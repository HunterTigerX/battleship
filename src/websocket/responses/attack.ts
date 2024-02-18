import { db } from '../websocketserver';
import { IAttackData, IPosition, IAttackJson } from '../../interfaces/interfaces';

export function attackShipsResponse(attackData: IAttackJson, zeroId: number, shotStatus: "miss" | "killed" | "shot") {

    const position: IPosition = {
        x: attackData.x,
        y: attackData.y,
    };

    let dataObject: IAttackData = {
        positon: position,
        currentPlayer: attackData.indexPlayer,
        status: shotStatus,
    };

    let result = {
        type: 'attack',
        data: JSON.stringify(dataObject),
        id: zeroId,
    };

    return JSON.stringify(result);
}

// Incoming
// {
//     type: "attack",
//     data:
//         {
//             gameId: <number>,
//             x: <number>,
//             y: <number>,
//             indexPlayer: <number>, /* id of the player in the current game session */
//         },
//     id: 0,
// }

// Outgoing
// {
//     type: "attack";,
//     data:
//         {
//             position:
//             {
//                 x: <number>,
//                 y: <number>,
//             },
//             currentPlayer: <number>, /* id of the player in the current game session */
//             status: "miss"|"killed"|"shot",
//         },
//     id: 0,
// }
