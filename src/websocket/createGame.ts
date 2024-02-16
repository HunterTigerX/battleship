export function createGameResponse(idGame: number, idPlayer: number, gameId: number) {
    return JSON.stringify({
        type: 'create_game',
        data: JSON.stringify({
            idGame: idGame,
            idPlayer: idPlayer,
        }),
        id: gameId,
    });
}

// {
//     type: "create_game", //send for both players in the room
//     data:
//         {
//             idGame: <number>,
//             idPlayer: <number>, \* id for player in the game session, who have sent add_user_to_room request, not enemy *\
//         },
//     id: 0,
// }
