export function loginResponseObject(
    messageData: any,
    userIndex: number,
    error: boolean,
    errorText: string,
    zeroId: number
) {
    const newData = {
        name: messageData.name,
        index: userIndex,
        error: error,
        errorText: errorText,
    };

    const response = {
        type: 'reg',
        data: JSON.stringify(newData),
        id: zeroId,
    };
    
    return JSON.stringify(response);
}

//  <- Received message:
// {
//     type: "reg",
//     data:
//         {
//             name: <string>,
//             password: <string>,
//         },
//     id: 0,
// }

// -> Response message:
// {
//     type: "reg",
//     data:
//         {
//             name: <string>,
//             index: <number>,
//             error: <bool>,
//             errorText: <string>,
//         },
//     id: 0,
// }
