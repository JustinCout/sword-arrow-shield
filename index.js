const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io").listen(server);
//Learned how to do multiple socket rooms from here:
//https://ayushgp.github.io/Tic-Tac-Toe-Socket-IO/
let rooms = 0;
let arr = [];

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", socket => {
  console.log("player connected");

  socket.on("create game", data => {
    socket.join(`game-${++rooms}`);
    socket.emit("new game", {
      name: data.name,
      room: `game-${rooms}`
    });
  });

  socket.on("join game", data => {
    var room = io.nsps["/"].adapter.rooms[data.room];
    if (room && room.length === 1) {
      socket.join(data.room);
      socket.broadcast.to(data.room).emit("player1", { name: data.name });
      socket.emit("player2", { name: data.name, room: data.room });
    } else if (!room || room.length > 1) {
      socket.emit("error", { message: "Sorry, The game is unavailable!" });
    }
  });

  socket.on("values", data => {
    arr.push(data.choice);

    let p1 = arr[0];
    let p2 = arr[1];

    console.log(arr);

    //Game Logic
    if (arr.length === 2) {
      if (
        (p1 === "arrow" && p2 === "sword") ||
        (p2 === "arrow" && p1 === "sword")
      ) {
        let msg =
          "The archer strikes the sword-bearer from afar. The wound is fatal - ARROW WINS!";
        io.in(data.room).emit("winningMsg", msg);
      } else if (
        (p1 === "shield" && p2 === "sword") ||
        (p2 === "shield" && p1 === "sword")
      ) {
        let msg =
          "In one heavy swoop, the sword breaks the shield leaving the shield-bearer vulnerable to attack - SWORD WINS!";
        io.in(data.room).emit("winningMsg", msg);
      } else if (
        (p1 === "arrow" && p2 === "shield") ||
        (p2 === "arrow" && p1 === "shield")
      ) {
        let msg =
          "The shield-bearer blocks the arrow and charges the archer, knocking them to the ground - SHIELD WINS!";
        io.in(data.room).emit("winningMsg", msg);
      } else if (p1 === p2) {
        let msg = "It's a draw! Everyone lives to fight another day.";
        io.in(data.room).emit("winningMsg", msg);
      }
      arr = [];
    }
  });
  socket.on("refresh", () => {
    io.in(`game-${rooms}`).emit("refresh");
  });

  socket.on("lobby", () => {
    io.in(`game-${rooms}`).emit("lobby");
  });
});

server.listen(process.env.PORT || 3000, function() {
  console.log("Awaiting players...");
});
