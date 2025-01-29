const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let players = [];

wss.on('connection', (ws) => {
    if (players.length < 2) {
        players.push(ws);
        ws.send(JSON.stringify({ type: 'welcome', player: players.length }));

        if (players.length === 2) {
            players.forEach((player, index) => {
                player.send(JSON.stringify({ type: 'Join', player: index + 1 }));
            });
        }

        ws.on('message', (message) => {
            console.log("Server received: %s", message);
            
            const data = JSON.parse(message);
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