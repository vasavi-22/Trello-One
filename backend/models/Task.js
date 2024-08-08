const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  email: { type: String, required: true },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
