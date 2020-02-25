// Here I required all the modules we want for project.
const express = require ( "express" );
const bodyParser = require ( "body-parser" );
const axios = require ( "axios" );
const CircularJSON = require ("circular-json");
const app = express();

app.use ( bodyParser.json() );
app.use ( bodyParser.urlencoded ({ extended : true }) );

const knex = require ( "./Model/tables")

//Below this I have created a routes.
var metaData = express.Router ();
app.use ( "/currencies" , metaData );
require ( "./Controller/metadata") ( metaData, knex, axios, CircularJSON );

var tickerData = express.Router ();
app.use ( "/currencies" , tickerData );
require ( "./Controller/tickerdata") ( tickerData, knex, axios, CircularJSON, dayTable, insertInTable)

app.listen ( 6000 , (port) => {
    console.log ( "Listen ", port);
})
