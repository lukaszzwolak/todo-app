const express = require("express");
const path = require("path");
const socket = require("socket.io");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, "/client/build")));

app.use((req, res) => {
  res.status(404).send({ message: "Not found..." });
});

const server = app.listen(PORT, () => {
  console.log("Server is running...");
});

const io = socket(server);

const tasks = [];

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.emit("updateData", tasks);

  socket.on("addTask", (task) => {
    console.log("Adding task:", task);
    tasks.push(task);
    socket.broadcast.emit("addTask", task);
  });

  socket.on("removeTask", (taskId) => {
    console.log("Removing task with id:", taskId);
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index !== -1) {
      tasks.splice(index, 1);
      socket.broadcast.emit("removeTask", taskId);
    }
  });
});
