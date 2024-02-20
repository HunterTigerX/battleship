import { returnRandomNumber } from '../functions/randomNum';

function copyFillPlayersShipsToArray(shipsArray: any[]) { // for testing purposes to check ships generation position
    let playerShipsArray: any[] = [];

    for (let i = 0; i < shipsArray.length; i += 1) {
        const ship = [];

        const shipPositionX = shipsArray[i].position.x;
        const shipPositionY = shipsArray[i].position.y;
        const shipDirection = shipsArray[i].direction;

        // true = vertical (y) axis
        // false = horizontal (x) axis
        const shipLength =
            shipsArray[i].type === 'small'
                ? 1
                : shipsArray[i].type === 'medium'
                  ? 2
                  : shipsArray[i].type === 'large'
                    ? 3
                    : 4;
        // "small"|"medium"|"large"|"huge"

        if (shipDirection === true) {
            // we go Y axis
            for (let f = 0; f < shipLength; f += 1) {
                ship.push({
                    x: shipPositionX,
                    y: shipPositionY + f,
                });
            }
        } else {
            // we go X axis
            for (let f = 0; f < shipLength; f += 1) {
                ship.push({
                    x: shipPositionX + f,
                    y: shipPositionY,
                });
            }
        }
        playerShipsArray.push(ship);
    }

    const shipsCopy = JSON.stringify([...playerShipsArray]);
    return shipsCopy;
}

export function generateCoordinates(): any[] {
    const result = [];
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            result.push({ x, y });
        }
    }
    return result;
}

function filterField(valueX: number, valueY: number, field: any[]): any[] {
    for (let i = 0; i < field.length; i += 1) {
        const fieldX = field[i].x;
        const fieldY = field[i].y;
        if (fieldX === valueX && fieldY === valueY) {
            field.splice(i, 1);
            break;
        }
    }

    return field;
}

function removeAvailableFields(
    availableField: any[],
    positionX: number,
    positionY: number,
    shipSize: number,
    shipDirection: boolean
) {
    let newField = availableField;

    for (let i = 0; i < shipSize; i += 1) {
        if (shipDirection) {
            // the direction of the ship is in vertical (y) axis
            if (i === 0) {
                newField = filterField(positionX - 1, positionY + i - 1, newField);
                newField = filterField(positionX, positionY + i - 1, newField);
                newField = filterField(positionX + 1, positionY + i - 1, newField);
            } else if (i === shipSize - 1) {
                newField = filterField(positionX - 1, positionY + i + 1, newField);
                newField = filterField(positionX, positionY + i + 1, newField);
                newField = filterField(positionX + 1, positionY + i + 1, newField);
            }
            newField = filterField(positionX - 1, positionY + i, newField);
            newField = filterField(positionX, positionY + i, newField);
            newField = filterField(positionX + 1, positionY + i, newField);
        } else {
            // the direction of the ship is in horizontal (x) axis
            if (i === 0) {
                newField = filterField(positionX + i - 1, positionY - 1, newField);
                newField = filterField(positionX + i - 1, positionY, newField);
                newField = filterField(positionX + i - 1, positionY + 1, newField);
            } else if (i === shipSize - 1) {
                newField = filterField(positionX + i + 1, positionY - 1, newField);
                newField = filterField(positionX + i + 1, positionY, newField);
                newField = filterField(positionX + i + 1, positionY + 1, newField);
            }
            newField = filterField(positionX + i, positionY - 1, newField);
            newField = filterField(positionX + i, positionY, newField);
            newField = filterField(positionX + i, positionY + 1, newField);
        }
    }
    return newField;
}

function checkIfShipsPartsPositionAvailable(availableField: any[], position: any) {
    let emptyFieldAvailable = false;
    for (let i = 0; i < availableField.length; i += 1) {
        if (availableField[i].x === position.x && availableField[i].y === position.y) {
            emptyFieldAvailable = true;
            break;
        }
    }

    return emptyFieldAvailable;
}

function checkIfShipPositionAvailable(
    availableField: any[],
    positionX: any,
    positionY: any,
    shipSize: number,
    shipDirection: boolean
) {
    let checkFilends = [];
    for (let i = 0; i < shipSize; i += 1) {
        if (shipDirection) {
            // the direction of the ship is in vertical (y) axis
            checkFilends.push({ x: positionX, y: positionY + i });
        } else {
            // the direction of the ship is in horizontal (x) axis
            checkFilends.push({ x: positionX + i, y: positionY });
        }
    }

    let canWePlace = true;
    for (let i = 0; i < checkFilends.length; i += 1) {
        if (!checkIfShipsPartsPositionAvailable(availableField, checkFilends[i])) {
            canWePlace = false;
            break;
        }
    }

    return canWePlace;
}

let availableFieldGenerator = JSON.stringify(generateCoordinates());
export function generateShips() {
    const shipsCounts = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]; // Desired number of ships
    const shipLengths = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]; // Ships length
    let availableField = JSON.parse(availableFieldGenerator);
    const shipsArrayData = [];
    for (let i = 0; i < shipsCounts.length; i += 1) {
        const shipLength = shipLengths[i];
        const type = shipLength === 4 ? 'huge' : shipLength === 3 ? 'large' : shipLength === 2 ? 'medium' : 'small';
        const shipDirection = returnRandomNumber(2) === 1; // Randomly choose horizontal or vertical

        let availableRandomPosition = availableField[returnRandomNumber(availableField.length - 1)];
        let potentialX = availableRandomPosition.x;
        let potentialY = availableRandomPosition.y;

        let startAvailable = checkIfShipPositionAvailable(
            availableField,
            potentialX,
            potentialY,
            shipLength,
            shipDirection
        );

        while (!startAvailable) {
            availableRandomPosition = availableField[returnRandomNumber(availableField.length - 1)];
            // the direction of the ship is in vertical (y) axis
            potentialX = availableRandomPosition.x;
            potentialY = availableRandomPosition.y;
            startAvailable = checkIfShipPositionAvailable(
                availableField,
                potentialX,
                potentialY,
                shipLength,
                shipDirection
            );
        }

        availableField = removeAvailableFields(availableField, potentialX, potentialY, shipLength, shipDirection);

        shipsArrayData.push({
            position: { x: potentialX, y: potentialY },
            direction: shipDirection,
            type: type,
            length: shipLength,
        });
    }
    return shipsArrayData;
    // return copyFillPlayersShipsToArray(shipsArrayData); // for testing purposes
}
