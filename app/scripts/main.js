/**
 * @author Joe Sangiorgio
 * JS Backend for BuzzFeed code test
 */

$(document).ready(function () {
  //lets get the party started
  buzzfeed.start()
});

//the API URL to GET from
var url = "http://www.buzzfeed.com/buzzfeed/api/comments?buzz_id="
var buzz_id = "3494459"

var buzzfeed = (function () {
  var buzzfeed = {}

  //Constants
  //number of comments to load per page
  buzzfeed.DISPLAY_NUM = 100
  //this would come in dynamically (presumably through a different api call)
  buzzfeed.ARTICLE_NAME = "Here Are The Cities Where The Rent Really Is Too Damn High"

  //main datastores for this class
  buzzfeed.commentArr = []
  buzzfeed.styleRefObj = {
    "@@@loves": "<img class='loves' src='img/love_small.png'>",
    "@@@hates": "<img class='hates' src='img/hate_small.png'>",
    "@@@thinks": "<span class='thinks'>thinks</span>"
  }
  buzzfeed.commentCount = 132
  buzzfeed.textComments = []
  buzzfeed.reactions = []
  buzzfeed.reactionTallies = {}
  buzzfeed.bots = []
  buzzfeed.gifReactions = []
  buzzfeed.imageReactions = []
  buzzfeed.users = {}
  buzzfeed.currTab = "all"

  //html strings that will be dynamically inserted depending on the tab
  buzzfeed.innerCommentStr = "<div class='userInfo' ><img class='userImg' src='img/user.jpg'><div class='user_id' id='user_id'></div><div class='dateDiffComment' id='dateDiffComment'></div></div><div class='blurb' id='blurb'></div>"
  buzzfeed.innerCommentStrAll = "<div class='userInfo' ><img class='userImg' src='img/user.jpg'><div class='user_id' id='user_idAll'></div><div class='dateDiffCommentAll' id='dateDiffCommentAll'></div></div><div class='blurb' id='blurbAll'></div>"
  buzzfeed.innerReactionStr = "<div class='reaction' >  <div class='myId'></div>  <div class='userText'></div>  <div class='dateDiff'></div></div>"
  buzzfeed.innerReactionStrAll = " <div class='myId'></div>  <div class='userTextAll'></div>  <div class='dateDiff'></div>"
  buzzfeed.outerReactionStr = "<div class='reaction' ><div class='myId'></div><div class='userText'></div><div class='dateDiff'></div></div>"

  //arrays to store the items in the pages that overflow
  buzzfeed.allPages = []
  buzzfeed.commentPages = []
  buzzfeed.reactionPages = []

  //objects that will store pages at a time
  buzzfeed.allPagesObj = {}
  buzzfeed.commentPagesObj = {}
  buzzfeed.reactionPagesObj = {}

  //current page for each tab
  buzzfeed.currTextPage = 0
  buzzfeed.currReactionPage = 0
  buzzfeed.currAllPage = 0
  buzzfeed.totalAll = 0

  //highcharts configuration object that dictates styling
  buzzfeed.highchartsConfig = {
    chart: {
      type: 'column',
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
      name: 'Reactions',
      data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]

    }]
  }

  /**
   * Makes AJAX Call, then starts the separation/population process
   */
  buzzfeed.start = function () {

    $.ajax({
      url: url + buzz_id,
      async: false,
      type: "GET"
    })
      .done(function (data) {
        console.log("API GET Successful")
        buzzfeed.commentArr = data.comments
        buzzfeed.commentCount = data.count
        buzzfeed.separateCommentTypes();
      })
      .fail(function () {
        console.log("error");
      })
      .always(function () {
        //alert( "complete" );
      });


  }

  //Data-Manipulation Functions

  /**
   * Separates the comments into all possible types, populating the datastores for later use
   */
  buzzfeed.separateCommentTypes = function () {

    //separate comments into two main types for this exercise: text comments and reactions
    _.each(buzzfeed.commentArr, function (e, i, l) {
      //make human date for later consumption
      e.humanDate = buzzfeed.humanizeDate(e.f_raw)
      e.dateDiff = buzzfeed.dateDiff(e.f_raw)
      e.dateDiffComment = buzzfeed.dateDiff(e.f_raw)
      e.dateDiffCommentAll = buzzfeed.dateDiff(e.f_raw)

      //nice and easy, lets take the text comments out of the equation
      if (e.form == "text") {
        e.blurb = cleanStrings(e.blurb)
        buzzfeed.textComments.push(e)

        //populate the page object
        if (!buzzfeed.commentPagesObj[buzzfeed.currTextPage]) {
          buzzfeed.commentPagesObj[buzzfeed.currTextPage] = []
        } else {
          if (buzzfeed.commentPagesObj[buzzfeed.currTextPage].length == buzzfeed.DISPLAY_NUM) {
            buzzfeed.currTextPage++
            buzzfeed.commentPagesObj[buzzfeed.currTextPage] = []
          } else {
          }
        }
        buzzfeed.commentPagesObj[buzzfeed.currTextPage].push(e)
        addToAllPages(e)

      }
      //get those bots outta here
      else if (e.form == "link-traffic") {
        buzzfeed.bots.push(e)
      }
      //reserve this for handling gif reactions
      else if (e.form == "react_image") {
        buzzfeed.gifReactions.push(e)
      }
      //reserve this for handling image reactions
      else if (e.form == "image") {
        buzzfeed.imageReactions.push(e)
      }
      //and finally, the reactions
      else {
        //use this for loop to count different badges, will be displayed in chart form later

        if (!buzzfeed.reactionPagesObj[buzzfeed.currReactionPage]) {
          buzzfeed.reactionPagesObj[buzzfeed.currReactionPage] = []
        } else {
          if (buzzfeed.reactionPagesObj[buzzfeed.currReactionPage].length == buzzfeed.DISPLAY_NUM) {
            buzzfeed.currReactionPage++
            buzzfeed.reactionPagesObj[buzzfeed.currReactionPage] = []
          } else {
          }
        }


        //need to check if user had more than one reaction to post, will be used later to populate
        //their reactions output accordingly.
        if (!buzzfeed.users[e.user_id]) {
          buzzfeed.users[e.user_id] = []
          buzzfeed.users[e.user_id].push(e)
          //only add to the reaction array the first time, will use the users object as reference later
          buzzfeed.reactions.push(e)
          buzzfeed.reactionPagesObj[buzzfeed.currReactionPage].push(e)
        } else {
          buzzfeed.users[e.user_id].push(e)
        }

        if (!e.badge_title) {
        }
        //we have badges, add them up
        else if (!buzzfeed.reactionTallies[e.badge_title]) {
          buzzfeed.reactionTallies[e.badge_title] = {
            total: 1,
            title: e.badge_title
          }
        } else {
          buzzfeed.reactionTallies[e.badge_title].total++
        }
        addToAllPages(e)

      }

    });

    function addToAllPages(e) {

      if (!buzzfeed.allPagesObj[buzzfeed.currAllPage]) {
        buzzfeed.allPagesObj[buzzfeed.currAllPage] = []
      } else {
        if (buzzfeed.allPagesObj[buzzfeed.currAllPage].length == buzzfeed.DISPLAY_NUM) {
          buzzfeed.currAllPage++
          buzzfeed.allPagesObj[buzzfeed.currAllPage] = []
        } else {
        }
      }
      buzzfeed.allPagesObj[buzzfeed.currAllPage].push(e)
    }

    //tag the name of the article for adding style once reactions are rendered
    var titleArr = buzzfeed.ARTICLE_NAME.split(" ")

    var newTitle = "";
    _.each(titleArr, function (e, i, l) {
      newTitle += "###" + e + " "
    })
    buzzfeed.ARTICLE_NAME = newTitle

    //reset currPages for usage with load more button
    buzzfeed.currTextPage = 0
    buzzfeed.currReactionPage = 0
    buzzfeed.currAllPage = 0

    //now that the datastores are populated, can use them to render the tabs and the highchart
    subCommentCount = 0;
    subCommentCountAll = 0;
    buzzfeed.allCommentCount = 0;

    console.log("Data Processed, Rendering Started")
    buzzfeed.spawnHighchart();
    buzzfeed.loadAllPage();
    buzzfeed.loadCommentPage();
    buzzfeed.loadReactionPage();
    console.log("Rendering Finished")

  }

  /**
   * Function for loading the next Comments page
   */
  buzzfeed.loadCommentPage = function () {

    //COMMENTS TAB
    //flip our operational boolean
    buzzfeed.onAllTab = false;
    //since some of the blurbs have links, we can't take advantage of transparency's beautiful one-line render.
    //Instead, iterate through comments and render by hand if a link is included. =(

    //TODO: check this
    //subCommentCount = 0;
    _.each(buzzfeed.commentPagesObj[buzzfeed.currTextPage], buzzfeed.spawnComment, this);
    //we just added a new page of reactions, see if there's more
    buzzfeed.checkLoadButton();
  }

  /**
   * Function for loading the next Reaction page
   */
  buzzfeed.loadReactionPage = function () {

    //flip our operational boolean
    buzzfeed.onAllTab = false;

    //REACTION TAB

    var outer = document.getElementById("reactions")
    outer.innerHTML = outer.innerHTML + "<div class='innerReactions' id='innerReactions'></div>"
    $('#innerReactions').attr('id', "innerReactions" + buzzfeed.currReactionPage);
    var output = document.getElementById("innerReactions" + buzzfeed.currReactionPage);
    output.innerHTML = output.innerHTML + buzzfeed.outerReactionStr
    $('#innerReactions').attr('id', "innerReactions" + buzzfeed.currReactionPage);


    //var output2 = document.getElementById("reactions" + buzzfeed.currReactionPage);
    //output2.innerHTML = output2.innerHTML + innerCommentStr;

    reactionInd = 0;
    $('#innerReactions' + buzzfeed.currReactionPage).render(buzzfeed.reactionPagesObj[buzzfeed.currReactionPage], buzzfeed.reactionDirectives);

    //once the reactions are rendered with plain text using transparency.js, we need to
    //replace the specially tagged strings with the corresponding html classes
    buzzfeed.stylizeReactionText();

    //we just added a new page of reactions, see if there's more
    buzzfeed.checkLoadButton();
  }

  /**
   * Function for loading the next All page
   */
  buzzfeed.loadAllPage = function () {

    //ALL TAB

    //mixed bag for the all tab, so we need to iterate to figure out
    // which kind of comment we're dealing with, then handle it appropriately

    buzzfeed.onAllTab = true;
    buzzfeed.firstAllRun = true;
    buzzfeed.renderedUsers = {}

    //iterate through all the response objects, spawning and rendering as need be
    _.each(buzzfeed.allPagesObj[buzzfeed.currAllPage], function (e, i, l) {

      if (e.form == "badge_vote" || e.form == "loves" || e.form == "hates") {

        //already rendered this users info, skip over them
        if (buzzfeed.renderedUsers[e.user_id]) {

        }
        //they're new to the party, put their info on the page
        else {

          var currContainer = "all"
          var innerContainer = "innerCommentsAll"
          if (buzzfeed.firstAllRun) {
            var outer = document.getElementById(currContainer)
            outer.innerHTML = outer.innerHTML + "<div class='" + innerContainer + "' id='" + innerContainer + "'></div>"
            $('#' + innerContainer).attr('id', innerContainer + buzzfeed.currAllPage);
          } else {

          }

          buzzfeed.allCommentCount++;
          buzzfeed.renderedUsers[e.user_id] = true;
          var output = document.getElementById(innerContainer + buzzfeed.currAllPage);
          var reactionStr = "<div class='reactionAll' id='reactionAll' ></div>"
          output.innerHTML = output.innerHTML + reactionStr
          $('#reactionAll').attr('id', "reactionAll" + buzzfeed.totalAll);
          var output2 = document.getElementById("reactionAll" + buzzfeed.totalAll);
          output2.innerHTML = output2.innerHTML + buzzfeed.innerReactionStrAll;
          reactionIndAll = 0
          $('#reactionAll' + buzzfeed.totalAll).render(e, buzzfeed.reactionDirectives);
          buzzfeed.totalAll++
        }

      } else if (e.form == "text") {
        buzzfeed.allCommentCount++;
        _.each([e], buzzfeed.spawnComment, this);
        buzzfeed.totalAll++
      }
      else {
        //can ignore all these other types
      }
      buzzfeed.firstAllRun = false;
    })
    buzzfeed.stylizeReactionText();
    //we just added a new page of reactions, see if there's more
    buzzfeed.checkLoadButton();

  }

  //Parsing/Stylizing/Rendering Functions

  /**
   * Leverages the userArr to suss out how to display a given reaction.
   * If a user has reacted more than once, this function will combine them appropriately
   */
  buzzfeed.parseReactionText = function () {

    var retStr = "";

    //a user has reacted more than once
    if (buzzfeed.users[this.user_id].length > 1) {

      var likeCount = 0;
      var reactionArr = [];
      var i = 0;
      var likeIndArr = []
      var userId = this.user_id


      //check if one of the reactions is a loves or hates type
      $.grep(buzzfeed.users[this.user_id], function (e) {
        var retVal = ((e.form == "hates" ) || ( e.form == "loves") )
        if (retVal) {
          likeIndArr.push(i)
          likeCount++
        } else {
          reactionArr.push(e.badge_title)
        }
        i++;
        return retVal;
      });

      //add our @@@ identifiers to these badges
      _.each(reactionArr, function (e, i, l) {
        reactionArr[i] = "@@@" + e
      });
      var reactionStr = String(reactionArr)
      reactionStr = reactionStr.replace(/,/g, " , ");

      //add ampersands for multiple reactions
      if (reactionArr.length > 1) {
        var lastInd = reactionStr.lastIndexOf(",")
        reactionStr = reactionStr.replaceAt(lastInd, "&");
      }


      //Starting here, we're figuring out what type of string to return

      //loved and hated the article
      if (likeCount == 2) {
        //1664046
        //just love and hate, no badge
        if (reactionArr.length == 0) {
          retStr = "@@@" + buzzfeed.users[this.user_id][likeIndArr[0]].form + " & " + "@@@" + buzzfeed.users[this.user_id][likeIndArr[1]].form + " " + buzzfeed.ARTICLE_NAME
        }
        //they have loved,hated, and badgevoted this article (overachievers)
        else {
          for (var j = 0; j < likeIndArr.length; j++) {
            retStr += "@@@" + buzzfeed.users[this.user_id][likeIndArr[j]].form;
            var amp = (j == likeIndArr.length - 2) ? " & " : ""
            retStr += amp
          }
          retStr += " and thinks it's " + reactionStr
        }
      }
      //liked and reacted
      else if (likeCount == 1 && reactionArr.length != 0) {
        retStr = "@@@" + buzzfeed.users[this.user_id][likeIndArr[0]].form + " " + buzzfeed.ARTICLE_NAME + " and thinks it's " + reactionStr
      }
      //they just reacted to the article without liking
      else {
        retStr = "thinks " + buzzfeed.ARTICLE_NAME + " is " + reactionStr
      }
    }
    //only reacted once, find out what type it is
    else {
      if (buzzfeed.users[this.user_id][0].form == "badge_vote") {
        var thinks = "thinks "
        retStr = "@@@" + thinks + buzzfeed.ARTICLE_NAME + " is @@@" + buzzfeed.users[this.user_id][0].badge_title
      }
      //they have only liked it
      else {
        retStr = "@@@" + buzzfeed.users[this.user_id][0].form + " " + buzzfeed.ARTICLE_NAME
      }
    }
    (buzzfeed.onAllTab) ? reactionIndAll++ : reactionInd++
    //console.log(retStr)
    return retStr

  }

  /**
   * Searches for tagged plain text in the rendered HTML
   * and replaces it with the corresponding html tags
   */
  buzzfeed.stylizeReactionText = function () {

    var currText = ""
    var currReaction = ""

    //using this method for the all tab and the reaction tab, need to set
    //the identifier strings accordingly
    if (buzzfeed.onAllTab) {
      currText = "userTextAll"
      currReaction = "reactionAll"

    } else {
      currText = "userText"
      currReaction = "reaction"
    }

    //add id tags to the reactions, will be used for paging later on
    var reactionNodes = document.getElementsByClassName(currText);
    var fullReactionNodes = document.getElementsByClassName(currReaction);

    _.each(reactionNodes, function (e, i, l) {
      e.setAttribute("id", currText + i);
      fullReactionNodes[i].setAttribute("id", currReaction + i);
      var currHTML = $('#' + currText + i).html()
      var wordArr = currHTML.split(" ")
      var matchingIndexes = []
      var currInd = 0;

      //find our tagged words, get their indexes so they can be replaced with
      //corresponding html tags
      var matchingWords = $.grep(wordArr, function (e) {
        var retVal = (e.indexOf("@@@") != -1)
        var d = (retVal) ? matchingIndexes.push(currInd) : $.noop()
        currInd++;
        return retVal
      });

      //same goes for title
      var titleWords = $.grep(wordArr, function (e) {
        var retVal = (e.indexOf("###") != -1)
        return retVal
      });

      var title = titleWords.join(" ")
      var re = new RegExp("###", 'g');
      title = title.replace(re, '');

      var titleSpan = "<div class='articleName'>" + title + "</div>"


      //replace the words with their corresponding html
      _.each(matchingWords, function (e2, i2, l2) {

        var word = e2.replace("@@@", '');
        var style = ""
        if (!buzzfeed.styleRefObj[e2.toLowerCase()]) {
          style = "<span class='badges'>" + word + "</span>"
        } else {
          style = buzzfeed.styleRefObj[e2.toLowerCase()]
        }
        wordArr[matchingIndexes[i2]] = style
      })
      var updatedHTML = wordArr.join(" ");
      updatedHTML = updatedHTML.replace(buzzfeed.ARTICLE_NAME, titleSpan);
      $('#' + currText + i).html(updatedHTML)


    })

  }

  /**
   * The comment rendering function. Used in conjunction with a for loop because blurbs that
   * contain links must be handled manually
   */
  buzzfeed.spawnComment = function (e, i, l) {

    var currContainer = ""
    var currType = ""
    var subCommentType = ""
    var innerCommentStr = ""
    var innerContainer = ""
    var currPage = ""

    //using this method for the all tab and the comments tab, need to set
    //the identifier strings accordingly
    if (buzzfeed.onAllTab) {
      currContainer = "all"
      currType = "commentAll"
      subCommentType = "subCommentAll"
      innerContainer = "innerCommentsAll"
      innerCommentStr = buzzfeed.innerCommentStrAll
      i = buzzfeed.currTextPage + "--" + buzzfeed.allCommentCount
      currPage = buzzfeed.currAllPage

    } else {
      currContainer = "comments"
      currType = "comment"
      subCommentType = "subComment"
      innerContainer = "innerComments"
      innerCommentStr = buzzfeed.innerCommentStr
      i = buzzfeed.currTextPage + "--" + i
      currPage = buzzfeed.currTextPage
    }

    //add the comment HTML to the page, will need to operate on it either way.
    var outer = document.getElementById(currContainer)

    outer.innerHTML = outer.innerHTML + "<div class='" + innerContainer + "' id='" + innerContainer + "'></div>"
    $('#' + innerContainer).attr('id', innerContainer + currPage);


    var output = document.getElementById(innerContainer + currPage);
    var commentStr = "<div class='" + currType + "' id='" + currType + "' ></div>"
    output.innerHTML = output.innerHTML + commentStr
    $('#' + currType).attr('id', currType + i);
    var output2 = document.getElementById(currType + i);
    output2.innerHTML = output2.innerHTML + innerCommentStr;

    //link in blurb string, lets do it the hard way
    if (e.blurb.indexOf("<a href=") != -1) {
      buzzfeed.addLink(e)
    }
    //beautiful one line render
    else {
      $('#' + currType + i).render(e, buzzfeed.commentDirectives);
    }

    //we have sub-comments to display, add the html and render them
    if (e.children) {
      _.each(e.children, function (e2, i2, l2) {
        //since this is for the comments-only view, we want to check that the element is a comment
        if (e2.form == "text") {
          var commentStr = "<div class='" + subCommentType + "' id='" + subCommentType + "' ></div>"
          output.innerHTML = output.innerHTML + commentStr
          $('#' + subCommentType).attr('id', subCommentType + subCommentCount);
          var output2 = document.getElementById(subCommentType + subCommentCount);
          output2.innerHTML = output2.innerHTML + innerCommentStr;
          e2.blurb = cleanStrings(e2.blurb)
          e2.humanDate = buzzfeed.humanizeDate(e2.f_raw)
          e2.dateDiff = buzzfeed.dateDiff(e2.f_raw)
          e2.dateDiffComment = buzzfeed.dateDiff(e2.f_raw)

          $('#' + subCommentType + subCommentCount).render(e2);
          subCommentCount++

        } else {

        }
      })
    }


  }

  /**
   * The function for manually adding links to blurbs that contain them
   */
  buzzfeed.addLink = function (e) {

    var blurbId = ""
    var userId = ""
    var dateDiffId = ""

    //using this method for the all tab and the comments tab, need to set
    //the identifier strings accordingly
    if (buzzfeed.onAllTab) {
      blurbId = "blurbAll"
      userId = "user_idAll"
      dateDiffId = "dateDiffCommentAll"

    } else {
      blurbId = "blurb"
      userId = "user_id"
      dateDiffId = "dateDiffComment"
    }

    //slice up the blurb, finding the link tag, extracting the url, creating an a tag with the new url
    //inserting the new url into the innerHTML, and then finally appending this to our comment in question
    var str = e.blurb
    var tagStart = str.search(/<[a-z][\s\S]*>/i);
    var tagEnd = str.search(">");
    var tag = str.slice(tagStart, tagEnd + 1);
    var linkStart = tag.indexOf('"')
    var linkEnd = tag.indexOf('"', linkStart + 1)
    var url = tag.slice(linkStart, linkEnd + 1);
    var preURLStr = str.slice(0, tagStart - 1)
    var wordArr = preURLStr.split(' ')
    var urlWord = wordArr[wordArr.length - 1]
    var startStr = preURLStr.replace(urlWord, "");
    var endStr = str.slice(tagEnd + 1)
    $("#" + blurbId).append(startStr)
    var re = new RegExp('"', 'g');
    url = url.replace(re, "");
    //console.log(url)
    var a = $('<a />');
    a.attr('href', url);
    a.text(urlWord);
    $('#' + blurbId).append(a);
    $("#" + blurbId).append(" " + endStr)

    $('#' + userId).append("User " + e.user_id);
    $('#' + dateDiffId).append(e.dateDiff);


  }

  /**
   * The function for populating highcharts data, then feeding it config object to render
   */
  buzzfeed.spawnHighchart = function () {

    //prepare the data for insertion into the highcharts object
    var reactionTallyArr = []
    _.each(buzzfeed.reactionTallies, function (e, i, l) {
      reactionTallyArr.push(e)
    })
    reactionTallyArr.sort(sort_by('total', false, function (a) {
      return a
    }));
    var orderedBadges = []
    var orderedTallies = []
    _.each(reactionTallyArr, function (e, i, l) {
      orderedBadges.push(e.title.toUpperCase())
      orderedTallies.push(e.total)
    })
    buzzfeed.highchartsConfig.xAxis.categories = orderedBadges
    buzzfeed.highchartsConfig.series[0].data = orderedTallies

    $(function () {
      $('#highcharts').highcharts(buzzfeed.highchartsConfig);
    });

  }

  //UI Functions

  /**
   * Simple toggle function, populates buzzfeed.currTab for use in the "load more" button
   * @param the tab that has been toggled into
   */
  buzzfeed.switchTabs = function (inTab) {

    switch (inTab) {
      case "all":
        buzzfeed.currTab = "all"
        buzzfeed.checkLoadButton()
        break;
      case "comments":
        buzzfeed.currTab = "comment"
        buzzfeed.checkLoadButton()
        break;
      case "reactions":
        buzzfeed.currTab = "reaction"
        buzzfeed.checkLoadButton()
        break;
    }
  }

  /**
   * Function for showing the next chunk of pages. Leverages the loadReactionPage method
   */
  buzzfeed.showNextPage = function () {
    var id = '';
    if (buzzfeed.currTab == "comment") {
      id = "Comment"
      buzzfeed.currTextPage++
      buzzfeed.loadCommentPage()
    } else if (buzzfeed.currTab == "all") {
      id = "All"
      buzzfeed.currAllPage++
      buzzfeed.loadAllPage()
    } else {
      id = "Reaction"
      buzzfeed.currReactionPage++
      buzzfeed.loadReactionPage()
    }

  }


  /**
   * Function for showing the next chunk of pages. Uses DISPLAY_NUM to determine how many more to show.
   */
  buzzfeed.checkLoadButton = function () {

    var id = ""
    if (buzzfeed.currTab == "comment") {
      id = "Text"
    } else if (buzzfeed.currTab == "all") {
      id = "All"
    } else {
      id = "Reaction"
    }
    var d = buzzfeed["curr" + id + "Page"]
    var nextPageNum = d + 1
    //theres still more comments to see, still need the button
    if (buzzfeed[buzzfeed.currTab + "PagesObj"][nextPageNum]) {
      $("#nextPageBtn").show()
    }
    //no comments left, can kill the button
    else {
      $("#nextPageBtn").hide()
    }

  }

  //Util Functions

  /**
   * Leverages the moment library to create a human-readable date
   * @param inDate the raw date string to be humanized
   */
  buzzfeed.humanizeDate = function (inDate) {
    return moment(inDate).format('hh:mm A');
  }

  /**
   * Leverages the moment library to figure out the difference from the reaction until
   * current date/time
   * @param inDate the raw date string to tested against
   */
  buzzfeed.dateDiff = function (inDate) {
    var humanDate = moment(inDate)
    var now = moment();
    humanDate = humanDate.fromNow()

    //the fromNow method gets us close to buzzfeed's requirements, but not exactly.
    //use this switch to handle the cases it doesn't
    switch (humanDate) {
      case contains(String(humanDate), "seconds"):
        humanDate = "just now"
        break;
      //minutes ago
      case (contains(String(humanDate), "minute") && contains(String(humanDate), "s")):
        humanDate = morphTimeString(humanDate)
        break;
      //minute ago
      case (contains(String(humanDate), "minute")):
        humanDate = "just now"
        break;
    }

    /**
     * Further formats strings returned from moment's fromNow function into
     * BuzzFeed-specific timestamps
     * @param inStr the time string to be further manipulated
     */
    function morphTimeString(inStr) {
      var retStr;

      //anything less than 15 is called a few
      if (parseInt(inStr) < 15) {
        retStr = "just now"

      } else if (parseInt(inStr) > 15 && parseInt(inStr) < 23) {
        retStr = "about 15 minutes ago"
      }
      //minutes ago
      else {
        retStr = "about a half hour ago"
      }
      return retStr
    }

    return humanDate

  }

  buzzfeed.reactionDirectives = {
    myId: {
      text: function (params) {
        return "User " + this.user_id
      }
    },
    //heres the deal: if a user has multiple entries that means they have had several reactions
    //to the article. this will make their reaction output different than other users that
    //only had one. we will leverage the user object to gleam their entire response, then
    //remove them from the reactionArr. This will prevent against duplicates
    //additionally, we will tag the parts of the string that need to be updated.(using @@@)
    // once they are rendered, will search for our @@@ breadcrumbs, and insert the appropriate html
    userText: {
      text: buzzfeed.parseReactionText
    },
    userTextAll: {
      text: buzzfeed.parseReactionText
    }
  };
  buzzfeed.commentDirectives = {
    user_id: {
      text: function (params) {
        return "User " + this.user_id
      }
    }
  };

  return buzzfeed;
}());

//prototype overrides

/**
 * Further formats strings returned from moment's fromNow function into
 * BuzzFeed-specific timestamps
 * @param inStr the time string to be further manipulated
 */
String.prototype.replaceAt = function (index, character) {
  return this.substr(0, index) + character + this.substr(index + character.length);
}

//util functions

/**
 * Checks if substring exists inside string
 * @param test the string to check
 * @param str the substring to test
 */
function contains(test, str) {
  if (test.indexOf(str) != -1) {
    return test
  } else {
    return false
  }
}
/**
 * Removes non-human readable characters from text, replacing them
 * with the appropriate ascii characters
 * @param inStr the string containing encoded characters
 */
function cleanStrings(inStr) {
  return $('<textarea />').html(inStr).text();
}
/**
 * Used to sort an array of objects.
 * * @param {string} field - The field you wish to sort by
 * * @param {boolean} reverse - sort in ascending/descending order
 * * @param {function} primer - function that tells how to sort
 */
var sort_by = function (field, reverse, primer) {
  var key = function (x) {
    return primer ? primer(x[field]) : x[field]
  };
  return function (a, b) {
    var A = key(a), B = key(b);
    //alert(A + " , " + B)
    return ((A < B) ? -1 :
        (A > B) ? +1 : 0) * [-1, 1][+!!reverse];
  }
};





