import { db } from '../../websocketserver';
import { gameCreate } from '../rooms/joinStartGameResponse';
import { returnOpenGamesResponse } from './updateGameResponse';
import { broadcastData } from '../../broadcasts/broadcast';
import { alertMessage } from '../../errors/error';

export function joinRoom(jsonData: any, playerId: number, clients: any[], zeroId: number) {
    // When 1 player joins, we update games
    // When 2 player joins the same game, we start the game
    // Create games have different playerId's and 2 different responses
    const jsonDatasData = JSON.parse(jsonData.data);
    const gameToJoin: number = jsonDatasData.indexRoom; // Game to join need to be equal to generated game id
    const isPlayerInTheGame = db.isPlayerInTheOpenGame(playerId);

    if (isPlayerInTheGame !== gameToJoin) {
        // Current player is not in any open game
        if (isPlayerInTheGame) {
            db.removePlayerFromTheGames(playerId); // remove player from last game if he was in another game
        }
        db.addPlayerToTheOpenGames(playerId, gameToJoin); // we add player to the players in the open games list
        const usersInTheGame = db.returnPlayersInTheOpenGame(gameToJoin);
        if (usersInTheGame && usersInTheGame.length === 1) {
            // There were no users in the game
            const openGamesResponse = returnOpenGamesResponse(zeroId); // We update games for other players
            broadcastData('everyone-same', clients, openGamesResponse); // change to broadcast only to players
        } else if (usersInTheGame && usersInTheGame.length === 2) {
            // ther were one user waiting in the game so we can start the game
            // We update games and start the game
            const playerWaitingId = usersInTheGame[0].index;
            const playerOneResponse = gameCreate(zeroId, gameToJoin, playerWaitingId);
            const playerTwoResponse = gameCreate(zeroId, gameToJoin, playerId);
            db.removePlayerFromTheGames(playerWaitingId); // close only on end?
            db.removePlayerFromTheGames(playerId); // close only on end?
            db.closeGame(gameToJoin); // close only on end?
            const updateGameResponse = returnOpenGamesResponse(zeroId);
            broadcastData('back', clients, playerOneResponse, playerWaitingId);
            broadcastData('back', clients, playerTwoResponse, playerId);

            broadcastData('everyone-same', clients, updateGameResponse);
        } else {
            alertMessage('This game is already full');
        }
    } else {
        alertMessage('You are already in this room');
    }
}
