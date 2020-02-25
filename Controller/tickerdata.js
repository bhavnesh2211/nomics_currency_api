module.exports = ( tickerData, knex, axios, CircularJSON) => {
    tickerData.get ( "/tickerdata" , ( req, res ) => {
        knex.select ().from ( "currenciestickerdata" )
            .then (( data ) => {
                if (data.length === 0) {
                    axios
                        .get("https://api.nomics.com/v1/currencies/ticker?key=f18f5cd0afd42cbfd6f6359510d62ebc" )
                        .then (( data ) => {
                            const currenciesTickerData = CircularJSON.stringify( data.data );
                            const tickerdata = JSON.parse(currenciesTickerData); // Here I get all ticker data.
                            //Here I taking data from database for cheking data is available.
                            for (let curdata = 0; curdata < tickerdata.length; curdata++) {
                                let currencytickerdata = tickerdata[curdata]
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
                        }).catch (( err ) => {
                            console.log ( err );
                        });
                }else {
                    res.send ( data );
                }            
            }).catch (( err ) => {
                console.log ( err );
            });    
    });
    
    //Here with this endpoint we will get tickerdata by there rank.
    tickerData.get ( "/gettickerdata/rank" , ( req, res ) => {
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
    tickerData.get ( "/gettickerdata/:input", ( req, res ) => {
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
    
    /Here I created a function for creating same column tables.
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

     
    //At below endpoint I insterted the days values in the days tables.
    tickerData.get ("/daystables" , ( req, res) => {
        axios
            .get("https://api.nomics.com/v1/currencies/ticker?key=f18f5cd0afd42cbfd6f6359510d62ebc" )
            .then (( data ) => {
                const daysTickerData = CircularJSON.stringify( data.data );
                const daytickerdata = JSON.parse(daysTickerData); // Here I get all ticker data.
                console.log (daytickerdata)
                //Here I taking data from database for cheking data is available.
                for (let curdata = 0; curdata < daytickerdata.length; curdata++) {
                    let currencytickerdata = daytickerdata[curdata]
                    // Here I insert data into database tables.
                    //Here I was checking that there is data is available or not, with there key. 
                    if (currencytickerdata.hasOwnProperty("1d")) {
                        //Here I checking that table is already created or not.
                        knex.schema.hasTable ( "1d" )
                        .then (( exists ) => {
                            if ( exists ) {
                                knex.select ().from ( "1d")
                                .then (( data ) => {
                                    if ( data.length === 0) {
                                        //Here we called inserttable function to inster data in tables.
                                        insertInTable ( "1d", currencytickerdata["1d"], currencytickerdata.id);
                                    }
                                })
                            }else {
                                dayTable ( "1d" );
                            }
                        }).catch (( err ) => {
                            console.log ( err )
                        });

                    };if (currencytickerdata.hasOwnProperty("7d")) { // for all if condition same thing doing
                        knex.schema.hasTable ( "7d" )
                        .then (( exists ) => {
                            if ( exists ) {
                                knex.select ().from ( "7d" )
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
                    };if (currencytickerdata.hasOwnProperty("30d")) { // Here for 30 days
                        knex.schema.hasTable ( "30d" )
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
                    };if (currencytickerdata.hasOwnProperty("365d")) { // Here for 365 days 
                        knex.schema.hasTable ( "365d" )
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
            }).catch (( err ) => {
                console.log ( err );
            })
    })
    
    // At the below endpoint user can get data by currencies days values.
    tickerData.get ("/getbyday/:input", ( req, res) => {
        let input = req.params.input;
        knex.select ( "price_change","price_change_pct","volume","volume_change","volume_change_pct","market_cap_change","market_cap_change_pct" )
        .from ( input )
        .then (( data ) => {
            res.send ( data );
        }).catch (( err ) => {
            console.log ( err );
        });
    });
};
