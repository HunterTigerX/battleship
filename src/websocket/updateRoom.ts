import { db } from './websocketserver';

export function firstRoomResponse(gameId: number) {
    return JSON.stringify({
        type: 'update_room',
        data: JSON.stringify([]),
        id: gameId,
    });
}

export function createEmptyRoomResponse(gameId: number, roomId: number) {
    const dataArray = JSON.stringify([
        {
            roomId: roomId,
            roomUsers: [],
        },
    ]);

    return JSON.stringify({
        type: 'update_room',
        data: dataArray,
        id: gameId,
    });
}

export function joinRoomResponse(gameId: number, roomId: number, name: string, index: number) {
    let roomUsersArray = [
        {
            name: name.toString(),
            index: index,
        },
    ];
    const waitingUser = db.getWaitingUser();
    if (waitingUser && JSON.stringify(waitingUser) !== JSON.stringify(roomUsersArray)) {
        roomUsersArray = roomUsersArray.concat(waitingUser);
    }

    db.userInTheRoom(roomUsersArray);

    const dataArray = [
        {
            roomId: roomId,
            roomUsers: roomUsersArray,
        },
    ];

    let result = JSON.stringify({
        type: 'update_room',
        data: JSON.stringify(dataArray),
        id: gameId,
    });

    db.saveLastRoom(result);

    return result;
}
//
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
