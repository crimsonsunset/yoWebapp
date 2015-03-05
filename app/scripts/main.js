/**
 * @author Joe Sangiorgio
 * JS Backend for TrustPilot code test
 */

$(document).ready(function () {
  //lets get the party started, initiate our widgets

  widgetRouter = {}
  //all that is needed to create a widget is one line calling its constructor
  companyWidget = CompanyWidget("joesCompany", "Joe's Awesome Company", "scripts/data/reviews.json");
  companyWidget2 = CompanyWidget("joesCompany22", "ScrollMotion", "scripts/data/reviews2.json");
});


/**
 * Constructor used to create a company widget
 * @param {string} divName - The name of the div you want to populate with a widget
 * @param {string} name - The display name of the company
 * @param {string} dataURL - The URL that houses the data you will use to populate user reviews
 */
function CompanyWidget(divName, name, dataURL) {

  var currWidget = {}
  var currOperator;
  currWidget.divName = "#" + divName;
  currWidget.id = divName;
  currWidget.name = name;

  //call to URL to get user data
  var ajax = $.ajax({
    type: "GET",
    url: dataURL,
    dataType: "json"
  })
    .done(function (data, textStatus, jqXHR) {
      //populate the customerList with user data
      currWidget.customerList = data;
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log('data get failed, please try again')
    })

  //must wait for user data to come in before creating the operator
  $.when(ajax).done(function( x ) {
    //create the operator that will interface with the widget
    currOperator = createOperator(currWidget)
  });

  return currOperator
}

/**
 * Public function exposed to top level. Will be used to interface with all widget's
 * left and right arrows. Using a widget id, this function will be able to choose which
 * operator must be used to move the card stack forward or backwards.
 * @param {bool} isNext - true if user is going forward through array, false if backwards
 * @param {bool} widgetId - id associated with the widget that must be accessed
 */
function rotateCard(isNext, widgetId) {

  widgetRouter[widgetId].rotateCard(isNext)

}
