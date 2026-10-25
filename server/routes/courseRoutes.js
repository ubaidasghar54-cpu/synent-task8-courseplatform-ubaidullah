const express = require('express');
const {
  getCourses,
  getCategories,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addModule,
  deleteModule,
  addLesson,
  deleteLesson
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public course endpoints
router.get('/', getCourses);
router.get('/categories', getCategories);
router.get('/:id', getCourseById);

// Admin-only course CRUD endpoints
router.post('/', protect, admin, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

// Admin-only module & lesson endpoints
router.post('/:id/modules', protect, admin, addModule);
router.delete('/:id/modules/:moduleId', protect, admin, deleteModule);
router.post('/:id/modules/:moduleId/lessons', protect, admin, addLesson);
router.delete('/:id/modules/:moduleId/lessons/:lessonId', protect, admin, deleteLesson);

module.exports = router;

