import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Search, Layers, PlayCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/courses/categories');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses whenever search, selectedCategory, or sort changes
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError('');
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (sort) params.sort = sort;

        const res = await api.get('/courses', { params });
        setCourses(res.data.courses || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input by 300ms to avoid spamming the backend
    const timeoutId = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, selectedCategory, sort]);

  // Helper to calculate total lessons in a course
  const countLessons = (course) => {
    return course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  };

  return (
    <div>
      {/* Catalog Title Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
          Explore Our Courses
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
          Discover industry-vetted courses with structured modules, test mode payments, and interactive learning.
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search courses by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="sort-select" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Sort by:
          </label>
          <select
            id="sort-select"
            className="filter-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Category Chips */}
      <div className="category-chips">
        <button
          type="button"
          className={`category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="page-loader">
          <div className="spinner" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent', width: '2.5rem', height: '2.5rem' }}></div>
          <p>Loading course catalog...</p>
        </div>
      ) : courses.length === 0 ? (
        /* Empty State */
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
          <Search size={42} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No matching courses found</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Try adjusting your search terms or selecting a different category filter.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedCategory('all'); }}
            className="btn btn-secondary"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Course Grid */
        <div className="course-grid">
          {courses.map((course) => {
            const lessonCount = countLessons(course);
            const moduleCount = course.modules?.length || 0;

            return (
              <div key={course._id} className="course-card">
                <div className="course-thumb-wrapper">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="course-thumb"
                    loading="lazy"
                  />
                  <span className="course-category-badge">{course.category}</span>
                </div>

                <div className="course-body">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc">{course.description}</p>

                  <div className="course-meta">
                    <span className="course-meta-item">
                      <Layers size={15} />
                      {moduleCount} {moduleCount === 1 ? 'Module' : 'Modules'}
                    </span>
                    <span className="course-meta-item">
                      <PlayCircle size={15} />
                      {lessonCount} Lessons
                    </span>
                  </div>

                  <div className="course-footer">
                    <div className="course-price">
                      ₹{course.price}
                    </div>
                    <Link to={`/courses/${course._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
