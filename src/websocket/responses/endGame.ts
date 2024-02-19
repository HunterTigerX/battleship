export function endGameResponse(userId: number, zeroId: number) {
    const newData = {
        winPlayer: userId,
    };

    const response = {
        type: 'finish',
        data: JSON.stringify(newData),
        id: zeroId,
    };

    return JSON.stringify(response);
}

// ->
// {
//     type: "finish",
//     data:
//         {
//             winPlayer: <number>, /* id of the player in the current game session */
//         },
//     id: 0,
// }
