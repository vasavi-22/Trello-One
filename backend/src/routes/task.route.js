import { Router } from "express";
import { getTasks, addTask, editTask, deleteTask } from "../controllers/task.controller.js";

const router = Router();

router.get('/', getTasks);
router.post('/', addTask);
router.put('/:id', editTask);
router.delete('/:id', deleteTask);

export default router;
