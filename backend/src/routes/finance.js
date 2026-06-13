const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isFinance } = require('../middlewares/roleMiddleware');

router.get('/fee-slip', verifyToken, isFinance, financeController.getFeeSlip);
router.get('/defaulters', verifyToken, isFinance, financeController.getDefaulters);
router.get('/search-courses', verifyToken, isFinance, financeController.searchCourses);

module.exports = router;
