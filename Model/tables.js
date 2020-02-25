// Below this I created mysql connection
const knex = require ( "knex" ) ({
    client : "mysql" , 
    connection : {
        host : "localhost",
        user : "root",
        password : "bhavnes",
        database : "currency"
    }
});
// Here I  created a createTable 
knex.schema.createTable ( "dataofcurrencies" , table => {
    table.string ( "original_symbol" ),
    table.string ( "name" ),
    table.text ( "description" ),
    table.string ( "website_url" ),
    table.string ( "logo_url" ),
    table.string ( "blog_url" ),
    table.string ( "discord_url" )
    table.string ( "facebook_url" ),
    table.string ( "github_url" ),
    table.string ( "medium_url" ),
    table.string ( "reddit_url" ),
    table.string ( "telegram_url" ),
    table.string ( "twitter_url" ),
    table.string ( "youtube_url" )
}).then (() => {
    console.log ( "Table created..." );
}).catch (() => { 
    console.log ( "Table already created..." );
});

// SECOND LEVEL 
// Here I created table for second level
knex.schema.createTable ( "currenciestickerdata" , table => {
    table.string ( "currency" ),
    table.string ( "symbol" ),
    table.string ( "logo" ),
    table.string ( "rank" ),
    table.string ( "price" ),
    table.string ( "price_date" ),
    table.string ( "market_cap" ),
    table.string ( "circulating_supply" ),
    table.string ( "max_supply" ),
    table.string ( "high" ),
    table.string ( "high_timestamp" )
}).then (() => {
    console.log ( "Table created... " );
}).catch (() => {
    console.log ( "Table already created... " );
});
