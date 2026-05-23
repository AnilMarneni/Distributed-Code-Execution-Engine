const mongoose = require('mongoose');

const TestCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    default: ''
  },
  expectedOutput: {
    type: String,
    default: ''
  }
});

const TestCaseResultSchema = new mongoose.Schema({
  input: {
    type: String,
    default: ''
  },
  output: {
    type: String,
    default: ''
  },
  expectedOutput: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['AC', 'WA', 'TLE', 'RTE', 'CE', 'PENDING'],
    default: 'PENDING'
  },
  executionTime: {
    type: Number,
    default: 0 // in ms
  },
  memoryUsed: {
    type: Number,
    default: 0 // in MB
  }
});

const SubmissionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['cpp', 'python', 'javascript']
  },
  testCases: [TestCaseSchema],
  results: [TestCaseResultSchema],
  verdict: {
    type: String,
    enum: ['PENDING', 'RUNNING', 'AC', 'WA', 'TLE', 'RTE', 'CE', 'SYSTEM_ERROR'],
    default: 'PENDING'
  },
  error: {
    type: String,
    default: ''
  },
  executionTime: {
    type: Number,
    default: 0 // in ms (max/total across test cases)
  },
  memoryUsed: {
    type: Number,
    default: 0 // in MB (max across test cases)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
