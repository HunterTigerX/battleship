import { db } from '../websocketserver';
import { IAttackData, IPosition, IAttackJson } from '../../interfaces/interfaces';

export function attackShipsResponse(attackData: IAttackJson, zeroId: number, shotStatus: 'miss' | 'killed' | 'shot') {

    const position: IPosition = {
        x: attackData.x,
        y: attackData.y,
    };

    let dataObject: IAttackData = {
        position: position,
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

export function attackShipsResponseEmpty(posX: number, posY: number, player: number) {
    const position: IPosition = {
        x: posX,
        y: posY,
    };

    let dataObject: IAttackData = {
        position: position,
        currentPlayer: player,
        status: 'miss',
    };

    let result = {
        type: 'attack',
        data: JSON.stringify(dataObject),
        id: 0,
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

// {
//     type: "randomAttack",
//     data:
//         {
//             gameId: <number>,
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
