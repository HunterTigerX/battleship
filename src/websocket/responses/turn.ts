import { db } from '../websocketserver';

export function turn(zeroId: number, playerIndex: number) {
    
    console.log('Player turn', playerIndex);
    // if (lastShot !== 'noStatus') {
    //     if (lastShot === 'miss') {
    //         if (index === 0) {
    //             index = 1;
    //         } else {
    //             index = 0;
    //         }
    //     }
    // }

    // db.setCurrentPlayer(index);

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
