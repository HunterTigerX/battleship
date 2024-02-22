# CRUD-api
# Installation and run

-   to install all dependencies run npm install in powershell or command prompt in windows or equivalent in other operation systems

-   to run the application there are list of available commands

1. npm run start

-   This command will start server at port 3000 in production mode.

2. npm run start:dev

-   This command will start server at port 3000 in development mode with tsx watch parameters.

3. npm run start:nodemon

-   This command will start server at port 3000 in development mode with nodemon.

# Additional information

-   This game supports up to 5 rooms by default. To change the number of rooms, you need to change the value of the `maxGameNumber` in src\websocket\websocketserver.ts file.

-   The random bot ships position generation was implemented, instead of using premade templates. I tested it for 20 times and hope that there are no bugs that I missed.

-   When bot wins 1 vs 1 game, he won't appear in the score table, but if you wish to add bots to the score table, you can uncomment line 105 at src\websocket\actions\game\battle.ts.

-   When playing vs bot, bot instantly strikes back when you miss. If you want to add a delay to bot shot after your miss, you can uncomment line 295 at src\websocket\actions\game\battle.ts and comment line 294 (where 2000 = 2s).

-   When user is online, nobody can log in with his credentials, untill the user will log off.
