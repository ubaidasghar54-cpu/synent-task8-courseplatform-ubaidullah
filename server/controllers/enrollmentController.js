const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * @desc   Get all enrolled courses for logged-in user
 * @route  GET /api/enrollments/my-courses
 * @access Private (Protected)
 */
const getMyCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course')
      .sort({ createdAt: -1 });

    // Format data with progress calculation
    const formatted = enrollments
      .filter(item => item.course !== null) // Filter out any deleted course references
      .map(item => {
        const course = item.course;
        const totalLessons = course.modules?.reduce(
          (acc, m) => acc + (m.lessons?.length || 0),
          0
        ) || 0;

        const completedCount = item.completedLessons?.length || 0;
        const progressPercentage = totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

        return {
          enrollmentId: item._id,
          courseId: course._id,
          title: course.title,
          category: course.category,
          thumbnail: course.thumbnail,
          totalLessons,
          completedCount,
          progressPercentage,
          enrolledAt: item.createdAt
        };
      });

    res.status(200).json({
      success: true,
      count: formatted.length,
      enrollments: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get full course content including video URLs for enrolled user or admin
 * @route  GET /api/enrollments/course/:courseId/learn
 * @access Private (Protected - enrolled or admin only)
 */
const getCourseLearningData = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // 1. Verify enrollment or admin privilege
    let enrollment = null;
    if (req.user.role !== 'admin') {
      enrollment = await Enrollment.findOne({
        user: req.user._id,
        course: courseId
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You must be enrolled in this course to watch lessons.'
        });
      }
    } else {
      // If admin, also check if an enrollment record exists
      enrollment = await Enrollment.findOne({
        user: req.user._id,
        course: courseId
      });
    }

    // 2. Fetch full course including video URLs
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      course,
      completedLessons: enrollment ? enrollment.completedLessons : []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Toggle completion status for a lesson in an enrolled course
 * @route  PATCH /api/enrollments/course/:courseId/lesson/:lessonId/toggle
 * @access Private (Protected)
 */
const toggleLessonCompletion = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    // 1. Find user's enrollment record
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment record not found for this course'
      });
    }

    // 2. Check if lesson is currently completed
    const isCurrentlyCompleted = enrollment.completedLessons.some(
      id => id.toString() === lessonId.toString()
    );

    if (isCurrentlyCompleted) {
      // Unmark: remove lesson ID from completedLessons
      enrollment.completedLessons = enrollment.completedLessons.filter(
        id => id.toString() !== lessonId.toString()
      );
    } else {
      // Mark complete: add lesson ID to completedLessons
      enrollment.completedLessons.push(lessonId);
    }

    await enrollment.save();

    // 3. Compute new progress percentage
    const course = await Course.findById(courseId);
    const totalLessons = course.modules?.reduce(
      (acc, m) => acc + (m.lessons?.length || 0),
      0
    ) || 0;

    const progressPercentage = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    res.status(200).json({
      success: true,
      isCompleted: !isCurrentlyCompleted,
      completedLessons: enrollment.completedLessons,
      progressPercentage
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyCourses,
  getCourseLearningData,
  toggleLessonCompletion
};

