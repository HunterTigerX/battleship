import { db } from '../../websocketserver';
import { generateCoordinates } from '../../functions/botShips';

export function savePlayersShipsToDb(shipsArray: any[], playerIndex: number, gameStartResponse: any) {
    let playerShipsArray: any[] = [];

    for (let i = 0; i < shipsArray.length; i += 1) {
        const ship = [];

        const shipPositionX = shipsArray[i].position.x;
        const shipPositionY = shipsArray[i].position.y;
        const shipDirection = shipsArray[i].direction;

        // true = vertical (y) axis
        // false = horizontal (x) axis
        const shipLength =
            shipsArray[i].type === 'small'
                ? 1
                : shipsArray[i].type === 'medium'
                  ? 2
                  : shipsArray[i].type === 'large'
                    ? 3
                    : 4;
        // "small"|"medium"|"large"|"huge"

        if (shipDirection === true) {
            // we go Y axis
            for (let f = 0; f < shipLength; f += 1) {
                ship.push({
                    x: shipPositionX,
                    y: shipPositionY + f,
                });
            }
        } else {
            // we go X axis
            for (let f = 0; f < shipLength; f += 1) {
                ship.push({
                    x: shipPositionX + f,
                    y: shipPositionY,
                });
            }
        }
        playerShipsArray.push(ship);
    }

    const shipsCopy = JSON.stringify([...playerShipsArray]);
    db.saveShipsLocation([...playerShipsArray], playerIndex, gameStartResponse, shipsCopy, generateCoordinates());
    playerShipsArray = [];
}
