const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

router.get('/department-enrollment', verifyToken, isAdmin, adminController.getDepartmentEnrollment);
router.get('/attendance-shortfall', verifyToken, isAdmin, adminController.getAttendanceShortfall);
router.get('/library-overdue', verifyToken, isAdmin, adminController.getLibraryOverdue);
router.get('/exam-timetable', verifyToken, isAdmin, adminController.getExamTimetable);
router.get('/result-card', verifyToken, isAdmin, adminController.getResultCard);
router.post('/allocate-hostel', verifyToken, isAdmin, adminController.allocateHostel);

module.exports = router;
