import WebSocket from 'ws';

export function broadcastData(type: string, playerId: number, clients: any, data: any) {
    if (type === 'back') {
        if (clients[playerId].readyState === WebSocket.OPEN) {
            clients[playerId].send(data);
        }
    }
    if (type === 'everyone-same') {
        for (let i = 0; i < clients.length; i++) {
            if (clients[i].readyState === WebSocket.OPEN) {
                clients[i].send(data);
            }
        }
    }
}
