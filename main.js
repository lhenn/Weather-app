// options for weather description:
//scattered clouds
//overcast clouds
//broken clouds
//light rain
//clear skies
const app = new Vue({
  el: '#app',
  data: {
    activePage:'landing-page',
    error:'none',
    cityName: '',
    countryName:'',
    countryCodes: countryCodes,
    weatherData: {},
    tabShown: 'daily',
    dailyDetails: [],
    forecastData: []
  },
  methods: {
    getData: function() {

      let dataURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + this.cityName +","+ this.getCountryCode(this.countryName)+ "&APPID=6c46ac8726907ad8effeff6768c2ea01";
      fetch(dataURL, {
          method: "GET"
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(json) {
          if(app.cityName != ''){
          app.weatherData = app.cleanData(json);
          app.dailyDetails = app.getDailyDetails();
          app.forecastData = app.getForecastData();
          app.createChart();
          app.activePage='result-page';
          app.cityName='';
          app.countryName='';
          app.error='none';
          } else {
          app.error='no-entry'
          }
        })
        .catch(function(error) {
          console.log(error)
          app.error='error';
        })
    },
    getCountryCode: function(countryString){
      for (var country in app.countryCodes){
        if(app.countryCodes[country] === countryString){
          return country.toLowerCase();
        }
      }
    },
    getCountryName: function(codeString) {
      return app.countryCodes[codeString];
    },
    cleanData: function(data) {
      let cloudy = new RegExp("cloud","i");
      let rainy = new RegExp("rain","i");
      for (let i = 0; i < data.list.length; i++) {
        let listItemNormalDate = data.list[i].dt_txt.split(" ", 1)[0].substring(5,10);
        let listItemMilTime = data.list[i].dt_txt.split(" ", 2)[1].substring(0, 5);
        if (parseInt(listItemMilTime.substring(0, 2)) > 11) {
          if (listItemMilTime == "12:00") {
            listItemNormalTime = "12pm";
          } else {
            listItemNormalTime = (parseInt(listItemMilTime.substring(0, 2)) - 12) + "pm";
          }
        } else if (parseInt(listItemMilTime.substring(0, 2)) == 00) {
          listItemNormalTime = "12am";
        } else {
          listItemNormalTime = parseInt(listItemMilTime.substring(0, 2)) + "am";
        }
        data.list[i]["normDate"] = listItemNormalDate;
        data.list[i]["milTime"] = listItemMilTime;
        data.list[i]["normTime"] = listItemNormalTime;
        if(data.list[i].weather[0].description == "clear sky"){
          data.list[i]["icon"] = "clear_sky.png";
        }
        if(cloudy.test(data.list[i].weather[0].description)){
          data.list[i]["icon"] = "cloudy.png";
        }
        if(rainy.test(data.list[i].weather[0].description)){
          data.list[i]["icon"] = "rain.png";
        }
      }
      return data;
    },
    getDailyDetails: function() {
      let array = [];
      currentDate = app.weatherData.list[0].normDate;
      for (let i = 0; i < app.weatherData.list.length; i++) {
        if (currentDate === app.weatherData.list[i].normDate) {
          array.push(app.weatherData.list[i]);
        } else {
          break;
        }
      }
      return array;
    },
    getForecastData: function() {
      forecastData = [];
      for (let i = 0; i < app.weatherData.list.length; i++) {
        if (i == 0 || app.weatherData.list[i].normDate != app.weatherData.list[i - 1].normDate) {
          forecastData.push({
            'date': app.weatherData.list[i].normDate,
            'high': 0,
            'low': 0,
            'description': ""
          });
        }
      }
      for (let i = 0; i < forecastData.length; i++) {
        let tempArray=[];
        let descrip = ""
        for (let j = 0; j < app.weatherData.list.length; j++) {
          if (forecastData[i].date == app.weatherData.list[j].normDate){
            tempArray.push(app.weatherData.list[j].main.temp);
            if(app.weatherData.list[j].normTime == '12pm') {
              descrip = app.weatherData.list[j].weather[0].description;
            }
          }
        }
        forecastData[i].high = app.convertToCelsius(Math.max(...tempArray));
        forecastData[i].low = app.convertToCelsius(Math.min(...tempArray));
        forecastData[i].description= descrip;
      }
      return forecastData;
    },
    convertToCelsius:function(temp) {
      return Math.round(temp - 273.15);
    },
    createChart: function() {
      Vue.nextTick()
        .then(function() {
          var ctx = app.$refs.myChart;
          var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            // The data for our dataset
            data: {
              labels: app.forecastData.map(x => x.date),
              datasets: [{
                label: 'Daily Highs',
                // backgroundColor: 'none',
                borderColor: 'rgb(255, 99, 132)',
                data: app.forecastData.map(x => x.high),
                fill:false
              },
              {
                label: 'Daily Lows',
                borderColor: 'blue',
                data: app.forecastData.map(x => x.low),
                fill:false
              }
            ]
            },
            // Configuration options go here
            options: {
              responsive: true,
              maintainAspectRatio: false
            }
          });
        });
    }
  }
})
