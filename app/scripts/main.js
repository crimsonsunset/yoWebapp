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

      widgetRef = {}

      companyWidget = CompanyWidget("joesCompany", "JoesCompany", data);
      companyWidget2 = CompanyWidget("joesCompany22", "JoesCompany22", data);

      //var companyWidget2 = CompanyWidget("joesCompany22", "JoesCompany22", data);
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
  var myOperator = createOperator(currWidget)

  return myOperator
}

// Note here that we are using Object.prototype.newMethod rather than
// Object.prototype so as to avoid redefining the prototype object
CompanyWidget.prototype.toString = function () {
  console.log('toStringzz')
};

function createOperator(inWidget) {

  var returnOperator = (function () {

    var widgetOperator = {}
    var company = {}
    var currReviewIndex = 0;
    var starCounts = [0, 0, 0, 0, 0];
    var lastSelectedRating = -1;

    //highcharts configuration object that dictates styling
    widgetOperator.highchartsConfig = {
      chart: {
        type: 'bar',
        backgroundColor: "transparent",
        events: {
          select: function (event) {
            alert("this")
          }
        }
      },
      colors: ["#B1D3FC"],
      title: {
        text: '',
        style: {
          display: "none"
        }
      },
      subtitle: {
        text: '',
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
        categories: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"]
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
        series: {
          colorByPoint: true,
          allowPointSelect: true,
          states: {
            select: {
              color: null,
              borderWidth:10,
              borderColor:'blue'
            }
          },
          point: {
            events: {
              select: function () {
              }
            }
          }
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
        id: 'series-1',
        data: [49, 71, 106, 129, 144]

      }],
      colors: ['#ED002B', '#FF6434', '#FFC543', '#62A44D', '#00A453']
    }


    calcStats = function () {
      console.log(company.customerList)

      var sum = 0;
      $.each(company.customerList, function (i, e) {
        sum += Number(e.starRating)
        starCounts[e.starRating - 1]++
      });
      console.log(starCounts)

      //Math.round(original*10)/10
      company.average = Math.round(sum / company.customerList.length * 10) / 10
      console.log(sum)
      console.log(company.average)


    }
    spawnTitle = function () {
      company.divNames["header"] = "header-" + company.name;
      company.divNames["title"] = "title-" + company.name;
      company.divNames["subtitle"] = "subtitle-" + company.name;
      var subtitleText = company.customerList.length + " Reviews | " + company.average + " Average"

      $(company.divName).append($('<div>', {id: company.divNames["header"], class: "header"}))


      $("#" + company.divNames["header"]).append($('<h1>', {
        id: company.divNames["title"],
        class: "title",
        text: company.name
      }))
        .append($('<h3>', {id: company.divNames["subtitle"], class: "subtitle", text: subtitleText}))

    }

    spawnHighchart = function () {


      company.divNames["highcharts"] = "hc-" + company.name;
      $(company.divName).append($('<div>', {id: company.divNames["highcharts"], class: "highcharts"}))

      //prepare the data for insertion into the highcharts object

      widgetOperator.highchartsConfig.series[0].data = starCounts
      widgetOperator.highchartsConfig.series[0].id = 'series-1-' + company.name

      $('#' + company.divNames["highcharts"]).highcharts(widgetOperator.highchartsConfig);

    }

    spawnCardz = function () {

      //spawn cardContainer
      company.divNames["bigCard"] = "bigCard-" + company.name
      $(company.divName).append($('<div>', {id: company.divNames["bigCard"], class: "bigCard"}))

      //append subContainer to cardContainer
      company.divNames["subCard"] = "subCard-" + company.name
      $("#" + company.divNames["bigCard"]).append($('<div>', {id: company.divNames["subCard"], class: "subCard"}))

    }

    spawnSubCard = function () {

      var subCardHTML = '<div class="subCard" id="subCard-' + company.name + '">\
    <div class="leftCardCol" id="leftCardCol-' + company.name + '">\
  <img class="avatar" src="images/erika-wolfe.png" id="avatar-' + company.name + '">\
  <h5 class="reviewerName" id="reviewerName-' + company.name + '"> Erika W.</h5>\
  <div class="reviewBox" id="reviewBox-' + company.name + '"> \
  <h5 class="reviewRating" id="reviewRating-' + company.name + '"> REVIEW TITLE</h5>\
  <input class="leftArrow" id="leftArrow-' + company.name + '" type="image" src="images/left_arrow.svg" onclick="rotateCard(false,\'' + company.name + '\')"/>\
  <input class="rightArrow"id="rightArrow-' + company.name + '"type="image" src="images/right_arrow.svg" onclick="rotateCard(true,\'' + company.name + '\')"/>\
  </div>\
  </div>\
  <div class="rightCardCol" id="rightCardCol-' + company.name + '">\
  <h5 class="reviewTitle" id="reviewTitle-' + company.name + '"> REVIEW TITLE</h5>\
  <h5 class="reviewBody" id="reviewBody-' + company.name + '"> THIS IS A BODY ASASASSA</h5>\
  </div>\
  </div>'


      //spawn cardContainer
      company.divNames["bigCard"] = "bigCard-" + company.name
      $(company.divName).append($('<div>', {id: company.divNames["bigCard"], class: "bigCard"}))

      //append subContainer to cardContainer
      company.divNames["subCard"] = "subCard-" + company.name
      $("#" + company.divNames["bigCard"]).html(subCardHTML)

      widgetOperator.spawnCard()

    }

    widgetOperator.init = function (inCompany) {
      company = inCompany;
      company.divNames = {}
      company.average = 0;
      calcStats();
      spawnTitle();
      spawnHighchart();
      spawnSubCard();
      widgetRef[company.name] = widgetOperator
    }
    widgetOperator.rotateCard = function (isNext) {

      //adjust indexes based on size of review array
      (isNext) ? currReviewIndex++ : currReviewIndex--;

      //next arrow has past bounds of array
      if (currReviewIndex > company.customerList.length - 1) {
        currReviewIndex = 0
      }
      //prev arrow has past bounds of array
      else if (currReviewIndex < 0) {
        currReviewIndex = company.customerList.length - 1
      } else {
      }

      widgetOperator.spawnCard();

    }
    widgetOperator.spawnCard = function () {

      var imgUrl = "images/" + company.customerList[currReviewIndex].firstName.toLowerCase() + "-" + company.customerList[currReviewIndex].lastName.toLowerCase() + ".png"

      //check if the reviewer has a avatar image. if not, use default.
      $.ajax({
        url: imgUrl,
        async: false,
        type: 'HEAD',
        error: function () {
          imgUrl = "images/default.png"
        },
        success: function () {
        }
      });

      var directives = {
        reviewerName: {
          text: function (params) {
            return company.customerList[currReviewIndex].fullName
          }
        },
        avatar: {
          src: function (params) {
            return imgUrl
          }
        },
        reviewTitle: {
          text: function (params) {
            return company.customerList[currReviewIndex].reviewTitle
          }
        },
        reviewRating: {
          text: function (params) {
            return company.customerList[currReviewIndex].starRating + " Stars"
          }
        },
        reviewBody: {
          text: function (params) {
            return company.customerList[currReviewIndex].reviewBody
          }
        }
      };

      $("#" + company.divNames["subCard"]).render({}, directives);

      //$('.reviewBody').succinct({
      //  size: 120
      //});

      company.divNames["leftCardCol"] = "leftCardCol-" + company.name

      //change background of left container to match the review they gave
      $("#" + company.divNames["leftCardCol"]).css('background-color', widgetOperator.highchartsConfig.colors[company.customerList[currReviewIndex].starRating - 1])


      //code that is used to select the bar associated with the current review.
      var chart = $("#"+company.divNames["highcharts"]).highcharts()

      //if the last review had the same star rating, no need to select it again.
      if (lastSelectedRating != company.customerList[currReviewIndex].starRating ) {
        chart.series[0].data[company.customerList[currReviewIndex].starRating-1].select();
        lastSelectedRating = company.customerList[currReviewIndex].starRating
      } else {

      }

    }

    return widgetOperator
  }());

  returnOperator.init(inWidget)

  return returnOperator

}


function rotateCard(isNext, inCompany) {

  widgetRef[inCompany].rotateCard(isNext)

}
