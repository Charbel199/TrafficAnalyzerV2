const { Pool } = require('pg')
const dotenv = require("dotenv");
dotenv.config();


const pool = new Pool({
    host: process.env.HOST_PRODUCTION,
    port: process.env.DB_PORT_PRODUCTION,
    user: process.env.USER_PRODUCTION,
    password: process.env.PASSWORD_PRODUCTION,
    database: process.env.DATABASE_PRODUCTION,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });


const execute = async (query) => {
    try {
        var response = await pool.query(query);  // sends queries
        return response;
    } catch (error) {
        console.error(error.stack);
        return false;
    }
};

const text = `
    CREATE TABLE IF NOT EXISTS "traffic" (
	    "id" SERIAL,
	    "start" VARCHAR(200) NOT NULL,
	    "destination" VARCHAR(200) NOT NULL,
        "duration" integer,
        "day" integer,
        "time" TIMESTAMP,
	    PRIMARY KEY ("id")
    );`;

execute(text).then(result => {
    if (result) {
        console.log('Table created');
    }
});


module.exports ={
    execute
}