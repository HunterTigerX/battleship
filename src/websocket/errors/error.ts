export function alertMessage(message: string): void {
    if (typeof window !== 'undefined') {
        alert(message);
    } else {
        console.log(message);
    }
}
