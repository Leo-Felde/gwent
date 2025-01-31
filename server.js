const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let sessions = {}; // Stores active sessions with their codes
let players = []; // Stores connected players

// Helper function to generate a random 4-character code
function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

wss.on('connection', (ws) => {
  ws.playerId = players.length + 1;
  players.push(ws);

  // Send a welcome message with the player's ID
  ws.send(JSON.stringify({ type: 'welcome', playerId: ws.playerId }));
  console.log(`# Player ${ws.playerId} connected`);

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'createSession') {
      // Generate a unique 4-character code
      const sessionCode = generateCode();
      // Create a new session and auto-join the creator
      sessions[sessionCode] = { players: [ws], code: sessionCode, playersReady: 0 };
      ws.sessionCode = sessionCode; // Store the session code on the WebSocket object
      ws.send(JSON.stringify({ type: 'sessionCreated', code: sessionCode }));
      console.log(`# Player ${ws.playerId} created Session ${sessionCode}`);

      // Notify the creator that they are auto-joined
      ws.send(JSON.stringify({ type: 'sessionJoined', code: sessionCode }));
    }

    if (data.type === "cancelSession") {
      const sessionCode = data.code;
      if (!sessions[sessionCode]) return;

      console.log(`# Player ${ws.playerId} cancelled Session ${sessionCode}`);
      delete sessions[ws.sessionCode];
    }

    if (data.type === "leaveSession") {
      const sessionCode = data.code;
      if (!sessions[sessionCode]) return;

      console.log(`# Player ${ws.playerId} left Session ${sessionCode}`);
      sessions[sessionCode].players = sessions[sessionCode].players.filter(player => player !== ws);
    }

    if (data.type === 'joinSession') {
      const sessionCode = data.code;
      if (sessions[sessionCode] && sessions[sessionCode].players.length === 1) {
        // Add the second player to the session
        sessions[sessionCode].players.push(ws);
        ws.sessionCode = sessionCode;
        ws.send(JSON.stringify({ type: 'sessionJoined', code: sessionCode }));
        console.log(`# Player ${ws.playerId} joined Session ${sessionCode}`);

        sessions[sessionCode].players.forEach((player, index) => {
          player.send(JSON.stringify({ type: 'sessionReady', player: index + 1 }));
        });
      } else {
        ws.send(JSON.stringify({ type: 'sessionInvalid' }));
        console.log(`# Player ${ws.playerId} attempted to join invalid Session ${sessionCode}`);
      }
    }

    if (data.type === "gameStart") {
        if (ws.sessionCode && sessions[ws.sessionCode]) {
            const session = sessions[ws.sessionCode]; 
            const firstPlayer = session.players[Math.floor(Math.random() * session.players.length)].playerId;
            session.players.forEach((player) => {
                player.send(JSON.stringify({ type: 'coinToss', player: firstPlayer }));
              });
        }
    }

    if (data.type === 'initial_reDraw') {
      if (ws.sessionCode && sessions[ws.sessionCode]) {
        const session = sessions[ws.sessionCode];
        session.playersReady += 1; // Increment the ready counter for the session

        console.log(`# Players ready in session ${ws.sessionCode}: ${session.playersReady}`);

        if (session.playersReady === 2) {
            session.players.forEach((player) => {
                player.send(JSON.stringify({ type: 'start' }));
              });
          session.playersReady = 0;
        }
      }
    }

    // Relay messages to the other player in the same session
    if (ws.sessionCode) {
      const sessionPlayers = sessions[ws.sessionCode]?.players || [];
      sessionPlayers.forEach((player) => {
        if (player !== ws) {
          player.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log(`# Player ${ws.playerId} disconnected`);

    // Check if the player has an active session
    if (ws.sessionCode && sessions[ws.sessionCode]) {
      const session = sessions[ws.sessionCode];

      // Check if the player is the creator of the session
      if (session.players[0] === ws) {
        // If the creator disconnects, delete the session
        console.log(`# Deleting session ${ws.sessionCode} because the creator left`);
        delete sessions[ws.sessionCode];
      } else {
        // If a non-creator disconnects, remove them from the session and notify the creator
        session.players = session.players.filter(player => player !== ws);
        session.players[0].send(JSON.stringify({ type: 'unReady' }));
        session.players[0].send(JSON.stringify({ type: 'sessionUnready' }));
        console.log(`# Player ${ws.playerId} left the session ${ws.sessionCode}`);
      }
    }

    // Remove the player from the players list
    players = players.filter(player => player !== ws);
  });
});

console.log(`## Server is up and running ##`);