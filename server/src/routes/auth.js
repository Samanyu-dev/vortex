import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Task } from '../models/Schemas.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vortex_quantum_secret_key_99';

// Futuristic Demo Seeds
const DEMO_TASKS = [
  {
    title: "Calibrate warp drive coils",
    description: "Align plasma injectors and run dynamic diagnostics across all three sub-space channels. Make sure coil magnetic induction is within 0.05% variance.",
    status: "Todo",
    priority: "High",
    dueDate: "2026-06-05",
    tags: ["Core", "Engineering"],
    subtasks: [
      { title: "Initiate magnetic lock", completed: true },
      { title: "Calibrate secondary plasma injector", completed: false },
      { title: "Run sub-space diagnostic sweep", completed: false }
    ],
    activities: [
      { text: "Task created in Hyper-Vortex", time: new Date().toISOString() },
      { text: "Magnetic lock successfully calibrated and engaged", time: new Date().toISOString() }
    ]
  },
  {
    title: "Refactor quantum state manager",
    description: "Optimize the event emitter loop in the quantum state machine. We are seeing intermittent cache misses under high stress workloads.",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2026-06-10",
    tags: ["State", "System"],
    subtasks: [
      { title: "Review current memory leaks", completed: true },
      { title: "Write high-stress unit test suite", completed: true },
      { title: "Implement lock-free queue in state ring", completed: false }
    ],
    activities: [
      { text: "Engineers flagged memory leaks in state manager", time: new Date(Date.now() - 3600000 * 4).toISOString() },
      { text: "Moved to In Progress state", time: new Date(Date.now() - 3600000 * 2).toISOString() }
    ]
  },
  {
    title: "Deploy hyper-lane routing mesh",
    description: "Initialize the mesh route protocol and sync active nodes. Re-align gravity wave routers to bypass dark sector fields.",
    status: "Done",
    priority: "High",
    dueDate: "2026-06-01",
    tags: ["Network", "Infrastructure"],
    subtasks: [
      { title: "Deploy nodes A1-C4", completed: true },
      { title: "Re-align gravity wave router telemetry", completed: true },
      { title: "Run load balance checks across gateways", completed: true }
    ],
    activities: [
      { text: "Gateway setup completed", time: new Date(Date.now() - 3600000 * 48).toISOString() },
      { text: "Routing mesh deployed to Production-A", time: new Date(Date.now() - 3600000 * 24).toISOString() },
      { text: "Moved to Done status", time: new Date(Date.now() - 3600000 * 24).toISOString() }
    ]
  },
  {
    title: "Upgrade shield matrix interface",
    description: "Revamp the dashboard styling for our deflectors page. The current panels look outdated and lack reactive glow signals.",
    status: "Todo",
    priority: "Low",
    dueDate: "2026-06-25",
    tags: ["UI", "Deflectors"],
    subtasks: [
      { title: "Create glassmorphic Figma layout draft", completed: false },
      { title: "Add glow state signals to indicators", completed: false }
    ],
    activities: [
      { text: "Draft request approved by design command", time: new Date(Date.now() - 3600000 * 12).toISOString() }
    ]
  }
];

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all details' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Create token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Seed tasks for new user to demonstrate premium functionality instantly
    for (const demoTask of DEMO_TASKS) {
      await Task.create({
        ...demoTask,
        userId: newUser._id
      });
    }

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error('Registration API error:', err);
    res.status(500).json({ error: 'Server error. Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login API error:', err);
    res.status(500).json({ error: 'Server error. Login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error('Auth-Me Error:', err);
    res.status(500).json({ error: 'Token validation failed.' });
  }
});

export default router;
