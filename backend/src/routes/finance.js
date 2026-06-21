const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isFinance } = require('../middlewares/roleMiddleware');

router.get('/fee-slip', verifyToken, isFinance, financeController.getFeeSlip);
router.get('/defaulters', verifyToken, isFinance, financeController.getDefaulters);
router.get('/search-courses', verifyToken, isFinance, financeController.searchCourses);
router.get('/payments', verifyToken, isFinance, financeController.getFeePayments);
router.post('/approve-payment', verifyToken, isFinance, financeController.approvePayment);
router.post('/reject-payment', verifyToken, isFinance, financeController.rejectPayment);

module.exports = router;
