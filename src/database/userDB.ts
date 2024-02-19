import {
    IUser,
    IWinners,
    IRoomUsers,
    IOpenRooms,
    IPlayerAndRoom,
    IShipsPlacedRoom,
    IPlayersTurns,
    IPosition,
    IPlayerPlayingData,
    IActiveGameStats,
} from '../interfaces/interfaces';
import { fillPlayersShipsToArray } from '../websocket/responses/startGame';

export class InMemoryDB {
    clients: any[] = [];
    private users: IUser[] = [];
    online: boolean = false;
    currentPlayers: number = 0;
    winners: IWinners[] = [];
    roomsList: IOpenRooms[] = []; // List of open rooms  // empty after game over
    openRoomPlayers: IPlayerAndRoom[] = []; // empty after game over
    roomsWithShips: IShipsPlacedRoom[] = []; // empty after game over
    playersTurns: IPlayersTurns[] = []; // empty after game over
    kills: IActiveGameStats[] = [];

    player1Ships: any[] = [];
    player2Ships: any[] = [];
    player1ShipsBackup: any[] = [];
    player2ShipsBackup: any[] = [];
    player1ShotsLocation: any[] = [];
    player2ShotsLocation: any[] = [];

    // on game end or dc remove game from playersTurns

    // rooms: IOpenRooms[] = [];
    // waitingUser: any[] = [];
    // usersInRoom: number[] = [];
    // lastShot: string = '';
    // shipResponse: string = '';

    saveClientsData(playerId: number, clientWS: any): void {
        const newClient = {
            clientId: playerId,
            clientData: clientWS,
        };
        this.clients.push(newClient);
    }

    removeClientsData(playerId: number): void {
        this.clients.filter((client) => client.clientId === playerId);
    }

    findClientsData(playerId: number) {
        const client = this.clients.find((client) => client.clientId === playerId);
        return client.clientData;
    }

    checkUser(id: number, username: string, password: string): string {
        const user = this.users.find((user) => user.username === username);
        if (user) {
            // user exists in DB
            if (user.password === password) {
                // user password is valid
                if (!user.online) {
                    // user is offline
                    this.currentPlayers += 1;
                    return 'User logged in successfully';
                } else {
                    return 'User is already online';
                }
            } else {
                return 'Password is not valid';
            }
        } else {
            // user don't exist in DB, we create new user
            const newUser = {
                id,
                username,
                password,
                online: true,
            };
            this.users.push(newUser);
            this.currentPlayers += 1;
            return 'New user was created';
        }
    }

    userLeft(userId: number): void {
        this.users.map((user) => {
            // we set users status offline
            if (user.id === userId) {
                user.online = false;
            }
        });
        this.currentPlayers -= 1;
        // remove player from rooms
    }

    getCurrentPlayers(): number {
        return this.currentPlayers;
    }

    updateWinners(playerId: number): void {
        const userName = this.getUsername(playerId);
        const checkWinner = this.winners.find((user) => {
            if (user.name === userName) {
                user.wins += 1;
            }
        });
        if (!checkWinner) {
            // We add new winner
            const newWinner: IWinners = {
                name: userName,
                wins: 1,
            };
            this.winners.push(newWinner);
        }
    }

    getWinners(): IWinners[] {
        return this.winners;
    }

    checkOpenRooms(newRoomNumber: number): boolean {
        const numberOfRooms = this.roomsList.length;
        let result = false;
        if (numberOfRooms > 0) {
            const room = this.roomsList.find((room) => room.roomId === newRoomNumber);
            result = room ? true : false;
        }
        return result;
    }

    saveOpenRoom(newRoom: IOpenRooms): void {
        this.roomsList.push(newRoom);
    }

    removeOpenedRoom(roomId: number): void {
        // Remove room when DC of when 2 players joined the same room
        this.roomsList = this.roomsList.filter((room) => room.roomId !== roomId);
    }

    getOpenRooms(): IOpenRooms[] {
        return this.roomsList;
    }

    isPlayerInTheOpenRoom(playerId: number): number | undefined {
        const isPlayerInTheRoom = this.openRoomPlayers.find((player) => player.playerId === playerId);
        if (isPlayerInTheRoom) {
            return isPlayerInTheRoom.roomId;
        } else {
            return isPlayerInTheRoom;
        }
    }

    addPlayersToTheOpenRooms(playerId: number, roomId: number): void {
        this.openRoomPlayers.push({
            playerId,
            roomId,
        });
    }

    getUsername(userId: number): string {
        const userName = this.users.find((user) => user.id === userId);
        if (userName) {
            return userName.username;
        } else {
            return 'temp_username';
        }
    }

    addUserToTheOpenRoom(userId: number, roomId: number) {
        const numberOfRooms = this.roomsList.length;
        if (numberOfRooms > 0) {
            const room = this.roomsList.find((room) => room.roomId === roomId);
            if (room) {
                const userName = this.getUsername(userId);
                const newRoomUser = {
                    name: userName,
                    index: userId,
                };
                room.roomUsers.push(newRoomUser);
            }
        }
    }

    returnPlayersInTheOpenRoom(roomId: number): IRoomUsers[] | 0 {
        const room = this.roomsList.find((room) => room.roomId === roomId);
        if (room && room.roomUsers.length !== 0) {
            return room.roomUsers;
        } else {
            return 0;
        }
    }

    removePlayerFromTheRooms(userId: number) {
        const playerData = this.openRoomPlayers.find((player) => player.playerId === userId);
        if (playerData) {
            const playerRoom = playerData.roomId;
            // we remove player from the list of players in open rooms
            // we remove player from the room data in the list of players
            this.openRoomPlayers = this.openRoomPlayers.filter((player) => player.playerId !== userId);
            const roomlistFiltered = this.roomsList.map((room) => {
                if (room.roomId === playerRoom) {
                    room.roomUsers = [];
                }
                return room;
            });
            this.roomsList = roomlistFiltered;
        }
    }

    closeRoom(roomId: number): void {
        this.roomsList = this.roomsList.filter((room) => room.roomId !== roomId);
    }

    addPlayerShips(gameId: number, playerId: number, response: string, ships: any[]): boolean {
        const currentRoom = this.roomsWithShips.find((room) => room.gameId === gameId);
        if (!currentRoom) {
            // First player in the room
            const player1Data = {
                playerId: playerId,
                playersResponse: response,
                shotsLocation: [],
            };
            this.roomsWithShips.push({
                gameId: gameId,
                playersData: [player1Data],
            });
            fillPlayersShipsToArray(ships, playerId, gameId);
            return false;
        } else {
            // Second player joined the room
            const player2Data = {
                playerId: playerId,
                playersResponse: response,
                shotsLocation: [],
            };
            currentRoom.playersData.push(player2Data);
            fillPlayersShipsToArray(ships, playerId, gameId);
            return true;
        }
    }

    returnPlayersShipsData(gameId: number): IShipsPlacedRoom | undefined {
        const currentGameData = this.roomsWithShips.find((game) => game.gameId === gameId);
        return currentGameData;
    }

    startFirstTurn(gameId: number, playerId: number, players: number[]) {
        const newGameData = {
            gameId: gameId,
            players: players,
            currentPlayer: playerId,
        };
        this.playersTurns.push(newGameData);
    }

    checkPlayerTurn(gameId: number, playerId: number): boolean {
        let isPlayersTurn = true;
        const currentGameData = this.playersTurns.find((game) => game.gameId === gameId);
        if (currentGameData) {
            if (currentGameData.currentPlayer !== playerId) {
                isPlayersTurn = false;
            }
        }
        return isPlayersTurn;
    }

    returnCurrentGamesPlayers(gameId: number): IPlayerPlayingData[] | undefined {
        const currentGameData = this.roomsWithShips.find((game) => game.gameId === gameId);
        if (currentGameData) {
            return currentGameData.playersData;
        }
    }

    switchTurn(gameId: number) {
        const currentGameData = this.playersTurns.find((game) => game.gameId === gameId);
        if (currentGameData) {
            const lastTurnPlayer = currentGameData.currentPlayer;
            const nowTurnGoesTo =
                currentGameData.players[0] === lastTurnPlayer ? currentGameData.players[1] : currentGameData.players[0];
            currentGameData.currentPlayer = nowTurnGoesTo;
            return nowTurnGoesTo;
        }
    }

    getShotsLocation(playerId: number, roomIndex: number) {
        const currentRoom = this.roomsWithShips.find((room) => room.gameId === roomIndex);
        if (currentRoom) {
            const playerShots = currentRoom.playersData.find((player) => player.playerId === playerId);
            if (playerShots) {
                return playerShots.shotsLocation;
            }
        }
    }

    saveShotsLocation(location: IPosition, playerId: number, roomIndex: number) {
        const currentRoom = this.roomsWithShips.find((room) => room.gameId === roomIndex);
        if (currentRoom) {
            const playerShots = currentRoom.playersData.find((player) => player.playerId === playerId);
            if (playerShots) {
                playerShots.shotsLocation?.push(location);
            }
        }
    }

    saveShipsLocation(ships: any[], playerId: number, roomIndex: number) {
        const currentRoom = this.roomsWithShips.find((room) => room.gameId === roomIndex);
        if (currentRoom) {
            const playerShips = currentRoom.playersData.find((player) => player.playerId === playerId);
            if (playerShips) {
                playerShips.shipsLocation = [...ships];
            }
        }
    }

    getShipsLocation(playerId: number, roomIndex: number) {
        const currentRoom = this.roomsWithShips.find((room) => room.gameId === roomIndex);
        if (currentRoom) {
            const playerShips = currentRoom.playersData.find((player) => player.playerId === playerId);
            if (playerShips) {
                return playerShips.shipsLocation;
            }
        }
    }

    saveShipsLocationBackup(ships: string, playerId: number, roomIndex: number) {
        const currentRoom = this.roomsWithShips.find((room) => room.gameId === roomIndex);
        if (currentRoom) {
            const playerShips = currentRoom.playersData.find((player) => player.playerId === playerId);
            if (playerShips) {
                playerShips.shipsLocationBackup = [...JSON.parse(ships)];
            }
        }
    }
    getShipsLocationBackup(playerId: number, roomIndex: number) {
        const currentRoom = this.roomsWithShips.find((room) => room.gameId === roomIndex);
        if (currentRoom) {
            const playerShips = currentRoom.playersData.find((player) => player.playerId === playerId);
            if (playerShips) {
                return playerShips.shipsLocationBackup;
            }
        }
    }

    countKils(playerId: number, roomId: number): number | undefined {
        const playerData = this.kills.find((player) => player.playerId === playerId);
        if (playerData) {
            // add kill
            playerData.kills += 1;
            return playerData.kills;
        } else {
            // first kill
            const result = {
                playerId: playerId,
                kills: 1,
                gameId: roomId,
            };
            this.kills.push(result);
            return 1;
        }
    }

    disqualification(playerId: number) {
        // check if someone DC'd if he was in the game
    }

    gameEnded(gameId: number): void {
        
    }
}
