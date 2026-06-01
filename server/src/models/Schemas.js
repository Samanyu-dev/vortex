import mongoose from 'mongoose';
import { UserMock, TaskMock } from '../db/localDb.js';

const isMongoEnabled = () => {
  return process.env.MONGODB_URI && process.env.MONGODB_URI !== 'local';
};

// Define Mongoose Schema for User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Define Mongoose Schema for Subtask
const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

// Define Mongoose Schema for Activity Timeline
const activitySchema = new mongoose.Schema({
  text: { type: String, required: true },
  time: { type: Date, default: Date.now }
});

// Define Mongoose Schema for Task
const taskSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: String, default: '' },
  tags: [{ type: String }],
  subtasks: [subtaskSchema],
  activities: [activitySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

let User;
let Task;

if (isMongoEnabled()) {
  try {
    User = mongoose.model('User', userSchema);
    Task = mongoose.model('Task', taskSchema);
    console.log('⚡ Mongoose schema drivers loaded successfully');
  } catch (err) {
    // Handle double-compiled hot-reload mongoose errors if any
    User = mongoose.models.User || mongoose.model('User', userSchema);
    Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
  }
} else {
  console.log('🛸 Falling back to VORTEX Local Persistent JSON DB engine');
  User = UserMock;
  Task = TaskMock;
}

export { User, Task, isMongoEnabled };
