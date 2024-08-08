const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

router.get('/', async (req, res) => {
  const email = req.query.email;
  try {
    const tasks = await Task.find({ email: email });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const { title, description, status, email } = req.body;
  if (!title || !['todo', 'in-progress', 'done'].includes(status)) {
    return res.status(400).send('Invalid task data');
  }
  const newTask = new Task({ title, description, status: 'todo', email });

  try {
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { title, description, status, email } = req.body;
  if (!title || !['todo', 'in-progress', 'done'].includes(status)) {
    return res.status(400).send('Invalid task data');
  }

  const task = await Task.findByIdAndUpdate(req.params.id, { title, description, status }, { new: true });
  if (!task) {
    return res.status(404).send('Task not found');
  }

  task.title = title;
  task.description = description;
  task.status = status;
  task.email = email;

  const updatedTask = await task.save();
  res.json(updatedTask);

});

router.delete('/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).send('Task not found');
  }

  res.status(204).send();
});

module.exports = router;
