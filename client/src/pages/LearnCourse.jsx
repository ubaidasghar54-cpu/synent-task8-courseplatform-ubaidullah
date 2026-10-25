import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Circle,
  Clock,
  Layers,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Award,
  Sparkles
} from 'lucide-react';

const LearnCourse = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeModuleName, setActiveModuleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/enrollments/course/${courseId}/learn`);
        const fetchedCourse = res.data.course;
        setCourse(fetchedCourse);
        setCompletedLessons(res.data.completedLessons || []);

        // Default to first lesson of first module
        if (fetchedCourse?.modules?.length > 0 && fetchedCourse.modules[0].lessons?.length > 0) {
          setActiveLesson(fetchedCourse.modules[0].lessons[0]);
          setActiveModuleName(fetchedCourse.modules[0].title);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Access denied or course not found.');
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, [courseId]);

  // Ensure YouTube URL is formatted as an embedable iframe source
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  // Flatten all lessons into a list for Prev/Next navigation and progress calculation
  const allLessons = [];
  course?.modules?.forEach((m) => {
    m.lessons?.forEach((l) => {
      allLessons.push({ ...l, moduleTitle: m.title });
    });
  });

  const currentLessonIndex = allLessons.findIndex(
    (l) => l._id?.toString() === activeLesson?._id?.toString()
  );

  const isCurrentLessonCompleted = completedLessons.some(
    (id) => id.toString() === activeLesson?._id?.toString()
  );

  const progressPercentage = allLessons.length > 0
    ? Math.round((completedLessons.length / allLessons.length) * 100)
    : 0;

  // Toggle lesson complete handler
  const handleToggleComplete = async () => {
    if (!activeLesson || isToggling) return;

    try {
      setIsToggling(true);
      const res = await api.patch(
        `/enrollments/course/${courseId}/lesson/${activeLesson._id}/toggle`
      );

      setCompletedLessons(res.data.completedLessons);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update lesson progress');
    } finally {
      setIsToggling(false);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      const next = allLessons[currentLessonIndex + 1];
      setActiveLesson(next);
      setActiveModuleName(next.moduleTitle);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      const prev = allLessons[currentLessonIndex - 1];
      setActiveLesson(prev);
      setActiveModuleName(prev.moduleTitle);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '2.5rem', height: '2.5rem' }}></div>
        <p>Loading course learning room...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={20} />
          <span>{error || 'Course content could not be loaded.'}</span>
        </div>
        <Link to="/courses" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Courses Catalog
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top Breadcrumb Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/my-courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to My Courses
        </Link>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          {course.title}
        </span>
      </div>

      {/* Completion Celebration Banner (shown when 100% complete) */}
      {progressPercentage === 100 && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
          <Sparkles size={20} color="var(--color-success)" />
          <div style={{ flex: 1 }}>
            <strong>Outstanding Achievement!</strong> You have completed all lessons in this course. You can re-watch any lesson at any time.
          </div>
        </div>
      )}

      {/* Main Learning Room Layout */}
      <div className="learn-layout">
        {/* Left Column: Video Player & Controls */}
        <div>
          <div className="video-container">
            {activeLesson ? (
              <iframe
                src={getEmbedUrl(activeLesson.videoUrl)}
                title={activeLesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#FFFFFF' }}>
                Select a lesson from the curriculum to begin playback
              </div>
            )}
          </div>

          {/* Lesson Metadata & Action Toolbar */}
          {activeLesson && (
            <div className="learn-details">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {activeModuleName}
                  </span>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-dark)', marginTop: '0.25rem' }}>
                    {activeLesson.title}
                  </h2>
                </div>

                {/* Mark Complete Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  disabled={isToggling}
                  className={`btn ${isCurrentLessonCompleted ? 'btn-secondary' : 'btn-primary'}`}
                  style={{
                    padding: '0.6rem 1.15rem',
                    fontSize: '0.875rem',
                    borderColor: isCurrentLessonCompleted ? 'var(--color-success)' : undefined,
                    color: isCurrentLessonCompleted ? 'var(--color-success)' : undefined,
                    backgroundColor: isCurrentLessonCompleted ? '#F0FDF4' : undefined
                  }}
                >
                  {isCurrentLessonCompleted ? (
                    <>
                      <CheckCircle2 size={16} color="var(--color-success)" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Circle size={16} />
                      <span>Mark as Complete</span>
                    </>
                  )}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                <Clock size={15} />
                <span>Duration: {activeLesson.duration || '10:00'}</span>
              </div>

              {/* Prev / Next Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={handlePrevLesson}
                  disabled={currentLessonIndex <= 0}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.875rem' }}
                >
                  <ChevronLeft size={16} /> Previous Lesson
                </button>

                <button
                  type="button"
                  onClick={handleNextLesson}
                  disabled={currentLessonIndex >= allLessons.length - 1}
                  className="btn btn-primary"
                  style={{ fontSize: '0.875rem' }}
                >
                  Next Lesson <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Playlist Sidebar with Dynamic Progress */}
        <div>
          <div className="playlist-sidebar">
            <div className="playlist-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700 }}>
                  <Layers size={18} color="var(--color-accent)" />
                  <span>Curriculum</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: progressPercentage === 100 ? 'var(--color-accent)' : '#93C5FD' }}>
                  {progressPercentage}%
                </span>
              </div>

              {/* Course Progress Bar */}
              <div className="progress-bar-bg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', height: '6px' }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${progressPercentage}%`,
                    backgroundColor: progressPercentage === 100 ? 'var(--color-accent)' : '#3B82F6'
                  }}
                ></div>
              </div>
              <div style={{ fontSize: '0.775rem', color: '#94A3B8', marginTop: '0.4rem', textAlign: 'right' }}>
                {completedLessons.length} of {allLessons.length} lessons completed
              </div>
            </div>

            <div className="playlist-body">
              {course.modules?.map((mod, modIdx) => (
                <div key={mod._id || modIdx}>
                  <div style={{ background: '#F8FAFC', padding: '0.65rem 1rem', fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #E2E8F0' }}>
                    {mod.title}
                  </div>

                  <div>
                    {mod.lessons?.map((lesson, lIdx) => {
                      const isActive = activeLesson?._id?.toString() === lesson._id?.toString();
                      const isCompleted = completedLessons.some(
                        (id) => id.toString() === lesson._id?.toString()
                      );

                      return (
                        <div
                          key={lesson._id || lIdx}
                          onClick={() => {
                            setActiveLesson(lesson);
                            setActiveModuleName(mod.title);
                          }}
                          className={`playlist-lesson-item ${isActive ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, paddingRight: '0.5rem' }}>
                            {isCompleted ? (
                              <CheckCircle2 size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                            ) : (
                              <PlayCircle size={16} color={isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'} style={{ flexShrink: 0 }} />
                            )}
                            <span style={{ fontSize: '0.875rem', lineHeight: 1.35, textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--color-text-muted)' : undefined }}>
                              {lesson.title}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                            {lesson.duration || '10:00'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnCourse;
