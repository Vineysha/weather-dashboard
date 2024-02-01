
let cities="";
let srchCity = $("#search-city");
let srchButton = $("#search-button");
let clearButton = $("#clear-history");
let currCity = $("#current-city");
let currTemperature = $("#temperature");
let currHumidty= $("#humidity");
let currWindSpeed=$("#wind-speed");
let currUvindex= $("#uv-index");
let sCity=[];

// This function will search an existing city from the storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}

// API key
let APIKey="d1d1c7bcb9ef6d0effd63fca0dd08d01";

// This function will display the current weather and future weather
function displayWeather(event){
    event.preventDefault();
    if(srchCity.val().trim()!==""){
        cities=srchCity.val().trim();
        currentWeather(cities);
    }
}

// AJAX call
function currentWeather(city){
// This URL will get data from the server
    const queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

// This will take the response to display values such as the date, weather icons, and city names
        console.log(response);

 // Data Api for icon property.
        const weathericon= response.weather[0].icon;
        const iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";

// Date format from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        const date=new Date(response.dt*1000).toLocaleDateString();

// This is the response for the city, date and icon.
        $(currCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");

// Displays current temperature
// Temp to fahrenheit

        const tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currTemperature).html((tempF).toFixed(2)+"&#8457");

// Humidity
        $(currHumidty).html(response.main.humidity+"%");

//Wind speed and converts to MPH
        const ws=response.wind.speed;
        const windsmph=(ws*2.237).toFixed(1);
        $(currWindSpeed).html(windsmph+"MPH");

// UVIndex
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("city-name",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }
    });
}

// UVIindex response
function UVIndex(ln,lt){
    const uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currUvindex).html(response.value);
            });
}
    
// 5 day forecast
function forecast(cityid){
    const dayover= false;
    const queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            const date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            const iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            const iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            const tempK= response.list[((i+1)*8)-1].main.temp;
            const tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            const humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        } 
    });
}

//Adds city to the search history
function addToList(c){
    const listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}

// Chosen city displays when its clicked from the search history
function invokePastSearch(event){
    const liEl=event.target;
    if (event.target.matches("li")){
        cities=liEl.textContent.trim();
        currentWeather(cities);
    }

}

function loadlastCity(){
    $("ul").empty();
    const sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        cities=sCity[i-1];
        currentWeather(cities);
    }

}
//Clears the search history
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();
}

//These are the click handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);