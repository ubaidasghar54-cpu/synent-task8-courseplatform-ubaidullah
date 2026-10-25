const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const jwt = require('jsonwebtoken');

/**
 * @desc   Get all courses with search, category filtering, and sorting
 * @route  GET /api/courses
 * @access Public (video URLs omitted for security)
 */
const getCourses = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    // 1. Search filter (title or description)
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // 2. Category filter
    if (category && category !== 'all' && category.trim() !== '') {
      query.category = category.trim();
    }

    // 3. Sorting options
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    // 4. Query database (omit video URLs for security)
    const courses = await Course.find(query)
      .select('-modules.lessons.videoUrl')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get distinct list of all course categories
 * @route  GET /api/courses/categories
 * @access Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Course.distinct('category');
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single course details
 * @route  GET /api/courses/:id
 * @access Public / Enrolled
 */
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if the user is authenticated and is an admin or enrolled
    let isAuthorizedForVideos = false;
    let isEnrolled = false;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'fallback_secret_key_change_in_production'
        );

        if (decoded.role === 'admin') {
          isAuthorizedForVideos = true;
          isEnrolled = true;
        } else {
          const enrollment = await Enrollment.findOne({
            user: decoded.id,
            course: course._id
          });
          if (enrollment) {
            isAuthorizedForVideos = true;
            isEnrolled = true;
          }
        }
      } catch (err) {
        // Token invalid, proceed as guest
      }
    }

    // If not authorized for full video URLs, sanitize modules before sending
    if (!isAuthorizedForVideos) {
      const sanitized = course.toObject();
      sanitized.modules = sanitized.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => {
          const { videoUrl, ...rest } = lesson;
          return { ...rest, isLocked: true };
        })
      }));

      return res.status(200).json({
        success: true,
        isEnrolled: false,
        course: sanitized
      });
    }

    res.status(200).json({
      success: true,
      isEnrolled: true,
      course
    });
  } catch (error) {
    // Check for invalid MongoDB ObjectId error
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Course not found with given ID'
      });
    }
    next(error);
  }
};

/**
 * @desc   Create a new course
 * @route  POST /api/courses
 * @access Private (Admin only)
 */
const createCourse = async (req, res, next) => {
  try {
    const { title, description, price, category, thumbnail, modules } = req.body;

    if (!title || !description || price === undefined || !category || !thumbnail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required course details (title, description, price, category, thumbnail)'
      });
    }

    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      thumbnail: thumbnail.trim(),
      modules: modules || []
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update course details
 * @route  PUT /api/courses/:id
 * @access Private (Admin only)
 */
const updateCourse = async (req, res, next) => {
  try {
    const { title, description, price, category, thumbnail } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (title) course.title = title.trim();
    if (description) course.description = description.trim();
    if (price !== undefined) course.price = Number(price);
    if (category) course.category = category.trim();
    if (thumbnail) course.thumbnail = thumbnail.trim();

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a course and its enrollments
 * @route  DELETE /api/courses/:id
 * @access Private (Admin only)
 */
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    // Clean up student enrollments associated with this deleted course
    await Enrollment.deleteMany({ course: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Course and related enrollments deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Add a new module to a course
 * @route  POST /api/courses/:id/modules
 * @access Private (Admin only)
 */
const addModule = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Module title is required' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.modules.push({ title: title.trim(), lessons: [] });
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      modules: course.modules
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a module from a course
 * @route  DELETE /api/courses/:id/modules/:moduleId
 * @access Private (Admin only)
 */
const deleteModule = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.modules = course.modules.filter(
      m => m._id.toString() !== req.params.moduleId
    );
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully',
      modules: course.modules
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Add a lesson to a course module
 * @route  POST /api/courses/:id/modules/:moduleId/lessons
 * @access Private (Admin only)
 */
const addLesson = async (req, res, next) => {
  try {
    const { title, videoUrl, duration } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Lesson title and video URL are required'
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const moduleItem = course.modules.id(req.params.moduleId);
    if (!moduleItem) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    moduleItem.lessons.push({
      title: title.trim(),
      videoUrl: videoUrl.trim(),
      duration: duration?.trim() || '10:00'
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      modules: course.modules
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a lesson from a course module
 * @route  DELETE /api/courses/:id/modules/:moduleId/lessons/:lessonId
 * @access Private (Admin only)
 */
const deleteLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const moduleItem = course.modules.id(req.params.moduleId);
    if (!moduleItem) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    moduleItem.lessons = moduleItem.lessons.filter(
      l => l._id.toString() !== req.params.lessonId
    );

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully',
      modules: course.modules
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

