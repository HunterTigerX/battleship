import WebSocket from 'ws';
import { db } from '../websocketserver';

export function broadcastData(type: 'back' | 'not-playing', data: any, playerId?: any) {
    if (type === 'back') {
        const client = db.findUserWsData(playerId);
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
    if (type === 'not-playing') {
        const playersData = db.getAllPlayersData();
        if (playersData) {
            playersData.map((player) => {
                if (!player.startedGame) {
                    if (player.userType !== 'bot') {
                        const playerClient = player.userDataWs;
                        console.log('player', player.userId, playerClient)
                        if (playerClient.readyState === WebSocket.OPEN) {
                            console.log('data', data)
                            playerClient.send(data);
                        }
                    }
                }
            });
        }
    }
}
