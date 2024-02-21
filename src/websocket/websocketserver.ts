import WebSocket from 'ws';
import { InMemoryDB } from './database/userDB';
import { registerLogin } from './actions/registerLogIn/register';
import { createGame } from './actions/rooms/createGame';
import { broadcastData } from './broadcasts/broadcast';
import { joinRoom } from './actions/rooms/joinRoom';
import { placeShipsStartGame, startGameWithBot } from './actions/game/placeShipsStartGame';
import { returnRandomNumber } from './functions/randomNum';
import { attack } from './actions/game/battle';
import { startSingleGame } from './actions/game/createSingleRoom';
import { disqualificationOrDisconnect } from './actions/game/disqualification';

// import { alertMessage } from './error';

export const wss = new WebSocket.Server({ port: 3000 });
let clients = new Array();
export const db = new InMemoryDB();
export const maxGameNumber: number = 5;
export const maxIdNumbers = 100000;


wss.on('connection', (ws, request) => {
    clients.push(ws);
    let botId = returnRandomNumber(maxIdNumbers); // Generating new bot id // remove from db when logout or dc!!!!!!!!!!!!!!!
    while (db.getUsername(botId)) {
        // Checking for duplicate ID
        botId = returnRandomNumber(maxIdNumbers);
    }
    db.saveUsersData(botId, 'bot');

    let playerTempId = returnRandomNumber(maxIdNumbers); // Generating new game number
    while (db.getUsername(playerTempId)) {
        // Checking for duplicate ID
        playerTempId = returnRandomNumber(maxIdNumbers);
    }
    let playerId = playerTempId;
    const zeroId = 0;

    ws.on('message', async (message: any, isBinary) => {
        const stringData = isBinary ? Buffer.from(message).toString('utf8') : message.toString();
        const jsonData = JSON.parse(stringData);
        const typeOfRequest = jsonData.type;

        console.log(typeOfRequest);

        if (typeOfRequest === 'reg') {
            playerId = registerLogin(jsonData, clients, zeroId, playerTempId, ws);
        }

        if (typeOfRequest === 'create_room') {
            createGame(maxGameNumber, clients, zeroId);
        }

        if (typeOfRequest === 'add_user_to_room') {
            joinRoom(jsonData, playerId, clients, zeroId);
        }

        if (typeOfRequest === 'add_ships') {
            const userData = db.getUsersData(playerId);
            if (userData) {
                if (userData.playWithBot === true) {
                    startGameWithBot(jsonData, playerId, zeroId, clients, botId);
                    // botShips = generateShips();
                } else {
                    placeShipsStartGame(jsonData, playerId, zeroId, clients);
                }
            }
        }

        if (typeOfRequest === 'randomAttack') {
            attack(jsonData, playerId, zeroId, clients, 'random');
        }

        if (typeOfRequest === 'attack') {
            attack(jsonData, playerId, zeroId, clients, 'manual');
        }

        if (typeOfRequest === 'single_play') {
            startSingleGame(playerId, botId, zeroId);
        }
        // End of messaging
    });

    ws.on('close', () => {
        // Handle WebSocket connection close
        const index = clients.indexOf(ws);
        disqualificationOrDisconnect(playerId, clients);
        db.userLeft(playerId, botId)
        clients.splice(index, 1);
        console.log('WebSocket connection closed');
        // db.testLeaveAndDc(); // for testing data removal
    });
});
