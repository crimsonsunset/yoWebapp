/**
 * Constructor used to create a widget operator
 * @param {CompanyWidget} inWidget - The populated widget that you wish to create an operator for
 */
function createOperator(inWidget) {

  var returnOperator = (function () {

    var widgetOperator = {}
    var widget = {}
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

    /**
     * Function used to calculate header statistics based on reviewer data
     */
    calcStats = function () {

      var sum = 0;
      $.each(widget.customerList, function (i, e) {
        sum += Number(e.starRating)
        starCounts[e.starRating - 1]++
      });
      widget.average = Math.round(sum / widget.customerList.length * 10) / 10

    }

    /**
     * Function used to spawn the header and associated text
     */
    spawnTitle = function () {
      widget.divNames["header"] = "header-" + widget.id;
      widget.divNames["title"] = "title-" + widget.id;
      widget.divNames["subtitle"] = "subtitle-" + widget.id;
      var subtitleText = widget.customerList.length + " Reviews | " + widget.average + " Average"

      $(widget.divName).append($('<div>', {id: widget.divNames["header"], class: "header"}))


      $("#" + widget.divNames["header"]).append($('<h1>', {
        id: widget.divNames["title"],
        class: "title",
        text: widget.name
      }))
        .append($('<h3>', {id: widget.divNames["subtitle"], class: "subtitle", text: subtitleText}))

    }


    /**
     * Function used to spawn the highchart component
     */
    spawnHighchart = function () {


      widget.divNames["highcharts"] = "hc-" + widget.id;
      $(widget.divName).append($('<div>', {id: widget.divNames["highcharts"], class: "highcharts"}))

      //prepare the data for insertion into the highcharts object
      widgetOperator.highchartsConfig.series[0].data = starCounts
      widgetOperator.highchartsConfig.series[0].id = 'series-1-' + widget.id

      //create the highcharts with the pre-determined configuration data
      $('#' + widget.divNames["highcharts"]).highcharts(widgetOperator.highchartsConfig);

    }


    /**
     * Function used to spawn the bottom container that will house the reviewer cards
     */
    spawnSubCard = function () {

      //HTML template for the bottom container
      var subCardHTML = SubCardHTML(widget.id)

      //spawn cardContainer
      widget.divNames["bigCard"] = "bigCard-" + widget.id
      $(widget.divName).append($('<div>', {id: widget.divNames["bigCard"], class: "bigCard"}))

      //append subContainer to cardContainer
      widget.divNames["subCard"] = "subCard-" + widget.id
      $("#" + widget.divNames["bigCard"]).html(subCardHTML)

      widgetOperator.spawnCard()

    }

    /**
     * Function used to cycle through a reviewer's card and associated information.
     * will loop back around once list of reviews is gone through
     * @param {bool} isNext - true if user is going forward through array, false if backwards
     */
    widgetOperator.rotateCard = function (isNext) {

      //adjust indexes based on size of review array
      (isNext) ? currReviewIndex++ : currReviewIndex--;

      //next arrow has past bounds of array
      if (currReviewIndex > widget.customerList.length - 1) {
        currReviewIndex = 0
      }
      //prev arrow has past bounds of array
      else if (currReviewIndex < 0) {
        currReviewIndex = widget.customerList.length - 1
      } else {
      }

      //once indices are straightened out, can move to the next card
      widgetOperator.spawnCard();

    }

    /**
     * Function used to spawn a reviewer's overall card and associated information
     */
    widgetOperator.spawnCard = function () {

      //assume avatar images will be of the form 'firstname'-'lastname'.png
      var imgUrl = "images/" + widget.customerList[currReviewIndex].firstName.toLowerCase() + "-" + widget.customerList[currReviewIndex].lastName.toLowerCase() + ".png"

      //check if the reviewer has a avatar image. if not, use default.
      var ajax = $.ajax({
        url: imgUrl,
        error: function () {
          imgUrl = "images/default.png"
        },
        success: function () {
        }
      });

      //must wait until image is verified/declined to continue spawning the card
      $.when(ajax).always(function() {

        var directives = {
          reviewerName: {
            text: function (params) {
              return widget.customerList[currReviewIndex].fullName
            }
          },
          avatar: {
            src: function (params) {
              return imgUrl
            }
          },
          reviewTitle: {
            text: function (params) {
              return widget.customerList[currReviewIndex].reviewTitle
            }
          },
          reviewRating: {
            text: function (params) {
              return widget.customerList[currReviewIndex].starRating + " Stars"
            }
          },
          reviewBody: {
            text: function (params) {
              return widget.customerList[currReviewIndex].reviewBody
            }
          }
        };

        $("#" + widget.divNames["subCard"]).render({}, directives);

        //$('.reviewBody').succinct({
        //  size: 120
        //});

        widget.divNames["leftCardCol"] = "leftCardCol-" + widget.id
        widget.divNames["avatarBox"] = "avatarBox-" + widget.id

        //change background of left container to match the review they gave
        $("#" + widget.divNames["avatarBox"]).css('background-color', widgetOperator.highchartsConfig.colors[widget.customerList[currReviewIndex].starRating - 1])


        //code that is used to select the bar associated with the current review.
        var chart = $("#"+widget.divNames["highcharts"]).highcharts()

        //if the last review had the same star rating, no need to select it again.
        if (lastSelectedRating != widget.customerList[currReviewIndex].starRating ) {
          chart.series[0].data[widget.customerList[currReviewIndex].starRating-1].select();
          lastSelectedRating = widget.customerList[currReviewIndex].starRating
        } else {

        }

      });

    }

    /**
     * Function used to initialize a widgetOperator and build out the widget components
     * @param {CompanyWidget} inWidget - The populated widget that you wish to initialize an operator for
     */
    widgetOperator.init = function (inWidget) {
      widget = inWidget;

      //will house all the names for the divs. will be used universally to select elements
      widget.divNames = {}
      widget.average = 0;

      //initialize data and call spawning functions
      calcStats();
      spawnTitle();
      spawnHighchart();
      spawnSubCard();

      //populate the widgetRouter for external user interaction
      widgetRouter[widget.id] = widgetOperator
    }

    return widgetOperator
  }());

  returnOperator.init(inWidget)

  return returnOperator

}
