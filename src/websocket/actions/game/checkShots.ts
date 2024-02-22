import { db } from '../../websocketserver';
import { shootAroundTheShip } from './attackResponse';
import { turn } from './turnResponse';
import { broadcastData } from '../../broadcasts/broadcast';

export function checkAttack(positionX: number, positionY: number, playerId: number): boolean {
    const playerShotsFired = db.getShotsLocation(playerId);
    let result = false;

    if (playerShotsFired && playerShotsFired.length !== 0) {
        for (let i = 0; i < playerShotsFired.length; i += 1) {
            const shot = playerShotsFired[i];
            if (shot.x === positionX && shot.y === positionY) {
                result = true;
            }
        }
    }

    return result;
}

export function shootAround(
    targetPositions: any[],
    player: number,
    enemy: number,
    bot: 'bot-turn' | 'non-bot' | 'human-turn'
) {
    for (let i = 0; i < targetPositions.length; i += 1) {
        const emptyX = targetPositions[i].x;
        const emptyY = targetPositions[i].y;
        if (!checkAttack(emptyX, emptyY, player)) {
            // not attacking attacked spaces, checking by comparing with hitted blocks by player
            db.saveShotsLocation(
                {
                    x: emptyX,
                    y: emptyY,
                },
                player,
                enemy
            );
            if (bot === 'bot-turn') {
                // this is bot's turn end player is the enemy
                const attackResponse = shootAroundTheShip(emptyX, emptyY, player);
                broadcastData('back', attackResponse, enemy);
                const playersTurnEndResponse = turn(0, player);
                broadcastData('back', playersTurnEndResponse, enemy);
            } else if (bot === 'human-turn') {
                // bot game, players turn
                const attackResponse = shootAroundTheShip(emptyX, emptyY, player);
                broadcastData('back', attackResponse, player);
                const playersTurnEndResponse = turn(0, player);
                broadcastData('back', playersTurnEndResponse, player);
            } else if (bot === 'non-bot') {
                // player vs player game
                const attackResponse = shootAroundTheShip(emptyX, emptyY, player);
                broadcastData('back', attackResponse, player);
                broadcastData('back', attackResponse, enemy);
                const playersTurnEndResponse = turn(0, player);
                broadcastData('back', playersTurnEndResponse, player);
                broadcastData('back', playersTurnEndResponse, enemy);
            }
        }
    }
}

export function getSurroundingPositions(shipsPartsArray: any[]): any[] {
    let result = [];
    for (let i = 0; i < shipsPartsArray.length; i += 1) {
        const shipX = shipsPartsArray[i].x;
        const shipY = shipsPartsArray[i].y;
        for (let xAxis = -1; xAxis <= 1; xAxis += 1) {
            for (let yAxis = -1; yAxis <= 1; yAxis += 1) {
                let emptyX = shipX + xAxis;
                let emptyY = shipY + yAxis;
                if (
                    emptyX >= 0 &&
                    emptyX < 10 && // We do not cross borders on x-Axis
                    emptyY >= 0 &&
                    emptyY < 10 // We do not cross borders on y-Axis
                ) {
                    result.push({ x: emptyX, y: emptyY });
                }
            }
        }
    }

    let filteredResult = result.filter((shipPart) => {
        for (let position of shipsPartsArray) {
            if (shipPart.x === position.x && shipPart.y === position.y) {
                return false;
            }
        }
        return true;
    });

    return filteredResult;
}

export function checkHit(xPos: number, yPos: number, playerId: number, enemyId: number): 'miss' | 'killed' | 'shot' {
    let arrayOfEnemyShips = db.getShipsLocation(enemyId);
    let result: 'miss' | 'killed' | 'shot' = 'miss';

    if (arrayOfEnemyShips) {
        for (let i = 0; i < arrayOfEnemyShips.length; i += 1) {
            for (let j = 0; j < arrayOfEnemyShips[i].length; j += 1) {
                const ship = arrayOfEnemyShips[i][j];
                if (ship.x === xPos && ship.y === yPos) {
                    arrayOfEnemyShips[i].splice(j, 1);
                    if (arrayOfEnemyShips[i].length === 0) {
                        result = 'killed';
                    } else {
                        result = 'shot';
                    }
                    db.saveShipsLocation(arrayOfEnemyShips, enemyId);
                }
            }
        }
    }
    db.saveShotsLocation(
        {
            x: xPos,
            y: yPos,
        },
        playerId,
        enemyId
    );
    return result;
}
