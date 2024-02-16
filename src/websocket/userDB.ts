interface User {
    id: number;
    username: string;
    password: string;
    online: boolean;
    currentIndex: number;
}

export class InMemoryDB {
    private users: User[] = [];
    online: boolean = false;
    rooms: number[] = [];
    waitingUser: any[] = [];
    lastRoomsSave: string = '';
    usersInRoom: number[] = [];
    add(user: User): void {
        this.users.push(user);
    }

    getAll(): User[] {
        return this.users;
    }

    getUsername(currentIndex: number): string {
        const userName = this.users.find((user) => user.currentIndex === currentIndex);
        if (userName) {
            return userName.username;
        } else {
            return 'Something went wrong';
        }
    }

    checkUser(gameId: number, userName: string, password: string, currentIndex: number): string {
        const user = this.users.find((user) => user.username === userName);
        if (user) {
            // user exists in DB
            if (user.password === password) {
                // user password is valid
                if (!user.online) {
                    // user is offline
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
                id: gameId,
                username: userName,
                password: password,
                online: true,
                currentIndex: currentIndex,
            };
            this.add(newUser);
            return 'New user was created';
        }
    }

    createRoom() {
        this.rooms.push(this.rooms.length);
    }

    getRoom() {
        return this.rooms;
    }

    userInTheRoom(userWaiting: any[]) {
        this.waitingUser = userWaiting;
    }

    getWaitingUser() {
        return this.waitingUser;
    }

    userLeft(userIndex: number) {
        this.waitingUser = this.waitingUser.filter((user) => user.index !== userIndex);
        this.usersInRoom = this.usersInRoom.filter((index) => index !== userIndex);
        this.users.map((user) => {
            if (user.currentIndex === userIndex) {
                user.online = false;
            }
        });
    }

    saveLastRoom(room: string) {
        this.lastRoomsSave = room;
    }

    getLastRoom() {
        return this.lastRoomsSave;
    }

    addUsersToTheRoom(index: number) {
        if (!this.usersInRoom.includes(index)) {
            this.usersInRoom.push(index);
        }
    }
    getUsersInRoom(index: number) {
        return this.usersInRoom.includes(index);
    }
    usersInTheRoom() {
        return this.usersInRoom;
    }
}
