class EvaluationService {
  /**
   * Evaluates the raw testcase results and determines final verdicts.
   * If a testcase was flagged TLE or RTE by the sandbox, it maintains that verdict.
   * If it completed successfully, it compares the trimmed outputs.
   */
  evaluate(rawResults) {
    const evaluatedResults = rawResults.map((tc) => {
      if (tc.status === 'TLE' || tc.status === 'RTE') {
        return tc;
      }

      const actual = (tc.output || '').trim();
      const expected = (tc.expectedOutput || '').trim();
      const isMatch = actual === expected;

      return {
        input: tc.input,
        output: tc.output,
        expectedOutput: tc.expectedOutput,
        status: isMatch ? 'AC' : 'WA',
        executionTime: tc.executionTime,
        memoryUsed: tc.memoryUsed
      };
    });

    // The overall verdict is determined by the first failing test case.
    // If all are AC, the overall verdict is AC.
    let finalVerdict = 'AC';
    for (const res of evaluatedResults) {
      if (res.status !== 'AC') {
        finalVerdict = res.status;
        break;
      }
    }

    return {
      results: evaluatedResults,
      verdict: finalVerdict
    };
  }
}

module.exports = new EvaluationService();
