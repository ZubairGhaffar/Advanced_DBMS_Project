const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// Dashboard endpoints
router.get('/department-enrollment', verifyToken, isAdmin, adminController.getDepartmentEnrollment);
router.get('/attendance-shortfall', verifyToken, isAdmin, adminController.getAttendanceShortfall);
router.get('/library-overdue', verifyToken, isAdmin, adminController.getLibraryOverdue);
router.get('/exam-timetable', verifyToken, isAdmin, adminController.getExamTimetable);
router.get('/result-card', verifyToken, isAdmin, adminController.getResultCard);
router.post('/allocate-hostel', verifyToken, isAdmin, adminController.allocateHostel);

// Helper endpoints
router.get('/departments', verifyToken, isAdmin, adminController.getDepartments);
router.get('/programs', verifyToken, isAdmin, adminController.getPrograms);

// Students CRUD
router.get('/students', verifyToken, isAdmin, adminController.getStudents);
router.get('/students/:id', verifyToken, isAdmin, adminController.getStudentDetails);
router.post('/students', verifyToken, isAdmin, adminController.createStudent);
router.put('/students/:id', verifyToken, isAdmin, adminController.updateStudent);
router.delete('/students/:id', verifyToken, isAdmin, adminController.deleteStudent);

// Faculty CRUD
router.get('/faculties', verifyToken, isAdmin, adminController.getFaculties);
router.get('/faculties/:id', verifyToken, isAdmin, adminController.getFacultyDetails);
router.post('/faculties', verifyToken, isAdmin, adminController.createFaculty);
router.put('/faculties/:id', verifyToken, isAdmin, adminController.updateFaculty);
router.delete('/faculties/:id', verifyToken, isAdmin, adminController.deleteFaculty);

// Courses CRUD
router.get('/courses', verifyToken, isAdmin, adminController.getCourses);
router.post('/courses', verifyToken, isAdmin, adminController.createCourse);
router.put('/courses/:id', verifyToken, isAdmin, adminController.updateCourse);
router.delete('/courses/:id', verifyToken, isAdmin, adminController.deleteCourse);

// Sections CRUD
router.get('/sections', verifyToken, isAdmin, adminController.getSections);
router.post('/sections', verifyToken, isAdmin, adminController.createSection);
router.put('/sections/:id', verifyToken, isAdmin, adminController.updateSection);
router.delete('/sections/:id', verifyToken, isAdmin, adminController.deleteSection);

// Enrollments CRUD
router.get('/enrollments', verifyToken, isAdmin, adminController.getEnrollments);
router.post('/enroll', verifyToken, isAdmin, adminController.enrollStudent);
router.delete('/enrollments/:id', verifyToken, isAdmin, adminController.dropEnrollment);

// Departments & Programs CRUD
router.post('/departments', verifyToken, isAdmin, adminController.createDepartment);
router.put('/departments/:id', verifyToken, isAdmin, adminController.updateDepartment);
router.delete('/departments/:id', verifyToken, isAdmin, adminController.deleteDepartment);
router.post('/programs', verifyToken, isAdmin, adminController.createProgram);
router.put('/programs/:id', verifyToken, isAdmin, adminController.updateProgram);
router.delete('/programs/:id', verifyToken, isAdmin, adminController.deleteProgram);

// Library Books CRUD
router.get('/library/books', verifyToken, isAdmin, adminController.getLibraryBooks);
router.post('/library/books', verifyToken, isAdmin, adminController.createLibraryBook);
router.put('/library/books/:id', verifyToken, isAdmin, adminController.updateLibraryBook);
router.delete('/library/books/:id', verifyToken, isAdmin, adminController.deleteLibraryBook);

// Library Issues CRUD
router.get('/library/issues', verifyToken, isAdmin, adminController.getLibraryIssues);
router.post('/library/issues', verifyToken, isAdmin, adminController.issueBook);
router.post('/library/issues/:id/return', verifyToken, isAdmin, adminController.returnBook);

// Hostels CRUD/Allotments
router.get('/hostels', verifyToken, isAdmin, adminController.getHostels);
router.post('/hostels', verifyToken, isAdmin, adminController.createHostel);
router.get('/hostel-allotments', verifyToken, isAdmin, adminController.getHostelAllotments);

module.exports = router;
