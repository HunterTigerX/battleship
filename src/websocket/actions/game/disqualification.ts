import { db } from '../../websocketserver';
import { endGameResponse } from './endGame';
import { updateWinnersResponse } from '../winners/updateWinnersResponse';
import { broadcastData } from '../../broadcasts/broadcast';

export function disqualificationOrDisconnect(userId: number, clients: any) {
    const zeroId = 0;
    const playerData = db.getUsersData(userId);
    if (playerData) {
        // WE found our player's data
        const usersRoom = playerData.inTheRoom;
        if (usersRoom) {
            // Our player was playing
            const usersRoomData = db.getWaitingRoomPlayersData(usersRoom);
            if (usersRoomData) {
                // We get users in the room to check
                if (!playerData.playWithBot) {
                    const playersInTheRoom = usersRoomData.players;
                    const secondPlayerId = playersInTheRoom.filter((player) => player !== userId)[0];

                    const endGame = endGameResponse(secondPlayerId, zeroId);
                    broadcastData('back', endGame, secondPlayerId);
                    db.updateWinners(secondPlayerId);
                    const winnersResponse = updateWinnersResponse(zeroId);
                    broadcastData('back', winnersResponse, secondPlayerId);
                    db.gameEnded(usersRoom, secondPlayerId, userId);
                    
                } else {
                    const playersInTheRoom = usersRoomData.players;
                    const secondPlayerId = playersInTheRoom.filter((player) => player !== userId)[0];
                    db.gameEnded(usersRoom, secondPlayerId, userId);
                }

            }
        }
    }
}
