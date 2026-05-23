const Submission = require('../models/Submission');
const sandboxService = require('../sandbox/sandbox.service');
const evaluationService = require('../services/evaluation.service');

exports.submitCode = async (req, res) => {
  try {
    const { code, language, testCases, timeLimit, memoryLimit } = req.body;

    if (!code || !language || !testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ error: 'Code, language, and non-empty test cases are required.' });
    }

    if (!['cpp', 'python', 'javascript'].includes(language)) {
      return res.status(400).json({ error: 'Unsupported language. Allowed: cpp, python, javascript.' });
    }

    // 1. Create a submission document in PENDING state
    const submission = new Submission({
      code,
      language,
      testCases,
      verdict: 'PENDING'
    });
    await submission.save();

    // 2. Trigger sandbox execution in background (Async)
    (async () => {
      try {
        submission.verdict = 'RUNNING';
        await submission.save();

        const rawResults = await sandboxService.execute(
          submission._id.toString(),
          code,
          language,
          testCases,
          timeLimit || 2000,
          memoryLimit || 128
        );

        if (rawResults.verdict === 'CE') {
          submission.verdict = 'CE';
          submission.error = rawResults.error;
          submission.results = [];
        } else {
          // Evaluate results
          const evaluation = evaluationService.evaluate(rawResults.testCaseResults);
          submission.verdict = evaluation.verdict;
          submission.results = evaluation.results;
          submission.executionTime = rawResults.executionTime;
          submission.memoryUsed = rawResults.memoryUsed;
        }
        await submission.save();
      } catch (error) {
        console.error(`Error in background run for submission ${submission._id}:`, error);
        submission.verdict = 'SYSTEM_ERROR';
        submission.error = error.message;
        await submission.save();
      }
    })();

    // 3. Return the created submission right away
    return res.status(202).json({
      message: 'Submission received and queued.',
      submissionId: submission._id,
      status: submission.verdict
    });

  } catch (error) {
    console.error('Submission controller error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    // Return latest 20 submissions
    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('_id language verdict createdAt executionTime memoryUsed');
    return res.json(submissions);
  } catch (error) {
    console.error('Get all submissions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
