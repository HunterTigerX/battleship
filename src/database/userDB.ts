import { IUser, IWinners, IRoomUsers, IOpenRooms, IPlayerAndRoom, IShipsPlacedRoom, IPlayersTurns } from '../interfaces/interfaces';

export class InMemoryDB {
    private users: IUser[] = [];
    online: boolean = false;
    currentPlayers: number = 0;
    winners: IWinners[] = [];
    roomsList: IOpenRooms[] = []; // List of open rooms
    openRoomPlayers: IPlayerAndRoom[] = [];
    roomsWithShips: IShipsPlacedRoom[] = [];
    playersTurns: IPlayersTurns[] = [];

    // on game end or dc remove game from playersTurns

    rooms: IOpenRooms[] = [];
    waitingUser: any[] = [];
    usersInRoom: number[] = [];
    player1Ships: any[] = [];
    player2Ships: any[] = [];
    player1ShotsLocation: any[] = [];
    player2ShotsLocation: any[] = [];
    lastShot: string = '';
    shipResponse: string = '';

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

    updateWinners(winnerData: IWinners): void {
        const checkWinner = this.winners.find((user) => {
            if (user.name === winnerData.name) {
                user.wins += 1;
                return user;
            }
        });
        if (!checkWinner) {
            // We add new winner
            const newWinner: IWinners = {
                name: winnerData.name,
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

    closeRoom(roomId: number):void {
        this.roomsList = this.roomsList.filter((room) => (room.roomId !== roomId));
    }

    addPlayerShips(gameId: number, playerId: number, response: string) {
        const currentRoom = this.roomsWithShips.find(room => room.gameId === gameId);
        let playersReturnedShips = 0;
        if (!currentRoom) {
            this.roomsWithShips.push({
                gameId: gameId,
                playersIds: [playerId],
                playersResponse: [response]
            });
            playersReturnedShips = 1;
        } else {
            currentRoom.playersIds.push(playerId)
            currentRoom.playersResponse.push(response)
            playersReturnedShips = 2;
        }
        return playersReturnedShips;
    }

    returnPlayersShipsData(gameId: number): IShipsPlacedRoom | undefined {
        const currentGameData = this.roomsWithShips.find(game => game.gameId === gameId);
        return currentGameData;
    }

    startFirstTurn(gameId: number, playerId: number, players: number[]) {
        const newGameData = {
            gameId: gameId,
            players: players,
            currentPlayer: playerId,
        }
        this.playersTurns.push(newGameData)
    }

    checkPlayerTurn(gameId: number, playerId: number): boolean {
        let isPlayersTurn = true;
        const currentGameData = this.playersTurns.find(game => game.gameId === gameId);
        if (currentGameData) {
            if (currentGameData.currentPlayer !== playerId) {
                isPlayersTurn = false;
            }
        }
        return isPlayersTurn;
    }

    returnCurrentGamesPlayers(gameId: number): number[] | undefined {
        let result = undefined;
        const currentGameData = this.roomsWithShips.find(game => game.gameId === gameId);
        if (currentGameData) {
            result = currentGameData.playersIds;
        }
        return result;
    }

    switchTurn(gameId: number): number {
        let nextPlayer = 999;
        const currentGameData = this.playersTurns.find(game => game.gameId === gameId);
        if (currentGameData) {
            const lastTurnPlayer = currentGameData.currentPlayer;
            const nowTurnGoesTo = currentGameData.players[0] === lastTurnPlayer ? currentGameData.players[1] : currentGameData.players[0]
            currentGameData.currentPlayer = nowTurnGoesTo;
            nextPlayer = nowTurnGoesTo;
        }
        return nextPlayer;
    }






























    // add(user: IUser): void {
    //     this.users.push(user);
    // }

    // getAll(): IUser[] {
    //     return this.users;
    // }

    // createRoom() {
    //     // this.rooms.push(this.rooms.length);
    // }

    // getRoom() {
    //     return this.rooms;
    // }

    // userInTheRoom(userWaiting: any[]) {
    //     this.waitingUser = userWaiting;
    // }

    // getWaitingUser() {
    //     return this.waitingUser;
    // }

    // addUsersToTheRoom(index: number) {
    //     if (!this.usersInRoom.includes(index)) {
    //         this.usersInRoom.push(index);
    //     }
    // }
    // getUsersInRoom(index: number) {
    //     return this.usersInRoom.includes(index);
    // }
    // usersInTheRoom() {
    //     return this.usersInRoom;
    // }
    // saveShipsLocation(ships: any[], playerIndex: number) {
    //     if (playerIndex === 0) {
    //         this.player1Ships = ships;
    //     }
    //     if (playerIndex === 1) {
    //         this.player2Ships = ships;
    //     }
    // }
    // getPlayerShipsLocation(playerIndex: number) {
    //     if (playerIndex === 0) {
    //         return this.player1Ships;
    //     }
    //     if (playerIndex === 1) {
    //         return this.player2Ships;
    //     }
    // }
    // saveShotsLocation(location: Position, playerIndex: number) {
    //     if (playerIndex === 0) {
    //         this.player1ShotsLocation.push(location);
    //     }
    //     if (playerIndex === 1) {
    //         this.player2ShotsLocation.push(location);
    //     }
    // }
    // getShotsLocation(playerIndex: number) {
    //     if (playerIndex === 0) {
    //         return this.player1ShotsLocation;
    //     }
    //     if (playerIndex === 1) {
    //         return this.player2ShotsLocation;
    //     }
    // }

    // setLastShot(status: string) {
    //     this.lastShot = status;
    // }
    // getLastShot() {
    //     return this.lastShot;
    // }

    // setCurrentPlayer(playerId: number) {
    //     // this.currentPlayer = playerId;
    // }

    // getCurrentPlayer() {
    //     // return this.currentPlayer;
    // }

    // setShipResponse(data: string) {
    //     this.shipResponse = data;
    // }

    // getShipResponse() {
    //     return this.shipResponse;
    // }
}
