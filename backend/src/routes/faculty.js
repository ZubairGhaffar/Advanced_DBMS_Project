const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isFaculty } = require('../middlewares/roleMiddleware');

router.post('/mark-attendance', verifyToken, isFaculty, facultyController.markAttendance);
router.post('/submit-grades', verifyToken, isFaculty, facultyController.submitGrades);

module.exports = router;
