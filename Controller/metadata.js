//Task 1
module.exports = ( metaData, knex, axios, CircularJSON ) => {
    // Here we write get method for get data of currency.
    metaData.get ( "/metadata", ( req , res ) => {
        knex.select().from ( "dataofcurrencies" )
                .then (( tableData ) => {
                    if (tableData.length === 0) {
                        axios
                            .get( "https://api.nomics.com/v1/currencies?key=f18f5cd0afd42cbfd6f6359510d62ebc&attributes=original_symbol,name,description,website_url,logo_url,blog_url,discord_url,facebook_url,github_url,medium_url,reddit_url,telegram_url,twitter_url,youtube_url" )
                            .then (( data ) => {
                                const currencyData = CircularJSON.stringify( data.data );
                                const metadata = JSON.parse(currencyData); //Here we get metadata of currency  
                                // I use this for checking that there data or not in database.
                                for (let curdata = 0; curdata < metadata.length; curdata++) {
                                    // Here I insert data in db
                                    knex ( "dataofcurrencies" ).insert (metadata[curdata])
                                    .then (() => {
                                        console.log ( "Done" );
                                    }).catch (( err ) => {
                                        console.log ( err );
                                    });
                                }
                            }).catch (( err ) => {
                                console.log ( err );
                            });    
                    }else {
                        res.send ( tableData )
                    }
        }).catch (( err ) => {
            console.log ( err )
        });
    });
};
