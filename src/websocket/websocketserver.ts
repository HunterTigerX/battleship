import { httpServer } from '../http_server';
import WebSocket from 'ws';
import { InMemoryDB } from './userDB';
import { loginResponseObject } from './registrationLogin';
import { createGameResponse } from './createGame';
import { firstRoomResponse, createEmptyRoomResponse, joinRoomResponse } from './updateRoom';
import { alertMessage } from './error';

export const wss = new WebSocket.Server({ port: 3000 });
let clients = new Array();
export const db = new InMemoryDB();
let roomId = 15;

wss.on('connection', (ws, request) => {
    clients.push(ws);

    ws.on('message', (message: any, isBinary) => {
        const stringData = isBinary ? Buffer.from(message).toString('utf8') : message.toString();
        // console.log('stringData', stringData);

        const stringDataJson = JSON.parse(stringData);
        const typeOfRequest = stringDataJson.type;
        const gameId = stringDataJson.id;
        const index = clients.indexOf(ws);
        // console.log('index', index);

        function broadcastToClients(data: string, users?: string) {
            if (users === 'everyone') {
                wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(data);
                    }
                });
            } else {
                if (clients[index].readyState === WebSocket.OPEN) {
                    clients[index].send(data);
                }
            }
        }

        // console.log(typeOfRequest);

        function updateRoom(users: string): void {
            if (users === 'no_users') {
                const updateRoom = firstRoomResponse(0);
                broadcastToClients(updateRoom);
            } else if (users === 'create_empty_room') {
                const updateRoom = createEmptyRoomResponse(0, roomId);
                broadcastToClients(updateRoom);
            } else if (users === 'join_room') {
                if (!db.getUsersInRoom(index)) {
                    db.addUsersToTheRoom(index);
                    const userName = db.getUsername(index);
                    const updateRoom = joinRoomResponse(0, roomId, userName, index);
                    broadcastToClients(updateRoom, 'everyone');

                    const usersInTheRoomNow = db.usersInTheRoom();
                    if (usersInTheRoomNow.length === 2) {
                        const newGameRoom = createGameResponse(roomId, usersInTheRoomNow[0], gameId);
                        broadcastToClients(newGameRoom, 'everyone');
                    }
                }
            } else if (users === 'update_rooms') {
                const lastSavedRooms = db.getLastRoom();
                for (let i = 0; i < clients.length; i += 1) {
                    broadcastToClients(lastSavedRooms);
                }
            }
        }

        if (typeOfRequest === 'add_user_to_room') {
            updateRoom('join_room');
        }

        if (typeOfRequest === 'create_room') {
            updateRoom('create_empty_room');
            db.createRoom(); // Сделать чтобы не забивался массив
        }

        if (typeOfRequest === 'reg') {
            // Received message: {"type":"reg","data":"{\"name\":\"fffff\",\"password\":\"fffff\"}","id":0}
            const userData = JSON.parse(stringDataJson.data);
            const userName = userData.name;
            const userPassword = userData.password;
            const doUserExist = db.checkUser(gameId, userName, userPassword, index);

            if (doUserExist === 'New user was created' || doUserExist === 'User logged in successfully') {
                const responseObject = loginResponseObject(typeOfRequest, userName, index, false, '', gameId);
                broadcastToClients(responseObject);
                const numberOfRooms = db.getRoom().length;
                console.log('numberOfRooms', numberOfRooms);
                if (numberOfRooms === 0) {
                    updateRoom('no_users');
                } else if (numberOfRooms !== 0) {
                    updateRoom('update_rooms');
                } else {
                    alertMessage('Непредвиденная ошибка (1)');
                }
            } else {
                alertMessage(doUserExist);
            }
        }

        // start_game
        // turn
        // attack
        // finish

        // update_room
        // update_winners
    });

    ws.on('close', () => {
        // Handle WebSocket connection close
        const index = clients.indexOf(ws);
        db.userLeft(index);
        clients.splice(index, 1);
        console.log('WebSocket connection closed');
    });
});
