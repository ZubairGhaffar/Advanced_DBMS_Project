const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isStudent } = require('../middlewares/roleMiddleware');

router.post('/register', studentController.register);
router.post('/enroll', verifyToken, isStudent, studentController.enroll);
router.post('/pay-fee', verifyToken, isStudent, studentController.payFee);
router.get('/dashboard', verifyToken, isStudent, studentController.dashboard);
router.get('/available-courses', verifyToken, isStudent, studentController.availableCourses);
router.get('/fee-slip', verifyToken, isStudent, studentController.getFeeSlip);
router.get('/library-overdue', verifyToken, isStudent, studentController.getLibraryOverdue);
router.get('/result-card', verifyToken, isStudent, studentController.getResultCard);
router.get('/transcript', verifyToken, isStudent, studentController.downloadTranscript);
router.get('/enrolled-courses', verifyToken, isStudent, studentController.getEnrolledCourses);
router.get('/detailed-attendance', verifyToken, isStudent, studentController.getDetailedAttendance);

// Extra Library routes
router.get('/library/books', verifyToken, isStudent, studentController.getLibraryBooks);
router.get('/library/my-issues', verifyToken, isStudent, studentController.getMyLibraryIssues);

module.exports = router;
