import { db } from '../../websocketserver';
import { attackShipsResponse } from './attackResponse';
import { checkHit, checkAttack, getSurroundingPositions, shootAround } from './checkShots';
import { broadcastData } from '../../broadcasts/broadcast';
import { turn } from './turnResponse';
import { updateWinnersResponse } from '../winners/updateWinnersResponse';
import { endGameResponse } from './endGame';
import { returnRandomNumber } from '../../functions/randomNum';
import { alertMessage } from '../../errors/error';

export function generateBotJson(posX: number, posY: number, gameId: number, playerId: number) {
    const newData = {
        x: posX,
        y: posY,
        gameId,
        indexPlayer: playerId,
    };

    const result = {
        type: 'attack',
        data: JSON.stringify(newData),
        id: 0,
    };
    return result;
}

export function generateRandomPosition(playerId: number) {
    let posX = returnRandomNumber(10) - 1;
    let posY = returnRandomNumber(10) - 1;
    let stop = 1000; // remove later
    let count = 0; // remove later
    let youCantAttack = checkAttack(posX, posY, playerId);
    while (youCantAttack && count < stop) { // remove later
        posX = returnRandomNumber(10) - 1;
        posY = returnRandomNumber(10) - 1;
        youCantAttack = checkAttack(posX, posY, playerId);
    }
    count = 0; // remove later
    return [posX, posY];
}

function attackByBot(
    attackData: any,
    humanOpponent: number,
    gameId: number,
    zeroId: number,
    clients: any,
    botId: number
) {
    let positionX: number = attackData.x;
    let positionY: number = attackData.y;
    // We are hitting uniq target
    const shotStatus: 'miss' | 'killed' | 'shot' = checkHit(positionX, positionY, botId, humanOpponent);

    if (shotStatus === 'shot') {
        // Ship is wounded, you can continue to shoot
        const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
        const playersTurnEndResponse = turn(zeroId, botId);
        broadcastData('back', attackResponse, humanOpponent);
        broadcastData('back', playersTurnEndResponse, humanOpponent);
        let [botPositionX, botPositionY] = generateRandomPosition(botId);
        const botJsonData = generateBotJson(botPositionX, botPositionY, gameId, botId);
        attack(botJsonData, humanOpponent, zeroId, clients, 'manual', botId);
    } else if (shotStatus === 'miss') {
        // We missed any target
        const playerTurn = db.switchTurn(gameId); // we switch players
        const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
        const playersTurnEndResponse = turn(zeroId, playerTurn!);
        broadcastData('back', attackResponse, humanOpponent);
        broadcastData('back', playersTurnEndResponse, humanOpponent);
    } else {
        // Ship is killed, lets clear empty spaces and continue to shoot
        const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
        broadcastData('back', attackResponse, humanOpponent);
        const playersTurnEndResponse = turn(zeroId, botId);
        broadcastData('back', playersTurnEndResponse, humanOpponent);
        const enemyShipParts = db.getShipsLocationBackup(humanOpponent);
        let fullShip;
        enemyShipParts?.map((arrayInside: any, index: number) => {
            const checkPartsOfTheShip = arrayInside.find(
                (shipsParts: { x: number; y: number }) => shipsParts.x === positionX && shipsParts.y === positionY
            );
            if (checkPartsOfTheShip) {
                fullShip = enemyShipParts[index];
            }
        });
        if (fullShip) {
            shootAround(getSurroundingPositions(fullShip), clients, botId, humanOpponent, 'bot-turn');
        }
        const botKills = db.countKils(botId, gameId); // Check if we won
        if (botKills === 10) {
            const endGame = endGameResponse(botId, zeroId);
            broadcastData('back', endGame, humanOpponent);
            // db.updateWinners(botId); // If we will want to add bots to the score table, uncomment this
            const winnersResponse = updateWinnersResponse(zeroId);
            broadcastData('back', winnersResponse, humanOpponent);
            db.gameEnded(gameId, botId, humanOpponent);
        } else {
            let [botPositionX, botPositionY] = generateRandomPosition(botId);
            const botJsonData = generateBotJson(botPositionX, botPositionY, gameId, botId);
            attack(botJsonData, humanOpponent, zeroId, clients, 'manual', botId);
        }
    }
}

function twoPlayersGameAttacks(
    attackData: any,
    playerId: number,
    gameId: number,
    zeroId: number,
    clients: any,
    typeOfAttack: string,
    currentRoomPlayers: any,
) {
    // || (botId && currentRoomPlayers))  // if users turn or bot turn
    const currentRoomUsersIds = currentRoomPlayers.players;
    if (currentRoomUsersIds) {
        const secondPlayerId = currentRoomUsersIds.filter(
            // if bot's turn, secont player is the player
            (playerIdToCheck: any) => playerIdToCheck !== playerId // if player's turn, second player is second player :]
        )[0];

        let positionX: number;
        let positionY: number;

        let hittingTheSame: boolean = true;
        if (typeOfAttack === 'random') {
            [positionX, positionY] = generateRandomPosition(playerId);

            attackData.x = positionX;
            attackData.y = positionY;
        } else {
            positionX = attackData.x;
            positionY = attackData.y;
        }

        hittingTheSame = checkAttack(positionX, positionY, playerId); // We are checking if we hit the hitted target twice

        // We check if the player hits the hitted target
        if (!hittingTheSame) {
            // We are hitting uniq target
            const shotStatus: 'miss' | 'killed' | 'shot' = checkHit(positionX, positionY, playerId, secondPlayerId);
            let playerTurn: any = playerId;

            if (shotStatus === 'shot') {
                // Ship is wounded, you can continue to shoot
                const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                const playersTurnEndResponse = turn(zeroId, playerTurn);

                broadcastData('back', attackResponse, playerId);
                broadcastData('back', attackResponse, secondPlayerId);
                broadcastData('back', playersTurnEndResponse, playerId);
                broadcastData('back', playersTurnEndResponse, secondPlayerId);

                if (typeOfAttack === 'random') {
                    // setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000);
                    // attack(jsonData, playerId, zeroId, clients, 'random');
                }
            } else if (shotStatus === 'miss') {
                // We missed any target
                playerTurn = db.switchTurn(gameId); // we switch players
                const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                const playersTurnEndResponse = turn(zeroId, playerTurn);

                broadcastData('back', attackResponse, playerId);
                broadcastData('back', attackResponse, secondPlayerId);
                broadcastData('back', playersTurnEndResponse, playerId);
                broadcastData('back', playersTurnEndResponse, secondPlayerId);
            } else {
                // Ship is killed, lets clear empty spaces and continue to shoot
                // if (!botData) {
                const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                broadcastData('back', attackResponse, playerId);
                // }

                const enemyShipParts = db.getShipsLocationBackup(secondPlayerId);

                let fullShip;
                enemyShipParts?.map((arrayInside: any, index: number) => {
                    const checkPartsOfTheShip = arrayInside.find(
                        (shipsParts: { x: number; y: number }) =>
                            shipsParts.x === positionX && shipsParts.y === positionY
                    );
                    if (checkPartsOfTheShip) {
                        fullShip = enemyShipParts[index];
                    }
                });
                if (fullShip) {
                    shootAround(getSurroundingPositions(fullShip), clients, playerId, secondPlayerId, 'non-bot');
                }
                const playerKills = db.countKils(playerId, gameId); // Check if we won

                if (playerKills === 10) {
                    const endGame = endGameResponse(playerId, zeroId);
                    broadcastData('back', endGame, playerId);
                    broadcastData('back', endGame, secondPlayerId);
                    db.updateWinners(playerId);
                    const winnersResponse = updateWinnersResponse(zeroId);
                    broadcastData('back', winnersResponse, playerId);
                    broadcastData('back', winnersResponse, secondPlayerId);
                    db.gameEnded(gameId, playerId, secondPlayerId);
                } else if (typeOfAttack === 'random') {
                    // setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000); // for faster random shots
                    // attack(jsonData, playerId, zeroId, clients, 'random');
                }
            }
        } else {
            alertMessage('Stop hitting the same target');
        }
    }
}

function attackVsBot(
    attackData: any,
    playerId: number,
    gameId: number,
    zeroId: number,
    clients: any,
    typeOfAttack: string,
    currentRoomPlayers: any,
) {
    const isPlayersTurn = db.checkPlayerTurn(gameId, playerId); // check if it's players turn
    if (isPlayersTurn) {
        // if users turn or bot turn
        const currentRoomUsersIds = currentRoomPlayers.players;
        if (currentRoomUsersIds) {
            // getting bot id
            const botId = currentRoomUsersIds.filter(
                (playerIdToCheck: any) => playerIdToCheck !== playerId
            )[0];

            let positionX: number;
            let positionY: number;

            let hittingTheSame: boolean = true;
            if (typeOfAttack === 'random') {
                [positionX, positionY] = generateRandomPosition(playerId); // hitting the same below will be false

                attackData.x = positionX;
                attackData.y = positionY;
            } else {
                positionX = attackData.x;
                positionY = attackData.y;
            }

            hittingTheSame = checkAttack(positionX, positionY, playerId); // We are checking if we hit the hitted target twice

            // We check if the player hits the hitted target
            if (!hittingTheSame) {
                // We are hitting uniq target
                const shotStatus: 'miss' | 'killed' | 'shot' = checkHit(positionX, positionY, playerId, botId);
                let playerTurn: any = playerId;
                if (shotStatus === 'shot') {
                    // Ship is wounded, you can continue to shoot
                    const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                    const playersTurnEndResponse = turn(zeroId, playerTurn);
                    broadcastData('back', attackResponse, playerId);
                    broadcastData('back', playersTurnEndResponse, playerId);
                    if (typeOfAttack === 'random') {
                        // setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000);
                        // attack(jsonData, playerId, zeroId, clients, 'random');
                    }
                } else if (shotStatus === 'miss') {
                    // We missed any target
                    playerTurn = db.switchTurn(gameId); // we switch players
                    const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                    const playersTurnEndResponse = turn(zeroId, playerTurn);
                    broadcastData('back', attackResponse, playerId);
                    broadcastData('back', playersTurnEndResponse, playerId);
                    let [botPositionX, botPositionY] = generateRandomPosition(playerId);
                    const botJsonData = generateBotJson(botPositionX, botPositionY, gameId, botId);
                    attack(botJsonData, playerId, zeroId, clients, 'manual', botId!); // bot strikes back
                } else {
                    // Ship is killed, lets clear empty spaces and continue to shoot
                    const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                    broadcastData('back', attackResponse, playerId);
                    
                    const playersTurnEndResponse = turn(zeroId, playerTurn);
                    broadcastData('back', playersTurnEndResponse, playerId);
                    
                    const enemyShipParts = db.getShipsLocationBackup(botId);
                    
                    let fullShip;
                    enemyShipParts?.map((arrayInside: any, index: number) => {
                        const checkPartsOfTheShip = arrayInside.find(
                            (shipsParts: { x: number; y: number }) =>
                                shipsParts.x === positionX && shipsParts.y === positionY
                        );
                        if (checkPartsOfTheShip) {
                            fullShip = enemyShipParts[index];
                        }
                    });
                    if (fullShip) {
                        shootAround(getSurroundingPositions(fullShip), clients, playerId, botId, 'human-turn');
                    }
                    const playerKills = db.countKils(playerId, gameId); // Check if we won
                    if (playerKills === 10) {
                        const endGame = endGameResponse(playerId, zeroId);
                        broadcastData('back', endGame, playerId);
                        db.updateWinners(playerId);
                        const winnersResponse = updateWinnersResponse(zeroId);
                        broadcastData('back', winnersResponse, playerId);
                        broadcastData('not-playing', winnersResponse, playerId);
                        db.gameEnded(gameId, playerId, botId);
                    } else if (typeOfAttack === 'random') {
                        // setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000);
                    }
                }
            } else {
                alertMessage('Stop hitting the same target');
            }
        }
    }
}

export function attack(
    jsonData: any,
    playerId: number,
    zeroId: number,
    clients: any,
    typeOfAttack: string,
    botId?: number
) {
    const attackData = JSON.parse(jsonData.data);
    const gameId = attackData.gameId;

    if (botId) {
        attackByBot(attackData, playerId, gameId, zeroId, clients, botId); // bot's move
    } else {
        const isPlayersTurn = db.checkPlayerTurn(gameId, playerId); // check if it's players turn
        if (isPlayersTurn) {
            // This is players turn
            const userData = db.getUsersData(playerId);
            if (userData && userData.inTheRoom) {
                const currentRoomPlayers = db.getWaitingRoomPlayersData(gameId);
                const isGameVsBot = userData.playWithBot;
                if (isPlayersTurn && currentRoomPlayers && !isGameVsBot) { // this is pvp
                    twoPlayersGameAttacks(
                        attackData,
                        playerId,
                        gameId,
                        zeroId,
                        clients,
                        typeOfAttack,
                        currentRoomPlayers,
                    );
                } else if (isPlayersTurn && currentRoomPlayers && isGameVsBot) { // this is pve
                    attackVsBot(
                        attackData,
                        playerId,
                        gameId,
                        zeroId,
                        clients,
                        typeOfAttack,
                        currentRoomPlayers
                    );
                }
            }
        } else {
            alertMessage("It's not your turn");
        }
    }
}
