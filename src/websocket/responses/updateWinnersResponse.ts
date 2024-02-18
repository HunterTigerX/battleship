import { db } from '../websocketserver';

export function updateWinnersResponse(zeroId: number) {
    const newData = db.getWinners();

    const response = {
        type: 'update_winners',
        data: JSON.stringify(newData),
        id: zeroId,
    };
    
    return JSON.stringify(response);
}


// 	->
// 	{
// 	    type: "update_winners",
// 	    data:
// 	        [
// 	            {
// 	                name: <string>,
// 	                wins: <number>,
// 	            }
// 	        ],
// 	    id: 0,
// }
