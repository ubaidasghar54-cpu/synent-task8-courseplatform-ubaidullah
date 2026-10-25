const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');

dotenv.config();

const sampleCourses = [
  {
    title: 'Full-Stack MERN Mastery 2026',
    description: 'Learn to build production-grade web applications from scratch with MongoDB, Express, React, and Node.js. Includes authentication, state management, and real-time APIs.',
    price: 4999,
    category: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
    modules: [
      {
        title: 'Module 1: Foundations of Modern Web',
        lessons: [
          {
            title: '1. Course Orientation & Architecture Breakdown',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: '08:30'
          },
          {
            title: '2. Setting up Vite, React, and Project Scaffolding',
            videoUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
            duration: '14:20'
          }
        ]
      },
      {
        title: 'Module 2: Server-Side REST APIs with Express',
        lessons: [
          {
            title: '3. Express Routing and JSON Middleware',
            videoUrl: 'https://www.youtube.com/embed/7CqJlxBYj-M',
            duration: '18:45'
          },
          {
            title: '4. MongoDB Schemas and Mongoose Relationships',
            videoUrl: 'https://www.youtube.com/embed/ofme2o29ngU',
            duration: '22:10'
          }
        ]
      }
    ]
  },
  {
    title: 'Modern React & Next.js Bootcamp',
    description: 'Master React 18 hooks, Server Components, suspense, client caching, and modern styling architectures for lightning-fast responsive user interfaces.',
    price: 3999,
    category: 'Frontend',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=60',
    modules: [
      {
        title: 'Module 1: Deep Dive into React Hooks',
        lessons: [
          {
            title: '1. useState & useEffect Best Practices',
            videoUrl: 'https://www.youtube.com/embed/O6P86uwfdR0',
            duration: '16:00'
          },
          {
            title: '2. useContext & Global State Patterns',
            videoUrl: 'https://www.youtube.com/embed/35lXWvCuM8o',
            duration: '19:15'
          }
        ]
      },
      {
        title: 'Module 2: Performance and Next.js Routing',
        lessons: [
          {
            title: '3. Next.js App Router and Server Components',
            videoUrl: 'https://www.youtube.com/embed/ZVnjOPwW444',
            duration: '25:30'
          }
        ]
      }
    ]
  },
  {
    title: 'Node.js Backend & API Architecture',
    description: 'Design robust, scalable, and secure microservices and RESTful APIs using Node.js, JWT, bcrypt, rate limiting, and database indexing.',
    price: 3499,
    category: 'Backend',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60',
    modules: [
      {
        title: 'Module 1: Advanced Express & Security',
        lessons: [
          {
            title: '1. JWT Authentication & Bearer Header Flow',
            videoUrl: 'https://www.youtube.com/embed/mbsmsi7l3r4',
            duration: '15:40'
          },
          {
            title: '2. Preventing Common Web Vulnerabilities',
            videoUrl: 'https://www.youtube.com/embed/8ZtInClt1V4',
            duration: '21:05'
          }
        ]
      }
    ]
  },
  {
    title: 'Python for Data Science & Machine Learning',
    description: 'Hands-on journey through Python, NumPy, Pandas, Matplotlib, and Scikit-Learn. Clean real-world datasets and deploy predictive models.',
    price: 4499,
    category: 'Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
    modules: [
      {
        title: 'Module 1: Python Data Analysis Tooling',
        lessons: [
          {
            title: '1. NumPy Arrays & Vectorized Calculations',
            videoUrl: 'https://www.youtube.com/embed/QUT1VHiLmmI',
            duration: '24:10'
          },
          {
            title: '2. Exploratory Data Analysis with Pandas',
            videoUrl: 'https://www.youtube.com/embed/vmEHCJofslg',
            duration: '28:50'
          }
        ]
      }
    ]
  },
  {
    title: 'UI/UX Design Systems & Figma for Developers',
    description: 'Learn wireframing, component-driven design systems, color theory, typography, and how to export Figma designs directly to responsive clean CSS.',
    price: 2999,
    category: 'Design',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60',
    modules: [
      {
        title: 'Module 1: Design Fundamentals',
        lessons: [
          {
            title: '1. Spacing, Typography & Color Tokens',
            videoUrl: 'https://www.youtube.com/embed/JWEX25k8iFw',
            duration: '12:35'
          },
          {
            title: '2. Responsive Layouts: 360px to 1280px',
            videoUrl: 'https://www.youtube.com/embed/7V2C_7Y8e4Q',
            duration: '17:45'
          }
        ]
      }
    ]
  }
];

const seedCourses = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/courseplatform';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing courses to prevent duplicates
    await Course.deleteMany({});
    console.log('[Seed] Cleared existing courses');

    // Insert 5 realistic sample courses
    const inserted = await Course.insertMany(sampleCourses);
    console.log(`[Seed] Successfully seeded ${inserted.length} courses!`);

    const activeCurrency = process.env.CURRENCY || 'PKR';
    inserted.forEach((c, idx) => {
      console.log(`  ${idx + 1}. [${c.category}] ${c.title} - ${activeCurrency} ${c.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding courses:', error.message);
    process.exit(1);
  }
};

seedCourses();

