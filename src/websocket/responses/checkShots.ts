import { db } from '../websocketserver';
import { attackShipsResponseEmpty } from './attack';
import { turn } from './turn';
import { broadcastData } from '../broadcasts/broadcast';

export function shootAround(targetPositions: any[], clients: any, player: number, roomId: number) {
    for (let i = 0; i < targetPositions.length; i += 1) {
        const emptyX = targetPositions[i].x;
        const emptyY = targetPositions[i].y;
        if (!checkAttack(emptyX, emptyY, player, roomId)) {
            // not attacking attacked spaces
            const attackResponse = attackShipsResponseEmpty(emptyX, emptyY, player);
            broadcastData('everyone-same', player, clients, attackResponse);
            const playersTurnEndResponse = turn(0, player);
            broadcastData('everyone-same', player, clients, playersTurnEndResponse);
        }
    }
}

export function getSurroundingPositions(shipsPartsArray: any[]): any[] {
    let result = [];
    for (let i = 0; i < shipsPartsArray.length; i += 1) {
        const shipX = shipsPartsArray[i].x;
        const shipY = shipsPartsArray[i].y;
        for (let xAxis = -1; xAxis <= 1; xAxis += 1) {
            // -1 0 1
            for (let yAxis = -1; yAxis <= 1; yAxis += 1) {
                // -1 0 1
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

let objects = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
];

export function checkAttack(positionX: number, positionY: number, playerId: number, gameId: number): boolean {
    const playerShotsFired = db.getShotsLocation(playerId, gameId);
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

export function checkHit(xPos: number, yPos: number, playerId: number, gameId: number): 'miss' | 'killed' | 'shot' {
    let arrayOfPlayerShips = db.getShipsLocation(playerId, gameId);
    let result: 'miss' | 'killed' | 'shot' = 'miss';

    if (arrayOfPlayerShips) {
        for (let i = 0; i < arrayOfPlayerShips.length; i += 1) {
            for (let j = 0; j < arrayOfPlayerShips[i].length; j += 1) {
                const ship = arrayOfPlayerShips[i][j];
                if (ship.x === xPos && ship.y === yPos) {
                    arrayOfPlayerShips[i].splice(j, 1);
                    if (arrayOfPlayerShips[i].length === 0) {
                        result = 'killed';
                    } else {
                        result = 'shot';
                    }
                    db.saveShotsLocation(
                        {
                            x: xPos,
                            y: yPos,
                        },
                        playerId,
                        gameId
                    );
                    db.saveShipsLocation(arrayOfPlayerShips, playerId, gameId);
                }
            }
        }
    }
    return result;
}
