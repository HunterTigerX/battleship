export function loginResponseObject(
    type: string,
    name: string,
    index: number,
    error: boolean,
    errorText: string,
    userId: number
) {
    return JSON.stringify({
        type: type,
        data: JSON.stringify({
            name: name,
            index: index,
            error: error,
            errorText: errorText,
        }),
        id: userId,
    });
}
