import { db } from '../websocketserver';
import { attackShipsResponse } from '../responses/attack';
import { checkHit, checkAttack, getSurroundingPositions, shootAround } from '../responses/checkShots';
import { broadcastData } from '../broadcasts/broadcast';
import { turn } from '../responses/turn';
import { updateWinnersResponse } from '../responses/updateWinnersResponse';
import { endGameResponse } from '../responses/endGame';
import { returnRandomNumber } from '../functions/randomNum';

function generateRandomPosition(playerId: number, gameId: number) {
    let posX = returnRandomNumber(10) - 1;
    let posY = returnRandomNumber(10) - 1;

    let youCantAttack = checkAttack(posX, posY, playerId, gameId);
    while (youCantAttack) {
        posX = returnRandomNumber(10) - 1;
        posY = returnRandomNumber(10) - 1;
        youCantAttack = checkAttack(posX, posY, playerId, gameId);
        console.log('old', posX, posY);
        console.log('randomizing');
        console.log('new', posX, posY);
    }
    return [posX, posY];
}

export function attack(jsonData: any, playerId: number, zeroId: number, clients: any, typeOfAttack: string) {
    const attackData = JSON.parse(jsonData.data);
    const gameId = attackData.gameId;
    const isPlayersTurn = db.checkPlayerTurn(gameId, playerId); // check if it's players turn

    if (isPlayersTurn) {
        const currentRoomUsersIds = db.returnCurrentGamesPlayers(gameId);

        if (currentRoomUsersIds) {
            const secondPlayerId = currentRoomUsersIds.filter(
                (playerIdToCheck: any) => playerIdToCheck.playerId !== playerId
            )[0].playerId;

            let positionX: number;
            let positionY: number;

            let hittingTheSame: boolean = true;
            if (typeOfAttack === 'random') {
                [positionX, positionY] = generateRandomPosition(playerId, gameId);

                attackData.x = positionX;
                attackData.y = positionY;
            } else {
                positionX = attackData.x;
                positionY = attackData.y;
            }
            hittingTheSame = checkAttack(positionX, positionY, playerId, gameId); // We are checking if we hit the hitted target twice

            console.log(positionX, positionY, playerId);
            // We check if the player hits the hitted target
            if (!hittingTheSame) {
                // We are hitting uniq target
                const shotStatus: 'miss' | 'killed' | 'shot' = checkHit(positionX, positionY, secondPlayerId, gameId);
                let playerTurn: any = playerId;

                if (shotStatus === 'shot') {
                    // Ship is wounded, you can continue to shoot
                    const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                    const playersTurnEndResponse = turn(zeroId, playerTurn);
                    broadcastData('back', playerId, clients, attackResponse);
                    broadcastData('back', secondPlayerId, clients, attackResponse);
                    broadcastData('back', playerId, clients, playersTurnEndResponse);
                    broadcastData('back', secondPlayerId, clients, playersTurnEndResponse);
                    if (typeOfAttack === 'random') {
                        setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000);
                        console.log('randomAttack'); // Faster random attacks
                    }
                } else if (shotStatus === 'miss') {
                    // We missed any target
                    playerTurn = db.switchTurn(gameId); // we switch players
                    const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                    const playersTurnEndResponse = turn(zeroId, playerTurn);
                    broadcastData('back', playerId, clients, attackResponse);
                    broadcastData('back', secondPlayerId, clients, attackResponse);
                    broadcastData('back', playerId, clients, playersTurnEndResponse);
                    broadcastData('back', secondPlayerId, clients, playersTurnEndResponse);
                } else {
                    // Ship is killed, lets clear empty spaces and continue to shoot
                    const attackResponse = attackShipsResponse(attackData, zeroId, shotStatus);
                    broadcastData('back', playerId, clients, attackResponse);
                    const enemyShipParts = db.getShipsLocationBackup(secondPlayerId, gameId);

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
                        shootAround(getSurroundingPositions(fullShip), clients, playerId, gameId);
                    }
                    const playerKills = db.countKils(playerId, gameId); // Check if we won

                    if (playerKills === 10) {
                        const endGame = endGameResponse(playerId, zeroId);
                        broadcastData('everyone-same', playerId, clients, endGame);

                        const winnersResponse = updateWinnersResponse(zeroId);
                        broadcastData('everyone-same', playerId, clients, winnersResponse);

                        db.gameEnded(gameId);
                    } else if (typeOfAttack === 'random') {
                        setTimeout(() => attack(jsonData, playerId, zeroId, clients, 'random'), 2000);
                        console.log('randomAttack'); // Faster random attacks
                    }
                }
            } else {
                // Hitting the same target
            }
        }
    } else {
        // Not players turn
    }
}
