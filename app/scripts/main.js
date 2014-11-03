$(document).ready(function () {

  buzzfeed.start()
});

var isDev = true;
//var url = (isDev) ? "http://0.0.0.0:5000" : "http://www.buzzfeed.com/buzzfeed/api/comments?buzz_id=3371338"
var url = "http://www.buzzfeed.com/buzzfeed/api/comments?buzz_id=3371338"

START_ROUTE = "/start"


var buzzfeed = (function () {
  var buzzfeed = {}

  //Constants
  buzzfeed.DISPLAY_NUM = 100
  //this would come in dynamically
  buzzfeed.ARTICLE_NAME = "ARTICLE NAME"

  buzzfeed.commentArr = [
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1410489039",
      "score": "0",
      "f_raw": "2014-09-11 22:30:39",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "16417522",
      "user_id": "1953686"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1410402495",
      "score": "0",
      "f_raw": "2014-09-10 22:28:15",
      "comment_type": "reaction",
      "id": "16373987",
      "user_id": "1953686"
    },
    {
      "blurb": "",
      "width": "605",
      "buzz_id": "3371338",
      "form": "react_image",
      "added": "1406156461",
      "score": "0",
      "height": "605",
      "f_raw": "2014-07-23 19:01:01",
      "comment_type": "contribution",
      "url": "/static/images/public/react_with_gif/default/fail.gif",
      "id": "14253565",
      "user_id": "1752203"
    },
    {
      "badge_title": "Fail",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1406096977",
      "score": "0",
      "f_raw": "2014-07-23 02:29:37",
      "comment_type": "reaction",
      "badge_id": "49",
      "id": "14221334",
      "user_id": "1752203"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1406096918",
      "score": "0",
      "f_raw": "2014-07-23 02:28:38",
      "comment_type": "reaction",
      "id": "14221291",
      "user_id": "1752203"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1406096904",
      "score": "0",
      "f_raw": "2014-07-23 02:28:24",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "14221286",
      "user_id": "1752203"
    },
    {
      "badge_title": "WIN",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404216683",
      "score": "0",
      "f_raw": "2014-07-01 08:11:23",
      "comment_type": "reaction",
      "badge_id": "47",
      "id": "13222246",
      "user_id": "1752203"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404560036",
      "score": "0",
      "f_raw": "2014-07-05 07:33:56",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13409773",
      "user_id": "994309"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404560034",
      "score": "0",
      "f_raw": "2014-07-05 07:33:54",
      "comment_type": "reaction",
      "id": "13409772",
      "user_id": "994309"
    },
    {
      "blurb": "This is a problem that affects different states to a greater degree too, as you can see on this <a href=\"https://www.ezlandlordforms.com/cost-to-rent-a-home/\">map of housing costs by state</a>: someone in Hawaii needs to earn twice the hourly rate of someone in Wyoming to afford a modest two-bedroom property. The burden on low-waged workers and young people starting out just seems completely unsustainable in most places.",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404399055",
      "score": "0",
      "f_raw": "2014-07-03 10:50:55",
      "comment_type": "contribution",
      "id": "13323719",
      "user_id": "1629986"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404331493",
      "score": "0",
      "f_raw": "2014-07-02 16:04:53",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13280323",
      "user_id": "1572343"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404285063",
      "score": "0",
      "f_raw": "2014-07-02 03:11:03",
      "comment_type": "reaction",
      "id": "13261754",
      "user_id": "1315423"
    },
    {
      "blurb": "Rent costs in most cities are completely out of control. My Mom lived in a big city at my age, making 15 bucks an hour full time in an entry level position (in 1983) and paid 400 bucks a month for a one bedroom apartment. In 2014, big city one bedroom apartments are upwards of 1000 normally. What the hell happened?",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404265234",
      "score": "0",
      "f_raw": "2014-07-01 21:40:34",
      "comment_type": "contribution",
      "id": "13250784",
      "user_id": "1206586"
    },
    {
      "buzz_id": "3371338",
      "form": "hates",
      "added": "1404260074",
      "score": "0",
      "f_raw": "2014-07-01 20:14:34",
      "comment_type": "reaction",
      "id": "13247820",
      "user_id": "1284040"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404228698",
      "score": "0",
      "f_raw": "2014-07-01 11:31:38",
      "comment_type": "reaction",
      "id": "13227337",
      "user_id": "548056"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404216691",
      "score": "0",
      "f_raw": "2014-07-01 08:11:31",
      "comment_type": "reaction",
      "id": "13222250",
      "user_id": "848086"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404216687",
      "score": "0",
      "f_raw": "2014-07-01 08:11:27",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13222247",
      "user_id": "848086"
    },
    {
      "badge_title": "WIN",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404216683",
      "score": "0",
      "f_raw": "2014-07-01 08:11:23",
      "comment_type": "reaction",
      "badge_id": "47",
      "id": "13222246",
      "user_id": "848086"
    },
    {
      "buzz_id": "3371338",
      "form": "hates",
      "added": "1404184903",
      "score": "0",
      "f_raw": "2014-06-30 23:21:43",
      "comment_type": "reaction",
      "id": "13211837",
      "user_id": "1619682"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404184565",
      "score": "0",
      "f_raw": "2014-06-30 23:16:05",
      "comment_type": "reaction",
      "id": "13211466",
      "user_id": "580485"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404169558",
      "score": "0",
      "f_raw": "2014-06-30 19:05:58",
      "comment_type": "reaction",
      "id": "13202336",
      "user_id": "975588"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404168313",
      "score": "0",
      "f_raw": "2014-06-30 18:45:13",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13201583",
      "user_id": "1303765"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404168311",
      "score": "0",
      "f_raw": "2014-06-30 18:45:11",
      "comment_type": "reaction",
      "id": "13201581",
      "user_id": "1303765"
    },
    {
      "blurb": "I live and work here in Hollywood....for those of you who are curious....for my studio I pay $1200 a month.....and by no means is this a fancy studio...\n\nFor a fancy 600 Sq Ft studio on Hollywood and Vine.... That is $2200 a month...lol\n\nhurts more to write this then I thought, lol ;)",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404157776",
      "score": "0",
      "f_raw": "2014-06-30 15:49:36",
      "comment_type": "contribution",
      "id": "13192809",
      "user_id": "1075525"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404151664",
      "score": "0",
      "f_raw": "2014-06-30 14:07:44",
      "comment_type": "reaction",
      "id": "13188219",
      "user_id": "1608088"
    },
    {
      "blurb": "All of south Florida is expensive, if you are not making 40,000 plus a year forget about finding a nice apartment in a safe neighborhood. That goes for Palm Beach, Broward and Miami Dade. Plus they are tearing down most of the low income housing (which was built in the 1940&#39;s) and replacing them with half the units, there are no available subsidies here either. There are like 26,000 people on wait lists for affordable housing, and that is crappy ghetto project housing down in Miami.",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404146536",
      "score": "0",
      "f_raw": "2014-06-30 12:42:16",
      "comment_type": "contribution",
      "id": "13184386",
      "user_id": "1103935"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404139560",
      "score": "0",
      "f_raw": "2014-06-30 10:46:00",
      "comment_type": "reaction",
      "id": "13179764",
      "user_id": "1476991"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404138037",
      "score": "0",
      "f_raw": "2014-06-30 10:20:37",
      "comment_type": "reaction",
      "id": "13179204",
      "user_id": "1630238"
    },
    {
      "buzz_id": "3371338",
      "form": "link-traffic",
      "added": "1404131207",
      "score": "0",
      "domain": "flavorwire.com",
      "f_raw": "2014-06-30 08:26:47",
      "comment_type": "audit",
      "id": "13176938",
      "user_id": "51"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404126673",
      "score": "0",
      "f_raw": "2014-06-30 07:11:13",
      "comment_type": "reaction",
      "id": "13175945",
      "user_id": "1599896"
    },
    {
      "buzz_id": "3371338",
      "form": "link-traffic",
      "added": "1404124022",
      "score": "0",
      "domain": "plus.url.google.com",
      "f_raw": "2014-06-30 06:27:02",
      "comment_type": "audit",
      "id": "13175258",
      "user_id": "51"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404123490",
      "score": "0",
      "f_raw": "2014-06-30 06:18:10",
      "comment_type": "reaction",
      "id": "13175176",
      "user_id": "1598804"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404115390",
      "score": "0",
      "f_raw": "2014-06-30 04:03:10",
      "comment_type": "reaction",
      "id": "13172987",
      "user_id": "823922"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404115124",
      "score": "0",
      "f_raw": "2014-06-30 03:58:44",
      "comment_type": "reaction",
      "id": "13172869",
      "user_id": "879006"
    },
    {
      "blurb": "I lived in West Hollywood and drained my savings in less than a year. I miss LA but not the cost of living there.",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404109951",
      "score": "0",
      "f_raw": "2014-06-30 02:32:31",
      "comment_type": "contribution",
      "id": "13170792",
      "user_id": "1118366"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404107343",
      "score": "0",
      "f_raw": "2014-06-30 01:49:03",
      "comment_type": "reaction",
      "id": "13169590",
      "user_id": "1398258"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404105306",
      "score": "0",
      "f_raw": "2014-06-30 01:15:06",
      "comment_type": "reaction",
      "id": "13168161",
      "user_id": "1085469"
    },
    {
      "blurb": "Are they talking about riverside CA? Like where UCR is? In southern California because I thought there were multiple cities called riverside in the US?",
      "love_count": "2",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404105081",
      "children": [
        {
          "buzz_id": "3371338",
          "form": "loves",
          "added": "1406267929",
          "score": "0",
          "parent_id": "13168011",
          "f_raw": "2014-07-25 01:58:49",
          "comment_type": "reaction",
          "id": "14318684",
          "user_id": "1752203"
        },
        {
          "buzz_id": "3371338",
          "form": "hates",
          "added": "1406267970",
          "score": "0",
          "parent_id": "13168011",
          "f_raw": "2014-07-25 01:59:30",
          "comment_type": "reaction",
          "id": "14318697",
          "user_id": "1752203"
        },
        {
          "buzz_id": "3371338",
          "form": "loves",
          "added": "1411527415",
          "score": "0",
          "parent_id": "13168011",
          "f_raw": "2014-09-23 22:56:55",
          "comment_type": "reaction",
          "id": "13329661",
          "user_id": "845106"
        }
      ],
      "hate_count": "1",
      "score": "0",
      "f_raw": "2014-06-30 01:11:21",
      "comment_type": "contribution",
      "id": "13168011",
      "user_id": "1162901"
    },
    {
      "blurb": "30% more ! 30!!!",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404098718",
      "score": "0",
      "f_raw": "2014-06-29 23:25:18",
      "comment_type": "contribution",
      "id": "13164074",
      "user_id": "1683956"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404098645",
      "score": "0",
      "f_raw": "2014-06-29 23:24:05",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13163997",
      "user_id": "1451813"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404098644",
      "score": "0",
      "f_raw": "2014-06-29 23:24:04",
      "comment_type": "reaction",
      "id": "13163995",
      "user_id": "1451813"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404094770",
      "score": "0",
      "f_raw": "2014-06-29 22:19:30",
      "comment_type": "reaction",
      "id": "13161288",
      "user_id": "104860"
    },
    {
      "blurb": "Living just outside of DC in cheap apartments for over $1600. There are cheaper places, but there are quite a few communities that are income based. We make just $2k over the line to be able to get into truly nice $1200 places. On top of $500 student loan payments (also income based), and every day bills. It is ridiculous to get by around here.",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404093022",
      "score": "0",
      "f_raw": "2014-06-29 21:50:22",
      "comment_type": "contribution",
      "id": "13160006",
      "user_id": "308345"
    },
    {
      "badge_title": "Fail",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404091378",
      "score": "0",
      "f_raw": "2014-06-29 21:22:58",
      "comment_type": "reaction",
      "badge_id": "49",
      "id": "13159138",
      "user_id": "963980"
    },
    {
      "badge_title": "LOL",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404090135",
      "score": "0",
      "f_raw": "2014-06-29 21:02:15",
      "comment_type": "reaction",
      "badge_id": "12",
      "id": "13158396",
      "user_id": "1353904"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404089929",
      "score": "0",
      "f_raw": "2014-06-29 20:58:49",
      "comment_type": "reaction",
      "id": "13158275",
      "user_id": "1529542"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404085556",
      "score": "0",
      "f_raw": "2014-06-29 19:45:56",
      "comment_type": "reaction",
      "id": "13156372",
      "user_id": "1619979"
    },
    {
      "buzz_id": "3371338",
      "form": "link-traffic",
      "added": "1404084417",
      "score": "0",
      "domain": "reddit.com",
      "f_raw": "2014-06-29 19:26:57",
      "comment_type": "audit",
      "id": "13155867",
      "user_id": "51"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404083999",
      "score": "0",
      "f_raw": "2014-06-29 19:19:59",
      "comment_type": "reaction",
      "id": "13155627",
      "user_id": "1683007"
    },
    {
      "blurb": "$700,000 I meant",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404079471",
      "score": "0",
      "f_raw": "2014-06-29 18:04:31",
      "comment_type": "contribution",
      "id": "13153976",
      "user_id": "234674"
    },
    {
      "blurb": "San Jose should be on here. We pay $2500 for a 3 bedroom. And these houses go for $700,00 these days. Of course, we&#39;re surrounded by techies who can afford it while the rest of us struggle month to month on a 113,000 a year income. Just ain&#39;t right :/",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404079418",
      "children": [
        {
          "blurb": "As a fellow San Jose resident, I was also surprised we weren&#39;t mentioned! I pay around $1700/mo for a 1br apartment, and that&#39;s considered a GOOD deal here... but I only make half of that income (like $60K), so even a 2br is out of my reach. :(",
          "buzz_id": "3371338",
          "form": "text",
          "added": "1404196794",
          "score": "0",
          "parent_id": "13153948",
          "f_raw": "2014-07-01 02:39:54",
          "comment_type": "contribution",
          "id": "13217982",
          "user_id": "755145"
        }
      ],
      "score": "0",
      "f_raw": "2014-06-29 18:03:38",
      "comment_type": "contribution",
      "id": "13153948",
      "user_id": "234674"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404079411",
      "score": "0",
      "f_raw": "2014-06-29 18:03:31",
      "comment_type": "reaction",
      "id": "13153946",
      "user_id": "1487351"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404076297",
      "score": "0",
      "f_raw": "2014-06-29 17:11:37",
      "comment_type": "reaction",
      "id": "13152451",
      "user_id": "847502"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404074030",
      "score": "0",
      "f_raw": "2014-06-29 16:33:50",
      "comment_type": "reaction",
      "id": "13151167",
      "user_id": "1136161"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404073784",
      "score": "0",
      "f_raw": "2014-06-29 16:29:44",
      "comment_type": "reaction",
      "id": "13151065",
      "user_id": "1164339"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404070445",
      "score": "0",
      "f_raw": "2014-06-29 15:34:05",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13149720",
      "user_id": "1479847"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404070444",
      "score": "0",
      "f_raw": "2014-06-29 15:34:04",
      "comment_type": "reaction",
      "id": "13149719",
      "user_id": "1479847"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404069994",
      "score": "0",
      "f_raw": "2014-06-29 15:26:34",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13149406",
      "user_id": "779704"
    },
    {
      "badge_title": "Amazing",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404069965",
      "score": "0",
      "f_raw": "2014-06-29 17:17:07",
      "comment_type": "reaction",
      "badge_id": "185",
      "id": "13149387",
      "user_id": "1682179"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404068681",
      "score": "0",
      "f_raw": "2014-06-29 15:04:41",
      "comment_type": "reaction",
      "id": "13148854",
      "user_id": "1008241"
    },
    {
      "badge_title": "LOL",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404068567",
      "score": "0",
      "f_raw": "2014-06-29 15:02:47",
      "comment_type": "reaction",
      "badge_id": "12",
      "id": "13148809",
      "user_id": "1607291"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404068498",
      "score": "0",
      "f_raw": "2014-06-29 15:01:38",
      "comment_type": "reaction",
      "id": "13148759",
      "user_id": "1353078"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404068375",
      "score": "0",
      "f_raw": "2014-06-29 14:59:35",
      "comment_type": "reaction",
      "id": "13148702",
      "user_id": "1368288"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404065653",
      "score": "0",
      "f_raw": "2014-06-29 14:14:13",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13147266",
      "user_id": "670110"
    },
    {
      "blurb": "I can guarantee this data isn&#39;t accurate, they didn&#39;t do enough research. They limited their search to only major cities in the US. The region with the highest rent is western North Dakota, in the Bakkan Oil Fields. There are just not enough homes for everyone, so what places do exist charge exorbitant amounts of rent.",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404062847",
      "score": "0",
      "f_raw": "2014-06-29 13:27:27",
      "comment_type": "contribution",
      "id": "13146402",
      "user_id": "1491762"
    },
    {
      "blurb": "I can guarantee this data isn&#39;t accurate",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404062673",
      "score": "0",
      "f_raw": "2014-06-29 13:24:33",
      "comment_type": "contribution",
      "id": "13146345",
      "user_id": "1491762"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404062074",
      "score": "0",
      "f_raw": "2014-06-29 13:14:34",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13146166",
      "user_id": "1373614"
    },
    {
      "buzz_id": "3371338",
      "form": "hates",
      "added": "1404062070",
      "score": "0",
      "f_raw": "2014-06-29 13:14:30",
      "comment_type": "reaction",
      "id": "13146164",
      "user_id": "1373614"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404061518",
      "score": "0",
      "f_raw": "2014-06-29 13:05:18",
      "comment_type": "reaction",
      "id": "13145916",
      "user_id": "1415115"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404059212",
      "score": "0",
      "f_raw": "2014-06-29 12:26:52",
      "comment_type": "reaction",
      "id": "13145068",
      "user_id": "764521"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404058348",
      "score": "0",
      "f_raw": "2014-06-29 12:12:28",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13144862",
      "user_id": "177917"
    },
    {
      "blurb": "It costs 400 kajillion dollars a minute to live in the shoebox hellhole that is Queens, British Colombia, Florida. The rent is too damn high!",
      "width": "605",
      "buzz_id": "3371338",
      "form": "image",
      "added": "1404058332",
      "score": "0",
      "height": "441",
      "f_raw": "2014-06-29 12:12:12",
      "comment_type": "contribution",
      "url": "/static/2014-06/29/12/imagebuzz/webdr06/it-costs-400-kajillion-dollars-a-minute-to-live-i-28655-1404058331-12.jpg",
      "id": "13144859",
      "user_id": "177917"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404058292",
      "score": "0",
      "f_raw": "2014-06-29 12:11:32",
      "comment_type": "reaction",
      "id": "13144847",
      "user_id": "1334169"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404058173",
      "score": "0",
      "f_raw": "2014-06-29 12:09:33",
      "comment_type": "reaction",
      "id": "13144818",
      "user_id": "1062095"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404057914",
      "score": "0",
      "f_raw": "2014-06-29 12:05:14",
      "comment_type": "reaction",
      "id": "13144729",
      "user_id": "330320"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404057445",
      "score": "0",
      "f_raw": "2014-06-29 11:57:25",
      "comment_type": "reaction",
      "id": "13144602",
      "user_id": "1663683"
    },
    {
      "blurb": "I fail to see how or why race is relevant to this...",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404056795",
      "children": [
        {
          "buzz_id": "3371338",
          "form": "hates",
          "added": "1404078241",
          "score": "0",
          "parent_id": "13144412",
          "f_raw": "2014-06-29 17:44:01",
          "comment_type": "reaction",
          "id": "13153517",
          "user_id": "767533"
        },
        {
          "blurb": "You would have to look average number of children each &#39;race&#39; has per household. More kids = less money to spend on housing....AKA higher \"financial burden\"",
          "love_count": "1",
          "buzz_id": "3371338",
          "form": "text",
          "added": "1404304538",
          "score": "0",
          "parent_id": "13144412",
          "f_raw": "2014-07-02 08:35:38",
          "comment_type": "contribution",
          "id": "13266187",
          "user_id": "918324"
        }
      ],
      "hate_count": "1",
      "score": "0",
      "f_raw": "2014-06-29 11:46:35",
      "comment_type": "contribution",
      "id": "13144412",
      "user_id": "684185"
    },
    {
      "buzz_id": "3371338",
      "form": "hates",
      "added": "1404055420",
      "score": "0",
      "f_raw": "2014-06-29 11:23:40",
      "comment_type": "reaction",
      "id": "13144016",
      "user_id": "167327"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404055417",
      "score": "0",
      "f_raw": "2014-06-29 11:23:37",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13144014",
      "user_id": "167327"
    },
    {
      "badge_title": "Yaaass",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404054276",
      "score": "0",
      "f_raw": "2014-06-29 11:04:36",
      "comment_type": "reaction",
      "badge_id": "237",
      "id": "13143720",
      "user_id": "1603964"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404053345",
      "score": "0",
      "f_raw": "2014-06-29 10:49:05",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13143473",
      "user_id": "1432774"
    },
    {
      "blurb": "I just went from a $1200 no utilities Townhouse that was in an okay area in a nicer city in a Suburb of Buffalo NY to a $760 Mortgage in a great country location outside Lockport NY... My point is at the Townhouse I was 10 minutes from work... My new house I am about 25 minutes... So I may have taken a chunk off my housing payment but I am making it up in gas driving.... You could say to move outside the city and commute but whats that going to save you... Especially in LA traffic...",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404052714",
      "score": "0",
      "f_raw": "2014-06-29 10:38:34",
      "comment_type": "contribution",
      "id": "13143348",
      "user_id": "1615631"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404052449",
      "score": "0",
      "f_raw": "2014-06-29 10:34:09",
      "comment_type": "reaction",
      "id": "13143306",
      "user_id": "1403544"
    },
    {
      "badge_title": "Fail",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404052362",
      "score": "0",
      "f_raw": "2014-06-29 10:32:42",
      "comment_type": "reaction",
      "badge_id": "49",
      "id": "13143261",
      "user_id": "1494166"
    },
    {
      "buzz_id": "3371338",
      "form": "hates",
      "added": "1404052362",
      "score": "0",
      "f_raw": "2014-06-29 10:32:42",
      "comment_type": "reaction",
      "id": "13143263",
      "user_id": "1494166"
    },
    {
      "blurb": "I&#39;m from Canada and I think your paying to much rent a try living here in the united William know what paying for to much rent a means",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404051480",
      "children": [
        {
          "buzz_id": "3371338",
          "form": "hates",
          "added": "1404057988",
          "score": "0",
          "parent_id": "13142984",
          "f_raw": "2014-06-29 12:06:28",
          "comment_type": "reaction",
          "id": "13144757",
          "user_id": "1283444"
        },
        {
          "blurb": "I can&#39;t speak for all of Canada, but for much Toronto has to offer, their rent is really reasonable. Compare that to some of the places here in the US and its nothing",
          "buzz_id": "3371338",
          "form": "text",
          "added": "1404081854",
          "score": "0",
          "parent_id": "13142984",
          "f_raw": "2014-06-29 18:44:14",
          "comment_type": "contribution",
          "id": "13154889",
          "user_id": "1020323"
        }
      ],
      "hate_count": "1",
      "score": "0",
      "f_raw": "2014-06-29 10:18:00",
      "comment_type": "contribution",
      "id": "13142984",
      "user_id": "803518"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404051346",
      "score": "0",
      "f_raw": "2014-06-29 10:15:46",
      "comment_type": "reaction",
      "id": "13142965",
      "user_id": "1654635"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404050826",
      "score": "0",
      "f_raw": "2014-06-29 10:07:06",
      "comment_type": "reaction",
      "id": "13142871",
      "user_id": "1496319"
    },
    {
      "badge_title": "Old",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404050029",
      "score": "0",
      "f_raw": "2014-06-29 09:53:49",
      "comment_type": "reaction",
      "badge_id": "19",
      "id": "13142543",
      "user_id": "1633450"
    },
    {
      "badge_title": "Ew",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404050021",
      "score": "0",
      "f_raw": "2014-06-29 09:53:41",
      "comment_type": "reaction",
      "badge_id": "27",
      "id": "13142539",
      "user_id": "1633450"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404050015",
      "score": "0",
      "f_raw": "2014-06-29 09:53:35",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13142533",
      "user_id": "1633450"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404049958",
      "score": "0",
      "f_raw": "2014-06-29 09:52:38",
      "comment_type": "reaction",
      "id": "13142507",
      "user_id": "1681319"
    },
    {
      "badge_title": "Old",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404048790",
      "score": "0",
      "f_raw": "2014-06-29 09:33:10",
      "comment_type": "reaction",
      "badge_id": "19",
      "id": "13142195",
      "user_id": "816214"
    },
    {
      "buzz_id": "3371338",
      "form": "hates",
      "added": "1404048787",
      "score": "0",
      "f_raw": "2014-06-29 09:33:07",
      "comment_type": "reaction",
      "id": "13142194",
      "user_id": "816214"
    },
    {
      "blurb": "Come to Minneapolis! I live in a 1300 sq. ft. 2 bed/2 bath apartment 15 minutes from downtown and it&#39;s only $925/mo!",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404047053",
      "children": [
        {
          "buzz_id": "3371338",
          "form": "hates",
          "added": "1404057993",
          "score": "0",
          "parent_id": "13141585",
          "f_raw": "2014-06-29 12:06:33",
          "comment_type": "reaction",
          "id": "13144758",
          "user_id": "1283444"
        },
        {
          "blurb": "And frigidly cold for like half of the year... :-P\n\nI&#39;ve always wanted to visit Minneapolis, but as a (nearly native) Californian I&#39;d probably die after a few days of your winter.",
          "love_count": "1",
          "buzz_id": "3371338",
          "form": "text",
          "added": "1404197105",
          "score": "0",
          "parent_id": "13141585",
          "f_raw": "2014-07-01 02:45:05",
          "comment_type": "contribution",
          "id": "13218073",
          "user_id": "755145"
        }
      ],
      "hate_count": "1",
      "score": "0",
      "f_raw": "2014-06-29 09:04:13",
      "comment_type": "contribution",
      "id": "13141585",
      "user_id": "1067030"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404044551",
      "score": "0",
      "f_raw": "2014-06-29 08:22:31",
      "comment_type": "reaction",
      "id": "13141093",
      "user_id": "1681136"
    },
    {
      "badge_title": "Fail",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404044212",
      "score": "0",
      "f_raw": "2014-06-29 08:16:52",
      "comment_type": "reaction",
      "badge_id": "49",
      "id": "13141003",
      "user_id": "1305449"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404043325",
      "score": "0",
      "f_raw": "2014-06-29 08:02:05",
      "comment_type": "reaction",
      "id": "13140753",
      "user_id": "866724"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404042837",
      "score": "0",
      "f_raw": "2014-06-29 07:53:57",
      "comment_type": "reaction",
      "id": "13140688",
      "user_id": "942773"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404042836",
      "score": "0",
      "f_raw": "2014-06-29 07:53:56",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13140687",
      "user_id": "942773"
    },
    {
      "badge_title": "Fail",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404042308",
      "score": "0",
      "f_raw": "2014-06-29 07:45:08",
      "comment_type": "reaction",
      "badge_id": "49",
      "id": "13140611",
      "user_id": "1104722"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404038632",
      "score": "0",
      "f_raw": "2014-06-29 06:43:52",
      "comment_type": "reaction",
      "id": "13140022",
      "user_id": "940657"
    },
    {
      "blurb": "If you did an international version of this you would be shocked how much we pay for rent in cities like Singapore, Hong Kong and Tokyo. It&#39;s shocking.",
      "love_count": "1",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404038093",
      "children": [
        {
          "buzz_id": "3371338",
          "form": "loves",
          "added": "1404059606",
          "score": "0",
          "parent_id": "13139952",
          "f_raw": "2014-06-29 12:33:26",
          "comment_type": "reaction",
          "id": "13145282",
          "user_id": "1627270"
        }
      ],
      "score": "0",
      "f_raw": "2014-06-29 06:34:53",
      "comment_type": "contribution",
      "id": "13139952",
      "user_id": "844297"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404037953",
      "score": "0",
      "f_raw": "2014-06-29 06:32:33",
      "comment_type": "reaction",
      "id": "13139930",
      "user_id": "264645"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404034992",
      "score": "0",
      "f_raw": "2014-06-29 05:43:13",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13139566",
      "user_id": "1254547"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404034451",
      "score": "0",
      "f_raw": "2014-06-29 05:34:11",
      "comment_type": "reaction",
      "id": "13139498",
      "user_id": "685818"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404034294",
      "score": "0",
      "f_raw": "2014-06-29 05:31:34",
      "comment_type": "reaction",
      "id": "13139469",
      "user_id": "1680935"
    },
    {
      "blurb": "I live in West LA, and the rent literally goes up by $100 every year.",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404029175",
      "score": "0",
      "f_raw": "2014-06-29 04:06:15",
      "comment_type": "contribution",
      "id": "13138402",
      "user_id": "348293"
    },
    {
      "buzz_id": "3371338",
      "form": "hates",
      "added": "1404027427",
      "score": "0",
      "f_raw": "2014-06-29 03:37:07",
      "comment_type": "reaction",
      "id": "13137870",
      "user_id": "1664046"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404027419",
      "score": "0",
      "f_raw": "2014-06-29 03:36:59",
      "comment_type": "reaction",
      "id": "13137866",
      "user_id": "1664046"
    },
    {
      "buzz_id": "3371338",
      "form": "link-traffic",
      "added": "1404026811",
      "score": "0",
      "domain": "pinterest.com",
      "f_raw": "2014-06-29 03:26:51",
      "comment_type": "audit",
      "id": "13137571",
      "user_id": "51"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404026655",
      "score": "0",
      "f_raw": "2014-06-29 03:24:15",
      "comment_type": "reaction",
      "id": "13137519",
      "user_id": "1680699"
    },
    {
      "buzz_id": "3371338",
      "form": "hates",
      "added": "1404025761",
      "score": "0",
      "f_raw": "2014-06-29 03:09:21",
      "comment_type": "reaction",
      "id": "13137294",
      "user_id": "1478974"
    },
    {
      "blurb": "Wow",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404025164",
      "score": "0",
      "f_raw": "2014-06-29 02:59:24",
      "comment_type": "contribution",
      "id": "13137174",
      "user_id": "1611784"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404024469",
      "score": "0",
      "f_raw": "2014-06-29 02:47:49",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13136991",
      "user_id": "939935"
    },
    {
      "blurb": "Rent is San Jose, CA is so awesome that our tiny two bedroom apartment is $1695 a month, and it&#39;s right on a busy street in a so so neighborhood. If you&#39;re not in high tech, you can&#39;t buy a home here.",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404024117",
      "children": [
        {
          "blurb": "Hey, that&#39;s a good deal! I pay right around $1700/mo for my 1br in south San Jose - and I&#39;m literally looking at the freeway from my balcony. But hey, we get what we pay for here. I guess.",
          "buzz_id": "3371338",
          "form": "text",
          "added": "1404197276",
          "score": "0",
          "parent_id": "13136930",
          "f_raw": "2014-07-01 02:47:56",
          "comment_type": "contribution",
          "id": "13218129",
          "user_id": "755145"
        }
      ],
      "score": "0",
      "f_raw": "2014-06-29 02:41:56",
      "comment_type": "contribution",
      "id": "13136930",
      "user_id": "1680673"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404023727",
      "score": "0",
      "f_raw": "2014-06-29 02:35:27",
      "comment_type": "reaction",
      "id": "13136829",
      "user_id": "1110633"
    },
    {
      "badge_title": "Ew",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404023523",
      "score": "0",
      "f_raw": "2014-06-29 02:32:03",
      "comment_type": "reaction",
      "badge_id": "27",
      "id": "13136722",
      "user_id": "1359801"
    },
    {
      "badge_title": "Bold",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404023517",
      "score": "0",
      "f_raw": "2014-06-29 02:31:57",
      "comment_type": "reaction",
      "badge_id": "55",
      "id": "13136716",
      "user_id": "1033756"
    },
    {
      "buzz_id": "3371338",
      "form": "link-traffic",
      "added": "1404023214",
      "score": "0",
      "domain": "twitter.com",
      "f_raw": "2014-06-29 02:26:54",
      "comment_type": "audit",
      "id": "13136582",
      "user_id": "51"
    },
    {
      "badge_title": "WIN",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404022581",
      "score": "0",
      "f_raw": "2014-06-29 02:16:21",
      "comment_type": "reaction",
      "badge_id": "47",
      "id": "13136311",
      "user_id": "1680611"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404021020",
      "score": "0",
      "f_raw": "2014-06-29 01:50:20",
      "comment_type": "reaction",
      "id": "13135616",
      "user_id": "987154"
    },
    {
      "blurb": "I really think there should be local regulations on how much an owner can charge for rent. I live in a suburb near LA and while the rent is lower, the cost of living is still the same (gas, lights, auto gas, food, etc) and the amount that I earn for for a job here is way less than in LA. I earn about $30,000 a year but pay at least half of that in housing. I could earn twice as much money if I worked in LA doing the same job, but then housing would increase and I would be in the same rut. It&#39;s ridiculous. You can&#39;t save money if you wanted to.",
      "love_count": "2",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404021000",
      "children": [
        {
          "buzz_id": "3371338",
          "form": "loves",
          "added": "1404023544",
          "score": "0",
          "parent_id": "13135614",
          "f_raw": "2014-06-29 02:32:24",
          "comment_type": "reaction",
          "id": "13136734",
          "user_id": "1033756"
        },
        {
          "buzz_id": "3371338",
          "form": "loves",
          "added": "1404265257",
          "score": "0",
          "parent_id": "13135614",
          "f_raw": "2014-07-01 21:40:57",
          "comment_type": "reaction",
          "id": "13250794",
          "user_id": "1206586"
        }
      ],
      "score": "0",
      "f_raw": "2014-06-29 01:50:00",
      "comment_type": "contribution",
      "id": "13135614",
      "user_id": "1469351"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404019873",
      "score": "0",
      "f_raw": "2014-06-29 01:31:13",
      "comment_type": "reaction",
      "id": "13135347",
      "user_id": "1018757"
    },
    {
      "blurb": "How did Honolulu not make this list? If you are looking for extremely ridiculous rent costs, look no further.",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404019516",
      "score": "0",
      "f_raw": "2014-06-29 01:25:16",
      "comment_type": "contribution",
      "id": "13135211",
      "user_id": "1351418"
    },
    {
      "blurb": "It&#39;s because properties are full and vacant apartments are extremely hard to come by.",
      "love_count": "2",
      "buzz_id": "3371338",
      "form": "text",
      "added": "1404019354",
      "children": [
        {
          "buzz_id": "3371338",
          "form": "loves",
          "added": "1404020207",
          "score": "0",
          "parent_id": "13135144",
          "f_raw": "2014-06-29 01:36:47",
          "comment_type": "reaction",
          "id": "13135428",
          "user_id": "1295643"
        },
        {
          "buzz_id": "3371338",
          "form": "loves",
          "added": "1404059636",
          "score": "0",
          "parent_id": "13135144",
          "f_raw": "2014-06-29 12:33:56",
          "comment_type": "reaction",
          "id": "13145295",
          "user_id": "1627270"
        }
      ],
      "score": "0",
      "f_raw": "2014-06-29 01:22:34",
      "comment_type": "contribution",
      "id": "13135144",
      "user_id": "1295643"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404019292",
      "score": "0",
      "f_raw": "2014-06-29 01:21:32",
      "comment_type": "reaction",
      "id": "13135123",
      "user_id": "1635641"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404019107",
      "score": "0",
      "f_raw": "2014-06-29 01:18:27",
      "comment_type": "reaction",
      "id": "13135023",
      "user_id": "379557"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404018914",
      "score": "0",
      "f_raw": "2014-06-29 01:15:14",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13134911",
      "user_id": "776667"
    },
    {
      "badge_title": "Fail",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404018904",
      "score": "0",
      "f_raw": "2014-06-29 01:15:04",
      "comment_type": "reaction",
      "badge_id": "49",
      "id": "13134909",
      "user_id": "776667"
    },
    {
      "buzz_id": "3371338",
      "form": "hates",
      "added": "1404018899",
      "score": "0",
      "f_raw": "2014-06-29 01:14:59",
      "comment_type": "reaction",
      "id": "13134907",
      "user_id": "776667"
    },
    {
      "buzz_id": "3371338",
      "form": "loves",
      "added": "1404018258",
      "score": "0",
      "f_raw": "2014-06-29 01:04:18",
      "comment_type": "reaction",
      "id": "13134670",
      "user_id": "1396624"
    },
    {
      "badge_title": "OMG",
      "buzz_id": "3371338",
      "form": "badge_vote",
      "added": "1404018012",
      "score": "0",
      "f_raw": "2014-06-29 01:00:12",
      "comment_type": "reaction",
      "badge_id": "14",
      "id": "13134575",
      "user_id": "1010058"
    }
  ]
  buzzfeed.commentCount = 132
  buzzfeed.textComments = []
  buzzfeed.reactions = []
  buzzfeed.reactionTallies = {}
  buzzfeed.bots = []
  buzzfeed.gifReactions = []
  buzzfeed.imageReactions = []
  buzzfeed.users = {}
  buzzfeed.innerCommentStr = "<div class='userInfo' ><img class='userImg' src='img/user.jpg'><div class='userId' id='user_id'></div><div class='timestamp' id='dateDiff'></div></div><div class='blurb' id='blurb'></div>"
  buzzfeed.innerCommentStrAll = "<div class='userInfo' ><img class='userImg' src='img/user.jpg'><div class='userId' ></div><div class='timestamp'></div></div><div class='blurb'></div>"
  buzzfeed.innerReactionStr = "<div class='reaction' >  <div class='myId'></div>  <div class='userText'></div>  <div class='dateDiff'></div></div></div><div class='blurb' id='blurb'></div>"

  function init() {
    start();
  }

  buzzfeed.start = function () {

    //$.ajax( {
    //  url: url,
    //  type: "GET"
    //} )
    //  .done(function(data) {
    //    buzzfeed.commentObj = data.comments
    //buzzfeed.commentCount = data.count
    //  })
    //  .fail(function() {
    //    alert( "error" );
    //  })
    //  .always(function() {
    //    //alert( "complete" );
    //  });
    this.separateCommentTypes();


  }

  buzzfeed.separateCommentTypes = function () {

    //separate comments into two main types for this exercise: text comments and reactions
    _.each(buzzfeed.commentArr, function (e, i, l) {
      //make human date for later consumption
      e.humanDate = buzzfeed.humanizeDate(e.f_raw)
      e.dateDiff = buzzfeed.dateDiff(e.f_raw)

      //nice and easy, lets take the text comments out of the equation
      if (e.form == "text") {
        e.blurb = cleanStrings(e.blurb)
        buzzfeed.textComments.push(e)
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


        //need to check if user had more than one reaction to post, will be used later to populate
        //their reactions output accordingly.
        if (!buzzfeed.users[e.user_id]) {
          buzzfeed.users[e.user_id] = []
          buzzfeed.users[e.user_id].push(e)
          //only add to the reaction array the first time, will use the users object as reference later
          buzzfeed.reactions.push(e)
        } else {
          buzzfeed.users[e.user_id].push(e)


        }



        if (!e.badge_title) {
        }
        //we have badges, add them up
        else if (!buzzfeed.reactionTallies[e.badge_title]) {
          buzzfeed.reactionTallies[e.badge_title] = 1
        } else {
          buzzfeed.reactionTallies[e.badge_title]++
        }
      }

    });
    buzzfeed.populateTabs();

  }

  buzzfeed.populateTabs = function (inTab) {


    //mixed bag for the all tab, so we need to iterate to figure out which kind of comment we're dealing with, then handle it appropraitely
    //_.each(buzzfeed.commentArr, function (e, i, l) {
    //  if (e.comment_type == "badge_vote") {
    //
    //  } else if (e.form == "text"){
    //
    //    //add the comment HTML to the page, will need to operate on it either way.
    //    var output = document.getElementById("all");
    //    console.log(output)
    //    var commentStr = "<div class='comment' id='commentAll' ></div>"
    //    output.innerHTML =   output.innerHTML + commentStr
    //    $('#commentAll').attr('id','commentAll'+i);
    //    var output2 = document.getElementById("commentAll"+i);
    //    output2.innerHTML =   output2.innerHTML + buzzfeed.innerCommentStr;
    //    $('#commentAll'+i).render(e);
    //
    //  }
    //  else {
    //    //can ignore all these other types
    //  }
    //
    //
    //})

    var reactionInd=0;
    var reactionDirectives = {
      myId: {
        text: function(params) {
          return "User " +this.user_id
        }
      },
      //heres the deal: if a user has multiple entries that means they have had several reactions
      //to the article. this will make their reaction output different than other users that
      //only had one. we will leverage the user object to gleam their entire response, then
      //remove them from the reactionArr. This will prevent against duplicates
      //additionally, we will tag the parts of the string that need to be updated.(using @@@)
      // once they are rendered, will search for our @@@ breadcrumbs, and insert the appropriate html
      userText: {
        text: function(params) {
          var retStr="";

          //console.log("WORKING ON " + this.user_id)

          //a user has reacted more than once
          if (buzzfeed.users[this.user_id].length > 1) {
            var likeCount=0;
            var reactionArr=[];
            var i=0;
            var likeIndArr = []
            var userId = this.user_id


            //check if one of the reactions is a loves or hates type
            $.grep(buzzfeed.users[this.user_id], function(e){
              var retVal = ((e.form == "hates" )||( e.form == "loves") )
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
              reactionArr[i] = "@@@"+e
            });
            var reactionStr = String(reactionArr)
            console.log(reactionStr)
            reactionStr = reactionStr.replace(/,/g , " , ");

            //add ampersands for multiple reactions
            if (reactionArr.length > 1) {
              var lastInd = reactionStr.lastIndexOf(",")
              reactionStr = reactionStr.replaceAt(lastInd, "&");
            }


            //Starting here, we're figuring out what type of string to return

            //loved and hated the article
            if(likeCount ==2){
              //1664046
              //just love and hate, no badge
              if (reactionArr.length == 0) {
                retStr = "@@@"+buzzfeed.users[this.user_id][likeIndArr[0]].form +" & " + "@@@"+buzzfeed.users[this.user_id][likeIndArr[1]].form +" "+ buzzfeed.ARTICLE_NAME
              }
              //they have loved,hated, and badgevoted this article (overachievers)
              else {
                for (var j = 0; j < likeIndArr.length; j++) {
                  retStr += "@@@"+buzzfeed.users[this.user_id][likeIndArr[j]].form ;
                  var amp = (j == likeIndArr.length-2) ? " & " : ""
                  retStr+=amp
                }
                retStr += " and thinks it's "+ reactionStr
              }
            }
            //liked and reacted
            else if (likeCount ==1 && reactionArr.length != 0){
              retStr = "@@@"+buzzfeed.users[this.user_id][likeIndArr[0]].form +" "+ buzzfeed.ARTICLE_NAME + " and thinks it's "+ reactionStr
            }
            //they just reacted to the article without liking
            else {
              retStr = "thinks " + buzzfeed.ARTICLE_NAME + " is " + reactionStr
            }
          }
          //only reacted once, find out what type it is
          else {
            if (buzzfeed.users[this.user_id][0].form == "badge_vote") {
              retStr = "thinks " + buzzfeed.ARTICLE_NAME + " is @@@" +buzzfeed.users[this.user_id][0].badge_title

            }
            //they have only liked it
            else {
              retStr = "@@@"+buzzfeed.users[this.user_id][0].form +" " + buzzfeed.ARTICLE_NAME
            }
          }
          reactionInd++;
          return retStr
        }
      }
    };

    $('#reactions').render(buzzfeed.reactions, reactionDirectives);


    var reactionNodes = document.getElementsByClassName("userText");
    buzzfeed.styleRefObj = {
      "@@@loves" : "<img class='loves' src='img/love_small.png'>",
      "@@@hates" : "<img class='hates' src='img/hate_small.png'>",
      "@@@lol" : "<span class='badges'>LOL</span>",
      "@@@win" : "<span class='badges'>win</span>",
      "@@@fail" : "<span class='badges'>fail</span>",
      "@@@omg" : "<span class='badges'>omg</span>",
      "@@@cute" : "<span class='badges'>cute</span>",
      "@@@wtf" : "<span class='badges'>wtf</span>",
      "@@@trashy" : "<span class='badges'>trashy</span>",
      "@@@yaas" : "<span class='badges'>yaas</span>",
      "@@@ew" : "<span class='badges'>ew</span>",
      "@@@old" : "<span class='badges'>old</span>",
      "@@@amazing" : "<span class='badges'>amazing</span>"
    }
    _.each(reactionNodes, function (e, i, l) {
      e.setAttribute("id", "userText"+i);
      var currHTML = $('#userText'+i).html()
      var wordArr = currHTML.split(" ")
      var matchingIndexes = []
      var currInd = 0;
      var matchingWords = $.grep(wordArr, function(e) {
        var retVal = (e.indexOf("@@@") != -1)
        var d = (retVal) ? matchingIndexes.push(currInd) : $.noop()
        currInd++;
        return retVal
      });

      //replace the words with their corresponding html
      _.each(matchingWords, function (e2, i2, l2) {
        wordArr[matchingIndexes[i2]] = buzzfeed.styleRefObj[e2.toLowerCase()]
      })
      var updatedHTML = wordArr.join(" ");
      $('#userText'+i).html(updatedHTML)

    })

    spawnComments(false);

  }

  function spawnComments(onAllTab){

    var currArr = []
    var currContainer = ""
    var currType = ""

    if (onAllTab) {

    } else {

      currArr = buzzfeed.textComments
      currContainer = "comments"
      currType = "comment"

    }

    //since some of the blurbs have links, we can't take advantage of transparency's beautiful one-line render.
    //Instead, interate through comments and render by hand if a link is included. =(
    var subCommentCount=0;
    _.each(buzzfeed.textComments, function (e, i, l) {

      //add the comment HTML to the page, will need to operate on it either way.
      var output = document.getElementById("comments");
      var commentStr = "<div class='comment' id='comment' ></div>"
      output.innerHTML =   output.innerHTML + commentStr
      $('#comment').attr('id','comment'+i);
      var output2 = document.getElementById("comment"+i);
      output2.innerHTML =   output2.innerHTML + buzzfeed.innerCommentStr;

      //link in blurb string, lets do it the hard way
      if (e.blurb.indexOf("<a href=") != -1) {
        buzzfeed.addLink(e)
      }
      //beautiful one line render
      else {
        $('#comment'+i).render(e);
      }

      //we have sub-comments to display, add the html and render them
      if (e.children) {
        _.each(e.children, function (e2, i2, l2) {
          //since this is for the comments-only view, we want to check that the element is a comment
          if (e2.form == "text") {
            var commentStr = "<div class='subComment' id='subComment' ></div>"
            output.innerHTML =   output.innerHTML + commentStr
            $('#subComment').attr('id','subComment'+subCommentCount);
            var output2 = document.getElementById("subComment"+subCommentCount);
            output2.innerHTML =   output2.innerHTML + buzzfeed.innerCommentStr;
            e2.blurb = cleanStrings(e2.blurb)
            e2.humanDate = buzzfeed.humanizeDate(e2.f_raw)
            e2.dateDiff = buzzfeed.dateDiff(e2.f_raw)

            $('#subComment'+subCommentCount).render(e2);
            subCommentCount++

          } else {

          }
        })
      }

    });

  }

  buzzfeed.switchTabs = function (inTab) {

    console.log("switching tabs to " + inTab)

    switch (inTab) {
      case "all":

        break;
      case "comments":

        break;
      case "reactions":

        break;
      default :
        console.log("switchingError")
    }
  }
  buzzfeed.addLink = function (e) {
    var str = e.blurb
    var tagStart = str.search(/<[a-z][\s\S]*>/i);
    var tagEnd = str.search(">");
    var tag = str.slice(tagStart, tagEnd + 1);
    var linkStart = tag.indexOf('"')
    var linkEnd = tag.indexOf('"',linkStart+1)
    var url = tag.slice(linkStart, linkEnd + 1);
    var preURLStr = str.slice(0, tagStart-1)
    var wordArr =preURLStr.split(' ')
    var urlWord = wordArr[wordArr.length-1]
    var startStr = preURLStr.replace(urlWord, "");
    var endStr = str.slice(tagEnd+1)
    $( "#blurb" ).append(startStr)
    var re = new RegExp('"', 'g');
    url = url.replace(re, "");
    //console.log(url)
    var a = $('<a />');
    a.attr('href',url);
    a.text(urlWord);
    $('#blurb').append(a);
    $( "#blurb" ).append(" "+endStr)

    $('#user_id').append(e.user_id);
    $('#dateDiff').append(e.dateDiff);



  }

  buzzfeed.humanizeDate = function (inDate) {
    return moment(inDate).format('hh:mm A');
  }
  buzzfeed.dateDiff = function (inDate) {
    var humanDate = moment(inDate)
    var now = moment();
    var diff = (now.diff(humanDate, 'days'))
    humanDate = (diff < 1) ? "Today" : diff + " days ago"
    return humanDate
  }

  return buzzfeed;
}());


//prototype overrides
String.prototype.endsWith = function (suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.replaceAt=function(index, character) {
  return this.substr(0, index) + character + this.substr(index+character.length);
}

Array.prototype.unique = function () {
  var a = this.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j])
        a.splice(j--, 1);
    }
  }

  return a;
};


//util functions
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
function contains(test, str) {
  if (test.indexOf(str) != -1) {
    return test
  } else {
    return false
  }

}
function cleanStrings(inStr) {
  return $('<textarea />').html(inStr).text();
}




