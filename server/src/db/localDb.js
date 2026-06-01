import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], tasks: [] }, null, 2));
}

// Read database
const readData = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading local DB:', err);
    return { users: [], tasks: [] };
  }
};

// Write database
const writeData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local DB:', err);
  }
};

// Custom ID Generator
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// User Model Mock
export const UserMock = {
  async findOne({ email }) {
    const db = readData();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  },

  async findById(id) {
    const db = readData();
    const user = db.users.find(u => u._id === id);
    return user ? { ...user } : null;
  },

  async create(userData) {
    const db = readData();
    const newUser = {
      _id: generateId(),
      createdAt: new Date().toISOString(),
      ...userData
    };
    db.users.push(newUser);
    writeData(db);
    return { ...newUser };
  }
};

// Task Model Mock
export const TaskMock = {
  async find(filter = {}) {
    const db = readData();
    let results = [...db.tasks];
    
    if (filter.userId) {
      results = results.filter(t => t.userId === filter.userId);
    }
    
    // Sort tasks by createdAt desc by default
    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findById(id) {
    const db = readData();
    const task = db.tasks.find(t => t._id === id);
    return task ? { ...task } : null;
  },

  async create(taskData) {
    const db = readData();
    const newTask = {
      _id: generateId(),
      subtasks: [],
      activities: [
        {
          id: generateId(),
          text: "Task sequence initiated",
          time: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...taskData
    };
    db.tasks.push(newTask);
    writeData(db);
    return { ...newTask };
  },

  async findByIdAndUpdate(id, updateData, options = {}) {
    const db = readData();
    const taskIndex = db.tasks.findIndex(t => t._id === id);
    if (taskIndex === -1) return null;

    const oldTask = db.tasks[taskIndex];
    const updatedTask = {
      ...oldTask,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    db.tasks[taskIndex] = updatedTask;
    writeData(db);
    return { ...updatedTask };
  },

  async findByIdAndDelete(id) {
    const db = readData();
    const taskIndex = db.tasks.findIndex(t => t._id === id);
    if (taskIndex === -1) return null;

    const deletedTask = db.tasks.splice(taskIndex, 1)[0];
    writeData(db);
    return deletedTask;
  }
};
