const endPoint = "https://api.openweathermap.org/data/2.5/";
const current = "weather?q=";
const oneCall1 = "onecall?lat=";
const oneCall2 = "&lon=";
const oneCall3 = "&units=imperial";
const APIkey = "&APPID=bc881e1f7531f18035cb2e22345637bc";

const savedSearchesName = "weatherDashboardSavedCities";
const lastSearchName = "weatherDashboardLastViewed";
var savedSearches = []; 
var lastSearchIndex = -1; 

getSavedSearches(); 
$("#city-search-btn").click(doSearch); 

function getSavedSearches() {
    var searchList = JSON.parse(localStorage.getItem(savedSearchesName));

    lastSearchIndex = localStorage.getItem(lastSearchName);

    if (searchList) {
        savedSearches = searchList;
        displaySavedSearches();
        displayWeatherData(); 
    }
}

function setSavedSearches() {
    if (savedSearches.length > 0) {
        localStorage.setItem(lastSearchName, lastSearchIndex);
        localStorage.setItem(savedSearchesName, JSON.stringify(savedSearches));
    }
}

function displaySavedSearches() {
    const listItemDef1 = '<a href="#" class="list-group-item list-group-item-action" value=';
    const listItemDef2 = '>';
    const listItemDef3 = '</a>';

    var cityListDiv = $("#city-list"); 
    cityListDiv.empty(); 

    for (let i=0; i<savedSearches.length; i++) {
        cityListDiv.append(listItemDef1 + i + listItemDef2 + savedSearches[i].name + listItemDef3);
    }

    $(".list-group-item-action").click(getCityWeather);
}

function getCityInfo(cityName) {
        var newCityInfo = {}; 
        var openWeatherURL = endPoint + current + cityName + APIkey;

        $.ajax({
            url: openWeatherURL,
            method: "GET"
        }).then(function (response) {
            newCityInfo.name = response.name; 
            newCityInfo.lat = response.coord.lat; 
            newCityInfo.lon = response.coord.lon; 
            lastSearchIndex = savedSearches.push(newCityInfo) - 1; 
            setSavedSearches(); 
            displaySavedSearches();
            displayWeatherData();
        })
}

function displayWeatherData() {
    const htmlH2 = '<h2 class="card-title">';
    const htmlImg = '<img src="';
    const htmlAlt = '" alt="';
    const htmlAltEnd = '">';
    const htmlH2end = '</h2>';
    const html1 = '<div class="col mb-2"> ' + 
        '<div class="card text-white bg-primary"> ' +
        '<div class="card-body px-2" id="forecast';
    const html2 = '"> </div> </div> </div>';
    const htmlH5 = '<h5 class="card-title">';
    const htmlH5end = '</h5>';
    const htmlP = '<p class="card-text">';
    const htmlPend = '</p>';
    const htmlSpan = '<span class="p-2 rounded text-white ';
    const htmlSpanEnd = '"</span>';

    function getUVcolor(uvi) {
        var backgroundColor = ""; 
        if (!(Number.isNaN(uvi))) {
            if (uvi < 4) {
                backgroundColor = "bg-success";
            }
            else if (uvi < 8) {
                backgroundColor = "bg-warning";
            }
            else {
                backgroundColor = "bg-danger";
            }
        }
        return backgroundColor;
    }

    if ((lastSearchIndex !== null) && (lastSearchIndex>=0) && (lastSearchIndex<savedSearches.length)) {
        var openWeatherURL = endPoint + oneCall1 + savedSearches[lastSearchIndex].lat + 
            oneCall2 + savedSearches[lastSearchIndex].lon + oneCall3 + APIkey;

        $.ajax({
            url: openWeatherURL,
            method: "GET"
        }).then(function (response) {
            var weatherDiv = $("#weather-data"); 
            var forecastDiv = $("#forecast-data"); 
            var infoDate = (new Date(response.current.dt * 1000)).toLocaleDateString();
            var weatherTitle = savedSearches[lastSearchIndex].name + " (" + infoDate + ") ";
            var imgURL = "http://openweathermap.org/img/wn/" + response.current.weather[0].icon + ".png";
            var imgDesc = response.current.weather[0].description;

            weatherDiv.empty();
            weatherDiv.append(htmlH2 + weatherTitle + htmlImg + imgURL + htmlAlt + imgDesc + htmlAltEnd + htmlH2end);
            weatherDiv.append(htmlP + "Temperature: " + response.current.temp + "\xB0 F" + htmlPend);
            weatherDiv.append(htmlP + "Humidity: " + response.current.humidity + "%" + htmlPend);
            weatherDiv.append(htmlP + "Wind Speed: " + response.current.wind_speed + " MPH" + htmlPend);
            weatherDiv.append(htmlP + "UV Index: " + htmlSpan + getUVcolor(response.current.uvi) + htmlSpanEnd + response.current.uvi + htmlPend);

            forecastDiv.empty();
            for (let i=0; i<5; i++) {
                forecastDiv.append(html1 + i + html2); 
                infoDate = (new Date(response.daily[i].dt * 1000)).toLocaleDateString();
                imgURL = "http://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + ".png";
                imgDesc = response.daily[i].weather[0].description;
                
                $("#forecast" + i).append(htmlH5 + infoDate + htmlH5end +
                    htmlP + htmlImg + imgURL + htmlAlt + imgDesc + htmlAltEnd + htmlPend +
                    htmlP + "Temp: " + response.daily[i].temp.day + "\xB0 F" + htmlPend +
                    htmlP + "Humidity: " + response.daily[i].humidity + "%" + htmlPend);
            }
        })
        $("#city-column").css("visibility", "visible"); 
    }
}

function doSearch(event) {
    event.preventDefault();
    var citySearchInput = $("#city-search-input");
    var city = citySearchInput.val().trim();
    citySearchInput.val(""); 
    getCityInfo(city);
}

function getCityWeather(event) {
    event.preventDefault();
    lastSearchIndex = $(this).attr("value");
    localStorage.setItem(lastSearchName, lastSearchIndex);
    displayWeatherData();
}

$("#clearHistory").click(function() {
    localStorage.clear();
    location.reload();
});

