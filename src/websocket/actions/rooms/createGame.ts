import { db } from '../../websocketserver';
import { returnOpenGamesResponse } from './updateGameResponse';
import { returnRandomNumber } from '../../functions/randomNum';
import { broadcastData } from '../../broadcasts/broadcast';
import { alertMessage } from '../../errors/error';

export function createGame(maxGameNumber: number, clients: any[], zeroId: number) {
    const currentGames = db.getOpenGames().length;
    if (maxGameNumber > currentGames) {
        // games number is not reached
        let gameID = returnRandomNumber(maxGameNumber); // Generating new game ID
        while (db.checkOpenGames(gameID)) {
            // Checking if there is a game with this number
            gameID = returnRandomNumber(maxGameNumber);
        }

        let newGameData = {
            roomId: gameID,
            roomUsers: [],
        };
        db.saveOpenGame(newGameData);
        const updateGameResponse = returnOpenGamesResponse(zeroId);
        broadcastData('everyone-same', clients, updateGameResponse);
    } else {
        alertMessage(`Max rooms number reached. Current limit of rooms is ${maxGameNumber}`);
    }
}
