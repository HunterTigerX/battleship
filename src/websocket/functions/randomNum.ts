export function returnRandomNumber(maxNum: number, maxMaxNum?: number): number {
    if (maxMaxNum) {
        return Math.floor(Math.random() * (maxMaxNum - maxNum + 1) + maxNum) // where maxNum is min and MaxMaxNum is max numbers
    } else {
        return Math.floor(Math.random() * maxNum) + 1;
    }
}
