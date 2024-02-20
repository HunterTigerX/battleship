import { IShips } from '../../interfaces/interfaces';

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
