"use strict";
var iTunesSearchAPIClient = function(userConfig) {

    userConfig = (userConfig ? userConfig : {});

    var http = Request();

    var defaultConfig = {
        endpoint: 'https://itunes.apple.com/search',
        search: 50
    };

    var config = Object.assign({}, defaultConfig, userConfig);


    function search(term, limit, searchConfig) {

        if(typeof(searchConfig) !== 'object') searchConfig = {};
        limit = (limit === undefined ? config.search.limit : limit);

        var data = Object.assign({}, config.search, { term: term, limit: limit }, searchConfig);
        return http.get(config.endpoint, data)
            .then(function(response){
                try{
                    var result = JSON.parse(response);
                } catch(e) {
                    throw new Error('invalid response from server.');
                }

                return result;
            });
    }

    return {
        search: search
    }
};
