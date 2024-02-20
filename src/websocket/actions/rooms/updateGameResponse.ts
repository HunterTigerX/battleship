import { db } from '../../websocketserver';

export function returnOpenGamesResponse(zeroId: number) {
    const dataArray: any[] = [];
    const openRooms = db.getOpenGames();
    dataArray.push(...openRooms);

    const result = {
        type: 'update_room',
        data: JSON.stringify(dataArray),
        id: zeroId,
    };

    return JSON.stringify(result);
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
