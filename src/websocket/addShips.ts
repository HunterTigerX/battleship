import { db } from './websocketserver';

// let playerShipsArray: any[] = [];

// function fillPlayersShipsToArray(shipsArray: any[], playerIndex: number) {
//     for (let i = 0; i < shipsArray.length; i += 1) {
//         const ship = [];

//         const shipPositionX = shipsArray[i].position.x;
//         const shipPositionY = shipsArray[i].position.y;
//         const shipDirection = shipsArray[i].direction;

//         // true = vertical (y) axis
//         // false = horizontal (x) axis
//         const shipLength =
//             shipsArray[i].type === 'small'
//                 ? 1
//                 : shipsArray[i].type === 'medium'
//                   ? 2
//                   : shipsArray[i].type === 'large'
//                     ? 3
//                     : 4;
//         // "small"|"medium"|"large"|"huge"

//         if (shipDirection === true) {
//             // we go Y axis
//             for (let f = 0; f < shipLength; f++) {
//                 ship.push({
//                     x: shipPositionX,
//                     y: shipPositionY + f,
//                 });
//             }
//         } else {
//             // we go X axis
//             for (let f = 0; f < shipLength; f++) {
//                 ship.push({
//                     x: shipPositionX + f,
//                     y: shipPositionY,
//                 });
//             }
//         }
//         playerShipsArray.push(ship);
//     }
//     db.saveShipsLocation(playerShipsArray, playerIndex);
//     playerShipsArray = [];
// }
// export function addShipsResponse(dataStringified: any, zeroId: number, index: number) {
//     const data = JSON.parse(dataStringified.data);
//     let dataObject = {
//         ships: data.ships,
//         indexPlayer: index,
//     };

//     fillPlayersShipsToArray(data.ships, index);
//     let result = JSON.stringify({
//         type: 'start_game',
//         data: JSON.stringify(dataObject),
//         id: zeroId,
//     });

//     return result;
// }

/*
{
    type: "start_game",
    data:
        {
            ships:
                [
                    {
                        position: {
                            x: <number>,
                            y: <number>,
                        },
                        direction: <boolean>,
                        length: <number>,
                        type: "small"|"medium"|"large"|"huge",
                    }
                ],
            currentPlayerIndex: <number>, //  id of the player in the current game session, who have sent his ships
        },
        id: 0,
    }
     */
