const express = require('express');
const {
  getMyCourses,
  getCourseLearningData,
  toggleLessonCompletion
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected enrollment routes
router.get('/my-courses', protect, getMyCourses);
router.get('/course/:courseId/learn', protect, getCourseLearningData);
router.patch('/course/:courseId/lesson/:lessonId/toggle', protect, toggleLessonCompletion);

module.exports = router;

