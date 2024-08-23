import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  email: { type: String, required: true },
});

const Task = mongoose.model('Task', TaskSchema);

export default Task;
