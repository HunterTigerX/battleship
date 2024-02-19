import { db } from '../websocketserver';

export function addUserToTheRoom(zeroId: number) {
    // We get all open rooms data from db
    const dataArray: any[] = [];
    const openRooms = db.getOpenRooms();
    dataArray.push(...openRooms);

    const result = {
        type: 'update_room',
        data: JSON.stringify(dataArray),
        id: zeroId,
    };

    return JSON.stringify(result);
}

export function returnAllOpenRooms(zeroId: number) {
    // We get all open rooms data from db
    const dataArray: any[] = [];
    const openRooms = db.getOpenRooms();
    dataArray.push(...openRooms);

    const result = {
        type: 'update_room',
        data: JSON.stringify(dataArray),
        id: zeroId,
    };

    return JSON.stringify(result);
}

export function gameCreate(zeroId: number, roomID: number, playerId: number): string {
    // We get all open rooms data from db

    const dataObj = {
        idGame: roomID,
        idPlayer: playerId,
    };

    const result = {
        type: 'create_game',
        data: JSON.stringify(dataObj),
        id: zeroId,
    };

    return JSON.stringify(result);
}

// <-
// {
//     type: "add_user_to_room",
//     data:
//         {
//             indexRoom: <number>,
//         },
//     id: 0,
// }

// Update room state (send rooms list, where only one player inside)
// ->
// {
//     type: "update_room",
//     data:
//         [
//             {
//                 roomId: <number>,
//                 roomUsers:
//                     [
//                         {
//                             name: <string>,
//                             index: <number>,
//                         }
//                     ],
//             },
//         ],
//     id: 0,
// }

// ->
// {
//     type: "create_game", //send for both players in the room
//     data:
//         {
//             idGame: <number>,
//             idPlayer: <number>, \* id for player in the game session, who have sent add_user_to_room request, not enemy *\
//         },
//     id: 0,
// }
