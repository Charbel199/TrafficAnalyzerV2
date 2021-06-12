const db = require('./db')


async function getStatistics(){
    let data = await db.execute(`SELECT * FROM "traffic"`);
    console.log('Data: ',new Date(data.rows[0].time).getDay())
}


getStatistics()


//TODO: Make statistics useful, get good plots and mean values

