const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  videoUrl: {
    type: String,
    required: [true, 'Lesson video URL is required'],
    trim: true
  },
  duration: {
    type: String,
    default: '10:00',
    trim: true
  }
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true
  },
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Course title must be at least 3 characters long']
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      trim: true
    },
    thumbnail: {
      type: String,
      required: [true, 'Course thumbnail URL is required'],
      trim: true
    },
    modules: [moduleSchema]
  },
  {
    timestamps: true
  }
);

// Optimize search queries on title and description
courseSchema.index({ title: 'text', description: 'text' });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

