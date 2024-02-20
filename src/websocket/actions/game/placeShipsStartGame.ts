import { db } from '../../websocketserver';
import { IAddShipsJson, IShips } from '../../interfaces/interfaces';
import { createGameResponse } from '../../actions/game/startGameResponse';
import { returnRandomNumber } from '../../functions/randomNum';
import { savePlayersShipsToDb } from './saveShipsToDb';
import { turn } from './turnResponse';
import { alertMessage } from '../../errors/error';
import { broadcastData } from '../../broadcasts/broadcast';
import { generateBotJson, generateRandomPosition, attack } from './battle';

export function placeShipsStartGame(jsonData: any, playerId: number, zeroId: number, clients: any) {
    const jsonDataShips: IAddShipsJson = JSON.parse(jsonData.data);
    const gameId = jsonDataShips.gameId;
    const shipsArray: IShips[] = jsonDataShips.ships;
    const gameStartResponse: string = createGameResponse(playerId, shipsArray, zeroId, gameId);
    savePlayersShipsToDb(shipsArray, playerId, gameStartResponse);
    const playersReady = db.getPlayersInTheWaitingRoom(gameId, playerId);
    const playersWaitingRoomData = db.getWaitingRoomPlayersData(gameId);

    if (playersReady === 2 && playersWaitingRoomData) {
        // Received ships from 2 players
        const playerTwoId = playersWaitingRoomData.players.filter((player) => player.players !== playerId)[0]; // Who connected first

        const playerOneData = db.getUsersData(playerId);
        const playerTwoData = db.getUsersData(playerTwoId);

        if (playerTwoData && playerOneData) {
            const playerOneResponse = playerOneData.playersResponse;
            const playerTwoResponse = playerTwoData.playersResponse;
            broadcastData('back', clients, playerOneResponse, playerId);
            broadcastData('back', clients, playerTwoResponse, playerTwoId);

            const firstTurnPlayer = returnRandomNumber(2); // return 1 or 2
            const firstTurn = firstTurnPlayer === 1 ? playerTwoId : playerId;
            const playersTurnEndResponse = turn(zeroId, firstTurn);
            db.startFirstTurn(gameId, firstTurn, [playerTwoId, playerId]);

            broadcastData('back', clients, playersTurnEndResponse, playerTwoId);
            broadcastData('back', clients, playersTurnEndResponse, playerId);
        }
    } else {
        alertMessage('Waiting ships from second player');
    }
}

export function startGameWithBot(
    jsonData: any,
    playerId: number,
    zeroId: number,
    clients: any,
    botShips: any[],
    botId: number
) {
    const jsonDataShips: IAddShipsJson = JSON.parse(jsonData.data);
    const gameId = jsonDataShips.gameId;
    const shipsArray: IShips[] = jsonDataShips.ships;

    const gameStartResponse: string = createGameResponse(playerId, shipsArray, zeroId, gameId);
    savePlayersShipsToDb(shipsArray, playerId, gameStartResponse);
    savePlayersShipsToDb(botShips, botId, gameStartResponse);
    db.getPlayersInTheWaitingRoom(gameId, playerId);
    db.getPlayersInTheWaitingRoom(gameId, botId);
    // Received ships from 2 players

    const playerOneData = db.getUsersData(playerId);

    if (playerOneData) {
        const playerOneResponse = playerOneData.playersResponse;
        broadcastData('back', clients, playerOneResponse, playerId);
        const firstTurnPlayer = returnRandomNumber(2); // return 1 or 2
        const firstTurn = firstTurnPlayer === 1 ? botId : playerId;
        const playersTurnEndResponse = turn(zeroId, firstTurn);
        db.startFirstTurn(gameId, firstTurn, [botId, playerId]);

        broadcastData('back', clients, playersTurnEndResponse, playerId);
        if (firstTurn === botId) {
            let [botPositionX, botPositionY] = generateRandomPosition(botId);
            const botJsonData = generateBotJson(botPositionX, botPositionY, gameId, botId);
            attack(botJsonData, playerId, zeroId, clients, 'manual', botId);
        }
    }
}
