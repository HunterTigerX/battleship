import { httpServer } from '../http_server';
import WebSocket from 'ws';
console.log('here');
export const wss = new WebSocket.Server({ port: 3000 });
let clients = new Array();
let index = 0;



wss.on('connection', (ws, request) => {

    clients.push(ws);

    ws.on('message', (message: any) => {

        const bufferData = Buffer.from(message);
        const stringData = bufferData.toString('utf8');
        const stringDataJson = JSON.parse(stringData);
        const userData = JSON.parse(stringDataJson.data);
        const typeOfRequest = stringDataJson.type;
        const userName = userData.name;
        const userPassword = userData.password;
        const userId = stringDataJson.id;

        console.log('RequestType:', typeOfRequest);
        console.log('Username:', userName);
        console.log('Usernames password:', userPassword);

        function loginResponseObject(type: string, name: string, index: number, error: boolean, errorText: string, userId: number) {
          return {
            type: type,
            data: JSON.stringify({
              name: name,
              index: index,
              error: error,
              errorText: errorText
            }),
            id: userId
          };
        }
        

        const responseObject = loginResponseObject(typeOfRequest, userName, index, false, "", userId);
        const stringifiedResponseObject = JSON.stringify(responseObject);
    
        function broadcastToClients(data: string) {
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(data);
            }
          });
        }

        // Received message: {"type":"reg","data":"{\"name\":\"fffff\",\"password\":\"fffff\"}","id":0}
        broadcastToClients(stringifiedResponseObject);

    });

    ws.on('close', () => {
        // Handle WebSocket connection close
        var position = clients.indexOf(ws);
        clients.splice(position, 1);
        console.log('WebSocket connection closed');
    });
});
