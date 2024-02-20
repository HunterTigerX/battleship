export interface IUser {
    userId: number;
    userType: 'player' | 'bot';
    userDataWs: any;
    username: string | undefined;
    password: string | undefined;
    online: boolean;
    inTheRoom?: number | undefined; // same as gameID
    playWithBot?: boolean;
    shipsLocation?: any[];
    shipsLocationBackup?: any[];
    shotsLocation?: any[];
    playersResponse?: string;
}

export interface IWinners {
    name: string;
    wins: number;
}

export interface IRoomUsers {
    name: string;
    index: number; // player id
}

export interface IOpenGames {
    roomId: number;
    roomUsers: IRoomUsers[];
}

export interface IAddUserToGameRequest {
    type: 'add_user_to_game';
    data: {
        indexGame: number;
    };
    id: number;
}

export interface IPlayerPlayingData {
    playerId: number;
    shipsLocation?: any[];
    shipsLocationBackup?: any[];
    shotsLocation?: any[];
    playersResponse: string;
    gameType?: string;
}

export interface IShipsPlacedGame {
    gameId: number;
    playersData: IPlayerPlayingData[];
}

export interface IShips {
    position: {
        x: number;
        y: number;
    };
    direction: boolean;
    type: string;
    length: number;
}

export interface IAddShipsJson {
    gameId: number;
    ships: IShips[];
    indexPlayer: number;
}

export interface IPlayersTurns {
    gameId: number;
    players: number[];
    currentPlayer: number;
}

export interface IPosition {
    x: number;
    y: number;
}

export interface IAttackData {
    position: IPosition;
    currentPlayer: number;
    status: 'miss' | 'killed' | 'shot';
}

export interface IAttackJson {
    x: number;
    y: number;
    gameId: number;
    indexPlayer: number;
}

export interface IActiveGameStats {
    playerId: number;
    kills: number;
    gameId: number;
}

export interface IWaitingRoom {
    room: number;
    players: any[];
}

// this.gamesList
// this.openGamePlayers
