export interface IUser {
    id: number;
    username: string;
    password: string;
    online: boolean;
}

export interface IWinners {
    name: string;
    wins: number;
}

export interface IRoomUsers {
    name: string;
    index: number;
}

export interface IOpenRooms {
    roomId: number;
    roomUsers: IRoomUsers[];
}

export interface IAddUserToRoomRequest {
    type: 'add_user_to_room';
    data: {
        indexRoom: number;
    };
    id: number;
}

export interface IPlayerAndRoom {
    playerId: number;
    roomId: number;
}

export interface IShipsPlacedRoom {
    gameId: number;
    playersIds: number[];
    playersResponse: string[];
}

export interface IShips {
    position: {
        x: number;
        y: number;
    };
    direction: boolean;
    type: 'huge' | 'large' | 'medium' | 'small';
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
    positon: IPosition;
    currentPlayer: number;
    status:  "miss" | "killed" | "shot";
}

export interface IAttackJson {
    x: number;
    y: number;
    gameId: number;
    indexPlayer: number;
}

// this.roomsList
// this.openRoomPlayers
