import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./index.css";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    const newSocket = io("ws://localhost:8000", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("updateData", (tasks) => setTasks(tasks));
    newSocket.on("addTask", (task) => addTask(task));
    newSocket.on("removeTask", (id) => removeTask(id, false));
    newSocket.on("editTask", (updatedTask) => {
      setTasks((tasks) =>
        tasks.map((task) =>
          task.id === updatedTask.id
            ? { ...task, name: updatedTask.name }
            : task
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const addTask = (task) => {
    setTasks((tasks) => [...tasks, task]);
  };

  const removeTask = (id, emit = true) => {
    setTasks((tasks) => tasks.filter((task) => task.id !== id));
    if (emit && socket) socket.emit("removeTask", id);
  };

  const editTask = (id, name, emit = true) => {
    setTasks((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, name } : task))
    );
    if (emit && socket) socket.emit("editTask", { id, name });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (taskName.trim() === "") return;

    const newTask = {
      id: Date.now(),
      name: taskName,
    };

    addTask(newTask);
    if (socket) socket.emit("addTask", newTask);

    setTaskName("");
  };

  return (
    <div className="App">
      <header>
        <h1>ToDoList.app</h1>
      </header>

      <section className="tasks-section" id="tasks-section">
        <h2>Tasks</h2>

        <ul className="tasks-section__list" id="tasks-list">
          {tasks.map((task) => (
            <li className="task" key={task.id}>
              {editingId === task.id ? (
                <>
                  <input
                    className="text-input"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        editTask(task.id, editedName);
                        setEditingId(null);
                      }
                    }}
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      editTask(task.id, editedName);
                      setEditingId(null);
                    }}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  {task.name}
                  <button
                    className="btn btn--red"
                    onClick={() => removeTask(task.id)}
                  >
                    Remove
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setEditingId(task.id);
                      setEditedName(task.name);
                    }}
                  >
                    Edit
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        <form id="add-task-form" onSubmit={handleFormSubmit}>
          <input
            className="text-input"
            autoComplete="off"
            type="text"
            placeholder="Type your description"
            id="task-name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
          />
          <button className="btn" type="submit">
            Add
          </button>
        </form>
      </section>
    </div>
  );
};

export default App;
