const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isStudent } = require('../middlewares/roleMiddleware');

router.post('/register', studentController.register);
router.post('/enroll', verifyToken, isStudent, studentController.enroll);
router.post('/pay-fee', verifyToken, isStudent, studentController.payFee);
router.get('/dashboard', verifyToken, isStudent, studentController.dashboard);

module.exports = router;
