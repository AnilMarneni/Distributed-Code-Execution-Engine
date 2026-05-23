const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');

router.post('/', submissionController.submitCode);
router.get('/', submissionController.getAllSubmissions);
router.get('/:id', submissionController.getSubmission);

module.exports = router;
