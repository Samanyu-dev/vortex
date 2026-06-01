import express from 'express';
import { Task } from '../models/Schemas.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate a unique random sub-ID for subtasks or activities
const generateSubId = () => Math.random().toString(36).substring(2, 11);

// Apply Auth Middleware to all routes in this router
router.use(authMiddleware);

// GET /api/tasks - Retrieve all tasks for current authenticated user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'Server error. Failed to retrieve tasks.' });
  }
});

// POST /api/tasks - Create a new task
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags, subtasks } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTask = await Task.create({
      userId: req.user.id,
      title,
      description: description || '',
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate: dueDate || '',
      tags: tags || [],
      subtasks: subtasks ? subtasks.map(s => ({ _id: generateSubId(), title: s.title, completed: !!s.completed })) : [],
      activities: [
        {
          _id: generateSubId(),
          text: `Task matrix generated: "${title}"`,
          time: new Date().toISOString()
        }
      ]
    });

    res.status(201).json(newTask);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Server error. Failed to generate task.' });
  }
});

// PUT /api/tasks/:id - Complete task update
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags, subtasks } = req.body;
    const taskId = req.params.id;

    // Check if task exists and belongs to the user
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build timeline updates
    const updatedActivities = [...(task.activities || [])];
    if (title && title !== task.title) {
      updatedActivities.push({
        _id: generateSubId(),
        text: `Title calibrated from "${task.title}" to "${title}"`,
        time: new Date().toISOString()
      });
    }
    if (priority && priority !== task.priority) {
      updatedActivities.push({
        _id: generateSubId(),
        text: `Priority frequency set to ${priority}`,
        time: new Date().toISOString()
      });
    }
    if (status && status !== task.status) {
      updatedActivities.push({
        _id: generateSubId(),
        text: status === 'Done' 
          ? 'Quantum operation completed successfully' 
          : `Task state shifted to ${status}`,
        time: new Date().toISOString()
      });
    }

    const updateData = {
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      status: status || task.status,
      priority: priority || task.priority,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      tags: tags || task.tags,
      subtasks: subtasks ? subtasks.map(s => ({ _id: s._id || generateSubId(), title: s.title, completed: !!s.completed })) : task.subtasks,
      activities: updatedActivities
    };

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
    res.json(updatedTask);

  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Server error. Failed to edit task.' });
  }
});

// PATCH /api/tasks/:id/status - Rapid status shift (Drag and drop or checkbox toggle)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    if (!['Todo', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Set activities log
    const updatedActivities = [...(task.activities || [])];
    const logText = status === 'Done'
      ? 'Task marked as COMPLETED (Done)'
      : `Stage transition: ${task.status} → ${status}`;

    updatedActivities.push({
      _id: generateSubId(),
      text: logText,
      time: new Date().toISOString()
    });

    const updatedTask = await Task.findByIdAndUpdate(taskId, {
      status,
      activities: updatedActivities
    }, { new: true });

    res.json(updatedTask);

  } catch (err) {
    console.error('Patch status error:', err);
    res.status(500).json({ error: 'Server error. Failed to shift task status.' });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted successfully', id: taskId });

  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Server error. Failed to wipe task.' });
  }
});

export default router;
