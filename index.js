const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const postRoute = require("./routes/posts");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const cors = require("cors");
const path = require("path");
//ens
// app.use(express.static(path.join(__dirname, 'public')))

// app.get('/', (req, res) => {
//   res.sendFile("index.html")
//   console.log("hello")
// }); 

//lama
// app.use(express.static(path.join(__dirname, "/client/build")));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
// });

const server = app.listen(process.env.PORT ||8800, () => {
  console.log("Backend server is ready!");
});

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});


let users = [];

const addUser = (userId, username, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, username, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when connect
  console.log("a user connected");

  // take socketid from user
  socket.on("addUser", ({ userId, username }) => {
    addUser(userId, username, socket.id);
    io.emit("getUsers", users);
  });

  //like && follow/unfollow && comment && share
  socket.on("sendNot", ({ receiverId, senderName, type }) => {
    console.log(type)
    const receiver = getUser(receiverId);
    io.to(receiver?.socketId).emit("getNot", {senderName, type});
  });


  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, newMessage }) => {
    const user = getUser(receiverId);
    io.to(user?.socketId).emit("getMessage", {
      senderId,
      newMessage,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user has disconnected!!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

dotenv.config();

mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
