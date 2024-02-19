import { db } from '../websocketserver';

export function turn(zeroId: number, playerIndex: number) {
    const currentPlayerObj = {
        currentPlayer: playerIndex,
    };

    let result = {
        type: 'turn',
        data: JSON.stringify(currentPlayerObj),
        id: zeroId,
    };

    return JSON.stringify(result);
}

// Outgoing
// {
//     type: "turn",
//     data:
//         {
//             currentPlayer: <number>, /* id of the player in the current game session */
//         },
//     id: 0,
// }
