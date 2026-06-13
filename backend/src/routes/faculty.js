const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isFaculty } = require('../middlewares/roleMiddleware');

router.get('/sections', verifyToken, isFaculty, facultyController.getSections);
router.get('/section-students', verifyToken, isFaculty, facultyController.getSectionStudents);
router.get('/workload', verifyToken, isFaculty, facultyController.getWorkload);
router.post('/mark-attendance', verifyToken, isFaculty, facultyController.markAttendance);
router.post('/submit-grades', verifyToken, isFaculty, facultyController.submitGrades);

module.exports = router;
