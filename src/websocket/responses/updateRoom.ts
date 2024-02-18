import { db } from '../websocketserver';

export function firstRoomResponse(zeroId: number) {
    const result = {
        type: 'update_room',
        data: JSON.stringify([]),
        id: zeroId,
    };

    return JSON.stringify(result);
}

export function createEmptyRoomResponse(roomId: number, zeroId: number) {
    const dataArray = [
        {
            roomId: roomId,
            roomUsers: [],
        },
    ];

    return JSON.stringify({
        type: 'update_room',
        data: JSON.stringify(dataArray),
        id: zeroId,
    });
}

export function returnOpenedRoomResponse(zeroId: number) {
    const dataArray: any[] = [];
    const openRooms = db.getOpenRooms();
    dataArray.push(...openRooms);

    return JSON.stringify({
        type: 'update_room',
        data: JSON.stringify(dataArray),
        id: zeroId,
    });
}

// Create new room (create game room and add yourself there)
// <-
// {
//     type: "create_room",
//     data: "",
//     id: 0,
// }

// Update room state (send rooms list, where only one player inside)
// ->
// {
//     type: "update_room",
// data:
//     [
//         {
//             roomId: <number>,
//             roomUsers:
//                 [
//                     {
//                         name: <string>,
//                         index: <number>,
//                     }
//                 ],
//         },
//     ],
//     id: 0,
// }
