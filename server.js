const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

let sessions = {}; // Stores active sessions with their codes
let players = []; // Stores connected players
let players_ready = 0;

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
      sessions[sessionCode] = { players: [ws], code: sessionCode };
      ws.sessionCode = sessionCode; // Store the session code on the WebSocket object
      ws.send(JSON.stringify({ type: 'sessionCreated', code: sessionCode }));
      console.log(`# Player ${ws.playerId} created Session ${sessionCode}`);

      // Notify the creator that they are auto-joined
      ws.send(JSON.stringify({ type: 'sessionJoined', code: sessionCode }));
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

    if (data.type === 'initial_reDraw') {
      players_ready += 1;
      console.log("# Players ready " + players_ready);
      if (players_ready === 2) {
        const firstPlayer = Math.random() < 0.5 ? 1 : 2;
        players.forEach((player) => {
          player.send(JSON.stringify({ type: 'coinToss', player: firstPlayer }));
        });
      } else if (players_ready > 2) {
        players_ready = 0;
        players = [];
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
      console.log(`# Deleting session ${ws.sessionCode} because the creator left`);
      delete sessions[ws.sessionCode]; // Delete the session
    }

    // Remove the player from the players list
    players = players.filter(player => player !== ws);
  });
});

console.log(`## Sever is up and running ##`);