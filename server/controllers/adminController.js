const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Course = require('../models/Course');

/**
 * @desc   Get all registered users with enrollment counts
 * @route  GET /api/admin/users
 * @access Private (Admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const enrollmentCount = await Enrollment.countDocuments({ user: u._id });
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isVerified: u.isVerified,
          createdAt: u.createdAt,
          enrollmentCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get platform-wide statistics and all enrollment records
 * @route  GET /api/admin/enrollments
 * @access Private (Admin only)
 */
const getEnrollmentsAndStats = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate('user', 'name email')
      .populate('course', 'title price modules')
      .sort({ createdAt: -1 });

    const payments = await Payment.find({ status: 'captured' });
    const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalStudents = await User.countDocuments({ role: 'user' });
    const totalCourses = await Course.countDocuments();

    const formatted = enrollments.map((e) => {
      const totalLessons = e.course?.modules?.reduce(
        (acc, m) => acc + (m.lessons?.length || 0),
        0
      ) || 0;
      const completedCount = e.completedLessons?.length || 0;
      const progressPercentage = totalLessons > 0
        ? Math.round((completedCount / totalLessons) * 100)
        : 0;

      return {
        id: e._id,
        studentName: e.user?.name || 'Deleted Account',
        studentEmail: e.user?.email || 'N/A',
        courseTitle: e.course?.title || 'Deleted Course',
        coursePrice: e.course?.price || 0,
        progressPercentage,
        completedCount,
        totalLessons,
        enrolledAt: e.createdAt
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalStudents,
        totalEnrollments: formatted.length,
        totalCourses
      },
      enrollments: formatted
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getEnrollmentsAndStats
};

