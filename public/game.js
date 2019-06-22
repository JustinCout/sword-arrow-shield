window.onload = () => {
  //var socket = io.connect("https://sword-arrow-shield.herokuapp.com/");
  var socket = io.connect("http://localhost:3000/");
  let player;
  let game;
  const p1 = 1;
  const p2 = 2;

  //Classes
  class Player {
    constructor(name, num) {
      this.name = name;
      this.num = num;
    }

    getPlayerName() {
      return this.name;
    }
  }

  class Game {
    constructor(gameId) {
      this.gameId = gameId;
    }

    playerPick(val) {
      $("#selected-weapon").html("You chose " + val);
    }

    getGameId() {
      return this.gameId;
    }

    gameLogic() {
      //Player selections
      $("#playerChoice").val("");
      $("#sword").click(() => {
        $("#selected-weapon").text("Sword");
        $("#playerChoice").val("sword");
      });
      $("#shield").click(() => {
        $("#selected-weapon").text("Shield");
        $("#playerChoice").val("shield");
      });
      $("#arrow").click(() => {
        $("#selected-weapon").text("Arrow");
        $("#playerChoice").val("arrow");
      });

      //Submit selection
      $("#submitVal").submit(e => {
        e.preventDefault();
        //Validation
        if ($("#playerChoice").val() === "") {
          alert("You must choose a weapon for battle!");
        } else {
          $("#submitBtn").css("display", "none");
          let playerChoice = $("#playerChoice").val();
          this.playerPick(playerChoice);

          let user = {};
          user.name = player.getPlayerName();
          user.choice = playerChoice;
          user.room = this.gameId;
          socket.emit("values", user);
        }
        //Call winner function - pass user object to get each user's value
        return false;
      });
    }

    displayGame(msg) {
      $("#game-login").css("display", "none");
      $("#game-board").css("display", "block");
      $("#player1").html(msg);
      //when game is displayed, call gameLogic() to check for submit actions
      this.gameLogic();
    }
  }

  //Socket Emit click events
  $("#createGame").on("click", () => {
    const p1Name = $("#playerName").val();
    if (!p1Name) {
      alert("You must enter a name for battle!");
      return;
    }
    socket.emit("create game", { name: p1Name });
    player = new Player(p1Name, p1);
  });

  $("#joinGame").on("click", () => {
    const p2Name = $("#player2Name").val();
    const gameId = $("#gameId").val();
    if (!p2Name || !gameId) {
      alert("You must enter a name and game ID to join a battle!");
      return;
    }
    socket.emit("join game", { name: p2Name, room: gameId });
    player = new Player(p2Name, p2);
  });

  $("#newGameBtn").on("click", () => {
    socket.emit("refresh");
  });

  $("#exitBtn").on("click", () => {
    socket.emit("lobby");
  });

  //Socket Listeners

  //When player 1 creates a game, new game is emitted from the server
  //listens for new game to be emitted
  socket.on("new game", data => {
    const msg = `Hello, ${
      data.name
    }. Tell your opponent to meet you at the battlefield with this Game ID: 
      ${data.room}. Waiting for player 2...`;

    game = new Game(data.room);
    game.displayGame(msg);
  });

  socket.on("player1", data => {
    const msg = `Hello, ${player.name}`;
    $("#player1").html(msg);
    $("#msg").text("");
  });

  socket.on("player2", data => {
    const msg = `Hello, ${data.name}`;
    // Create game for player 2
    game = new Game(data.room);
    $("#player2").html(msg);
    game.displayGame();
  });

  socket.on("winningMsg", msg => {
    $("#msg").html(msg);
    $("#newGameBtn").css("display", "flex");
    $("#exitBtn").css("display", "flex");
  });

  socket.on("error", data => {
    $("#msg").html(data);
    location.reload();
  });

  socket.on("refresh", () => {
    $("#msg").text("");
    $("#selected-weapon").text("");
    $("#newGameBtn").css("display", "none");
    $("#exitBtn").css("display", "none");
    $("#submitBtn").css("display", "flex");
  });

  socket.on("lobby", () => {
    location.reload();
  });

  //Toggle Rules
  $("#rulesBtn").on("click", () => {
    $("#sideMenu").toggle(() => {
      $(this).css("display", "block");
    });
  });
};
