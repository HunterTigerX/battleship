import WebSocket from 'ws';
import { db } from '../websocketserver';

export function broadcastData(type: 'back' | 'everyone-same', playerId: number, clients: any, data: any) {
    if (type === 'back') {
        const client = db.findClientsData(playerId);
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
    if (type === 'everyone-same') {
        for (let i = 0; i < clients.length; i += 1) {
            if (clients[i].readyState === WebSocket.OPEN) {
                clients[i].send(data);
            }
        }
    }
}
