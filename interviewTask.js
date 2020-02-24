// Here I required all the modules we want for project.
const express = require ( "express" );
const bodyParser = require ( "body-parser" );
const axios = require ( "axios" );
const CircularJSON = require ("circular-json");
const app = express();

app.use ( bodyParser.json() );
app.use ( bodyParser.urlencoded ({ extended : true }) );

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

// Here we write get method for get data of currency.
app.get ( "/currenciesdata", ( req , res ) => {
    axios
        .get( "https://api.nomics.com/v1/currencies?key=f18f5cd0afd42cbfd6f6359510d62ebc&attributes=original_symbol,name,description,website_url,logo_url,blog_url,discord_url,facebook_url,github_url,medium_url,reddit_url,telegram_url,twitter_url,youtube_url" )
        .then (( data ) => {
            const currencyData = CircularJSON.stringify( data.data );
            const metadata = JSON.parse(currencyData); //Here we get metadata of currency  
            // I use this for checking that there data or not in database.
            knex.select().from ( "dataofcurrencies" )
            .then (( tableData ) => {
                if (tableData.length === 0) {
                    for (let curdata = 0; curdata < metadata.length; curdata++) {
                        // Here I insert data in db
                        knex ( "dataofcurrencies" ).insert (metadata[curdata])
                        .then (() => {
                            console.log ( "Done" );
                        }).catch (( err ) => {
                            console.log ( err );
                        });
                    };
                }else {
                    res.send ( tableData )
                };
            }) 
        }).catch (( err ) => {
                    console.log ( err );
        });    
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

//Here I created a function for creating same column tables.
var dayTable = (( tableName ) => {
    knex.schema.createTable ( tableName , table => {
        table.string ( "id" )
        table.string ( "price_change" ),
        table.string ( "price_change_pct" ),
        table.string ( "volume" ),
        table.string ( "volume_change" ),
        table.string ( "volume_change_pct"),
        table.string ( "market_cap_change"),
        table.string ( "market_cap_change_pct")
    }).then (() => {
        console.log ( "Table created...." + tableName );
    }).catch (() => {
        console.log ( "Table already created...." );
    });
});

//Here I created a function for insert into database for same column\row tables.
var insertInTable = (( tableName, tableData , id ) => {
    knex.schema.hasTable ( tableName )
    .then (( exists ) => { 
        if ( exists ) {
            tableData.id = id
            knex ( tableName ).insert ( tableData )
            .   then (( data ) => {
                console.log ( "Inserted into " + tableName );
            }).catch (( err ) => {
                console.log ( err );
            });
        }else {
            dayTable( tableName )
        }
    });
});

app.get ( "/currenciesticker" , ( req, res ) => {
    axios
        .get("https://api.nomics.com/v1/currencies/ticker?key=f18f5cd0afd42cbfd6f6359510d62ebc" )
        .then (( data ) => {
            const currenciesTickerData = CircularJSON.stringify( data.data );
            const tickerdata = JSON.parse(currenciesTickerData); // Here I get all ticker data.
            //Here I taking data from database for cheking data is available.
            knex.select ().from ( "currenciestickerdata" )
            .then (( data ) => {
                if (data.length === 0) {
                    for (let curdata = 0; curdata < tickerdata.length; curdata++) {
                        var currencytickerdata = tickerdata[curdata]
                        // Here I insert data into database table.
                        knex ( "currenciestickerdata" ).insert ({
                            "currency" : currencytickerdata.currency,
                            "symbol" : currencytickerdata.symbol,
                            "logo" : currencytickerdata.logo_url,
                            "rank" : currencytickerdata.rank,
                            "price" : currencytickerdata.price,
                            "price_date" : currencytickerdata.price_date,
                            "circulating_supply" : currencytickerdata.circulating_supply,
                            "max_supply" : currencytickerdata.max_supply,
                            "high" : currencytickerdata.high,
                            "high_timestamp" : currencytickerdata.high_timestamp
                        }).then (() => {
                            console.log ( "Done" );
                        }).catch (( err ) => {
                            console.log ( err );
                        });
                    };
                }else {
                    //Here I am sending the data of endpoint
                    res.send ( data )
                }
            }).catch (( err ) => {
                console.log ( err );
            });
        }).catch (( err ) => {
            console.log ( err );
        });
});

//Here with this endpoint we will get tickerdata by there rank.
app.get ( "/getcurrenciestickerdata/rank" , ( req, res ) => {
    knex.select ( "rank","price","price_date","market_cap","circulating_supply","max_supply","high","high_timestamp" )
    .from ( "currenciestickerdata" )
    .orderBy ( "rank" )
    .then (( data ) => {
        res.send ( data );
    }).catch (( err ) => {
        console.log ( err );
        res.send ( "Something went wrong....!");
    });
});

//Here user can get data by rank, price, price_date, market_cap, also circulating_supply, max_supply, high, high_timestamp get by sort
app.get ( "/gettickerdata/:input", ( req, res ) => {
    let input = req.params.input
    knex.select ("rank","price","price_date","market_cap","circulating_supply","max_supply","high","high_timestamp")
    .from ( "currenciestickerdata" )
    .orderBy ( input )
    .orderBy ( "circulating_supply","asc","max_supply","asc","high","asc","high_timestamp","asc")
    .then (( data ) => {
        res.send ( data );
    }).catch (( err ) => {
        console.log ( err );
    });
});
 
//
app.get ("/daystables" , ( req, res) => {
    axios
        .get("https://api.nomics.com/v1/currencies/ticker?key=f18f5cd0afd42cbfd6f6359510d62ebc" )
        .then (( data ) => {
            const daysTickerData = CircularJSON.stringify( data.data );
            const daytickerdata = JSON.parse(daysTickerData); // Here I get all ticker data.
            //Here I taking data from database for cheking data is available.
                if (data.length === 0) {
                    for (let curdata = 0; curdata < daytickerdata.length; curdata++) {
                        var currencytickerdata = daytickerdata[curdata]
                        // Here I insert data into database tables.
                        if (currencytickerdata.hasOwnProperty("1d")) {
                            knex.hasTable ( "1d" )
                            .then (( exists ) => {
                                if ( exists ) {
                                    knex.select ().from ( "1d")
                                    .then (( data ) => {
                                        if ( data.length === 0) {
                                            insertInTable ( "1d", currencytickerdata["1d"], currencytickerdata.id);
                                        }
                                    })
                                }else {
                                    hasTable ( "1d" );
                                }
                            }).catch (( err ) => {
                                console.log ( err )
                            });
                        };if (currencytickerdata.hasOwnProperty("7d")) {
                            knex.hasTable ( "7d" )
                            .then (( exists ) => {
                                if ( exists ) {
                                    knex.select ().from ( "7d")
                                    .then (( data ) => {
                                        if ( data.length === 0) {
                                            insertInTable ( "7d", currencytickerdata["7d"], currencytickerdata.id);
                                        }
                                    })
                                }else {
                                    dayTable ( "7d" );
                                }
                            }).catch (( err ) => {
                                console.log ( err );
                            });
                        };if (currencytickerdata.hasOwnProperty("30d")) {
                            knex.hasTable ( "30d" )
                            .then (( exists ) => {
                                if ( exists ) {
                                    knex.select ().from ( "30d")
                                    .then (( data ) => {
                                        if ( data.length === 0) {
                                            insertInTable ( "30d", currencytickerdata["30d"], currencytickerdata.id);
                                        }
                                    })
                                }else {
                                    dayTable ( "30d" );
                                }
                            }).catch (( err ) => {
                                console.log ( err );
                            });
                        };if (currencytickerdata.hasOwnProperty("365d")) {
                            knex.hasTable ( "365d" )
                            .then (( exists ) => {
                                if ( exists ) {
                                    knex.select ().from ( "365d")
                                    .then (( data ) => {
                                        if ( data.length === 0) {
                                            insertInTable ( "365d", currencytickerdata["365d"], currencytickerdata.id);
                                        }
                                    })
                                }else {
                                    dayTable ( "365d" );
                                }
                            }).catch (( err ) => {
                                console.log ( err );
                            });
                        };
                    };
                };
        }).catch (( err ) => {
            console.log ( err );
        })
})


app.get ("/getbyday/:input", ( req, res) => {
    let input = req.params.input;
    knex.select ( "price_change","price_change_pct","volume","volume_change","volume_change_pct","market_cap_change","market_cap_change_pct" )
    .from ( input )
    .then (( data ) => {
        res.send ( data );
    }).catch (( err ) => {
        console.log ( err );
    });
});

// Port 
app.listen ( 5000 , () => {
    console.log ("Listen ", 5000)
});


