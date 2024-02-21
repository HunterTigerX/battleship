import { returnRandomNumber } from '../../functions/randomNum';
import { db } from '../../websocketserver';
import { gameCreate } from '../rooms/joinStartGameResponse';
import { broadcastData } from '../../broadcasts/broadcast';
import { returnOpenGamesResponse } from '../rooms/updateGameResponse';
import { maxGameNumber as minRoomNumber } from '../../websocketserver';

export function startSingleGame(playerId: number, botId: number, zeroId: number) {
    
    const maxGameNumber = 999999;
    // We create game -> Join game -> Receive ships -> start game
    let gameId = returnRandomNumber(minRoomNumber + 1, maxGameNumber); // Generating new game number

    while (db.checkOpenGames(gameId)) {
        // Checking if there is a game with this number
        gameId = returnRandomNumber(maxGameNumber); // If true, generate new game id untill game id will be uniq
    }
    
    const isPlayerInTheGame = db.isPlayerInTheOpenGame(playerId);
    if (isPlayerInTheGame) {
        db.removePlayerFromTheGames(playerId); // remove player from last game if he was in another game
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

    broadcastData('back', playerOneResponse, playerId);
    broadcastData('not-playing', updateGameResponse);
}
