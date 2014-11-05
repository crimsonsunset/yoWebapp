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
  buzzfeed.DISPLAY_NUM = 100
  //this would come in dynamically
  buzzfeed.ARTICLE_NAME = "Here Are The Cities Where The Rent Really Is Too Damn High"

  //main datastores for this class
  buzzfeed.commentArr = []
  buzzfeed.styleRefObj = {
    "@@@loves": "<img class='loves' src='img/love_small.png'>",
    "@@@hates": "<img class='hates' src='img/hate_small.png'>",
    "@@@lol": "<span class='badges'>LOL</span>",
    "@@@win": "<span class='badges'>win</span>",
    "@@@fail": "<span class='badges'>fail</span>",
    "@@@omg": "<span class='badges'>omg</span>",
    "@@@cute": "<span class='badges'>cute</span>",
    "@@@wtf": "<span class='badges'>wtf</span>",
    "@@@trashy": "<span class='badges'>trashy</span>",
    "@@@yaas": "<span class='badges'>yaas</span>",
    "@@@Yaaass": "<span class='badges'>Yaaass</span>",
    "@@@ew": "<span class='badges'>ew</span>",
    "@@@old": "<span class='badges'>old</span>",
    "@@@bold": "<span class='badges'>bold</span>",
    "@@@amazing": "<span class='badges'>amazing</span>"
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
  buzzfeed.innerCommentStrAll = "<div class='userInfo' ><img class='userImg' src='img/user.jpg'><div class='user_id' id='user_idAll'></div><div class='dateDiffComment' id='dateDiffComment'></div></div><div class='blurb' id='blurbAll'></div>"
  buzzfeed.innerReactionStr = "<div class='reaction' >  <div class='myId'></div>  <div class='userText'></div>  <div class='dateDiff'></div></div>"
  buzzfeed.innerReactionStrAll = "<div class='reactionAll' >  <div class='myId'></div>  <div class='userTextAll'></div>  <div class='dateDiff'></div></div>"

  //arrays to store the items in the pages that overflow
  buzzfeed.allPages = []
  buzzfeed.commentPages = []
  buzzfeed.reactionPages = []

  //objects that will store pages at a time
  buzzfeed.allPagesObj = {}
  buzzfeed.commentPagesObj = {}
  buzzfeed.reactionPagesObj = {}

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
          fontSize: '11px',
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
        console.log("success")
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


    buzzfeed.textTally = 0
    buzzfeed.reactionTally = 0
    buzzfeed.allTally = 0

    buzzfeed.currTextPage = 0
    buzzfeed.currReactionPage = 0
    buzzfeed.currAllPage = 0

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

    function addToAllPages(e){

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

    //now that the datastores are populated, can use this data to render the tabs and the highchart
    buzzfeed.populateTabs();
    //buzzfeed.spawnHighchart();


  }

  /**
   * Main rendering function, separated into three main chunks for the corresponding tabs
   */
  buzzfeed.populateTabs = function () {

    //ALL TAB

    //mixed bag for the all tab, so we need to iterate to figure out
    // which kind of comment we're dealing with, then handle it appropriately
    buzzfeed.allCommentCount = 0;
    subCommentCount = 0;
    buzzfeed.onAllTab = true;
    buzzfeed.renderedUsers = {}

    //iterate through all the response objects, spawning and rendering as need be
    //_.each(buzzfeed.commentArr, function (e, i, l) {
    //  var currCommentId = ""
    //
    //  if (e.form == "badge_vote" || e.form == "loves" || e.form == "hates") {
    //
    //    //already rendered this users info, skip over them
    //    if (buzzfeed.renderedUsers[e.user_id]) {
    //
    //    }
    //    //they're new to the party, put their info on the page
    //    else {
    //      buzzfeed.allCommentCount++;
    //      buzzfeed.renderedUsers[e.user_id] = true;
    //      var output = document.getElementById("all");
    //      var reactionStr = "<div class='reactionAll' id='reactionAll' ></div>"
    //      output.innerHTML = output.innerHTML + reactionStr
    //      $('#reactionAll').attr('id', "reactionAll" + i);
    //      var output2 = document.getElementById("reactionAll" + i);
    //      output2.innerHTML = output2.innerHTML + buzzfeed.innerReactionStrAll;
    //      reactionIndAll = 0
    //      currCommentId = 'reactionAll' + i
    //      $('#reactionAll' + i).render(e, reactionDirectives);
    //    }
    //
    //  } else if (e.form == "text") {
    //    buzzfeed.allCommentCount++;
    //    _.each([e], buzzfeed.spawnComment, this);
    //    currCommentId = "commentAll" + buzzfeed.allCommentCount
    //  }
    //  else {
    //    //can ignore all these other types
    //  }
    //
    //  //have reached our page limit, hide these until user clicks button
    //  if (buzzfeed.allCommentCount > buzzfeed.DISPLAY_NUM && currCommentId != "") {
    //    $("#" + currCommentId).hide()
    //    buzzfeed.allPages.push(currCommentId)
    //  } else {
    //  }
    //
    //})
    //buzzfeed.stylizeReactionText();


    //done with all tab, now flip our operational boolean
    buzzfeed.onAllTab = false;

    //REACTION TAB

    var reactionDirectives = {
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

    reactionInd = 0;
    $('#reactions').render(buzzfeed.reactionPagesObj[0], reactionDirectives);
    //once the reactions are rendered with plain text using transparency.js, we need to
    //replace the specially tagged strings with the corresponding html classes
    buzzfeed.stylizeReactionText();

    //COMMENTS TAB

    //since some of the blurbs have links, we can't take advantage of transparency's beautiful one-line render.
    //Instead, iterate through comments and render by hand if a link is included. =(
    subCommentCount = 0;
    _.each(buzzfeed.textComments, buzzfeed.spawnComment, this);

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
        retStr = "thinks " + buzzfeed.ARTICLE_NAME + " is @@@" + buzzfeed.users[this.user_id][0].badge_title
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
        wordArr[matchingIndexes[i2]] = buzzfeed.styleRefObj[e2.toLowerCase()]
      })
      var updatedHTML = wordArr.join(" ");
      updatedHTML = updatedHTML.replace(buzzfeed.ARTICLE_NAME, titleSpan);
      $('#' + currText + i).html(updatedHTML)


      //paging support
      if (!buzzfeed.onAllTab && i > buzzfeed.DISPLAY_NUM) {
        $("#" + currReaction + i).hide()
        buzzfeed.reactionPages.push(currReaction + i)
      } else {
      }

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

    //using this method for the all tab and the comments tab, need to set
    //the identifier strings accordingly
    if (buzzfeed.onAllTab) {
      currContainer = "all"
      currType = "commentAll"
      subCommentType = "subCommentAll"
      innerCommentStr = buzzfeed.innerCommentStrAll
      i = buzzfeed.allCommentCount;

    } else {
      currContainer = "comments"
      currType = "comment"
      subCommentType = "subComment"
      innerCommentStr = buzzfeed.innerCommentStr
    }

    //add the comment HTML to the page, will need to operate on it either way.
    var output = document.getElementById(currContainer);
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
      $('#' + currType + i).render(e);
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

    //paging support
    if (!buzzfeed.onAllTab && i > buzzfeed.DISPLAY_NUM) {
      $("#" + currType + i).hide()
      buzzfeed.commentPages.push(currType + i)
    } else {
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

    $('#' + userId).append(e.user_id);
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
        break;
      case "comments":
        buzzfeed.currTab = "comment"
        break;
      case "reactions":
        buzzfeed.currTab = "reaction"
        break;
    }
    if (buzzfeed[buzzfeed.currTab + "Pages"].length > 0) {
      $("#nextPageBtn").show()

    } else {
      $("#nextPageBtn").hide()

    }
  }

  /**
   * Function for showing the next chunk of pages. Uses DISPLAY_NUM to determine how many more to show.
   */
  buzzfeed.showNextPage = function () {

    //show the next chunk of comments
    for (var i = 0; i < buzzfeed.DISPLAY_NUM; i++) {
      if (buzzfeed[buzzfeed.currTab + "Pages"][i]) {
        //console.log("showing " + buzzfeed[buzzfeed.currTab+"Pages"][i])
        $("#" + buzzfeed[buzzfeed.currTab + "Pages"][i]).show()
        buzzfeed[buzzfeed.currTab + "Pages"].shift()
        i--
      } else {
        break
      }
    }
    //theres still more comments to see, still need the button
    if (buzzfeed[buzzfeed.currTab + "Pages"].length > 0) {
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





