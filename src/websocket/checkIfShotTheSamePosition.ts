// import { db } from './websocketserver';

// export function checkAttack(positionX: number, positionY: number, playerIndex: number): boolean {
//     const playerShotsFired = db.getShotsLocation(playerIndex);
//     let result = true;

//     if (playerShotsFired && playerShotsFired.length !== 0) {
//         for (let i = 0; i < playerShotsFired.length; i++) {
//             const shot = playerShotsFired[i];
//             console.log('shot', shot)
//             console.log(positionX, shot.x, positionY, shot.y)
//             if (shot.x === positionX && shot.y === positionY) {
//                 result = false;
//             }
//         }
//         if (result) {
//             db.saveShotsLocation(
//                 {
//                     x: positionX,
//                     y: positionY,
//                 },
//                 playerIndex
//             );
//         }
//     } else {
//         db.saveShotsLocation(
//             {
//                 x: positionX,
//                 y: positionY,
//             },
//             playerIndex
//         );
//     }
//     return result;
// }

// export function checkHit(xPos: number, yPos: number, playerIndex: number): string {
//     let arrayOfPlayerShips = db.getPlayerShipsLocation(playerIndex);
//     console.log(arrayOfPlayerShips)
//     let result = '';

//     if (arrayOfPlayerShips) {
//         for (let i = 0; i < arrayOfPlayerShips.length; i++) {
//             for (let j = 0; j < arrayOfPlayerShips[i].length; j++) {
//                 const ship = arrayOfPlayerShips[i][j];
//                 if (ship.x === xPos && ship.y === yPos) {
//                     arrayOfPlayerShips[i].splice(j, 1);
//                     if (arrayOfPlayerShips[i].length === 0) {
//                         result = 'killed';
//                     } else {
//                         result = 'shot';
//                     }
//                     db.saveShipsLocation(arrayOfPlayerShips, playerIndex);
//                 }
//             }
//         }
//         if (result === '') {
//             result = 'miss';
//         }
//     }
//     return result;
// }
