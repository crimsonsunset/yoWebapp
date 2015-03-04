console.log('\'Allo \'Allo!');

/**
 * @author Joe Sangiorgio
 * JS Backend for TrustPilot code test
 */

$(document).ready(function () {
  //lets get the party started, get our data
  $.ajax({
    type: "GET",
    url: "scripts/reviews.json",
    dataType: "json",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Cache-Control": "max-age=0"
    }
  })
    .done(function (data, textStatus, jqXHR) {

      var companyWidget = CompanyWidget("joesCompany", "JoesCompany", data);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {

      console.log('data get failed, please try again')

    })



});


function CompanyWidget(divName, name, customerList) {

  var currWidget = {}
  currWidget.divName = "#" + divName;
  currWidget.name = name;
  currWidget.customerList = customerList;
  widgetOperator.init(currWidget)

  return currWidget
}


// Note here that we are using Object.prototype.newMethod rather than
// Object.prototype so as to avoid redefining the prototype object
CompanyWidget.prototype.toString = function () {
  console.log('toStringzz')
};

var widgetOperator = (function () {

  var widgetOperator = {}
  var company = {}
  widgetOperator

  //highcharts configuration object that dictates styling
  widgetOperator.highchartsConfig = {
    chart: {
      type: 'bar',
      backgroundColor: "transparent"
    },
    colors: ["#B1D3FC"],
    title: {
      text: 'Monthly Average Rainfall',
      style: {
        display: "none"
      }
    },
    subtitle: {
      text: 'Source: WorldClimate.com',
      style: {
        display: "none"
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    exporting: {
      enabled: false
    },
    xAxis: {

      labels: {
        formatter: function () {
          return this.value;
        }
      },
      tickColor: 'E0E0E0',
      lineColor: '#E0E0E0',
      lineWidth: 0,
      gridLineColor: "#F5f5f5",
      gridLineWidth: 0,
      categories: ["1 Star","2 Stars","3 Stars","4 Stars","5 Stars"]
    },
    yAxis: {
      tickColor: 'E0E0E0',
      lineColor: '#E0E0E0',
      lineWidth: 0,
      gridLineWidth: 0,
      min: 0,
      title: {
        text: ''
      },
      style: {
        display: "none"
      },

      labels: {
        enabled: false
      }
    },
    tooltip: {
      enabled: false
    },
    plotOptions: {
      series:{
        colorByPoint: true
      },
      column: {
        dataLabels: {
          enabled: true
        },
        pointPadding: -.26,
        borderWidth: 0
      }
    },
    series: [{
      name: 'Stars',
      data: [49, 71, 106, 129, 144]

    }],
    colors: ['#ED002B', '#FF6434', '#FFC543', '#62A44D', '#00A453']
  }


  calcStats = function () {
    console.log(company.customerList)

    var sum=0;
    $.each(company.customerList, function( i, e ) {
      sum+= Number(e.starRating)
    });

    //Math.round(original*10)/10
    company.average = Math.round(sum/company.customerList.length*10)/10
    console.log(sum)
    console.log(company.average)


  }
  spawnTitle = function () {
    company.divNames["title"] = "title-" + company.name;
    company.divNames["subtitle"] = "subtitle-" + company.name;
    var subtitleText = company.customerList.length + " Reviews | " + company.average + " Average"
    $(company.divName).append($('<h1>', {id: company.divNames["title"], class: "title", text: company.name}))
      .append($('<h3>', {id: company.divNames["subtitle"], class: "subtitle", text: subtitleText}))

  }

  spawnHighchart = function () {


    company.divNames["highcharts"] = "hc-" + company.name;
    $(company.divName).append($('<div>', {id: company.divNames["highcharts"], class: "highcharts"}))

    //prepare the data for insertion into the highcharts object
    $('#' + company.divNames["highcharts"]).highcharts(widgetOperator.highchartsConfig);

  }

  spawnCard = function () {

    //spawn cardContainer
    company.divNames["bigCard"] = "bigCard-" + company.name
    $(company.divName).append($('<div>', {id: company.divNames["bigCard"], class: "bigCard"}))

    //append subContainer to cardContainer
    company.divNames["subCard"] = "subCard-" + company.name
    $("#"+company.divNames["bigCard"]).append($('<div>', {id: company.divNames["subCard"], class: "subCard"}))

  }

  widgetOperator.init = function (inCompany) {
    company = inCompany;
    company.divNames = {}
    company.average=0;
    calcStats();
    spawnTitle();
    spawnHighchart();
    spawnCard();

  }

  return widgetOperator
}());
