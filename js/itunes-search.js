"use strict";
var iTunesSearch = function(userConfig){

    userConfig = (userConfig ? userConfig : {});
    var prevState = {};
    var state = {
        searchTerm: '',
        appClass: 'app-visible',
        detailClass: 'off',
        loadingResults: false,
        resultCount: 0,
        results: [],
        error: null,
        page: 'results',
        detailIndex: null
    };

    var templateCurly = function(template) {
        var placeholderRegex = /{{([^{}]*)}}/g;
        return function(data) {
            return template.replace(placeholderRegex, function(a,b) {
                var val = data[b];
                return typeof(val) === 'string' || typeof(val) === 'number' ? val : a;
            })
        }
    };

    var defaultConfig = {
        templateType: templateCurly,
        container: '#itunes-search',
        resultTemplate: '#itunes-search-result-template',
        detailTemplate: '#itunes-search-detail-template',
        search: '',
        limit: 50,
        media: '',
        country: ''
    };

    var config = Object.assign({}, defaultConfig, userConfig);
    var apiConfig = {
        search: {
            limit: config.limit,
            media: config.media,
            country: config.country
        }
    };
    var apiClient = iTunesSearchAPIClient(apiConfig);

    var $searchButton, $searchInput;
    var $mainElement = document.querySelector(config.container);
    var mainElementTemplate = config.templateType($mainElement.innerHTML);
    var resultTemplate = config.templateType(document.querySelector(config.resultTemplate).innerHTML);
    var detailTemplate = config.templateType(document.querySelector(config.detailTemplate).innerHTML);

    function initEvents(){
        $mainElement.addEventListener('click', function(e){
            var dataset = e.target.dataset;
            if(dataset.hasOwnProperty('itsCall')){
                if(publicAPI.hasOwnProperty(dataset.itsCall)){
                    publicAPI[dataset.itsCall](dataset.itsCallArgs);
                } else {
                    console.warn('unknown API function: ', dataset.itsCall);
                }
            }
            if(dataset.hasOwnProperty('itsSearchButton')){
                var $target = $mainElement.querySelector(dataset.itsSearchButton);
                if($target) {
                    search($target.value);
                }
            }
        });

        $mainElement.addEventListener('keydown', function(e){
            var dataset = e.target.dataset;
            if(dataset.hasOwnProperty('itsSearchInput')) {
                if(e.key === 'Enter'){
                    search(e.target.value);
                }
            }
        })
    }


    function render() {
        $mainElement.innerHTML = mainElementTemplate(state);
        var $searchInput = $mainElement.querySelector('.its-input.search.term');
        $searchInput.select();
        $searchInput.focus();
        var $resultsContainer = $mainElement.querySelector('[data-its-results]');
        renderResults($resultsContainer, state.resultCount, state.results);

        var $detailContainer = $mainElement.querySelector('[data-its-detail]');
        if(state.detailIndex !== null && $detailContainer){
            if(typeof state.results[state.detailIndex] !== 'undefined'){
                var detailResult = state.results[state.detailIndex];
                renderDetail($detailContainer, detailResult);
            }
        }
    }

    function renderResults(element, resultCount, results){
        var resultNodes = [];
        for(var i = 0; i < results.length; i++){
            var resultClass = (i === state.detailIndex ? 'active' : 'inactive');
            resultNodes.push(resultTemplate(Object.assign({}, results[i], {
                _index: i,
                _length: results.length,
                _count: resultCount,
                resultClass: resultClass,
                _detailIndex: state.detailIndex
            })));
        }
        element.innerHTML = resultNodes.join("\n");
    }

    function renderDetail(element, result) {
        element.innerHTML = detailTemplate(result);
    }

    function setState(newState){
        prevState = Object.assign({}, state);
        state = Object.assign({}, state, newState);
        render();
    }

    function search(term) {
        setState({ searchTerm: term, loadingResults: true });
        apiClient.search(term)
            .then(function(result){
                setState(Object.assign({ error: null, loadingResults: false}, result));
            })
            .catch(function(error){
                setState({loadingResults: false, resultCount: 0, results: [], error: error});
            });
    }

    function showDetail(index) {
        setState({ detailIndex: index, detailClass: 'on'});
    }

    function hideDetail() {
        setState({ detailIndex: null , detailClass: 'off'});
    }

    function showNext() {
        var newIndex;
        if(state.detailIndex === null){
            newIndex = 0;
        } else {
            newIndex = (state.detailIndex + 1) % state.results.length;
        }
        showDetail(newIndex);
    }

    function showPrev() {
        var newIndex;
        if(state.detailIndex === null){
            newIndex = state.results.length - 1;
        } else {
            newIndex = ((state.detailIndex - 1) + state.results.length)%state.results.length;
        }
        showDetail(newIndex);
    }


    setTimeout(function(){
        search(config.searchTerm);
    }, 1000);

    var publicAPI = {
        search: search,
        showDetail: showDetail,
        hideDetail: hideDetail,
        showNext: showNext,
        showPrev: showPrev
    };

    initEvents();

    return publicAPI;
};