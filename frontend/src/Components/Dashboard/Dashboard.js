import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import axios from "axios";
import "./dashboard.css";
import Task from "./Task";

const Dashboard = () => {
  const location = useLocation();
  const email = location?.state?.logData?.email;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [tasks, setTasks] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");

  useEffect(() => {
    if (email) {
      axios.get(`/api/tasks?email=${email}`).then((response) => {
        console.log(response.data.tasks, "tasks");
        setTasks(response.data.tasks);
      });
    }
  }, [email]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const newTask = { title, description, status: "todo", email };

    try {
      const response = await axios.post("/api/tasks", newTask);
      setTasks([...tasks, response.data]);
      setTitle("");
      setDescription("");
      setVisible(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleEditTask = (task) => {
    setIsEditing(true);
    setEditTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setVisible(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    const updatedTask = { title, description, status, email };

    try {
      const response = await axios.put(`/api/tasks/${editTaskId}`, updatedTask);
      setTasks(
        tasks.map((task) => (task._id === editTaskId ? response.data : task))
      );
      setTitle("");
      setDescription("");
      setStatus("");
      setEditTaskId(null);
      setIsEditing(false);
      setVisible(false); // Close the dialog after updating the task
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!isConfirmed) {
      return;
    }
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleViewTask = (task) => {
    setViewTask(task);
  };

  const closeViewModal = () => {
    setViewTask(null);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", options).replace(/, /g, ", ");
  };

  const getFilteredTasks = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    // .sort((a, b) => {
    //   if (sortOrder === "recent") {
    //     return new Date(b.createdAt) - new Date(a.createdAt);
    //   } else {
    //     return new Date(a.createdAt) - new Date(b.createdAt);
    //   }
    // });
  };

  // const getFilteredTasks = (status) => tasks.filter((task) => task.status === status)

  const saveTasksToBackend = async (updatedTasks) => {
    try {
      const response = await axios.post("/api/save-tasks", updatedTasks);

      if (!response.ok) {
        throw new Error("Failed to save tasks");
      }

      const data = await response.json();
      console.log("Tasks saved:", data);
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, TouchSensor, KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeTask = tasks.find((task) => task._id === active.id);
    const overTask = tasks.find((task) => task._id === over.id);

    if (!activeTask) {
      return;
    }

    if (!overTask || activeTask.status !== overTask.status) {
      // Moving task between different lists or into an empty list
      const targetStatus = overTask ? overTask.status : over.id;

      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          if (task._id === active.id) {
            return {
              ...task,
              status: targetStatus, // Set the task's status to the target column's status
            };
          }
          return task;
        });

        return updatedTasks;
      });
    } else {
      // Reordering task within the same list
      const activeIndex = tasks.findIndex((task) => task._id === active.id);
      const overIndex = tasks.findIndex((task) => task._id === over.id);

      if (activeIndex !== overIndex) {
        setTasks((prevTasks) => {
          return arrayMove(prevTasks, activeIndex, overIndex);
        });
      }
    }
    // saveTasksToBackend(tasks);
  };

  
  return (
    <div className="main-div">
      <button className="a-btn" onClick={() => setVisible(true)}>
        Add Task
      </button>
      <Dialog
        className="add-task"
        header={isEditing ? "Edit Task Details" : "New Task Details"}
        visible={visible}
        style={{ width: "35vw", height: "35vw" }}
        onHide={() => {
          setVisible(false);
          setIsEditing(false);
          setTitle("");
          setDescription("");
          setStatus("");
        }}
        footer={
          <div className="footer-div">
            <Button
              label="Save"
              onClick={isEditing ? handleUpdateTask : handleAddTask}
              autoFocus
            />
            <Button
              label="Cancel"
              onClick={() => {
                setVisible(false);
                setIsEditing(false);
                setTitle("");
                setDescription("");
                setStatus("");
              }}
            />
          </div>
        }
      >
        <form>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <br />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <br />
          {isEditing && (
            <input
              type="text"
              placeholder="Task Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          )}
        </form>
      </Dialog>

      {viewTask && (
        <Dialog
          className="view-task"
          header="Task Details"
          visible={true}
          style={{ width: "35vw", height: "35vw" }}
          onHide={closeViewModal}
          footer={
            <div className="footer-div">
              <Button label="Close" onClick={closeViewModal} autoFocus />
            </div>
          }
        >
          <div>
            <h4>Title: {viewTask.title}</h4>
            <p>Description: {viewTask.description}</p>
            <p>Created At: {new Date(viewTask.createdAt).toLocaleString()}</p>
          </div>
        </Dialog>
      )}

      <div className="filter-div">
        <span>
          Search :{" "}
          <input
            type="text"
            placeholder="Search...."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </span>
        <span>
          Sort by :
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
          </select>
        </span>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <div className="cards-div">
          {["todo", "in-progress", "done"].map((status) => (
            <SortableContext
              key={status}
              items={getFilteredTasks(status).map((task) => task._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="card">
                <p className="heading">
                  {status.toUpperCase().replace("-", " ")}
                </p>
                {getFilteredTasks(status).map((task) => (
                  <Task
                    key={task._id}
                    task={task}
                    onFormat={formatDate}
                    onDeleteTask={handleDeleteTask}
                    onEditTask={handleEditTask}
                    onViewTask={handleViewTask}
                  />
                ))}
                {getFilteredTasks(status).length === 0 && (
                  <div className="empty-list-placeholder" id={status}>
                    Drag tasks here
                  </div>
                )}
              </div>
            </SortableContext>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default Dashboard;
