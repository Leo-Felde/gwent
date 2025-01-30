const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let players = [];
let players_ready = 0;

wss.on('connection', (ws) => {
    if (players.length < 2) {
        players.push(ws);
        const playerId = players.length;
        ws.send(JSON.stringify({ type: 'welcome', player: playerId }));

        ws.on('message', (message) => {
            const data = JSON.parse(message);

            if (data.type === 'newGame') {
                if (players.length > 2) {
                    players = [];
                    players_ready = 0;
                }
            }

            if (data.type === 'initial_reDraw') {
                players_ready += 1;
                console.log("Players ready " + players_ready);
                if (players_ready === 2) {
                    console.log("All players are ready")
                    const firstPlayer = Math.random() < 0.5 ? 1 : 2;
                    console.log("Player " + firstPlayer + " goes first");
                    players.forEach((player) => {
                        player.send(JSON.stringify({ type: 'coinToss', player: firstPlayer }));
                    });
                } else if (players_ready > 2) {
                    players_ready = 0;
                    players = [];
                }
            }

            players.forEach((player) => {
                if (player !== ws) {
                    player.send(JSON.stringify(data));
                }
            });
        });

        ws.on('close', () => {
            players = players.filter(player => player !== ws);
        });
    } else {
        ws.send(JSON.stringify({ type: 'full' }));
        ws.close();
    }
});

console.log('Server is running on ws://localhost:8080');