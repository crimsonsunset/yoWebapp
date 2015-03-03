console.log('\'Allo \'Allo!');

/**
 * @author Joe Sangiorgio
 * JS Backend for TrustPilot code test
 */

$(document).ready(function () {
  //lets get the party started
  //var companyWidget = CompanyWidget();
  companyWidget.spawnHighchart()
});

var companyWidget = (function () {


  var companyWidget = {}

  //highcharts configuration object that dictates styling
  companyWidget.highchartsConfig = {
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
        useHTML: true,
        style: {
          background: 'yellow',
          fontSize: '9px',
          fontFamily: 'Helvetica Neue,Arial,Helvetica,sans-serif',
          color: 'black',
          padding: "2px"

        },
        formatter: function () {
          return this.value;
        }
      },
      tickColor: 'E0E0E0',
      lineColor: '#E0E0E0',
      lineWidth: 0,
      gridLineColor: "#F5f5f5",
      gridLineWidth: 0,
      categories: []
    },
    yAxis: {
      tickColor: 'E0E0E0',
      lineColor: '#E0E0E0',
      lineWidth: 0,
      gridLineColor: "#F5f5f5",
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

    }]
  }

  companyWidget.spawnHighchart = function () {

    console.log('zzz')

    //prepare the data for insertion into the highcharts object
    $(function () {
      $('#highcharts').highcharts(companyWidget.highchartsConfig);
    });

  }
  return companyWidget
}());
