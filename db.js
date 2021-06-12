const { Pool } = require('pg')
const dotenv = require("dotenv");
dotenv.config();
console.log(process.env.CONNECTON_STRING)
var conString = process.env.CONNECTON_STRING;

const pool = new Pool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
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