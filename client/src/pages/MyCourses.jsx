import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { BookOpen, PlayCircle, Clock, ArrowRight, AlertCircle, Award } from 'lucide-react';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/enrollments/my-courses');
        setEnrollments(res.data.enrollments || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '2.5rem', height: '2.5rem' }}></div>
        <p>Loading your enrolled courses...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
          My Learning Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
          Continue your active courses, stream lesson videos, and track your completion progress.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {enrollments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <BookOpen size={48} color="var(--color-primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>No enrolled courses yet</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
            You haven't enrolled in any courses yet. Explore our catalog to find a course and start learning with test mode checkout.
          </p>
          <Link to="/courses" className="btn btn-primary">
            Explore Course Catalog <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="course-grid">
          {enrollments.map((item) => (
            <div key={item.enrollmentId} className="course-card">
              <div className="course-thumb-wrapper">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="course-thumb"
                  loading="lazy"
                />
                <span className="course-category-badge">{item.category}</span>
              </div>

              <div className="course-body">
                <h3 className="course-title">{item.title}</h3>

                {/* Progress Tracking Bar */}
                <div style={{ margin: '0.75rem 0 1.25rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    <span>{item.completedCount} of {item.totalLessons} Lessons</span>
                    <span style={{ color: item.progressPercentage === 100 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                      {item.progressPercentage}% Complete
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${item.progressPercentage}%`,
                        background: item.progressPercentage === 100 ? 'var(--color-success)' : undefined
                      }}
                    ></div>
                  </div>
                </div>

                <div className="course-footer" style={{ marginTop: 'auto' }}>
                  <Link
                    to={`/learn/${item.courseId}`}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.65rem', fontSize: '0.9rem' }}
                  >
                    <PlayCircle size={16} /> Continue Learning
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;

