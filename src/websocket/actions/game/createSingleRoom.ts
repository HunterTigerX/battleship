import { returnRandomNumber } from '../../functions/randomNum';
import { db } from '../../websocketserver';
import { gameCreate } from '../rooms/joinStartGameResponse';
import { broadcastData } from '../../broadcasts/broadcast';
import { returnOpenGamesResponse } from '../rooms/updateGameResponse';
export function startSingleGame(playerId: number, botId: number, clients: any, zeroId: number) {
    const maxGameNumber = 999999;
    // We create game -> Join game -> Receive ships -> start game
    let gameId = returnRandomNumber(maxGameNumber); // Generating new game number

    while (db.checkOpenGames(gameId)) {
        // Checking if there is a game with this number
        gameId = returnRandomNumber(maxGameNumber);
    }

    db.setGameWithBot(playerId); // set players settings to the bot mode

    let newGameData = {
        roomId: gameId,
        roomUsers: [],
    };
    db.saveOpenGame(newGameData);

    db.addPlayerToTheOpenGames(playerId, gameId); // we add player to the players in the open games list
    db.addPlayerToTheOpenGames(botId, gameId); // we add bot to the players in the open games list
    const playerOneResponse = gameCreate(zeroId, gameId, playerId);
    db.removePlayerFromTheGames(playerId); // close only on end?
    db.removePlayerFromTheGames(botId); // close only on end?
    db.closeGame(gameId); // close only on end?

    const updateGameResponse = returnOpenGamesResponse(zeroId);

    broadcastData('back', clients, playerOneResponse, playerId);
    broadcastData('everyone-same', clients, updateGameResponse); // Update only for not playing players later
}
