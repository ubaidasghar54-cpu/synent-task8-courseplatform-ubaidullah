import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Layers,
  PlayCircle,
  Clock,
  Lock,
  CheckCircle,
  ShieldCheck,
  CreditCard,
  AlertCircle
} from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollMsg, setEnrollMsg] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data.course);
        if (res.data.isEnrolled) {
          setIsEnrolled(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const totalLessons = course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  // Razorpay Checkout Trigger
  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      setIsEnrolling(true);
      setError('');
      setEnrollMsg('');

      // 1. Create order on server
      const orderRes = await api.post('/payments/create-order', { courseId: course._id });
      const { orderId, amount, currency, keyId, isMockMode } = orderRes.data;

      // 2. If in development fallback mode (placeholder keys), simulate authentic verification
      if (isMockMode) {
        setEnrollMsg('Razorpay Test Mode: Verifying signature and completing enrollment...');
        const verifyRes = await api.post('/payments/verify-payment', {
          courseId: course._id,
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: 'test_bypass_sig'
        });

        setIsEnrolled(true);
        setEnrollMsg(verifyRes.data.message);
        setTimeout(() => {
          navigate(`/learn/${course._id}`);
        }, 1500);
        return;
      }

      // 3. Open official Razorpay modal if live keys exist
      if (!window.Razorpay) {
        setError('Razorpay SDK failed to load. Please check your internet connection and refresh.');
        setIsEnrolling(false);
        return;
      }

      const options = {
        key: keyId,
        amount,
        currency,
        name: 'LearnHub Online Platform',
        description: `Enrollment for: ${course.title}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            setEnrollMsg('Verifying payment signature with server...');
            const verifyRes = await api.post('/payments/verify-payment', {
              courseId: course._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            setIsEnrolled(true);
            setEnrollMsg(verifyRes.data.message);
            setTimeout(() => {
              navigate(`/learn/${course._id}`);
            }, 1500);
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || 'Payment verification failed.');
          } finally {
            setIsEnrolling(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function () {
            setIsEnrolling(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setError(`Payment failed: ${resp.error.description}`);
        setIsEnrolling(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate checkout.');
      setIsEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '2.5rem', height: '2.5rem' }}></div>
        <p>Loading course information...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={20} />
          <span>{error || 'Course not found.'}</span>
        </div>
        <Link to="/courses" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Back to All Courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.25rem' }}>
        <ArrowLeft size={16} /> Back to Course Catalog
      </Link>

      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {enrollMsg && (
        <div className="alert alert-success" role="status">
          <CheckCircle size={18} />
          <span>{enrollMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="course-header-banner">
        <span style={{ display: 'inline-block', background: 'rgba(251, 191, 36, 0.2)', color: 'var(--color-accent)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
          {course.category}
        </span>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: '#CBD5E1', fontSize: '0.95rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={18} color="var(--color-accent)" /> {course.modules?.length || 0} Modules
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlayCircle size={18} color="var(--color-accent)" /> {totalLessons} Lessons
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={18} color="var(--color-accent)" /> Synent Certified Curriculum
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="course-detail-layout">
        {/* Left: Syllabus */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '1rem' }}>
            Course Curriculum
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Step-by-step sequential learning designed for deep practical mastery.
          </p>

          <div className="syllabus-section">
            {course.modules?.map((mod, modIdx) => (
              <div key={mod._id || modIdx} className="module-box">
                <div className="module-header">
                  <span>{mod.title}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {mod.lessons?.length || 0} Lessons
                  </span>
                </div>

                <div>
                  {mod.lessons?.map((lesson, lessonIdx) => (
                    <div key={lesson._id || lessonIdx} className="lesson-row">
                      <div className="lesson-info">
                        {isEnrolled ? (
                          <PlayCircle size={15} color="var(--color-primary)" />
                        ) : (
                          <Lock size={15} color="var(--color-text-muted)" />
                        )}
                        <span style={{ fontWeight: 500 }}>{lesson.title}</span>
                      </div>
                      <div className="lesson-duration">
                        <Clock size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {lesson.duration || '10:00'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div>
          <div className="sidebar-card">
            <img
              src={course.thumbnail}
              alt={course.title}
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}
            />

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total Investment</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                ₹{course.price}
              </div>
            </div>

            {isEnrolled ? (
              <Link
                to={`/learn/${course._id}`}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                <PlayCircle size={18} /> Continue Learning
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleEnrollClick}
                disabled={isEnrolling}
                className="btn btn-accent"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
              >
                {isEnrolling ? (
                  <>
                    <span className="spinner"></span>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    <span>Enroll Now (₹{course.price})</span>
                  </>
                )}
              </button>
            )}

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} color="var(--color-success)" /> Instant Access to all {totalLessons} Lessons
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} color="var(--color-success)" /> Razorpay HMAC SHA-256 Verified
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} color="var(--color-success)" /> Prevent Duplicate Charges Guaranteed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
