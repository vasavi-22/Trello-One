import React from "react";
import "./dashboard.css";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const Task = ({ task, onFormat, onDeleteTask, onEditTask, onViewTask }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task._id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleButtonClick = (e, callback) => {
    e.stopPropagation(); // Prevents the drag event from being triggered
    callback();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="task"
    >
      <div {...attributes} {...listeners} className="task-drag-handle">
        <p className="title">{task.title}</p>
        <p>{task.description}</p>
        <p className="time">Created at : {onFormat(task.createdAt)}</p>
      </div>
      <div className="btns">
        <button
          className="delete"
          onClick={(e) => handleButtonClick(e, () => onDeleteTask(task._id))}
        >
          Delete
        </button>
        <button
          className="edit"
          onClick={(e) => handleButtonClick(e, () => onEditTask(task))}
        >
          Edit
        </button>
        <button
          className="view"
          onClick={(e) => handleButtonClick(e, () => onViewTask(task))}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default Task;
