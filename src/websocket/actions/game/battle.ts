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

    let youCantAttack = checkAttack(posX, posY, playerId);
    while (youCantAttack) {
        posX = returnRandomNumber(10) - 1;
        posY = returnRandomNumber(10) - 1;
        youCantAttack = checkAttack(posX, posY, playerId);
    }
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
        broadcastData('back', clients, attackResponse, humanOpponent);
        broadcastData('back', clients, playersTurnEndResponse, humanOpponent);
        let [botPositionX, botPositionY] = generateRandomPosition(botId);
        const botJsonData = generateBotJson(botPositionX, botPositionY, gameId, botId);
        attack(botJsonData, humanOpponent, zeroId, clients, 'manual', botId);
    } else if (shotStatus === 'miss') {
        // We missed any target
        const playerTurn = db.switchTurn(gameId); // we switch players
        const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
        const playersTurnEndResponse = turn(zeroId, playerTurn!);
        broadcastData('back', clients, attackResponse, humanOpponent);
        broadcastData('back', clients, playersTurnEndResponse, humanOpponent);
    } else {
        // Ship is killed, lets clear empty spaces and continue to shoot
        const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
        broadcastData('back', clients, attackResponse, humanOpponent);
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
            broadcastData('back', clients, endGame, humanOpponent);
            db.updateWinners(botId);
            const winnersResponse = updateWinnersResponse(zeroId);
            broadcastData('back', clients, winnersResponse, humanOpponent);
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
    jsonData: any
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

                broadcastData('back', clients, attackResponse, playerId);
                broadcastData('back', clients, attackResponse, secondPlayerId);
                broadcastData('back', clients, playersTurnEndResponse, playerId);
                broadcastData('back', clients, playersTurnEndResponse, secondPlayerId);

                if (typeOfAttack === 'random') {
                    // setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000);
                    attack(jsonData, playerId, zeroId, clients, 'random');
                }
            } else if (shotStatus === 'miss') {
                // We missed any target
                playerTurn = db.switchTurn(gameId); // we switch players
                const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                const playersTurnEndResponse = turn(zeroId, playerTurn);

                broadcastData('back', clients, attackResponse, playerId);
                broadcastData('back', clients, attackResponse, secondPlayerId);
                broadcastData('back', clients, playersTurnEndResponse, playerId);
                broadcastData('back', clients, playersTurnEndResponse, secondPlayerId);
            } else {
                // Ship is killed, lets clear empty spaces and continue to shoot
                // if (!botData) {
                const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                broadcastData('back', clients, attackResponse, playerId);
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
                    broadcastData('everyone-same', clients, endGame);
                    db.updateWinners(playerId);
                    const winnersResponse = updateWinnersResponse(zeroId);
                    broadcastData('everyone-same', clients, winnersResponse);
                    db.gameEnded(gameId, playerId, secondPlayerId);
                } else if (typeOfAttack === 'random') {
                    // setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000);
                    attack(jsonData, playerId, zeroId, clients, 'random');
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
    jsonData: any
) {
    const isPlayersTurn = db.checkPlayerTurn(gameId, playerId); // check if it's players turn
    if (isPlayersTurn) {
        // if users turn or bot turn
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
                    broadcastData('back', clients, attackResponse, playerId);
                    broadcastData('back', clients, playersTurnEndResponse, playerId);
                    if (typeOfAttack === 'random') {
                        // setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000);
                        attack(jsonData, playerId, zeroId, clients, 'random');
                    }
                } else if (shotStatus === 'miss') {
                    // We missed any target
                    playerTurn = db.switchTurn(gameId); // we switch players
                    const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                    const playersTurnEndResponse = turn(zeroId, playerTurn);
                    broadcastData('back', clients, attackResponse, playerId);
                    broadcastData('back', clients, playersTurnEndResponse, playerId);
                    let [botPositionX, botPositionY] = generateRandomPosition(playerId);
                    const botJsonData = generateBotJson(botPositionX, botPositionY, gameId, secondPlayerId);
                    attack(botJsonData, playerId, zeroId, clients, 'manual', secondPlayerId!); // bot strikes back
                } else {
                    // Ship is killed, lets clear empty spaces and continue to shoot
                    const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                    broadcastData('back', clients, attackResponse, playerId);

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
                        shootAround(getSurroundingPositions(fullShip), clients, playerId, secondPlayerId, 'human-turn');
                    }
                    const playerKills = db.countKils(playerId, gameId); // Check if we won

                    if (playerKills === 10) {
                        const endGame = endGameResponse(playerId, zeroId);
                        broadcastData('back', clients, endGame, playerId);
                        db.updateWinners(playerId);
                        const winnersResponse = updateWinnersResponse(zeroId);
                        broadcastData('back', clients, winnersResponse, playerId);
                        db.gameEnded(gameId, playerId, secondPlayerId);
                    } else if (typeOfAttack === 'random') {
                        setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000);
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
        attackByBot(attackData, playerId, gameId, zeroId, clients, botId);
    } else {
        const isPlayersTurn = db.checkPlayerTurn(gameId, playerId); // check if it's players turn
        if (isPlayersTurn) {
            // This is players turn
            const userData = db.getUsersData(playerId);
            if (userData && userData.inTheRoom) {
                const currentRoomPlayers = db.getWaitingRoomPlayersData(gameId);
                const isGameVsBot = userData.playWithBot;
                if (isPlayersTurn && currentRoomPlayers && !isGameVsBot) {
                    twoPlayersGameAttacks(
                        attackData,
                        playerId,
                        gameId,
                        zeroId,
                        clients,
                        typeOfAttack,
                        currentRoomPlayers,
                        jsonData
                    );
                } else if (isPlayersTurn && currentRoomPlayers && isGameVsBot) {
                    attackVsBot(
                        attackData,
                        playerId,
                        gameId,
                        zeroId,
                        clients,
                        typeOfAttack,
                        currentRoomPlayers,
                        jsonData
                    );
                }
            }
        } else {
            alertMessage("It's not your turn");
        }
    }
}
