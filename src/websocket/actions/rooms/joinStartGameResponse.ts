export function gameCreate(zeroId: number, gameID: number, playerId: number): string {
    // We get all open games data from db
    const dataObj = {
        idGame: gameID,
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
//     type: "add_user_to_game",
//     data:
//         {
//             indexGame: <number>,
//         },
//     id: 0,
// }

// Update game state (send games list, where only one player inside)
// ->
// {
//     type: "update_game",
//     data:
//         [
//             {
//                 gameId: <number>,
//                 gameUsers:
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
//     type: "create_game", //send for both players in the game
//     data:
//         {
//             idGame: <number>,
//             idPlayer: <number>, \* id for player in the game session, who have sent add_user_to_game request, not enemy *\
//         },
//     id: 0,
// }
