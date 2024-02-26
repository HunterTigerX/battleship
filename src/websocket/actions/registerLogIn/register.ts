import WebSocket from 'ws';
import { db } from '../../websocketserver';
import { loginResponseObject } from './loginResponse';
import { updateWinnersResponse } from '../winners/updateWinnersResponse';
import { broadcastData } from '../../broadcasts/broadcast';
import { returnOpenGamesResponse } from '../rooms/updateGameResponse';
import { alertMessage } from '../../errors/error';

interface IRegistrationData {
    type: 'reg';
    data: string;
    id: 0;
}

export function registerLogin(
    jsonData: IRegistrationData,
    clients: any[],
    zeroId: 0,
    playerTempId: number,
    client: any
): number {
    const userData = JSON.parse(jsonData.data);
    const userName = userData.name;
    const userPassword = userData.password;
    const doUserExist = db.checkCredentials(userName, userPassword); // we are checkin username and password in our db
    let responseObject,
        returnId = playerTempId;

    function respond(responseObject: any) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(responseObject);
        }
    }

    if (doUserExist !== 'Logged in' && doUserExist !== "don't exist") {
        // Credentials are wrong or user with this credentials is already online
        responseObject = loginResponseObject(userData, playerTempId, true, doUserExist, zeroId);
        returnId = playerTempId;
        alertMessage(doUserExist);
        respond(responseObject);
    } else {
        if (doUserExist === 'Logged in') {
            // We log in as our user
            const playerId = db.getUserId(userName) as number;
            responseObject = loginResponseObject(userData, playerId, false, '', zeroId);
            returnId = playerId;
            db.updateUsersData(returnId, client);
        } else if (doUserExist === "don't exist") {
            // We add new user to user DB
            db.saveUsersData(returnId, 'player', client, userName, userPassword);
            responseObject = loginResponseObject(userData, playerTempId, false, '', zeroId);
            returnId = playerTempId;
        }
        respond(responseObject);
        const winnersResponse = updateWinnersResponse(zeroId);
        broadcastData('not-playing', winnersResponse);
        const updateRoomResponse = returnOpenGamesResponse(zeroId);
        broadcastData('not-playing', updateRoomResponse);

        db.updateUsersData(returnId, client);
        console.log('Result: User logged in')
    }

    return returnId;
}
