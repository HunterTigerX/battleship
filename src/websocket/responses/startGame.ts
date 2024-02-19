import { IShips } from '../../interfaces/interfaces';
import { db } from '../websocketserver';

export function fillPlayersShipsToArray(shipsArray: any[], playerIndex: number, roomId: number) {
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
    db.saveShipsLocationBackup(shipsCopy, playerIndex, roomId);
    db.saveShipsLocation([...playerShipsArray], playerIndex, roomId);
    playerShipsArray = [];
}

export function createGameResponse(playerIndex: number, ships: IShips[], zeroId: number, roomId: number): string {
    const shipsData = {
        ships: ships,
        currentPlayerIndex: playerIndex,
    };

    const result = {
        type: 'start_game',
        data: JSON.stringify(shipsData),
        id: zeroId,
    };

    return JSON.stringify(result);
}

// <-
// {
//     type: "add_ships",
//     data:
//         {
//             gameId: <number>,
//             ships:
//                 [
//                     {
//                         position: {
//                             x: <number>,
//                             y: <number>,
//                         },
//                         direction: <boolean>,
//                         length: <number>,
//                         type: "small"|"medium"|"large"|"huge",
//                     }
//                 ],
//             indexPlayer: <number>, /* id of the player in the current game session */
//         },
//     id: 0,
// }
// Start game (only after server receives both player's ships positions)\

// ->
// {
//     type: "start_game",
//     data:
//         {
//             ships:
//                 [
//                     {
//                         position: {
//                             x: <number>,
//                             y: <number>,
//                         },
//                         direction: <boolean>,
//                         length: <number>,
//                         type: "small"|"medium"|"large"|"huge",
//                     }
//                 ],
//             currentPlayerIndex: <number>, /* id of the player in the current game session, who have sent his ships */
//         },
//     id: 0,
// }
