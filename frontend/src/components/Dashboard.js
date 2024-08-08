import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "../styles.css";

const Dashboard = () => {
  const [email, setEmail] = useState(localStorage.getItem('email') || "");
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
      axios.get(`https://trello-app-9fop.onrender.com/api/tasks?email=${email}`).then((response) => {
        console.log(response.data);
        setTasks(response.data);
      });
    }
  }, [email]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const newTask = { title, description, status: "todo", email };

    try {
      const response = await axios.post(
        "https://trello-app-9fop.onrender.com/api/tasks",
        newTask
      );
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
      const response = await axios.put(
        `https://trello-app-9fop.onrender.com/api/tasks/${editTaskId}`,
        updatedTask
      );
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
    try {
      await axios.delete(`https://trello-app-9fop.onrender.com/api/tasks/${taskId}`);
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

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    console.log("Drag Result:", result);

    if (!destination) {
      console.log("No destination. Dragging cancelled.");
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log("Dropped in the same place. Dragging cancelled.");
      return;
    }

    const task = tasks.find((task) => task._id === draggableId);
    const newStatus = destination.droppableId;

    const updatedTask = { ...task, status: newStatus };

    try {
      const response = await axios.put(
        `https://trello-app-9fop.onrender.com/api/tasks/${draggableId}`,
        updatedTask
      );
      setTasks(
        tasks.map((task) => (task._id === draggableId ? response.data : task))
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getFilteredTasks = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortOrder === "recent") {
          return new Date(b.createdAt) - new Date(a.createdAt);
        } else {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
      });
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

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="cards-div">
          {["todo", "in-progress", "done"].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  className="card"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  <p className="heading">
                    {status.toUpperCase().replace("-", " ")}
                  </p>
                  {getFilteredTasks(status).map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="task"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <p className="title">{task.title}</p>
                          <p>{task.description}</p>
                          <p className="time">
                            Created at : {formatDate(task.createdAt)}
                          </p>
                          <div className="btns">
                            <button
                              className="delete"
                              onClick={() => handleDeleteTask(task._id)}
                            >
                              Delete
                            </button>
                            <button
                              className="edit"
                              onClick={() => handleEditTask(task)}
                            >
                              Edit
                            </button>
                            <button
                              className="view"
                              onClick={() => handleViewTask(task)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Dashboard;
