"use strict";
var Request = function() {

    function request(method, url) {
        return new Promise(function(resolve, reject){
            var xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function() {
                if(this.status >= 200 && this.status < 300){
                    resolve(xhr.response);
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function() {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send();
        });
    }

    function buildQueryString(data) {
        var query = [];
        for(var k in data){
            if(data.hasOwnProperty(k)){
                query.push(k+'='+encodeURIComponent(data[k]));
            }
        }
        return query.join('&');
    }

    /**
     * Send a GET request with optional data.
     * @param url
     * @param data
     */
    function get(url, data) {
        var finalUrl = url + (data === undefined ?  '' : '?' + buildQueryString(data));
        return request('GET', finalUrl);
    }

    return {
        get: get
    }
};