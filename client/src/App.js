import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./index.css";

const App = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState("");

  useEffect(() => {
    const newSocket = io("ws://localhost:8000", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const removeTask = (id) => {
    setTasks((tasks) => tasks.filter((task) => task.id !== id));
    if (socket) socket.emit("removeTask", id);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (taskName.trim() === "") return;

    const newTask = {
      id: Date.now(),
      name: taskName,
    };

    setTasks((tasks) => [...tasks, newTask]);
    if (socket) socket.emit("addTask", newTask);

    setTaskName(""); // wyczyść input
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
              {task.name}
              <button
                className="btn btn--red"
                onClick={() => removeTask(task.id)}
              >
                Remove
              </button>
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
