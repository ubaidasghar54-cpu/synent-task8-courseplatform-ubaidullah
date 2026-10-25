import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Layers,
  Users,
  IndianRupee,
  GraduationCap,
  PlayCircle,
  Clock,
  Video
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Course Modal state (Tab 1)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    thumbnail: '',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Curriculum Management state (Tab 2)
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [activeLessonModuleId, setActiveLessonModuleId] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    videoUrl: '',
    duration: '10:00'
  });
  const [isCurriculumLoading, setIsCurriculumLoading] = useState(false);

  // Users & Analytics state (Tab 3)
  const [auditUsers, setAuditUsers] = useState([]);
  const [auditEnrollments, setAuditEnrollments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    totalCourses: 0
  });
  const [isAuditLoading, setIsAuditLoading] = useState(false);

  // Fetch courses list
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/courses');
      const loadedCourses = res.data.courses || [];
      setCourses(loadedCourses);
      if (loadedCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(loadedCourses[0]._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch selected course for curriculum tab
  useEffect(() => {
    if (!selectedCourseId) return;

    const fetchSingleCourse = async () => {
      try {
        setIsCurriculumLoading(true);
        const res = await api.get(`/courses/${selectedCourseId}`);
        setSelectedCourse(res.data.course);
      } catch (err) {
        console.error('Failed to load selected course curriculum:', err.message);
      } finally {
        setIsCurriculumLoading(false);
      }
    };

    fetchSingleCourse();
  }, [selectedCourseId]);

  // Fetch Users & Audit Data when Tab 3 is clicked
  useEffect(() => {
    if (activeTab === 'users') {
      const fetchAuditData = async () => {
        try {
          setIsAuditLoading(true);
          const [usersRes, enrollmentsRes] = await Promise.all([
            api.get('/admin/users'),
            api.get('/admin/enrollments')
          ]);

          setAuditUsers(usersRes.data.users || []);
          setAuditEnrollments(enrollmentsRes.data.enrollments || []);
          setStats(enrollmentsRes.data.stats || {});
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load audit records.');
        } finally {
          setIsAuditLoading(false);
        }
      };

      fetchAuditData();
    }
  }, [activeTab]);

  // Tab 1: Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setFormData({
      title: '',
      category: 'Web Development',
      price: '',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      description: ''
    });
    setModalError('');
    setIsModalOpen(true);
  };

  // Tab 1: Open modal for Edit
  const handleOpenEditModal = (course) => {
    setEditingCourseId(course._id);
    setFormData({
      title: course.title,
      category: course.category,
      price: course.price,
      thumbnail: course.thumbnail,
      description: course.description
    });
    setModalError('');
    setIsModalOpen(true);
  };

  // Tab 1: Submit Create or Edit Course
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.title.trim() || !formData.category.trim() || !formData.description.trim() || formData.price === '') {
      setModalError('Please fill out all required fields.');
      return;
    }

    try {
      setIsSaving(true);
      if (editingCourseId) {
        await api.put(`/courses/${editingCourseId}`, formData);
        setSuccessMsg(`Course "${formData.title}" updated successfully!`);
      } else {
        await api.post('/courses', formData);
        setSuccessMsg(`New course "${formData.title}" created successfully!`);
      }

      setIsModalOpen(false);
      fetchCourses();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save course.');
    } finally {
      setIsSaving(false);
    }
  };

  // Tab 1: Delete Course
  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${courseTitle}"?\nAll student enrollments for this course will also be removed.`
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/courses/${courseId}`);
      setCourses(courses.filter(c => c._id !== courseId));
      setSuccessMsg(`Course "${courseTitle}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course');
    }
  };

  // Tab 2: Add Module
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      const res = await api.post(`/courses/${selectedCourseId}/modules`, {
        title: newModuleTitle.trim()
      });
      setSelectedCourse({ ...selectedCourse, modules: res.data.modules });
      setNewModuleTitle('');
      setSuccessMsg('Module added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add module');
    }
  };

  // Tab 2: Delete Module
  const handleDeleteModule = async (moduleId, moduleTitle) => {
    if (!window.confirm(`Delete module "${moduleTitle}" and all its lessons?`)) return;

    try {
      const res = await api.delete(`/courses/${selectedCourseId}/modules/${moduleId}`);
      setSelectedCourse({ ...selectedCourse, modules: res.data.modules });
      setSuccessMsg('Module deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete module');
    }
  };

  // Tab 2: Add Lesson
  const handleAddLesson = async (e, moduleId) => {
    e.preventDefault();
    if (!lessonFormData.title.trim() || !lessonFormData.videoUrl.trim()) {
      alert('Please provide lesson title and video URL');
      return;
    }

    try {
      const res = await api.post(
        `/courses/${selectedCourseId}/modules/${moduleId}/lessons`,
        lessonFormData
      );
      setSelectedCourse({ ...selectedCourse, modules: res.data.modules });
      setActiveLessonModuleId(null);
      setLessonFormData({ title: '', videoUrl: '', duration: '10:00' });
      setSuccessMsg('Lesson added successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add lesson');
    }
  };

  // Tab 2: Delete Lesson
  const handleDeleteLesson = async (moduleId, lessonId, lessonTitle) => {
    if (!window.confirm(`Delete lesson "${lessonTitle}"?`)) return;

    try {
      const res = await api.delete(
        `/courses/${selectedCourseId}/modules/${moduleId}/lessons/${lessonId}`
      );
      setSelectedCourse({ ...selectedCourse, modules: res.data.modules });
      setSuccessMsg('Lesson deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  return (
    <div className="admin-container">
      {/* Admin Header */}
      <div className="admin-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            <Shield size={16} /> Administrator Management Suite
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-dark)' }}>
            Course Control Center
          </h1>
        </div>

        {activeTab === 'courses' && (
          <button onClick={handleOpenCreateModal} className="btn btn-primary">
            <Plus size={18} /> Add New Course
          </button>
        )}
      </div>

      {/* Admin Navigation Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('courses')}
          className={`admin-tab ${activeTab === 'courses' ? 'active' : ''}`}
        >
          <BookOpen size={18} /> Manage Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`admin-tab ${activeTab === 'curriculum' ? 'active' : ''}`}
        >
          <Layers size={18} /> Modules & Lessons Manager
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users size={18} /> Users & Enrollments Auditor
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="alert alert-success" role="status">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: COURSES TABLE */}
      {activeTab === 'courses' && (
        <div>
          {loading ? (
            <div className="page-loader">
              <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '2.5rem', height: '2.5rem' }}></div>
              <p>Loading course catalog...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course Info</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Structure</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const moduleCount = course.modules?.length || 0;
                    const lessonCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

                    return (
                      <tr key={course._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              style={{ width: '60px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--color-dark)' }}>{course.title}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {course.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ background: '#F1F5F9', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
                            {course.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-dark)' }}>
                          ₹{course.price}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {moduleCount} modules • {lessonCount} lessons
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleOpenEditModal(course)}
                              className="btn-icon"
                              title="Edit Course Details"
                            >
                              <Edit2 size={16} color="var(--color-primary)" />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id, course.title)}
                              className="btn-icon"
                              title="Delete Course"
                            >
                              <Trash2 size={16} color="var(--color-danger)" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MODULES & LESSONS MANAGER */}
      {activeTab === 'curriculum' && (
        <div>
          {/* Select Course dropdown */}
          <div style={{ background: '#FFFFFF', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label htmlFor="course-select" style={{ fontWeight: 700, color: 'var(--color-dark)' }}>
              Select Course to Manage:
            </label>
            <select
              id="course-select"
              className="filter-select"
              style={{ flex: 1, minWidth: '280px' }}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} (₹{c.price})
                </option>
              ))}
            </select>
          </div>

          {isCurriculumLoading || !selectedCourse ? (
            <div className="page-loader">
              <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '2rem', height: '2rem' }}></div>
              <p>Loading course modules...</p>
            </div>
          ) : (
            <div>
              {/* Add New Module form */}
              <form onSubmit={handleAddModule} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', background: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="New Module Title (e.g. Module 3: State Management with Redux)..."
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={16} /> Add Module
                </button>
              </form>

              {/* Modules list */}
              {selectedCourse.modules?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <p style={{ color: 'var(--color-text-muted)' }}>No modules added to this course yet. Use the field above to add your first module.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {selectedCourse.modules?.map((mod, modIdx) => (
                    <div key={mod._id} className="module-box" style={{ boxShadow: 'var(--shadow-sm)' }}>
                      <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Layers size={18} color="var(--color-primary)" />
                          <span style={{ fontWeight: 700 }}>{mod.title}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            ({mod.lessons?.length || 0} Lessons)
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setActiveLessonModuleId(activeLessonModuleId === mod._id ? null : mod._id)}
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            <Plus size={14} /> Add Lesson
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(mod._id, mod.title)}
                            className="btn-icon"
                            title="Delete Module"
                          >
                            <Trash2 size={16} color="var(--color-danger)" />
                          </button>
                        </div>
                      </div>

                      {/* Add Lesson Collapsible Form */}
                      {activeLessonModuleId === mod._id && (
                        <form
                          onSubmit={(e) => handleAddLesson(e, mod._id)}
                          style={{ padding: '1.25rem', background: '#F8FAFC', borderBottom: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}
                        >
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Lesson Title..."
                            value={lessonFormData.title}
                            onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                            required
                          />
                          <input
                            type="url"
                            className="form-input"
                            placeholder="YouTube Video Embed URL..."
                            value={lessonFormData.videoUrl}
                            onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                            required
                          />
                          <input
                            type="text"
                            className="form-input"
                            placeholder="12:30"
                            value={lessonFormData.duration}
                            onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                          />
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 0.85rem', fontSize: '0.85rem' }}>
                              Save
                            </button>
                            <button type="button" onClick={() => setActiveLessonModuleId(null)} className="btn btn-secondary" style={{ padding: '0.65rem 0.85rem', fontSize: '0.85rem' }}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Lessons list */}
                      <div>
                        {mod.lessons?.length === 0 ? (
                          <div style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                            No lessons in this module yet. Click "+ Add Lesson" to publish one.
                          </div>
                        ) : (
                          mod.lessons?.map((lesson) => (
                            <div key={lesson._id} className="lesson-row">
                              <div className="lesson-info">
                                <Video size={16} color="var(--color-primary)" />
                                <div>
                                  <span style={{ fontWeight: 600 }}>{lesson.title}</span>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    URL: {lesson.videoUrl}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span className="lesson-duration">
                                  <Clock size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                  {lesson.duration || '10:00'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(mod._id, lesson._id, lesson.title)}
                                  className="btn-icon"
                                  title="Delete Lesson"
                                >
                                  <Trash2 size={15} color="var(--color-danger)" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USERS & ENROLLMENTS AUDITOR */}
      {activeTab === 'users' && (
        <div>
          {/* Platform KPI Stats Grid */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#D97706' }}>
                <IndianRupee size={24} />
              </div>
              <div>
                <div className="stat-value">₹{stats.totalRevenue?.toLocaleString()}</div>
                <div className="stat-label">Total Revenue Generated</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary)' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.totalStudents || 0}</div>
                <div className="stat-label">Registered Students</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
                <BookOpen size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.totalEnrollments || 0}</div>
                <div className="stat-label">Total Course Enrollments</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(15, 23, 42, 0.1)', color: 'var(--color-dark)' }}>
                <Layers size={24} />
              </div>
              <div>
                <div className="stat-value">{stats.totalCourses || 0}</div>
                <div className="stat-label">Published Courses</div>
              </div>
            </div>
          </div>

          {isAuditLoading ? (
            <div className="page-loader">
              <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '2.5rem', height: '2.5rem' }}></div>
              <p>Auditing user records and transaction ledgers...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Enrollments & Sales Ledger */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '1rem' }}>
                  Student Enrollment & Transactions Ledger ({auditEnrollments.length})
                </h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student Name & Email</th>
                        <th>Course Enrolled</th>
                        <th>Amount Paid</th>
                        <th>Progress</th>
                        <th>Enrolled Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditEnrollments.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No enrollments recorded yet.</td>
                        </tr>
                      ) : (
                        auditEnrollments.map((e) => (
                          <tr key={e.id}>
                            <td>
                              <div style={{ fontWeight: 700 }}>{e.studentName}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{e.studentEmail}</div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{e.courseTitle}</td>
                            <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                              ₹{e.coursePrice}
                            </td>
                            <td>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.85rem', color: e.progressPercentage === 100 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                                {e.progressPercentage}% ({e.completedCount}/{e.totalLessons} lessons)
                              </div>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                              {new Date(e.enrolledAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Registered Users Table */}
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '1rem' }}>
                  Registered User Accounts ({auditUsers.length})
                </h3>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Verification</th>
                        <th>Active Enrollments</th>
                        <th>Registered On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditUsers.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div style={{ fontWeight: 700 }}>{u.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                          </td>
                          <td>
                            <span className={u.role === 'admin' ? 'role-pill' : 'user-badge'} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.825rem', color: u.isVerified ? 'var(--color-success)' : '#D97706', fontWeight: 600 }}>
                              {u.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            {u.enrollmentCount} {u.enrollmentCount === 1 ? 'Course' : 'Courses'}
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Course Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingCourseId ? 'Edit Course Details' : 'Create New Course'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={16} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label className="form-label">Course Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Next.js 15 Masterclass"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Frontend"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price in INR (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="499"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Thumbnail Image URL *</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Description *</label>
                <textarea
                  className="form-input"
                  rows="4"
                  placeholder="Comprehensive description of what students will achieve..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving Changes...' : editingCourseId ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
