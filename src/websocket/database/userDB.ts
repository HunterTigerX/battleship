import {
    IUser,
    IWinners,
    IRoomUsers,
    IOpenGames,
    IShipsPlacedGame,
    IPlayersTurns,
    IPosition,
    IActiveGameStats,
    IWaitingRoom,
} from '../interfaces/interfaces';

export class InMemoryDB {
    private players: IUser[] = [];
    winners: IWinners[] = [];
    gamesList: IOpenGames[] = []; // List of open games  // empty after game over
    waitingRooms: IWaitingRoom[] = []; // empty after game over
    gamesWithShips: IShipsPlacedGame[] = []; // empty after game over
    playersTurns: IPlayersTurns[] = []; // empty after game over
    kills: IActiveGameStats[] = [];

    // on game end or dc remove game from playersTurns

    saveUsersData(
        userId: number,
        clientType: 'player' | 'bot',
        clientWS?: any,
        username?: string,
        password?: string
    ): void {
        const newUser: IUser = {
            userId: userId,
            userType: clientType,
            userDataWs: clientWS,
            username,
            password,
            online: true,
        };

        if (clientType === 'bot') {
            newUser.playWithBot = true;
        }
        this.players.push(newUser);
    }

    getUsersData(userId: number) {
        const playerData = this.players.find((player) => player.userId === userId);
        return playerData;
    }

    updateUsersData(playerId: number, clientWS: any): void {
        const user = this.players.find((users) => users.userId === playerId);
        if (user) {
            user.userDataWs = clientWS;
        }
    }

    removeUsersData(playerId: number): void {
        this.players.filter((users) => users.userId !== playerId);
    }

    findUserWsData(playerId: number) {
        const user = this.players.find((user) => user.userId === playerId);
        if (user) {
            return user.userDataWs;
        }
    }

    checkCredentials(username: string, password: string): string {
        const user = this.players.find((user) => user.username === username);
        if (user) {
            // user exists in DB
            if (user.password === password) {
                // user password is valid
                if (!user.online) {
                    // user is offline
                    user.online = true;
                    return 'Logged in';
                } else {
                    return 'User is already online';
                }
            } else {
                return 'Password is not valid';
            }
        }
        return "don't exist";
    }

    getUsername(userId: number) {
        const userName = this.players.find((user) => user.userId === userId);
        if (userName) {
            return userName.username;
        }
    }

    getUserId(userName: string): number | undefined {
        const userId = this.players.find((user) => user.username === userName);
        if (userId) {
            return userId.userId;
        }
    }

    updateWinners(playerId: number): void {
        const userName = this.getUsername(playerId);
        if (userName) { // We add only players to the winning board
            const checkWinner = this.winners.find((user) => user.name === userName);
            if (checkWinner) {
                checkWinner.wins += 1;
            } else if (!checkWinner) {
                // We add new winner
                const newWinner: IWinners = {
                    name: userName,
                    wins: 1,
                };
                this.winners.push(newWinner);
            }
        }
    }

    getWinners(): IWinners[] {
        return this.winners;
    }

    getOpenGames(): IOpenGames[] {
        return this.gamesList;
    }

    saveOpenGame(newGame: IOpenGames): void {
        this.gamesList.push(newGame);
    }

    checkOpenGames(newGameId: number): boolean {
        // We are checking if there are games with the same id
        const game = this.gamesList.find((game) => game.roomId === newGameId);
        return game ? true : false;
    }

    isPlayerInTheOpenGame(userId: number): number | undefined {
        const isPlayerInTheGame = this.players.find((player) => player.userId === userId);
        if (isPlayerInTheGame) {
            return isPlayerInTheGame.inTheRoom;
        }
        return isPlayerInTheGame;
    }

    removePlayerFromTheGames(userId: number) {
        const playerData = this.players.find((player) => player.userId === userId);
        if (playerData) {
            const playersRoom = playerData.inTheRoom;
            if (playersRoom) {
                const playerGame = this.gamesList.find((room) => room.roomId === playersRoom);
                if (playerGame) {
                    // we remove player from the list of players in open games
                    // we remove player from the game data in the list of players
                    playerGame.roomUsers = playerGame.roomUsers.filter((user) => user.index !== userId);
                }
            }
        }
    }

    addPlayerToTheOpenGames(userId: number, gameId: number) {
        const game = this.gamesList.find((game) => game.roomId === gameId);
        const user = this.players.find((player) => player.userId === userId);
        const userName = user?.username;
        if (game && user && userName) {
            // saving data in this format for responses
            const newGameUser = {
                name: userName,
                index: userId,
            };
            game.roomUsers.push(newGameUser);
            user.inTheRoom = gameId;
        }
    }

    closeGame(gameId: number): void {
        this.gamesList = this.gamesList.filter((game) => game.roomId !== gameId);
    }

    returnPlayersInTheOpenGame(gameId: number): IRoomUsers[] | undefined {
        const game = this.gamesList.find((game) => game.roomId === gameId);
        if (game && game.roomUsers.length !== 0) {
            return game.roomUsers;
        }
    }

    setPlayerPlaying(userId: number) {
        const user = this.players.find((player) => player.userId === userId);
        if (user) {
            user.startedGame = true;
        }
    }

    getPlayersInTheWaitingRoom(gameId: number, playerId: number) {
        const currentGame = this.waitingRooms.find((game) => game.room === gameId);

        if (!currentGame) {
            this.waitingRooms.push({
                room: gameId,
                players: [playerId],
            });
            return 1;
        } else {
            currentGame.players.push(playerId);
            return 2;
        }
    }

    getWaitingRoomPlayersData(gameId: number) {
        const currentGame = this.waitingRooms.find((game) => game.room === gameId);
        return currentGame;
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

    getShotsLocation(playerId: number) {
        const currentPlayerData = this.players.find((player) => player.userId === playerId);
        if (currentPlayerData && currentPlayerData.shotsLocation) {
            return currentPlayerData.shotsLocation;
        }
    }

    saveShotsLocation(location: IPosition, playerId: number) {
        const currentPlayerData = this.players.find((player) => player.userId === playerId);

        if (currentPlayerData) {
            if (!currentPlayerData.shotsLocation) {
                currentPlayerData.shotsLocation = [];
            }
            currentPlayerData.shotsLocation.push(location);
            currentPlayerData.availableLocations = currentPlayerData.availableLocations?.filter(availablelLocation => availablelLocation.x !== location.x && availablelLocation.y !== location.y)
        }
    }

    getAvailableLocation(playerId: number) {
        const currentPlayerData = this.players.find((player) => player.userId === playerId);
        if (currentPlayerData) {
            return currentPlayerData.availableLocations
        }
    }

    saveShipsLocation(ships: any[], playerId: number, gameStartResponse?: any, shipsCopy?: string, availableLocations?: any[]) {
        const player = this.players.find((player) => player.userId === playerId);
        if (player) {
            player.shipsLocation = ships;
            if (shipsCopy && gameStartResponse) {
                player.playersResponse = gameStartResponse;
                player.shipsLocationBackup = JSON.parse(shipsCopy);
            }
            if (availableLocations) {
                player.availableLocations = availableLocations;
            }
        }
    }

    getShipsLocation(playerId: number) {
        const currentPlayerData = this.players.find((player) => player.userId === playerId);
        if (currentPlayerData && currentPlayerData.shipsLocation) {
            return currentPlayerData.shipsLocation;
        }
    }

    getShipsLocationBackup(playerId: number) {
        const currentPlayerData = this.players.find((player) => player.userId === playerId);
        if (currentPlayerData && currentPlayerData.shipsLocation) {
            return currentPlayerData.shipsLocationBackup;
        }
    }

    countKils(playerId: number, gameId: number): number | undefined {
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
                gameId: gameId,
            };
            this.kills.push(result);
            return 1;
        }
    }

    disqualification(playerId: number) {
        // check if someone DC'd if he was in the game
        
    }

    gameEnded(gameId: number, playerId: number, enemyId: number): void {
        const playerOneData = this.players.find((player) => player.userId === playerId);
        const playerTwoData = this.players.find((player) => player.userId === enemyId);
        if (playerOneData && playerTwoData) {
            playerOneData.inTheRoom = undefined;
            playerOneData.playWithBot = false;
            playerOneData.shipsLocation = [];
            playerOneData.shipsLocationBackup = [];
            playerOneData.shotsLocation = [];
            playerOneData.playersResponse = '';
            playerOneData.startedGame = false;
            playerOneData.availableLocations = [];
            playerTwoData.inTheRoom = undefined;
            playerTwoData.playWithBot = false;
            playerTwoData.shipsLocation = [];
            playerTwoData.shipsLocationBackup = [];
            playerTwoData.shotsLocation = [];
            playerTwoData.playersResponse = '';
            playerTwoData.startedGame = false;
            playerTwoData.availableLocations = [];
        }
        // return all player settings to default
        this.waitingRooms = this.waitingRooms.filter((room) => room.room !== gameId);
        this.playersTurns = this.playersTurns.filter((room) => room.gameId !== gameId);
        this.kills = this.kills.filter((game) => game.gameId !== gameId);

    }

    userLeft(userId: number, botId: number): void {
        this.removeUsersData(botId); // We remove bot when the user log off
        this.players.map((user) => {
            // we set users status offline
            if (user.userId === userId) {
                user.online = false;
                user.inTheRoom = undefined; // also when starting game we need to switch it
                user.playWithBot = false;
                user.startedGame = false;
            }
        });
    }


    setGameWithBot(playerId: number) {
        const currentPlayerData = this.players.find((player) => player.userId === playerId);
        if (currentPlayerData) {
            currentPlayerData.playWithBot = true;
        }
    }

    getAllPlayersData() {
        return this.players;
    }

    // testLeaveAndDc() {
    //     console.log('this.gamesList', this.gamesList);
    //     console.log('this.waitingRooms', this.waitingRooms);
    //     console.log('this.gamesWithShips', this.gamesWithShips);
    //     console.log('this.playersTurns', this.playersTurns);
    //     console.log('this.kills', this.kills);
    // }
}

