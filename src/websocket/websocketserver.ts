import WebSocket from 'ws';
import { InMemoryDB } from '../database/userDB';
import { loginResponseObject } from './responses/loginResponse';
import { broadcastData } from './broadcasts/broadcast';
import { firstRoomResponse, createEmptyRoomResponse, returnOpenedRoomResponse } from './responses/updateRoom';
import { updateWinnersResponse } from './responses/updateWinnersResponse';
import { returnRandomNumber } from './functions/randomNum';
import { addUserToTheRoom, returnAllOpenRooms, gameCreate } from './responses/joinStartRoom';
import { createGameResponse } from './responses/startGame';
import { turn } from './responses/turn';
import { attack } from './battles/battle';

// import { alertMessage } from './error';
import { IAddShipsJson, IShips } from '../interfaces/interfaces';
// Interfaces are above

export const wss = new WebSocket.Server({ port: 3000 });
let clients = new Array();
export const db = new InMemoryDB();

wss.on('connection', (ws, request) => {
    clients.push(ws);
    // const playerId = clients.indexOf(ws);
    const playerId = returnRandomNumber(10000000);
    const zeroId = 0;
    db.saveClientsData(playerId, ws);

    // const playerWsIndex = clients.indexOf(ws);

    ws.on('message', async (message: any, isBinary) => {
        const stringData = isBinary ? Buffer.from(message).toString('utf8') : message.toString();
        const jsonData = JSON.parse(stringData);
        const typeOfRequest = jsonData.type;

        console.log(typeOfRequest);

        if (typeOfRequest === 'reg') {
            const userData = JSON.parse(jsonData.data);
            const userName = userData.name;
            const userPassword = userData.password;
            const doUserExist = db.checkUser(playerId, userName, userPassword);
            let responseObject;

            if (doUserExist === 'New user was created' || doUserExist === 'User logged in successfully') {
                responseObject = loginResponseObject(userData, playerId, false, '', zeroId);
            } else {
                responseObject = loginResponseObject(userData, playerId, true, doUserExist, zeroId);
            }
            const currentPlayers = db.getCurrentPlayers();

            // responding to registration
            broadcastData('back', playerId, clients, responseObject);
            // const currentOpenRooms = db.getOpenRooms().length;
            // if (currentPlayers === 1) {
            //     // updating rooms and winners for solo player
            //     if (currentOpenRooms >= 1) {
            //     // There are opened rooms
            //         const updateRoomResponse = returnOpenedRoomResponse(zeroId);
            //         broadcastData('back', playerId, clients, updateRoomResponse);
            //     } else {
            //         // There were no opened rooms
            //         const updateRoomResponse = firstRoomResponse(zeroId);
            //         broadcastData('back', playerId, clients, updateRoomResponse);
            //     }
            //     const winnersResponse = updateWinnersResponse(zeroId);
            //     broadcastData('back', playerId, clients, winnersResponse);
            // } else if (currentPlayers > 1) {

            //     if (currentOpenRooms >= 1) {
            //         // We return all open rooms to all players
            //         const updateRoomResponse = returnOpenedRoomResponse(zeroId);
            //         broadcastData('everyone-same', playerId, clients, updateRoomResponse);
            //     } else if (currentOpenRooms === 0) {
            //         // There are no open rooms
            //         const updateRoomResponse = firstRoomResponse(zeroId);
            //         broadcastData('everyone-same', playerId, clients, updateRoomResponse);
            //     }
            //     const winnersResponse = updateWinnersResponse(zeroId);
            //     broadcastData('everyone-same', playerId, clients, winnersResponse);
            // }

            const winnersResponse = updateWinnersResponse(zeroId);
            broadcastData('everyone-same', playerId, clients, winnersResponse);
            const updateRoomResponse = returnAllOpenRooms(zeroId);
            broadcastData('everyone-same', playerId, clients, updateRoomResponse);
        }

        if (typeOfRequest === 'create_room') {
            const maxRoomNumber: number = 5;
            const currentRooms = db.getOpenRooms().length;
            if (maxRoomNumber > currentRooms) {
                let newRoomNumber = returnRandomNumber(maxRoomNumber); // Generating new room number
                while (db.checkOpenRooms(newRoomNumber)) {
                    // Checking if there is a room with this number
                    newRoomNumber = returnRandomNumber(maxRoomNumber);
                }

                let newRoomData = {
                    roomId: newRoomNumber,
                    roomUsers: [],
                };
                db.saveOpenRoom(newRoomData);

                const currentPlayers = db.getCurrentPlayers();

                if (currentPlayers === 1) {
                    // We have one player and room data is sending back to the single user
                    if (currentRooms > 0) {
                        // There are open rooms
                        const updateRoomResponse = returnOpenedRoomResponse(zeroId);
                        broadcastData('back', playerId, clients, updateRoomResponse);
                    } else if (currentRooms === 0) {
                        // There are no open rooms
                        const updateRoomResponse = createEmptyRoomResponse(newRoomNumber, zeroId);
                        broadcastData('back', playerId, clients, updateRoomResponse);
                    }
                    //
                } else {
                    // We have many players and new rooms data is broadcasting to every user
                    if (currentRooms > 0) {
                        // There are open rooms
                        const updateRoomResponse = returnOpenedRoomResponse(zeroId);
                        broadcastData('everyone-same', playerId, clients, updateRoomResponse);
                    } else if (currentRooms === 0) {
                        // There are no open rooms
                        const updateRoomResponse = createEmptyRoomResponse(newRoomNumber, zeroId);
                        broadcastData('everyone-same', playerId, clients, updateRoomResponse);
                    }
                    // broadcastData('everyone-same', playerId, clients, updateRoomResponse);
                }
            } else {
                // `Max room number reached. Current limit of rooms is ${maxRoomNumber}`
            }
        }

        if (typeOfRequest === 'add_user_to_room') {
            // When 1 player joins, we update rooms
            // When 2 player joins the same room, we start the game
            // Create games have different playerId's and 2 different responses
            const jsonDatasData = JSON.parse(jsonData.data);
            const roomToJoin: number = jsonDatasData.indexRoom;
            const isPlayerInTheRoom = db.isPlayerInTheOpenRoom(playerId);
            if (isPlayerInTheRoom) {
                // remove player from last room
                db.removePlayerFromTheRooms(playerId);
            }
            if (!isPlayerInTheRoom || isPlayerInTheRoom !== roomToJoin) {
                // Current player is not in any open room
                db.addPlayersToTheOpenRooms(playerId, roomToJoin); // we add player to the players in the open rooms list
                const usersInTheRoom = db.returnPlayersInTheOpenRoom(roomToJoin);

                if (usersInTheRoom === 0) {
                    // There were no users in the room
                    db.addUserToTheOpenRoom(playerId, roomToJoin); // We add player to the room in db
                    const addUserToTheRoomResponce = addUserToTheRoom(zeroId); // We update rooms for other players
                    broadcastData('everyone-same', playerId, clients, addUserToTheRoomResponce);
                } else if (usersInTheRoom.length === 1) {
                    // ther were one user waiting in the room so we can start the game
                    // We update rooms and start the game
                    const playerWaitingId = usersInTheRoom[0].index;
                    const playerOneResponse = gameCreate(zeroId, roomToJoin, playerWaitingId);
                    const playerTwoResponse = gameCreate(zeroId, roomToJoin, playerId);
                    db.removePlayerFromTheRooms(playerWaitingId);
                    db.removePlayerFromTheRooms(playerId);
                    db.closeRoom(roomToJoin);
                    const updateRoomResponse = returnAllOpenRooms(zeroId);
                    broadcastData('back', playerWaitingId, clients, playerOneResponse);
                    broadcastData('back', playerId, clients, playerTwoResponse);

                    broadcastData('everyone-same', playerId, clients, updateRoomResponse);
                }
            } else {
                // Current player is waiting already in this open room
            }
        }

        if (typeOfRequest === 'add_ships') {
            const jsonDataShips: IAddShipsJson = JSON.parse(jsonData.data);
            const gameId = jsonDataShips.gameId;
            const shipsArray: IShips[] = jsonDataShips.ships;

            const gameStartResponse: string = createGameResponse(playerId, shipsArray, zeroId, gameId);
            const playersInTheRoomReady = db.addPlayerShips(gameId, playerId, gameStartResponse, shipsArray);

            if (playersInTheRoomReady) {
                const shipsData = db.returnPlayersShipsData(gameId);

                // We return players count in the room who placed ships
                if (shipsData) {
                    const playersData = shipsData.playersData; // array of players data

                    const playerTwoData = playersData.find((playersData) => playersData.playerId === playerId); // Who connected last
                    const playerOneData = playersData.filter((playerData) => playerData.playerId !== playerId)[0]; // Who connected first

                    if (playerOneData && playerTwoData) {
                        const playerOneId = playerOneData.playerId;
                        const playerOneResponse = playerOneData.playersResponse;

                        const playerTwoId = playerTwoData.playerId;
                        const playerTwoResponse = playerTwoData.playersResponse;

                        broadcastData('back', playerOneId, clients, playerOneResponse);
                        broadcastData('back', playerTwoId, clients, playerTwoResponse);

                        const firstTurnPlayer = returnRandomNumber(2); // return 1 or 2
                        const firstTurn = firstTurnPlayer === 1 ? playerOneId : playerTwoId;
                        const playersTurnEndResponse = turn(zeroId, firstTurn);
                        db.startFirstTurn(gameId, firstTurn, [playerOneId, playerTwoId]);

                        broadcastData('back', playerOneId, clients, playersTurnEndResponse);
                        broadcastData('back', playerTwoId, clients, playersTurnEndResponse);
                    }
                } else {
                    // something went wrong
                }
            } else {
                // waiting for the second player in the room
            }
        }

        if (typeOfRequest === 'randomAttack') {
            attack(jsonData, playerId, zeroId, clients, 'random');
        }

        if (typeOfRequest === 'attack') {
            attack(jsonData, playerId, zeroId, clients, 'manual');
        }

        // End of messaging
    });

    ws.on('close', () => {
        // Handle WebSocket connection close
        const index = clients.indexOf(ws);
        db.userLeft(playerId);
        clients.splice(index, 1);
        console.log('WebSocket connection closed');
    });
});
