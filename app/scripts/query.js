var pushToProd = true; //true = Production Evironment // false = DEV Environment
var hideSearch = false;
var fuzzySearch = true;


//AvenirLTStd-Black
//AvenirLTStd-BlackOblique
//AvenirLTStd-Book
//AvenirLTStd-BookOblique
//AvenirLTStd-Medium
//AvenirLTStd-MediumOblique
//AkzidenzGroteskPro-Md
//AkzidenzGroteskPro-Regular
//FreightTextProBook-Regular
//FreightTextProBook-Italic

var global = {
    activityRemarksTable: {},
    remarksTable: {},
    remarkCatTable: {},
    participantGroupsTable: {},
    activitiesTable: {},
    biosTable: {},
    tripsTable: {}
};

//allTripsPage
var tripIndex;
var tripParticipants = {};
var currActivities = {};

var sortingPost = [];
var emptyOverlayArray = [];

//activityDetail
var activityParticipants = {};
var activityParticipants2 = {};
var activityId = null;
var activityRemarks = {};
var activityRemarks2 = [];
var fakeIndex = 'a';
var fakeIndexArr = [];

//vars to prevent multiple favorite toggles
var lastToggledBio = '';
var lastToggledSuccess = {};

//Initial ideas on versioning
var localVersions = {};
var serverVersions = {};

var remarksLibOverlayArray2 = [];  //global

var isOnline = true;

var calendarData = {}; //calendar

var currAct;

var pollForOfflineUpdates;  //Polling only begins when device goes offline.

function clearCookies() {
    borg.runAction({
        "action": "#spawnOnce",
        "trigger": "now",
        "data": {
            "overlayId": "toggleSwitchWebView"
        }

    });
}

function performAction(actions) {
    try {
        for (var i = 0; i < actions.length; i++) {
            borg.runAction(actions[i]);
        }
    }
    catch (e) {
    }
}

function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

Date.prototype.yyyymmdd = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]); // padding
};

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

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

//Auto Login
function login() {

    loginURL = (pushToProd) ? "https://login.psso.its.jnj.com/nidp/saml2/sso?id=scrollmotion-basic" : "https://login.ssso.its.jnj.com/nidp/saml2/sso?id=scrollmotion-basic";
    samlURL = (pushToProd) ? "https://webapps-jnj.smint.us/saml2/samlrequestform/" : "https://webapps-jnj-dev.smint.us/saml2/samlrequestform/";

    var action = {
        "action": "userLoginAction",
        "trigger": "now",
        "target": "#systemAuthentication",
        "data": {
            "username": "auto",
            "password": "login",
            "loginURL": loginURL,
            "samlURL": samlURL,
            "serviceType": "jandjauthservice"
        }
    };
    borg.runAction(action);
};

//Remove the cookie and keychain entry on the device.
function logout() {

    var action = {
        "action": "userLogoutAction",
        "trigger": "now",
        "target": "#systemAuthentication",
        "data": {
            "serviceType": "jandjauthservice"
        }
    };
    borg.runAction(action);
};

var getAllTables = function () {

    SSO.smService();
    allTripsObj.getTable();
    activitiesObj.getTable();
    biosObj.getTable();
    remarksLibObj.getTable();
    remarksLibObj.getTable2();
    activityRemarksObj.getTable();
    participantGroupsObj.getTable();
    newsObj.getTable();

    var offlineTable = borg.getPersistentItem("talk.track.offline");

    if (offlineTable === null) {

        var offlineTempData = {
            "Activity": {
                "update": [
                ]
            },
            "BioNote": {
                "add": [
                ],
                "update": [
                ]
            },
            "ActivityRemark": {
                "add": [
                ],
                "update": [
                ],
                "order": [
                ],
                "copy": [
                ],
                "delete": [
                ]
            },
            "BiographyFavorite": {
                "add": [
                ],
                "delete": [
                ]
            },
            hasData: false,
            wasSorted: false
        };

        borg.setPersistentItem("talk.track.offline", offlineTempData);
        fakeIndex = 'a';
        fakeIndexArr = [];
        borg.setPersistentItem("talk.track.fakeIndex", fakeIndex);
        borg.setPersistentItem("talk.track.fakeIndexArr", fakeIndexArr);
    }
    else {
        if (offlineTable.hasData === false) {

            var offlineTempData = {
                "Activity": {
                    "update": [
                    ]
                },
                "BioNote": {
                    "add": [
                    ],
                    "update": [
                    ]
                },
                "ActivityRemark": {
                    "add": [
                    ],
                    "update": [
                    ],
                    "order": [
                    ],
                    "copy": [
                    ],
                    "delete": [
                    ]
                },
                "BiographyFavorite": {
                    "add": [
                    ],
                    "delete": [
                    ]
                },
                hasData: false,
                wasSorted: false
            };

            borg.setPersistentItem("talk.track.offline", offlineTempData);
            fakeIndex = 'a';
            fakeIndexArr = [];
            borg.setPersistentItem("talk.track.fakeIndex", fakeIndex);
            borg.setPersistentItem("talk.track.fakeIndexArr", fakeIndexArr);
        }
        else if (offlineTable.hasData === true) {
            return;
        }
    }

    //redefine the function for subsequent calls.
    getAllTables = function () {

        SSO.smService();
        allTripsObj.getTable();
        activitiesObj.getTable();
    };
};

var post = {
    activity: function (activityId, status) {

        var offlineSyncTable = borg.getPersistentItem("talk.track.offline");
        var offlinePost =
        {
            "id": activityId,
            "status": status
        };

        if (isOnline) {
            var activityStatusPost = 'data={"id":' + activityId + ', "field": "status", "value":"' + status + '"}';

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activities/update/" : "https://webapps-jnj-dev.smint.us/api/activities/update/";

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = xmlhttp.responseText;
                    console.log("postactivity, response is: " + response);
                }
            }
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(activityStatusPost);
        }
        else {
            if (offlineSyncTable.Activity.update.length === 0) {

                offlineSyncTable.Activity.update.push(offlinePost);
                offlineSyncTable.hasData = true;

                borg.setPersistentItem("talk.track.offline", offlineSyncTable);

                borg.clearIntervals();
                pollForOfflineUpdates = setInterval(function () {
                    post.gettingBackOnline();
                }, 5000);
            }
            else {
                var tempArray = [];

                for (var i = 0; i < offlineSyncTable.Activity.update.length; i++) {
                    var a = offlineSyncTable.Activity.update[i].id;
                    tempArray.push(a);

                }

                var check = tempArray.indexOf(activityId);
                if (check === -1) {

                    offlineSyncTable.Activity.update.push(offlinePost);
                    offlineSyncTable.hasData = true;
                    borg.setPersistentItem("talk.track.offline", offlineSyncTable);

                    borg.clearIntervals();
                    pollForOfflineUpdates = setInterval(function () {
                        post.gettingBackOnline();
                    }, 5000);

                }
                else {

                    offlineSyncTable.Activity.update[check].status = status;
                    offlineSyncTable.hasData = true;
                    borg.setPersistentItem("talk.track.offline", offlineSyncTable);

                    borg.clearIntervals();
                    pollForOfflineUpdates = setInterval(function () {
                        post.gettingBackOnline();
                    }, 5000);

                }
            }
        }
    },
    getOfflineValOnLogin: function () {
        var offlineTable = borg.getPersistentItem("talk.track.offline");

        if (offlineTable === null) {
            return;
        }
        if (offlineTable.hasData) {

            borg.runAction({
                "action": "setHiddenAction",
                "target": "offlineUpdatesIcon",
                "trigger": "now",
                "data": {
                    "hidden": false
                }
            });
            borg.setText("consoleText", "offlineTempData.hasData = true - POST is pending.");

            borg.clearIntervals();
            var pollForOfflineUpdates = setInterval(function () {
                post.gettingBackOnline();
            }, 5000);
        }
    },
    gettingBackOnline: function () {
        var offlineTable = borg.getPersistentItem("talk.track.offline");
        var cookieCheck = borg.getPersistentItem("talk.track.cookie");
        console.log('polling:' + " isOnline: " + isOnline + " hasData: " + offlineTable.hasData + " cookieCheck: " + cookieCheck);
        console.log('skeleton:' + JSON.stringify(offlineTable));

        borg.runAction({
            "action": "setHiddenAction",
            "target": "pollingIcon",
            "trigger": "now",
            "data": {
                "hidden": false
            }
        });
        borg.runAction({
            "action": "setHiddenAction",
            "delay": 0.5,
            "target": "pollingIcon",
            "trigger": "now",
            "data": {
                "hidden": true
            }
        });

        //        if (isOnline && offlineTable.wasSorted) {
        //            console.log('getting back online and sorting occured so updatesortpost');
        //
        //            //TODO: remove this condition?
        ////            activityRemarksObj.updateSortPost();
        //            offlineTable.wasSorted = false;
        ////            borg.setPersistentItem("talk.track.offline", offlineTable);
        //            return;
        //        }


        if (isOnline && gVars.editedCopies.length > 0) {
            console.log('getting back online and there are edited copies so fix them...');
            activityRemarksObj.fixUpdatedCopies();
            gVars.editedCopies = [];
            var offlineTableSend = JSON.stringify(borg.getPersistentItem("talk.track.offline"));
            return;
        }
        if (isOnline && offlineTable === null) {
            console.log('catch the case where polling begins on the auth page and clear the interal.');
            borg.clearIntervals();
            return;

        }
        else if (!isOnline && offlineTable.hasData) {
            console.log('offline, and have data to send');
            borg.setText("consoleText", "offlineTempData.hasData = true - POST is pending.");

            borg.runAction({
                "action": "setHiddenAction",
                "target": "offlineUpdatesIcon",
                "trigger": "now",
                "data": {
                    "hidden": false
                }
            });
            return;
        }
        else if (isOnline && !offlineTable.hasData && !offlineTable.wasSorted) {
            console.log('back online and there are no offline updates to post to the server, so clear the interval');
            borg.clearIntervals();
            return;
        }
        else if (isOnline && offlineTable.hasData) {
            console.log('there are some offline updates to post to the server. Get a session, then fire post.postAllUpdates();');

            if (cookieCheck === null) {
                cookieCheck = borg.getPersistentItem('talk.track.while');

                login();
                SSO.smService();
            }
            else if (cookieCheck !== null) {

                var didFix = false; //added from JS.
                if (offlineTable.hasData === true) {
                    //error checking for updated offline remarks
                    for (var i = 0; i < offlineTable.ActivityRemark.update.length; i++) {

                        if (isNaN(parseInt(offlineTable.ActivityRemark.update[i].id))) {
                            console.log('we have an offline update from add')
                            var fixMe = offlineTable.ActivityRemark.update[i];
                            //                            alert(JSON.stringify(fixMe))

                            for (var j = 0; j < offlineTable.ActivityRemark.add.length; j++) {
                                if (offlineTable.ActivityRemark.add[j].fakeId == fixMe.id) {
                                    console.log("activityreamrk place1")
                                    offlineTable.ActivityRemark.add[j].remark = fixMe.text;
                                    offlineTable.ActivityRemark.add[j].text = fixMe.text;
                                    offlineTable.ActivityRemark.add[j].title = fixMe.title;
                                    offlineTable.ActivityRemark.add[j].remembered = fixMe.remembered;
                                    offlineTable.ActivityRemark.update.splice(i, 1);
                                    console.log("special case hit" + JSON.stringify(offlineTable));
                                    borg.setPersistentItem("talk.track.offline", offlineTable);
                                    didFix = true;
                                }
                            }
                        }
                        //                        var str = JSON.stringify(offlineTable.ActivityRemark.update[i].id)

                    }
                }

                post.postAllUpdates();
                borg.setText("consoleText", "Back Online, sending data saved while offline.");
            }
        }
        else if (isOnline && offlineTable.wasSorted) {
            console.log('online, only sorting occured');
            activityRemarksObj.makeSortingArr();
            offlineTable.wasSorted = false;
            console.log("sortingPost! :" + JSON.stringify(sortingPost));
            activityRemarksObj.updateSortPost();
            borg.setPersistentItem("talk.track.offline", offlineTable);
            return;
        }
    },
    postAllUpdates: function () {
        //        alert(JSON.stringify(offlineTable.ActivityRemark))
        SSO.smService();
        var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");
        var offlineTable = borg.getPersistentItem("talk.track.offline");
        var offlineTableSend = JSON.stringify(borg.getPersistentItem("talk.track.offline"));

        console.log('SKELETON BEFORE SUCCESS' + ' ' + offlineTableSend);

        //        var didFix = false; //added from JS.
        if (offlineTable.hasData === true) {

            //TODO: put back in if weird behavior
            //            //error checking for updated offline remarks
            //            for (var i = 0; i < offlineTable.ActivityRemark.update.length; i++) {
            //
            //                if (isNaN(parseInt(offlineTable.ActivityRemark.update[i].id))) {
            //                    console.log('we have an offline update from add')
            //                    var fixMe = offlineTable.ActivityRemark.update[i];
            //
            //                    for (var j = 0; j < offlineTable.ActivityRemark.add.length; j++) {
            //                        if (offlineTable.ActivityRemark.add[j].fakeId == fixMe.id) {
            //                            offlineTable.ActivityRemark.add[j].text = fixMe.text;
            //                            offlineTable.ActivityRemark.add[j].title = fixMe.title;
            //                            offlineTable.ActivityRemark.update.splice(i, 1);
            //                            console.log("special case hit" + JSON.stringify(offlineTable));
            //                            borg.setPersistentItem("talk.track.offline", offlineTable);
            //                            didFix = true;
            //                        }
            //                    }
            //                }
            //                var str = JSON.stringify(offlineTable.ActivityRemark.update[i].id)
            //
            //            }
            //
            //            if (didFix) {
            //                return
            //            }
            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/offline_sync/" : "https://webapps-jnj-dev.smint.us/api/offline_sync/";

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = xmlhttp.responseText;
                    console.log(JSON.stringify(response));
                    var response2 = JSON.parse(response);
                    var success = response2['success'];

                    //4activityremarks
                    var ar = JSON.parse(response).data;
                    var errorResp = JSON.parse(response).errors;
                    var addResp = ar.activity_remarks_ids_from_add;
                    var copyResp = ar.activity_remarks_ids_from_copy;
                    gVars.addResp = addResp;
                    gVars.copyResp = copyResp;

                    for (var i = 0; i < offlineTable.ActivityRemark.add.length; i++) {
                        gVars.addActIds.push(offlineTable.ActivityRemark.add[i].activity_id)

                        //TODO: JS Added for special toggled offline case
                        for (var j = 0; j < offlineTable.ActivityRemark.update.length; j++) {

                            //                            alert(offlineTable.ActivityRemark.add[i] +' found special casez ' + JSON.stringify(offlineTable.ActivityRemark.update[j]))


                            if (offlineTable.ActivityRemark.update[j].id == offlineTable.ActivityRemark.add[i].fakeId) {
                                activityRemarksObj.remsToBeFavorited[offlineTable.ActivityRemark.update[j].id] = offlineTable.ActivityRemark.update[j]
                            } else {

                            }

                        }

                    }

                    gVars.copyRemOrder = [];
                    for (var i = 0; i < offlineTable.ActivityRemark.copy.length; i++) {
                        for (var j = 0; j < offlineTable.ActivityRemark.copy[i].fakeIndexArr.length; j++) {
                            gVars.copyRemOrder.push(offlineTable.ActivityRemark.copy[i].fakeIndexArr[j]);
                            gVars.copyActIds.push(offlineTable.ActivityRemark.copy[i].activity_id);
                        }
                    }

                    //                    console.log("addActIds: " + JSON.stringify(gVars.addActIds))
                    //                    console.log("addResp: " + JSON.stringify(addResp))
                    //                    console.log("addResp: " + JSON.stringify(addResp))
                    console.log("copyResp: " + JSON.stringify(copyResp))


                    if (errorResp.ActivityRemark != null) {
                        console.log("ERRORS OCCURED" + JSON.stringify(errorResp));
                        borg.clearIntervals();
                        console.log('resetting the skeleton after errors');

                        var offlineTempData = {
                            "Activity": {
                                "update": [
                                ]
                            },
                            "BioNote": {
                                "add": [
                                ],
                                "update": [
                                ]
                            },
                            "ActivityRemark": {
                                "add": [
                                ],
                                "update": [
                                ],
                                "order": [
                                ],
                                "copy": [
                                ],
                                "delete": [
                                ]
                            },
                            "BiographyFavorite": {
                                "add": [
                                ],
                                "delete": [
                                ]
                            },
                            hasData: false,
                            wasSorted: false
                        };
                        borg.setPersistentItem("talk.track.offline", offlineTempData);

                        return;
                    }

                    if (addResp.length > 0) {

                        activityRemarksObj.addResp();
                    }

                    if (copyResp.length > 0) {
                        if (activityRemarksObj.copyResp()) {
                            console.log("ERRORS OCCURED, got a bad PL EROR");
                            borg.clearIntervals();
                            console.log('resetting the skeleton after errors');

                            var offlineTempData = {
                                "Activity": {
                                    "update": [
                                    ]
                                },
                                "BioNote": {
                                    "add": [
                                    ],
                                    "update": [
                                    ]
                                },
                                "ActivityRemark": {
                                    "add": [
                                    ],
                                    "update": [
                                    ],
                                    "order": [
                                    ],
                                    "copy": [
                                    ],
                                    "delete": [
                                    ]
                                },
                                "BiographyFavorite": {
                                    "add": [
                                    ],
                                    "delete": [
                                    ]
                                },
                                hasData: false,
                                wasSorted: false
                            };
                            borg.setPersistentItem("talk.track.offline", offlineTempData);

                            return;

                        }
                    }

                    if (success === true && errorResp.ActivityRemark == null) {

                        console.log("IN THE 100percent if! :" + JSON.stringify(sortingPost))
                        activityRemarksObj.makeSortingArr();
                        console.log("sortingPost! :" + JSON.stringify(sortingPost))

                        console.log('resetting the skeleton');

                        var offlineTempData = {
                            "Activity": {
                                "update": [
                                ]
                            },
                            "BioNote": {
                                "add": [
                                ],
                                "update": [
                                ]
                            },
                            "ActivityRemark": {
                                "add": [
                                ],
                                "update": [
                                ],
                                "order": [
                                ],
                                "copy": [
                                ],
                                "delete": [
                                ]
                            },
                            "BiographyFavorite": {
                                "add": [
                                ],
                                "delete": [
                                ]
                            },
                            hasData: false,
                            wasSorted: false
                        };
                        borg.setPersistentItem("talk.track.offline", offlineTempData);

                        //                        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
                        var biosTable = global.biosTable;

                        //TODO: ES: integrate
                        biosObj.getTable();

                        //TODO: ES initial thoughs on more immediate updates.
                        /*if (borg.pageId === "activityDetailPage2") {
                         activityRemarksObj.activityRemarksOverlays();
                         }*/

                        borg.clearIntervals();

                        borg.runAction({
                            "action": "setHiddenAction",
                            "target": "offlineUpdatesIcon",
                            "trigger": "now",
                            "data": {
                                "hidden": true
                            }
                        });
                        borg.setText("consoleText", "Offline Data Sent. offlineTempData.hasData = false");

                    }

                    //else if (response == '{"status": "Invalid session.", "success": false}') {
                    //console.log('fire the login action');
                    //login();

                    //}
                    activityRemarksObj.updateSortPost();

                    //Es: added 6-21-2013 // ticket 
                    if (borg.pageId === "activityDetailPage2") {

                        activityRemarksObj.getTable();
                    }

                    console.log('SKELETON AFTER SUCCESS and sorting' + ' ' + JSON.stringify(borg.getPersistentItem("talk.track.offline")));

                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {

                    ///the assumption here is that server injested all updates, but rejected some, which we'll handle in other ways.

                    // should set the offlineUpdates Icon to hidden here...

                    console.log('postAllUpdates403');
                    console.log(JSON.stringify(response));
                    console.log('postAllUpdates403');
                    login();

                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 500) {

                    console.log("ERRORS OCCURED, got a bad INTENRAL SERVER EROR");
                    borg.clearIntervals();
                    console.log('resetting the skeleton after errors');

                    var offlineTempData = {
                        "Activity": {
                            "update": [
                            ]
                        },
                        "BioNote": {
                            "add": [
                            ],
                            "update": [
                            ]
                        },
                        "ActivityRemark": {
                            "add": [
                            ],
                            "update": [
                            ],
                            "order": [
                            ],
                            "copy": [
                            ],
                            "delete": [
                            ]
                        },
                        "BiographyFavorite": {
                            "add": [
                            ],
                            "delete": [
                            ]
                        },
                        hasData: false,
                        wasSorted: false
                    };
                    borg.setPersistentItem("talk.track.offline", offlineTempData);

                    return;

                }
                else {
                    //xmlhttp.readyState cycle
                    console.log('in the else and ready state is' + ' ' + xmlhttp.readyState);
                }
            }
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(offlineTableSend);
        }
        else {
            console.log('nothing to send');
        }
    }
};

var SSO = {
    localStorage: function () {
        var characters = JSON.stringify(localStorage).length;
        var bytes = JSON.stringify(localStorage).length * 2 / 1024;
        var fixed = bytes.toFixed(2);
        alert('Your localStorage is currently ' + characters + ' characters in length. Assuming JavaScript strings are UTF-16, each character requires two bytes of memory. This means your local storage is ' + fixed + ' Kbs.');
        alert(navigator.userAgent);
    },
    smService: function () {
        var userId, sessionId;

        userId = readCookie("userid");
        sessionId = readCookie("sessionid");

        borg.setPersistentItem("talk.track.id", userId);
        borg.setPersistentItem("talk.track.cookie", sessionId);
    },
    smService2: function () {

        alert('user id is ' + borg.getPersistentItem("talk.track.id") + ' and session id is ' + borg.getPersistentItem("talk.track.cookie"));
        alert('skeleton:' + JSON.stringify(borg.getPersistentItem("talk.track.offline")));
    },
    serverLogout: function () {
        var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/device_logout/" : "https://webapps-jnj-dev.smint.us/api/device_logout/";

        var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
                var data = xmlhttp.responseText;

                data = JSON.stringify(JSON.parse(data));

                var authReturnData = JSON.parse(data);

                var success = authReturnData['success'];

                if (success === true) {

                    //clear local storage cookie and sessionid values

                    cookie = null;
                    borg.setPersistentItem("talk.track.cookie", cookie);

                    borg.setPersistentItem("talk.track.sepSSID", '');

                    borg.setPersistentItem("trip.docs.id", '');
                    borg.setPersistentItem("talktrack.briefcase.id", '');

                    borg.setPersistentItem("SEP.breadcrumbs.history", []);

                    cloudCollection = null;

                    ID = "";
                    borg.setPersistentItem("talk.track.id", ID);

                    //clear data tables
                    borg.setPersistentItem("talk.track.tables['bios']", '');
                    borg.setPersistentItem("talk.track.tables['trips']", '');
                    borg.setPersistentItem("talk.track.tables['remarks']", '');
                    borg.setPersistentItem("talk.track.tables['remarkCat']", '');
                    borg.setPersistentItem("talk.track.tables['activities']", '');
                    borg.setPersistentItem("talk.track.tables['activityRemarks']", '');
                    borg.setPersistentItem("talk.track.tables['participantGroups']", '');

                    //delete the cookie and remove the keychain entry.
                    logout();

                    //close the persistent tabbar
                    borg.runAction({
                        "action": "close",
                        "trigger": "touchUpInside",
                        "target": "bottomTabBar"
                    });

                    //close the persistent fireFirstMethod action for CV
                    borg.runAction({
                        "action": "close",
                        "target": "fireFirstMethod"
                    });
                    //goto login overlay

                    borg.runAction({
                        "action": "userLogout",
                        "trigger": "now",
                        "target": "#systemAuthentication",
                        "data": {
                            "logoutURL": "https://talktrack.scrollmotion.com",
                            "serviceType": "smauthservice"
                        }
                    });

                    borg.gotoPage('authenticate', 'Crossfade', '0.25');
                }
            }

            else {
            }

        };
        xmlhttp.open("GET", url, true);
        xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xmlhttp.setRequestHeader("Cookie", cookie);
        xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
        xmlhttp.send();
    }
};

var localJSONObject = {
    initialCheck: function () {
        //check if person is online on page entered

        var a1 = { "action": "checkNetworkStatusAction", "target": "#reachabilityService", "trigger": "now" };
        borg.runAction(a1);

        if (!isOnline) {
            return false;
        }
        else {
            return true;
        }
    },
    toggleButton: function () {
        var biosTable = global.biosTable;
        var toggled = borg.getPersistentItem('talk.track.bioToggled');
        if (toggled === null) {
            var firstBioID = borg.getPersistentItem('talk.track.firstBio');

            setTimeout(function () {
                moreBorg.toggle("ab_vert_trans_btn" + biosTable[firstBioID].id, "on")
            }, 200);
        }
        else {
            setTimeout(function () {
                console.log('togglingzz ' + biosTable[toggled].id)
                moreBorg.toggle("ab_vert_trans_btn" + biosTable[toggled].id, "on")
            }, 400);
        }
    },
    tbPostSearch: function () {
        var biosTable = global.biosTable;
        console.log("tbpost : " + gVars.toggleFromSearch)
        if (gVars.toggleFromSearch != -1) {

            if (biosTable[gVars.toggleFromSearch]) {
                console.log("doing stuzz : " + gVars.toggleFromSearch)

                var d = "ab_vert_trans_btn" + biosTable[gVars.toggleFromSearch].id;
                setTimeout(function () {
                    moreBorg.toggle(d, "on")
                }, 400);

                gVars.toggleFromSearch = -1;
                gVars.bioResized = true;
            }
            else {

                alert(JSON.stringify('err'))
            }

        } else {

            gVars.toggleFromSearch = -1;
            return
        }
    },
    arraysEqual: function () {
    },
    toggleButton2: function () {

        //        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        var biosTable = global.biosTable;

        var toggleArr = borg.getPersistentItem('talk.track.toggleArr');
        if (!toggleArr) {
            toggleArr = [];
            borg.setPersistentItem('talk.track.toggleArr', toggleArr);
            toggleArr = borg.getPersistentItem('talk.track.toggleArr');
        } else {

        }

        var dudeArr = borg.getPersistentItem('talk.track.firstBioz');

        if (!dudeArr) {
            dudeArr = [];
            borg.setPersistentItem('talk.track.firstBioz', dudeArr);
            dudeArr = borg.getPersistentItem('talk.track.firstBioz');
        } else {
        }


        var toggleMe = toggleArr[tripIndex]
        if (toggleMe) {

            setTimeout(function () {

                moreBorg.toggle("ab_vert_trans_btn" + toggleMe.index, "on")
            }, 200);


        } else {

            setTimeout(function () {

                moreBorg.toggle("ab_vert_trans_btn" + dudeArr[tripIndex], "on")
            }, 200);


        }


        //        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        //        //TODO: figure out savestates on toggled biostabs
        //        var toggled = borg.getPersistentItem('talk.track.bioTabToggled');
        //        if (toggled === null) {
        //            var firstBioID2 = borg.getPersistentItem('talk.track.firstBio2');
        //
        //            setTimeout(function () {
        //                moreBorg.toggle("ab_vert_trans_btn" + biosTable[firstBioID2].id, "on")
        //            }, 200);
        //        }
        //        else {
        //            setTimeout(function () {
        //                moreBorg.toggle("ab_vert_trans_btn" + biosTable[toggled].id, "on")
        //            }, 200);
        //        }
    },
    blockNavBarBtns: function () {
        console.log("in Blocker function and page Id is : " + borg.pageId)

        if (borg.pageId == 'dashboardPage') {


            setTimeout(function () {
                moreBorg.close('tabBarBlockerAllTrips');
                moreBorg.close('tabBarBlockerBios');
                moreBorg.close('tabBarBlockerRemarks');
                moreBorg.close('tabBarBlockerBriefcase');
                moreBorg.close('tabBarBlockerLegal');
                moreBorg.close('tabBarBlockerNews');
            }, 800);

            moreBorg.containerSpawn('tabBarBlockerDashboard', 'bottomTabBar', false);
        }
        else if (borg.pageId == 'allTripsPage') {

            setTimeout(function () {
                moreBorg.close('tabBarBlockerDashboard');
                moreBorg.close('tabBarBlockerBios');
                moreBorg.close('tabBarBlockerRemarks');
                moreBorg.close('tabBarBlockerBriefcase');
                moreBorg.close('tabBarBlockerLegal');
                moreBorg.close('tabBarBlockerNews');
            }, 500);

            moreBorg.containerSpawn('tabBarBlockerAllTrips', 'bottomTabBar', false);
        }
        else if (borg.pageId == 'remarkLibPage') {

            setTimeout(function () {
                moreBorg.close('tabBarBlockerAllTrips');
                moreBorg.close('tabBarBlockerBios');
                moreBorg.close('tabBarBlockerBriefcase');
                moreBorg.close('tabBarBlockerDashboard');
                moreBorg.close('tabBarBlockerLegal');
                moreBorg.close('tabBarBlockerNews');
            }, 500);

            moreBorg.containerSpawn('tabBarBlockerRemarks', 'bottomTabBar', false);
        }
        else if (borg.pageId == 'tripDetailPage') {

            setTimeout(function () {
                moreBorg.close('tabBarBlockerAllTrips');
                moreBorg.close('tabBarBlockerBios');
                moreBorg.close('tabBarBlockerRemarks');
                moreBorg.close('tabBarBlockerBriefcase');
                moreBorg.close('tabBarBlockerDashboard');
                moreBorg.close('tabBarBlockerNews');
                moreBorg.close('tabBarBlockerLegal');
            }, 500);

        }
        else if (borg.pageId == 'biographiesPage') {

            setTimeout(function () {

                moreBorg.close('tabBarBlockerAllTrips');
                moreBorg.close('tabBarBlockerRemarks');
                moreBorg.close('tabBarBlockerDashboard');
                moreBorg.close('tabBarBlockerBriefcase');
                moreBorg.close('tabBarBlockerLegal');
                moreBorg.close('tabBarBlockerNews');
            }, 500);
            moreBorg.containerSpawn('tabBarBlockerBios', 'bottomTabBar', false);
        }
        else if (borg.pageId == 'pbAuth') {

            setTimeout(function () {
                moreBorg.close('tabBarBlockerAllTrips');
                moreBorg.close('tabBarBlockerRemarks');
                moreBorg.close('tabBarBlockerBios');
                moreBorg.close('tabBarBlockerDashboard');
                moreBorg.close('tabBarBlockerLegal');
                moreBorg.close('tabBarBlockerNews');
            }, 500);

            moreBorg.containerSpawn('tabBarBlockerBriefcase', 'bottomTabBar', false);
        }
        else if (borg.pageId == 'pb') {

            setTimeout(function () {
                moreBorg.close('tabBarBlockerAllTrips');
                moreBorg.close('tabBarBlockerRemarks');
                moreBorg.close('tabBarBlockerBios');
                moreBorg.close('tabBarBlockerDashboard');
                moreBorg.close('tabBarBlockerLegal');
                moreBorg.close('tabBarBlockerNews');
            }, 500);

            moreBorg.containerSpawn('tabBarBlockerBriefcase', 'bottomTabBar', false);
        }
        else if (borg.pageId == 'legalPage') {

            setTimeout(function () {
                moreBorg.close('tabBarBlockerAllTrips');
                moreBorg.close('tabBarBlockerRemarks');
                moreBorg.close('tabBarBlockerBios');
                moreBorg.close('tabBarBlockerBriefcase');
                moreBorg.close('tabBarBlockerDashboard');
                moreBorg.close('tabBarBlockerNews');
            }, 500);

            moreBorg.containerSpawn('tabBarBlockerLegal', 'bottomTabBar', false);
        }
        else if (borg.pageId == 'briefcase') {

            setTimeout(function () {
                moreBorg.close('tabBarBlockerAllTrips');
                moreBorg.close('tabBarBlockerRemarks');
                moreBorg.close('tabBarBlockerBios');
                moreBorg.close('tabBarBlockerDashboard');
                moreBorg.close('tabBarBlockerLegal');
                moreBorg.close('tabBarBlockerNews');
            }, 500);

            moreBorg.containerSpawn('tabBarBlockerBriefcase', 'bottomTabBar', false);
        }
        else if (borg.pageId == 'newsPage') {


            setTimeout(function () {

                moreBorg.close('tabBarBlockerAllTrips');
                moreBorg.close('tabBarBlockerRemarks');
                moreBorg.close('tabBarBlockerBios');
                moreBorg.close('tabBarBlockerDashboard');
                moreBorg.close('tabBarBlockerLegal');
                moreBorg.close('tabBarBlockerBriefcase');
            }, 500);
            moreBorg.containerSpawn('tabBarBlockerNews', 'bottomTabBar', false);
        }
    },
    ttBrowserConnectivity: function () {

        if (borg.pageId === "pb") {

            borg.runAction({
                "action": "#spawnOnce",
                "trigger": "now",
                "data": {
                    "overlayId": "wifiError_container_closeBkgd"
                }
            });

            borg.runAction({
                "action": "#spawnOnce",
                "trigger": "now",
                "data": {
                    "overlayId": "wifiError_container_modal"
                }
            });
        }
    }
};

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

var allTripsObj = {

    getTable: function () {

        if (isOnline === true) {

            var tripsTable = {};
            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/trips/" : "https://webapps-jnj-dev.smint.us/api/trips/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var ID = "userid=" + borg.getPersistentItem("talk.track.id");

            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    clearTimeout(xmlHttpTimeout);
                    var data = xmlhttp.responseText;
                    global.tripsTable = JSON.parse(data).trips;
                    global.execName = JSON.parse(data).executiveName;
                    borg.setPersistentItem("talk.track.tables['trips']", JSON.parse(data).trips);

                    //global.tripsTable = borg.getPersistentItem("talk.track.tables['trips']");

                    console.log('getting trips global - success');
//                    console.log(JSON.stringify(global.tripsTable))
                    if (borg.pageId === "dashboardPage") {
                        dashboardObject.spawnData();
                    }
                    if (borg.pageId === "allTripsPage") {
                        allTripsObj.spawnDataAllTripsPage();
                    }

                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    clearTimeout(xmlHttpTimeout);

                    var data = xmlhttp.responseText;
                    var trip403 = JSON.parse(data);

                    console.log('getting trips table - failure');

                    var success = trip403['success'];
                    var status = trip403['status'];

                    if (status == 'Invalid session.') {

                        login();
                        console.log('logging back in');

                        global.activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");

                        if (borg.pageId === "dashboardPage") {
                            dashboardObject.spawnData();
                        }

                        global.tripsTable = borg.getPersistentItem("talk.track.tables['trips']");

                        if (borg.pageId === "allTripsPage") {
                            allTripsObj.spawnDataAllTripsPage();
                        }
                    }
                    clearTimeout(xmlHttpTimeout);
                }
            };
            xmlhttp.open("GET", url + '?' + ID, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.withCredentials = true;
            xmlhttp.send();

            var xmlHttpTimeout = setTimeout(ajaxTimeout, 5000);

            function ajaxTimeout() {
                xmlhttp.abort();
                //alert("Request timed out - trips table");
                console.log("Request timed out - trips table");

                global.participantGroupsTable = borg.getPersistentItem("talk.track.tables['participantGroups']");
                global.activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");

                if (borg.pageId === "dashboardPage") {
                    dashboardObject.spawnData();
                }

                global.tripsTable = borg.getPersistentItem("talk.track.tables['trips']");

                if (borg.pageId === "allTripsPage") {
                    allTripsObj.spawnDataAllTripsPage();
                }

            }
        }
        else if (isOnline === false) {
            global.participantGroupsTable = borg.getPersistentItem("talk.track.tables['participantGroups']");
            global.activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");

            if (borg.pageId === "dashboardPage") {
                dashboardObject.spawnData();
            }

            global.tripsTable = borg.getPersistentItem("talk.track.tables['trips']");

            if (borg.pageId === "allTripsPage") {
                allTripsObj.spawnDataAllTripsPage();
            }

        }
    },
    spawnCard: function (index) {
        //        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        //        var activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");


        var biosTable = global.biosTable;
        var activitiesTable = global.activitiesTable;
        var allParticipantGroups = [];
        var testActivityID;
        var upcomingActivities = [];
        var upcomingActivitiesOverlays = [];
        var suffix = index;


        var dashCheckTodayDate = new Date();
        dashCheckTodayDate = dashCheckTodayDate.yyyymmdd();
        for (i in activitiesTable) {
            allParticipantGroups[activitiesTable[i].id] = activitiesTable[i].participantsGroups;
            for (j in allParticipantGroups[activitiesTable[i].id]) {

                for (var k = 0; k < allParticipantGroups[activitiesTable[i].id][j].length; k++) {
                    if (allParticipantGroups[activitiesTable[i].id][j][k] == suffix) {
                        testActivityID = activitiesTable[i];
                        upcomingActivities.push(testActivityID);
                    }
                }
            }
        }
        upcomingActivities.sort(sort_by('_activityDate', true, function (a) {
            return a.toUpperCase()
        }));

        for (var i = 0; i < upcomingActivities.length; i++) {
            var start, end;
            start = (upcomingActivities[i].activityStartTime == "") ? "no start time in CMS" : upcomingActivities[i].activityStartTime;
            end = (upcomingActivities[i].activityEndTime == "") ? "no end time in CMS" : upcomingActivities[i].activityEndTime;

            if (upcomingActivities[i]._activityDate >= dashCheckTodayDate && upcomingActivities[i].keyEvent === true && upcomingActivities[i].activityState != "Draft") {

                upcomingActivitiesOverlays.push({
                    "overlayId": "upcomingActivitiesContainer",
                    "type": "container",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "0px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "0px",
                        "margin-left": "0px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "relative": "parent",
                    "x": "",
                    "y": "",
                    "width": "438px",
                    "height": "auto",
                    "_borderColor": "#0000ff",
                    "overlays": [
                        {
                            "overlayId": "upcomingActivitiesContainer2" + upcomingActivities[i].id,
                            "type": "container",
                            "layoutType": "flow",
                            "relative": "parent",
                            "x": "",
                            "y": "",
                            "width": "370px",
                            "height": "auto",
                            "_borderColor": "#ff00ff",
                            "onInit": "biosObj.goToActivity(" + upcomingActivities[i].id + ");",
                            "overlays": [
                                {
                                    "overlayId": "upcomingActivitiesOverlays",
                                    "type": "text",
                                    "textAlign": "left",
                                    "text": upcomingActivities[i].activityName + " >",
                                    "x": "",
                                    "y": "",
                                    "width": "438px",
                                    "height": "auto",
                                    "relative": "parent",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "size": "1.2em",
                                    "fontColor": "#0a8caa",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "upcomingActivitiesOverlays",
                                    "type": "text",
                                    "textAlign": "left",
                                    "text": upcomingActivities[i].activityDate3 + '&nbsp;-&nbsp;' + start + '-' + end,
                                    "x": "",
                                    "y": "",
                                    "width": "438px",
                                    "height": "auto",
                                    "font": "AkzidenzGroteskPro-Regular",
                                    "size": "1.0em",
                                    "relative": "parent",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "spacer",
                                    "width": "22px",
                                    "height": "10px",
                                    "x": "",
                                    "y": ""
                                }
                            ]
                        }
                    ]
                });
            }
            else {
                upcomingActivitiesOverlays.push({
                    "overlayId": "upcomingActivitiesContainer",
                    "type": "container",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "0px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "0px",
                        "margin-left": "0px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "relative": "parent",
                    "x": "",
                    "y": "",
                    "width": "438px",
                    "height": "auto",
                    "overlays": [
                        {
                            "overlayId": "upcomingActivitiesContainer2" + upcomingActivities[i].id,
                            "type": "container",
                            "layoutType": "flow",
                            "relative": "parent",
                            "x": "",
                            "y": "",
                            "width": "438px",
                            "height": "auto",
                            "overlays": [
                                {
                                    "overlayId": "upcomingActivitiesOverlays",
                                    "type": "text",
                                    "textAlign": "left",
                                    "text": upcomingActivities[i].activityName,
                                    "x": "",
                                    "y": "",
                                    "width": "438px",
                                    "height": "auto",
                                    "relative": "parent",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "size": "1.2em",
                                    "fontColor": "#000000",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "upcomingActivitiesOverlays",
                                    "type": "text",
                                    "_padding": "10px",
                                    "textAlign": "left",
                                    "text": upcomingActivities[i].activityDate3 + '&nbsp;-&nbsp;' + start + '-' + end,
                                    "x": "",
                                    "y": "",
                                    "width": "438px",
                                    "height": "auto",
                                    "font": "AkzidenzGroteskPro-Regular",
                                    "size": "1.0em",
                                    "relative": "parent"
                                },
                                {
                                    "overlayId": "spacer",
                                    "width": "22px",
                                    "height": "10px",
                                    "x": "",
                                    "y": ""
                                }
                            ]
                        }
                    ]
                });
            }
        }

        var i = index;
        borg.setPersistentItem('talk.track.bioTabToggled', index);
        var name = biosTable[i].firstName + " " + biosTable[i].lastName;
        name = (name.length > 18) ? name.substr(0, 18) + "..." : name;

        var toggleArr = borg.getPersistentItem('talk.track.toggleArr');
        var tempO = {
            name: name,
            index: i
        }
        toggleArr[tripIndex] = tempO;
        borg.setPersistentItem('talk.track.toggleArr', toggleArr);


        var photoUrl = biosTable[i].photo;
        var company = (biosTable[i].company.length > 65) ? biosTable[i].company.substr(0, 65) + "..." : biosTable[i].company;
        var title = (biosTable[i].title.length > 65) ? biosTable[i].title.substr(0, 65) + "..." : biosTable[i].title;

        var ab_name = biosTable[i].firstName
        ab_name += " "
        ab_name += biosTable[i].lastName;
        //ab_name = (ab_name.length > 25) ? ab_name.substr(0, 25) + "..." : ab_name;

        var ab_title = biosTable[i].title;
        ab_title = (ab_title.length > 30) ? ab_title.substr(0, 30) + "..." : ab_title;

        var ab_company = biosTable[i].company
        ab_company = (ab_company.length > 33) ? ab_company.substr(0, 33) + "..." : ab_company;

        var ab_audioId = biosTable[i].audioId;
        var ab_fileType = ab_audioId.split('.').pop();
        var filetypeLen = ab_fileType.length + 1
        ab_audioId = ab_audioId.substring(0, ab_audioId.length - filetypeLen);

//        console.log(ab_audioId);
        
        var ab = {
            "overlayId": "ab_main_data_container2",
            "type": "container",
            "layoutType": "flow",
            "layoutOptions": {
                "margin-top": "0px",
                "marginY": "0px",
                "paddingY": "10px",
                "margin-bottom": "0px",
                "margin-left": "0px",
                "marginX": "0px",
                "paddingX": "0px",
                "margin-right": "0px"
            },
            "height": "770px",
            "width": "541px",
            "relative": "parent",
            "horizontalAlign": "left",
            "verticalAlign": "top",
            "x": "",
            "y": "",
            "overlays": [
                {
                    "overlayId": "ab_main_data_sub_container",
                    "type": "container",
                    "height": "230px",
                    "width": "499px",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "relative": "parent",
                    "borderColor": "#0000ff",
                    "overlays": [
                        {
                            "overlayID": "detailsFlowContainer",
                            "type": "container",
                            "layoutType": "flow",
                            "layoutOptions": {
                                "margin-top": "30px",
                                "marginY": "0px",
                                "paddingY": "0px",
                                "margin-bottom": "0px",
                                "margin-left": "0px",
                                "marginX": "0px",
                                "paddingX": "0px",
                                "margin-right": "0px"
                            },
                            "width": "270px",
                            "height": "200px",
                            "verticalAlign": "top",
                            "horizontalAlign": "left",
                            "x": "204px",
                            "y": "36px",
                            "overlays": [
                                {
                                    "overlayId": "ab_name_value" + i,
                                    "type": "text",
                                    "text": "<strong>" + ab_name + "</strong>",
                                    "height": "auto",
                                    "width": "268px",
                                    "fontColor": "#3d3d3d",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "textAlign": "left",
                                    "size": "1.5em",
                                    "relative": "parent",
                                    "horizontalAlign": "left",
                                    "verticalAlign": "top",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "ab_title_value",
                                    "type": "text",
                                    "text": "<strong>" + ab_title + "</strong>",
                                    "fontColor": "#3d3d3d",
                                    "horizontalAlign": "left",
                                    "verticalAlign": "top",
                                    "size": "1.0em",
                                    "height": "20px",
                                    "width": "268px",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "textAlign": "left",
                                    "relative": "parent",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "ab_company_value",
                                    "type": "text",
                                    "text": "<strong>" + ab_company + "</strong>",
                                    "fontColor": "#3d3d3d",
                                    "horizontalAlign": "left",
                                    "verticalAlign": "top",
                                    "size": "1.0em",
                                    "height": "20px",
                                    "width": "268px",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "textAlign": "left",
                                    "relative": "parent"
                                },
                                {
                                    "overlayId": "bioAudio_container",
                                    "x": "",
                                    "y": "",
                                    "overlays": [
                                        {
                                            "overlayId": "bioAudio_container_circle"
                                        },
                                        {
                                            "overlayId": "bioAudio_text"
                                        },
                                        {
                                            "overlayId": "bioAudio_btn" + i,
                                            "type": "button",
                                            "color": "#magic",
                                            "x": "0px",
                                            "y": "0px",
                                            "relative" : "parent",
                                            "horizontalAlign" : "left",
                                            "verticalAlign" : "top",
                                            "width": "200px",
                                            "height": "30px",
                                            "actions": [
                                                {
                                                    "action": "checkPackageStatus",
                                                    "trigger": "now",
                                                    "source": "#systemPackageDataRegistry",
                                                    "target": "#systemPackageDataRegistry",
                                                    "data": {
                                                        "packageID": ab_audioId,
                                                        "type": ab_fileType
                                                    }
                                                },
                                                {
                                                    "action" : "#subscribe",
                                                    "target" : "#eventManager",
                                                    "trigger" : "now",
                                                    "data" : {
                                                        "event" : "stateInstallCompleted",
                                                        "actionId" : "closeAudioBlocker"
                                                    }
                                                },
                                                {
                                                    "action": "runScriptAction",
                                                    "trigger": "touchUpInside",
                                                    "target": "#jsBridge",
                                                    "data": {
                                                        "script": "biosObj.audioPronunciation('"+ ab_name + "', '" + ab_audioId + "', '" + ab_fileType + "');"
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            "overlayId": "bioAudio_container_notAvailable",
                                            "backgroundColor": "#DEDEDD"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "overlayId": "defaultImage",
                            "type": "image",
                            "images": ["Spine/images/photoFrameAnon.png"],
                            "width": "153px", //159
                            "height": "198px", //204
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "relative": "parent",
                            "_draggable": true,
                            "x": "32px",
                            "y": "31px"
                        },
                        {
                            "overlayId": "attendee_view_attendee_image",
                            "imagesDefault": ["Spine/images/photoFrameAnon.png"],
                            "dynamicSource": "url",
                            "type": "image",
                            "images": [
                                "$(" + photoUrl + ")"
                            ],
                            "width": "136px", //159  // 153 //117
                            "height": "182px", //204  // 198 //164
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "relative": "parent",
                            "x": "42px",
                            "_draggable": true,
                            "y": "40px",
                            "scaleMode": "aspect-fill",
                            "clipToBounds": true
                        },
                        {
                            "overlayId": "bioLibPhotoFrame",
                            "_draggable": true
                        }
                    ]
                },
                {
                    "overlayId": "bioSpacerz"
                },
                {
                    "overlayId": "descco", //bioNotes will go here
                    "type": "container",
                    "width": "520px",
                    "height": "auto",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "0px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "0px",
                        "margin-left": "30px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "relative": "parent",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "borderColor": "#0000ff",
                    "overlays": [
                        {
                            "overlayId": "ab_description_value",
                            "type": "text",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": biosTable[index].summary,
                            "height": "auto",
                            "width": "460px",
                            "relative": "parent",
                            "fontColor": "#3d3d3d",
                            "_borderColor": "#0000ff",
                            "size": "1.0em"
                        }
                    ]
                },
                {
                    "overlayId": "abDescDetail",
                    "type": "container",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "0px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "0px",
                        "margin-left": "30px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "x": "",
                    "y": "",
                    "width": "460px",
                    "height": "auto",
                    "relative": "parent",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "overlays": [
                        {
                            "overlayId": "ab_description_value2",
                            "type": "text",
                            "padding": "5px",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": "Participant in Upcoming Activities",
                            "height": "auto",
                            "width": "438px",
                            "relative": "parent",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#3d3d3d",
                            "size": "0.9em"
                        }
                    ]
                },
                {
                    "overlayId": "abBioNotesContainer", //bioNotes will go here
                    "type": "container",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "20px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "35px",
                        "margin-left": "30px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "x": "",
                    "y": "",
                    "width": "477px",
                    "height": "auto",
                    "relative": "parent",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "overlays": [
                        {
                            "overlayId": "activityFollowUpNotesInnerTopMiddleBottomContainer",
                            "x": "",
                            "y": "",
                            "onTouchDown": "biosObj.editBioNotes(" + index + ");",
                            "overlays": [
                                {
                                    "overlayId": "bioLibtopImage"
                                },
                                {
                                    "overlayId": "bioLibUpNotesLabelText"
                                }
                            ]
                        },
                        {
                            "overlayId": "bioLlibMiddle",
                            "onTouchDown": "biosObj.editBioNotes(" + index + ");",
                            "overlays": [
                                {
                                    "overlayId": "bioLibNotesTextfieldOffscreen",
                                    "type": "textfield",
                                    "relative": "screen",
                                    "x": "-200px",
                                    "y": "-200px"
                                },
                                {
                                    "overlayId": "bioLibUpNotesTextDisplayOnly" + index,
                                    "type": "textfield",
                                    "multiline": true,
                                    "isEditable": true,
                                    "saveState": false,
                                    "//saveText": false,
                                    "placeholder": "Enter a note...",
                                    "text": biosTable[index].bioNotes.text,
                                    "textAlign": "left",
                                    "font": "Helvetica",
                                    "fontColor": "#666666",
                                    "size": "1.0em",
                                    "height": "auto",
                                    "width": "400px",
                                    "horizontalAlign": "left",
                                    "verticalAlign": "top",
                                    "relative": "parent",
                                    "actions": [
                                        {
                                            "action": "runScriptAction",
                                            "trigger": "editingbegan",
                                            "target": "#jsBridge",
                                            "data": {
                                                "script": "biosObj.editBioNotes(" + index + ");"
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "overlayId": "bioLibbottomImage",
                            "onTouchDown": "biosObj.editBioNotes(" + index + ");",
                            "x": "",
                            "y": ""
                        }
                    ]
                }
            ]
        };
        //es..commented this back in...
        moreBorg.close('ab_main_data_container2');
        //        moreBorg.spawn('ab_main_data_container2');
        moreBorg.containerSpawn(ab, 'ab_main_container2', false);
        
        borg.setText("bioLibUpNotesTextDisplayOnly" + index, biosTable[index].bioNotes.text);
        moreBorg.containerSpawn(upcomingActivitiesOverlays, 'abDescDetail', false);
    },
    spawnDataAllTripsPage: function () {
        //        var tripsTable = borg.getPersistentItem("talk.track.tables['trips']");

        var tripsTable = global.tripsTable;

        var allTripsPageOverlaysArray2 = [];

        borg.runAction({
            "action": "close",
            "trigger": "now",
            "data": {
                "overlayId": "spinnerAllTrips"
            }

        });
        borg.runAction({
            "action": "#spawnOnce",
            "trigger": "now",
            "data": {
                "overlayId": "allTripsPage_container",
                "_borderWidth": "1px",
                "_borderColor": "#ff00ff"
            }

        });

        borg.runAction({
            "action": "spawnOnce",
            "target": "allTripsPage_container",
            "trigger": "now",
            "data": {
                "overlayId": "containerPageIndicator",
                "relative": "container"
            }
        });

        borg.runAction({
            "action": "spawnOnce",
            "target": "allTripsPage_container",
            "trigger": "now",
            "data": {
                "overlayId": "tripCardsContainer",
                "relative": "container",
                "contentWidth": (allTripsPageOverlaysArray2.length * 768) - 768 + "px"
            }
        });

        //reset tripIndex on return to all trips view
        tripIndex = null;

        for (i in tripsTable) {

            var tripName = (tripsTable[i].tripName.length > 32) ? tripsTable[i].tripName.substr(0, 32) + "..." : tripsTable[i].tripName;

            var mapUrl = tripsTable[i].mapUrl;
            var mapUrl2 = mapUrl.replace(/ /g, "%20");
            var mapInsource = "$(" + mapUrl2 + ")";

            allTripsPageOverlaysArray2.push({

                "overlayId": "TripSelectCardContainer",
                "_x": (i * 768) + 384 + "px",
                "overlays": [
                    {
                        "overlayId": "TripSelectCardBackground",
                        "overlays": [
                            {
                                "overlayId": "titleText",
                                "text": "" + tripName + "&nbsp;>"
                            },
                            {
                                "overlayId": "subtitleText",
                                "text": tripsTable[i].tripRange
                            },
                            {
                                "overlayId": "summaryTitle",
                                "text": "" + "Summary" + ""
                            },
                            {
                                "overlayId": "TripTextContainer",
                                "overlays": [
                                    {
                                        "overlayId": "cardText2",
                                        "text": "" + tripsTable[i].summary + ""
                                    }
                                ]
                            },
                            {
                                "overlayId": "goToTripBriefingPageButton",
                                "actions": [
                                    {
                                        "action": "#goToPage",
                                        "trigger": "touchupinside",
                                        "data": {
                                            "pageId": "tripDetailPage",
                                            "transitionType": "slide"
                                        }
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "allTripsObj.spawnOverview(" + i + ");"
                                        }
                                    }
                                ]
                            },
                            {
                                "overlayId": "goToTripBriefingPageDocumentsButton",
                                "actions": [
                                    {
                                        "action": "#goToPage",
                                        "trigger": "touchupinside",
                                        "data": {
                                            "pageId": "tripDetailPage",
                                            "transitionType": "slide",
                                            "transitionDuration": 0.5
                                        }
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "allTripsObj.spawnDocs(" + i + ");"
                                        }
                                    },
                                    {
                                        "action": "bringToFront",
                                        "delay": 0.501,
                                        "target": "documentsTabContainer"
                                    },
                                    {
                                        "action": "bringToFront",
                                        "delay": 0.501,
                                        "target": "tabButtonsContainer"
                                    }
                                ]
                            },
                            {
                                "overlayId": "goToTripBriefingPageBiographiesButton",
                                "actions": [

                                    {
                                        "action": "#goToPage",
                                        "trigger": "touchupinside",
                                        "data": {
                                            "pageId": "tripDetailPage",
                                            "transitionType": "slide"
                                        }
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "allTripsObj.spawnBios(" + i + ");"
                                        }
                                    },
                                    {
                                        "action": "bringToFront",
                                        "delay": 0.01,
                                        "target": "biographiesTabContainer"
                                    },
                                    {
                                        "action": "bringToFront",
                                        "delay": 0.01,
                                        "target": "tabButtonsContainer"
                                    }
                                ]
                            },
                            {
                                "overlayId": "goToTripBriefingPageItineraryButton",
                                "actions": [
                                    {
                                        "action": "#goToPage",
                                        "trigger": "touchupinside",
                                        "data": {
                                            "pageId": "tripDetailPage",
                                            "transitionType": "slide"
                                        }
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "allTripsObj.spawnItinerary(" + i + ");"
                                        }
                                    },
                                    {
                                        "action": "bringToFront",
                                        "target": "itineraryTabContainer"
                                    },
                                    {
                                        "action": "bringToFront",
                                        "target": "tabButtonsContainer"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "overlayId": "attendee_view_attendee_image",
                        "imagesDefault": ["Spine/images/mapUnavailable.png"],
                        "dynamicSource": "url",
                        "type": "image",
                        "images": [
                            mapInsource
                        ],
                        "x": "390px",
                        "y": "180px",
                        "width": "285px",
                        "height": "285px",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "relative": "parent",
                        "scaleMode": "aspect-fill",
                        "clipToBounds": true,
                        "borderColor": "#696969"
                    },
                    {
                        "_overlayId": "beijingMap" + i
                    }
                ]
            });
        }


        if (allTripsPageOverlaysArray2.length == 0) {
            borg.runAction({
                "action": "setHiddenAction",
                "target": "allTripsNoTrips",
                "trigger": "now",
                "data": {
                    "hidden": false
                }
            });
        }
        else if (allTripsPageOverlaysArray2.length !== 0) {
            borg.runAction({
                "action": "setHiddenAction",
                "target": "allTripsNoTrips",
                "trigger": "now",
                "data": {
                    "hidden": true
                }
            });
            //moreBorg.containerSpawn(allTripsPageOverlaysArray2, 'tripCardsContainer', false);
            moreBorg.replaceOverlays('tripCardsContainer', allTripsPageOverlaysArray2);
            allTripsPageOverlaysArray2 = [];

        }


        borg.runAction({
            "action": "close",
            "trigger": "now",
            "target": "allTripsLoadSpinner"
        });
        borg.runAction({
            "action": "close",
            "target": "imageToPreventUsersFromMashingTheButtons",
            "delay": 1.2,
            "trigger": "now"
        });
    },
    spawnTitle: function (index) {
        //        var tripsTable = borg.getPersistentItem("talk.track.tables['trips']");
        var tripsTable = global.tripsTable;

        var tripName = tripsTable[tripIndex].tripName;
        tripName = (tripName.length > 44) ? tripName.substr(0, 44) + "..." : tripName;

        tripIndex = (!tripIndex) ? index : tripIndex;

        borg.runAction({
            "action": "spawnOnce",
            "target": "overviewTabContainer",
            "data": {
                "overlayId": "tripTitleTextMain",
                "type": "container",
                "x": "14px",
                "y": "5px",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "height": "80px",
                "width": "600px",
                "overlays": [
                    {
                        "overlayId": "fulltitle",
                        "relative": "screen",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "font": "FreightTextProBook-Regular",
                        "fontColor": "#FFFFFF",
                        "type": "text",
                        "text": tripName,
                        "size": "2.5em",
                        "width": "725px",
                        "height": "100px",
                        "textAlign": "left",
                        "x": "10px",
                        "y": "8px",
                        "_borderColor": "#0000ff"
                    },
                    {
                        "overlayId": "subtitle",
                        "type": "text",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#FFFFFF",
                        "textAlign": "left",
                        "relative": "screen",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "size": "1.3em",
                        "width": "600px",
                        "height": "100px",
                        "text": tripsTable[tripIndex].tripRange,
                        "x": "10px",
                        "y": "54px"

                    }
                ]
            }
        }); //this will place the container within a dual orientation container
    },
    spawnOverview: function (index) {
        //        var tripsTable = borg.getPersistentItem("talk.track.tables['trips']");
        var tripsTable = global.tripsTable;

        tripIndex = (!tripIndex) ? index : tripIndex;
        this.spawnTitle(tripIndex);

        borg.runAction({
            "action": "spawnOnce",
            "target": "container_overview_main",
            "data": {
                "overlayId": "overviewScrollingContainer",
                "overlays": [
                    {
                        "overlayId": "itinInnerTopContainer",
                        "overlays": [
                            {
                                "overlayId": "itinInnerTopContainerImage",
                                "images": ["Spine/images/fakePaperTopNoDivider.png"]
                            },
                            {
                                "overlayId": "tripTitleText",
                                "type": "text",
                                "text": "<strong>" + tripsTable[tripIndex].tripName + "</strong>",
                                "relative": "parent",
                                "height": "40px",
                                "width": "650px",
                                "x": "80px",
                                "y": "51px",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "textAlign": "left",
                                "_font": "FreightTextProBook-Regular",
                                "font": "Helvetica Neue",
                                "fontColor": "#f30617",
                                "size": "1.6em"
                            }
                        ]
                    },
                    {
                        "overlayId": "itinInnerMiddleContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {
                                "overlayId": "tripSummaryText",
                                "type": "text",
                                "text": tripsTable[tripIndex].overview,
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "width": "608px",
                                "verticalAlign": "top",
                                "textAlign": "left",
                                "font": "FreightTextProBook-Regular",
                                "size": "1.2em"
                            }

                        ]
                    },
                    {
                        "overlayId": "itinInnerBottomImage"
                    }
                ]
            }
        });
    },
    spawnBios: function (index) {
        //        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        //        var activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");
        var biosTable = global.biosTable;
        var activitiesTable = global.activitiesTable;
        var firstBioIdArray2 = [];

        borg.runAction(
            {
                "action": "close",
                "targets": [
                    "overviewBlocker"
                ]
            })
        var currPartGroups = {};
        tripParticipants = [];

        var bioTabOverlaysArray2 = [];

        tripIndex = (!tripIndex) ? index : tripIndex;
        this.spawnTitle(tripIndex);

        var partArray = [];
        for (i in activitiesTable) {
            if (activitiesTable[i].tripId == tripIndex) { //if this activity belongs to your current trip
                currPartGroups[activitiesTable[i].id] = activitiesTable[i].participantsGroups;
                for (k in currPartGroups[activitiesTable[i].id]) { //loop through the participant groups
                    for (var m = 0; m < currPartGroups[activitiesTable[i].id][k].length; m++) { // loop through participant group lists

                        bio_id = currPartGroups[activitiesTable[i].id][k][m]; //finally, an id to be used in the biographies table
                        a = jQuery.inArray(biosTable[bio_id], tripParticipants);
                        if (a == -1) {
                            tripParticipants[bio_id] = biosTable[bio_id];

                        } else {
                        }
                    }
                }
            }
        }

        tripParticipants = tripParticipants.filter(function (val) {
            return !(val === null);
        });

        tripParticipants.sort(sort_by('lastName', true, function (a) {
            return a.toUpperCase()
        }));


        if (tripParticipants.length > 0) {
            //
            //            var dudeArr = [];
            //            borg.setPersistentItem("talk.track.firstBioz", dudeArr);

            var dudeArr = borg.getPersistentItem("talk.track.firstBioz");

            if (!dudeArr) {
                dudeArr = [];
                borg.setPersistentItem('talk.track.firstBioz', dudeArr);
                dudeArr = borg.getPersistentItem('talk.track.firstBioz');
            } else {
            }


            dudeArr[tripIndex] = tripParticipants[0].id
            borg.setPersistentItem("talk.track.firstBioz", dudeArr);
        }
        //vertical scrolling container
        for (var i = 0; i < tripParticipants.length; i++) {

            firstBioIdArray2.push(tripParticipants[i].id);

            var name = tripParticipants[i].firstName + " " + tripParticipants[i].lastName;
            name = (name.length > 18) ? name.substr(0, 18) + "..." : name;
            var company = (tripParticipants[i].company.length > 22) ? tripParticipants[i].company.substr(0, 22) + "..." : tripParticipants[i].company;


            bioTabOverlaysArray2.push({
                "overlayId": "ab_vert_scroll_sub" + i,
                "type": "container",
                "width": "229px",
                "height": "62px",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "lazyLoad": true,
                "relative": "parent",
                "clipToBounds": true,
                "overlays": [
                    {
                        "overlayId": "ab_vert_trans_btn" + tripParticipants[i].id,
                        "type": "Button",
                        "width": "227px",
                        "height": "60px",
                        "images": [
                            "Spine/images/attendeeDivider.png"
                        ],
                        "imagesDown": [
                            "Spine/images/selectedCell.png"
                        ],
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "x": "0px",
                        "y": "-1px",
                        "verticalAlign": "top",
                        "toggle": true,
                        "radioGroup": "ab_vert",
                        "actions": [
                            {
                                "action": "close",
                                "trigger": "touchUpInside",
                                "target": "ab_image"
                            },
                            {
                                "_action": "runScriptAction",
                                "trigger": "toggleOn",
                                "target": "#jsBridge",
                                "data": {
                                    "script": "borg.setPersistentItem('talk.track.btn_check2', '" + tripParticipants[i].id + "');"
                                }
                            },
                            {
                                "action": "runScriptAction",
                                "trigger": "toggleOn",
                                "target": "#jsBridge",
                                "data": {
                                    "script": "allTripsObj.spawnCard(tripParticipants[" + i + "].id);"
                                }
                            }
                        ]
                    },
                    {
                        "overlayId": "ab_vert_scroll_name_value" + i,
                        "type": "text",
                        "text": "<strong>" + name + "</strong>",
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "width": "200px",
                        "height": "20px",
                        "x": "10px",
                        "y": "9px",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.0em",
                        "relative": "parent"
                    },
                    {
                        "overlayId": "ab_vert_scroll assoc_value" + i,
                        "type": "text",
                        "text": "<strong>" + company + "</strong>",
                        "width": "635px",
                        "height": "20px",
                        "x": "10px",
                        "y": "30px",
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "0.9em",
                        "relative": "parent"
                    }
                ]
            });
        }
        moreBorg.containerSpawn(bioTabOverlaysArray2, 'biosTab_vert_scroll_container', true);

        var firstBio2 = firstBioIdArray2[0];

        borg.setPersistentItem('talk.track.firstBio2', firstBio2);

        console.log(JSON.stringify(tripParticipants));

        var action2 = {
            "action": "runScriptAction",
            "delay": 0.3,
            "trigger": "now",
            "target": "#jsBridge",
            "data": {
                "script": "localJSONObject.toggleButton2();"
            }
        };
        borg.runAction(action2);
    },
    spawnItinerary: function (index) {
        //        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        //        var activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");
        var biosTable = global.biosTable;
        var activitiesTable = global.activitiesTable;

        borg.runAction(
            {
                "action": "close",
                "targets": [
                    "overviewBlocker"
                ]
            })
        tripIndex = (!tripIndex) ? index : tripIndex;
        this.spawnTitle(tripIndex);
        var rowOverlays = [];
        var itinTabOverlaysArray = [];
        var currPartGroups = {};
        currActivities = {};
        var rows;

        for (i in activitiesTable) {
            if (activitiesTable[i].tripId == tripIndex && activitiesTable[i].activityState != "Draft") { //if this activity belongs to your current trip
                currPartGroups[activitiesTable[i].id] = activitiesTable[i].participantsGroups;
                currActivities[activitiesTable[i].id] = activitiesTable[i];

                activityParticipants = [];
                for (k in currPartGroups[activitiesTable[i].id]) { //loop through the participant groups

                    for (var m = 0; m < currPartGroups[activitiesTable[i].id][k].length; m++) { // loop through participant group lists

                        bio_id = currPartGroups[activitiesTable[i].id][k][m]; //finally, an id to be used in the biographies table

                        if (biosTable.hasOwnProperty(bio_id)) {

                            //TODO: adjust to regular array for searching? alphabetize?
                            tripParticipants[bio_id] = biosTable[bio_id];
                            var a = biosTable[bio_id];

                            activityParticipants.push(a);
                        }
                    }
                }
                //add list of participants as property to an object, will be used later for itinerary view
                currActivities[activitiesTable[i].id].participants = activityParticipants;
            }
        }

        var lastDate;
        var dayNum = 0;
        //get list of participants
        for (i  in currActivities) {

            var peopleStr = '';
            var bgVal = '';
            //get string of participants for current activity
            for (j in currActivities[activitiesTable[i].id].participants) {
                if (currActivities[activitiesTable[i].id].participants[j].firstName) {
                    var b = currActivities[activitiesTable[i].id].participants[j].firstName + " " + currActivities[activitiesTable[i].id].participants[j].lastName + ", ";
                    peopleStr += b
                }

            }
            peopleStr = peopleStr.substring(0, peopleStr.length - 2);
            //var name = activitiesTable[i].activityName.substr(0, 101);
            if (activitiesTable[i].keyEvent == true) {
                var name = (activitiesTable[i].activityName.length > 72) ? activitiesTable[i].activityName.substr(0, 72) + "...>" : activitiesTable[i].activityName + ">";
            } else {
                var name = (activitiesTable[i].activityName.length > 72) ? activitiesTable[i].activityName.substr(0, 72) + "..." : activitiesTable[i].activityName + "";
            }
            var venue = (activitiesTable[i].venue.length > 130) ? activitiesTable[i].venue.substr(0, 130) + "..." : activitiesTable[i].venue;
            var pNotes = activitiesTable[i].itineraryNotes.substr(0, 123);
            pNotes = (pNotes.length > 122) ? pNotes += "..." : pNotes;
            peopleStr = (peopleStr.length > 100) ? peopleStr.substr(0, 100) + "..." : peopleStr;
            bgVal = (i % 2) ? "Spine/images/paperTexture.png" : "Spine/images/paperTextureDark.png";
            var useKey1 = '';
            useKey1 = (activitiesTable[i].keyEvent == true) ? "runScriptAction" : "azzzzdkfkfkfkf";
            var useKey2 = '';
            useKey2 = (activitiesTable[i].keyEvent == true) ? "#goToPage" : "azzzzdkfkfkfkf";
            var useKey3 = '';
            useKey3 = (activitiesTable[i].keyEvent == true) ? "#f30617" : "#3d3d3d";

            if (activitiesTable[i].activityDate != lastDate) {
                dayNum++;
                itinTabOverlaysArray.push({
                    "overlayId": "ab_vert_scroll_subz" + i,
                    "type": "container",
                    "width": "1538px",
                    "height": "20px",
                    "backgroundImage": "Spine/images/itinHeaderBackground.png",
                    "clipToBounds": true,
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "lazyLoad": true,
                    "relative": "parent",
                    "overlays": [
                    ]
                });

                row = {
                    "overlayId": "ab_vert_scroll_subz2" + i,
                    "type": "container",
                    "width": "1538px",
                    "height": "20px",
                    "backgroundImage": "Spine/images/itinDayDividerBackground.png",
                    "clipToBounds": true,
                    "borderWidth": "1px",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "lazyLoad": true,
                    "relative": "parent",
                    "overlays": [
                        {
                            "overlayId": "ab_vert_scroll_date_value" + i,
                            "type": "text",
                            "text": activitiesTable[i].activityDate3,
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "width": "300px",
                            "height": "60px",
                            "x": "80px",
                            "y": "5px",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#3d3d3d",
                            "size": "0.9em",
                            "relative": "parent"
                        },
                        {
                            "overlayId": "line1" + i,
                            "type": "container",
                            "width": "1px",
                            "height": "80px",
                            "backgroundImage": "Spine/images/verticalLine1x80px.png",
                            "relative": "parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "66px",
                            "y": "1px"
                        },
                        {
                            "overlayId": "line2" + i,
                            "type": "container",
                            "width": "1px",
                            "height": "80px",
                            "backgroundImage": "Spine/images/verticalLine1x80px.png",
                            "relative": "parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "386px",
                            "y": "1px"
                        },
                        {
                            "overlayId": "line3" + i,
                            "type": "container",
                            "width": "1px",
                            "height": "80px",
                            "backgroundImage": "Spine/images/verticalLine1x80px.png",
                            "relative": "parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "768px",
                            "y": "1px"
                        },
                        {
                            "overlayId": "line4" + i,
                            "type": "container",
                            "width": "1px",
                            "height": "80px",
                            "backgroundImage": "Spine/images/verticalLine1x80px.png",
                            "relative": "parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "1148px",
                            "y": "1px"
                        },
                        {
                            "overlayId": "ab_vert_scroll_date2_value" + i,
                            "type": "text",
                            "text": "<strong>" + "Day " + dayNum + "</strong>",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "width": "70px",
                            "height": "60px",
                            "x": "7px",
                            "y": "5px",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#3d3d3d",
                            "size": "0.9em",
                            "relative": "parent"
                        }
                    ]
                }
                rowOverlays.push(row);
            }

            //vertical scrolling container
            itinTabOverlaysArray.push({
                "overlayId": "ab_vert_scroll_sub" + i,
                "type": "container",
                "width": "400px",
                "height": "80px",
                "borderWidth": "1px",
                "backgroundImage": bgVal,
                "backgroundPosition": "center",
                "backgroundRepeat": "repeat",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "lazyLoad": true,
                "relative": "parent",
                "clipToBounds": true,
                "overlays": [

                    {
                        "overlayId": "ab_vert_scroll_time_value" + i,
                        "type": "text",
                        "text": "<strong>" + activitiesTable[i].activityStartTime + "-\n" + activitiesTable[i].activityEndTime + "</strong>",
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "width": "70px",
                        "height": "60px",
                        "x": "10px",
                        "y": "10px",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.2em",
                        "relative": "parent"
                    },
                    {
                        "overlayId": "ab_vert_scroll name_value" + i,
                        "type": "text",
                        "text": name,
                        "width": "300px",
                        "height": "80px",
                        "x": "80px",
                        "y": "45px",
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "center",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.35em",
                        "relative": "parent"
                    },
                    {
                        "overlayId": "ab_vert_trans_btn" + i,
                        "type": "Button",
                        "width": "400px",
                        "height": "80px",
                        "_images": [
                            "Spine/images/attendeeDivider.png"
                        ],
                        "_imagesDown": [
                            "Spine/images/selectedCell.png"
                        ],
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "1px",
                        "toggle": true,
                        "color": "#magic",
                        "radioGroup": "ab_vert",
                        "actions": [
                            {
                                "action": "runScriptAction",
                                "trigger": "toggleOn",
                                "target": "#jsBridge",
                                "data": {
                                    "script": "activityId = " + i + ";"
                                }
                            },
                            {
                                "action": "#goToPage",
                                "trigger": "touchupinside",
                                "data": {
                                    "pageId": "activityDetailPage2",
                                    "transitionType": "slide",
                                    "//transitionDuration": 0.5
                                }
                            }

                        ]
                    }
                ]
            });

            var timeDisp = '';
            if (activitiesTable[i].activityStartTime && activitiesTable[i].activityEndTime) {
                timeDisp = "<strong>" + activitiesTable[i].activityStartTime + "&nbsp;-\n" + activitiesTable[i].activityEndTime + "</strong>"
            } else if (!activitiesTable[i].activityEndTime && !activitiesTable[i].activityStartTime) {
                timeDisp = ""
            }
            else if (!activitiesTable[i].activityStartTime) {
                timeDisp = "<strong>" + "N/A" + "&nbsp;-\n" + activitiesTable[i].activityEndTime + "</strong>"
            }
            else if (!activitiesTable[i].activityEndTime) {
                timeDisp = "<strong>" + activitiesTable[i].activityStartTime + "</strong>"
            }

            row = {
                "overlayId": "ab_vert_scroll_sub" + i,
                "type": "container",
                "width": "1538px",
                "height": "80px",
                "backgroundImage": bgVal,
                "backgroundPosition": "center",
                "backgroundRepeat": "repeat",
                "clipToBounds": true,
                "borderWidth": "1px",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "lazyLoad": true,
                "relative": "parent",
                "overlays": [
                    {
                        "overlayId": "ab_vert_scroll_time_value" + i,
                        "type": "text",
                        "text": timeDisp,
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "width": "60px",
                        "height": "60px",
                        "x": "7px",
                        "y": "10px",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.2em",
                        "relative": "parent"
                    },
                    {
                        "overlayId": "ab_vert_scroll name_value" + i,
                        "type": "text",
                        "text": name,
                        "width": "290px",
                        "height": "60px",
                        "x": "80px",
                        "y": "40px",
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "center",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": useKey3,
                        "size": "1.2em",
                        "relative": "parent"
                    },
                    {
                        "overlayId": "ab_vert_scroll_venue_value" + i,
                        "type": "text",
                        "text": venue,
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "width": "354px",
                        "height": "60px",
                        "x": "400px",
                        "y": "10px",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.2em",
                        "relative": "parent"
                    },
                    {
                        "overlayId": "ab_vert_scroll_duration_value" + i,
                        "type": "text",
                        "text": peopleStr,
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "width": "350px",
                        "height": "60px",
                        "x": "782px",
                        "y": "10px",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.2em",
                        "relative": "parent"
                    },
                    {
                        "overlayId": "ab_vert_scroll_notes_value" + i,
                        "type": "text",
                        "text": pNotes,
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "width": "358px",
                        "height": "60px",
                        "x": "1162px",
                        "y": "10px",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.2em",
                        "relative": "parent"
                    },
                    {
                        "overlayId": "ab_vert_trans_btn2" + i,
                        "type": "Button",
                        "width": "1152px",
                        "height": "80px",
                        "_images": [
                            "Spine/images/attendeeDivider.png"
                        ],
                        "_imagesDown": [
                            "Spine/images/selectedCell.png"
                        ],
                        "color": "#magic",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "1px",
                        "actions": [
                            {
                                "action": "runScriptAction",
                                "trigger": "toggleOn",
                                "target": "#jsBridge",
                                "data": {
                                    "script": "activitiesDetailObj.spawnActivityDetail(" + i + ");"
                                }
                            }
                        ]
                    },
                    {
                        "overlayId": "ab_vert_trans_btn" + i,
                        "type": "Button",
                        "width": "400px",
                        "height": "80px",
                        "_images": [
                            "Spine/images/attendeeDivider.png"
                        ],
                        "_imagesDown": [
                            "Spine/images/selectedCell.png"
                        ],
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "1px",
                        "toggle": true,
                        "color": "#magic",
                        "radioGroup": "ab_vert",
                        "actions": [
                            {
                                "action": useKey1,
                                "trigger": "toggleOn",
                                "target": "#jsBridge",
                                "data": {
                                    "script": "activityId = " + i + ";"
                                }
                            },
                            {
                                "action": useKey2,
                                "trigger": "touchupinside",
                                "data": {
                                    "pageId": "activityDetailPage2",
                                    "transitionType": "slide"
                                }
                            }

                        ]
                    },
                    {
                        "overlayId": "line" + i,
                        "type": "container",
                        "width": "1px",
                        "height": "80px",
                        "backgroundImage": "Spine/images/verticalLine1x80px.png",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "66px",
                        "y": "1px"
                    },
                    {
                        "overlayId": "line2" + i,
                        "type": "container",
                        "width": "1px",
                        "height": "80px",
                        "backgroundImage": "Spine/images/verticalLine1x80px.png",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "386px",
                        "y": "1px"
                    },
                    {
                        "overlayId": "line3" + i,
                        "type": "container",
                        "width": "1px",
                        "height": "80px",
                        "backgroundImage": "Spine/images/verticalLine1x80px.png",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "1148px",
                        "y": "1px"
                    },
                    {
                        "overlayId": "line4" + i,
                        "type": "container",
                        "width": "1px",
                        "height": "80px",
                        "backgroundImage": "Spine/images/verticalLine1x80px.png",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "768px",
                        "y": "1px"
                    }
                ]
            }

            rowOverlays.push(row);

            lastDate = activitiesTable[i].activityDate
        }
        moreBorg.containerSpawn(itinTabOverlaysArray, 'itineraryTab_vert_scroll_container', true);
        moreBorg.containerSpawn(rowOverlays, 'itineraryTab_vert_scroll_container2', true);
        borg.runAction({
            "action": "close",
            "target": "imageToPreventUsersFromMashingTheButtons",
            "delay": 1.2,
            "trigger": "now"
        });
    },
    //upcoming builds
    spawnDocs: function (index) {

        if(!index){
            index = tripIndex;
        }

        borg.runAction(
            {
                "action": "close",
                "targets": [
                    "overviewBlocker"
                ]
            });
        tripIndex = (!tripIndex) ? index : tripIndex;

        var tripDocsUrl = global.tripsTable[tripIndex].workcloud_url;
        var tripDocsID = tripDocsUrl.slice(10+(tripDocsUrl.indexOf("collection"))).replace(/\//g,'');
       
        borg.setPersistentItem("trip.docs.id", tripDocsID);

        var jnjCollViewOverlayzz = {
            "overlayId": "CLOUD_collView",
            "defaultCollection": tripDocsID,
            "height": "740px",
            "y": "158px",
            "layoutProperties": {
                "contentWidth": "768px",
                "contentHeight": "140px",
                "edges":[0,0,0,0],
                "itemMappingQuery": [
                    "type"
                ],
                  "itemMapping": {
                    "collection":{
                        "column": 1,
                        "row": 1
                    }
                },
                "minimumLineSpacing": "0px",
                "minimumInteritemSpacing" :"0px"
            },
            "properties":{
                "backgroundColor": "#FFFFFF",
                "backgroundAlpha": 1
            },
            "item": {
                "animationId": "anim_fadeIn_collectionView",
                "layers":[
                    {
                        "type":"image",
                        "atIndex" : 0,
                        "x": "21px",
                        "y": "27px",
                        "width": "90px",
                        "height": "90px",
                        "borderWidth": "2px",
                        "image": "#fileiconpath"
                    },
                    {
                        "state": "installCompleted",
                        "atIndex" : 6,
                        "type":"overlay",
                        "verticalAlign": "top",
                        "horizontalAlign": "center",
                        "overlayId": "collectionView_btn_installedActions_tripDocs"
                    },
                    {
                        "type": "overlay",
                        "state": "downloadQueued",
                        "overlayId": "collectionView_btn_queuedActions_tripDocs",
                        "atIndex" : 6
                    },
                    {
                        "type": "overlay",
                        "state": "downloadStarted",
                        "overlayId": "collectionView_btn_queuedActions_tripDocs",
                        "atIndex" : 6
                    },
                    {
                        "type": "overlay",
                        "state": "installQueued",
                        "overlayId": "collectionView_btn_queuedActions_tripDocs",
                        "atIndex" : 6
                    },
                    {
                        "type": "overlay",
                        "state": "installStarted",
                        "overlayId": "collectionView_btn_queuedActions_tripDocs",
                        "atIndex" : 6
                    },
                    {
                        "type": "text",
                        "atIndex" : 1,
                        "x":"150px",
                        "y":"50px",
                        "width": "580px",
                        "height": "45px",
                        "textAlign": "left",
                        "lineBreak": 0,
                        "lineBreak": "tailTruncation",
                        "numberOfLines": 1,
                        "text": "#title",
                        "//customize": "change font properties below",
                        "font": "AvenirLTStd-Medium",
                        "fontColor": "#000000",
                        "fontSize": 1.6
                    },
                    {
                        "type": "overlay",
                        "overlayId": "1pxDivider_tripDocs",
                        "atIndex" : 9
                    },
                    {
                        "type": "overlay",
                        "overlayId": "collectionView_progressBar_tripDocs",
                        "atIndex" : 8, 
                        "packageID": "#packageID"
                    },
                    {
                        "//type": "backgroundColor",
                        "atIndex" : 1,
                        "backgroundColor": "#d3edf3",
                        "backgroundAlpha": 0.5
                    }
                ]
            },       
            "actions": [
                {
                    "action": "checkPackageStatus",
                    "trigger": "fileSelected",
                    "source": "CLOUD_collView",
                    "target": "#systemPackageDataRegistry",
                    "data": {
                        "packageID": "#packageID",
                        "type": "#type"
                    }
                },
                {
                    "action": "#subscribe",
                    "trigger": "stateInstallCompleted",
                    "source": "CLOUD_collView",
                    "data": {
                        "actionId": "collectionView_package-stateInstallCompleted"
                    }                   
                },
                {
                    "action": "#spawnOnce",
                    "trigger": "installCompleted",
                    "data": {
                        "overlayId": "collectionView_actionLogic-stateInstallCompleted"
                    }
                },
                {
                    "action": "runScriptAction",
                    "trigger": "loadData",
                    "target": "#jsBridge",
                    "data": {
                        "script": "sepSaveState.loadCollectionView();"
                    }
                },
                {
                    "action": "subscribe",
                    "target": "#eventManager",
                    "trigger": "now",
                    "data": {
                        "event": "sepFilterResultEmpty",
                        "actionId": "sepFilterResultEmptyAction"
                    }
                },
                {
                    "action": "subscribe",
                    "target": "#eventManager",
                    "trigger": "now",
                    "data": {
                        "event": "sepNoEntitledPackages",
                        "actionId": "sepNoEntitledPackagesAction"
                    }
                },
                {
                    "action": "subscribe",
                    "target": "#eventManager",
                    "trigger": "now",
                    "data": {
                        "event": "sepEmptyCollection",
                        "actionId": "sepEmptyCollectionAction"
                    }
                },
                {
                    "action": "#subscribe",
                    "trigger": "collectionViewPullRefresh",
                    "data": {
                        "actionId": "updates_collectionViewPullRefresh_loadDataAction"
                    }
                },
                {
                    "action": "#subscribe",
                    "trigger": "collectionViewRequestStarted",
                    "data": {
                        "actionId": "updates_collectionViewRequestStarted-spinner"
                    }
                },
                {
                    "//comment": "This is the general request finished event",
                    "action": "#subscribe",
                    "trigger": "collectionViewRequestFinished",
                    "data": {
                        "actionId": "updates_collectionViewRequestFinished-spinner"
                    }
                },
                {
                    "//comment": "This is the pull refresh request finish event",
                    "action": "#subscribe",
                    "trigger": "collectionViewPullRefreshFinished",
                    "data": {
                        "actionId": "updates_collectionViewRequestFinished-spinner"
                    }
                },
                {
                    "action": "#subscribe",
                    "trigger": "collectionViewPullRefreshFinished",
                    "data": {
                        "actionId": "updates_collectionViewPullRefresh_checkUpdates"
                    }
                },
                {
                    "action": "#subscribe",
                    "trigger": "collectionViewHightlightStarted",
                    "_target": "CLOUD_collView",
                    "data": {
                        "actionId": "refreshCellAction"
                    }
                },
                {
                    "action": "#subscribe",
                    "trigger": "collectionViewPullRefresh",
                    "_target": "CLOUD_collView",
                    "data": {
                        "actionId": "collectionViewPullRefresh"
                    }
                },
                {
                    "action": "#subscribe",
                    "trigger": "collectionViewPullRefreshFinished",
                    "_target": "CLOUD_collView",
                    "data": {
                        "actionId": "collectionViewPullRefreshFinished_allFilesList"
                    }
                }
            ]
        }

        borg.runAction({
            "action": "spawnOnce",
            "delay": 0.1,
            "trigger": "now",
            "target": "documentsTabContainer",
            "data": jnjCollViewOverlayzz
        });
        this.spawnTitle(tripIndex);
    }
};

var activitiesObj = {
    getTable: function () {

        if (isOnline === true) {

            var activitiesTable = {};
            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activities/" : "https://webapps-jnj-dev.smint.us/api/activities/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var ID = "userid=" + borg.getPersistentItem("talk.track.id");

            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    clearTimeout(xmlHttpTimeout);

                    var data = xmlhttp.responseText;

                    global.activitiesTable = JSON.parse(data).activities;

                    borg.setPersistentItem("talk.track.tables['activities']", JSON.parse(data).activities);

                    borg.setPersistentItem("talk.track.tables['activitiesSuccess']", JSON.parse(data).success);

                    // if (borg.pageId === "dashboardPage") {
                    //     dashboardObject.spawnData();
                    // }
                    if (borg.pageId === "activityDetailPage2") {
                        activitiesDetailObj.spawnActivityDetail();
                        activitiesDetailObj.activityStateNib();
                        activitiesDetailObj.activityParticipantsOverlays();
                    }
                    console.log('getting activities table - success');
                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    clearTimeout(xmlHttpTimeout);
                    var data = xmlhttp.responseText;
                    var activities403 = JSON.parse(data);

                    console.log('getting activities table - failure');

                    var success = activities403['success'];
                    var status = activities403['status'];

                    if (status == 'Invalid session.') {

                        login();
                        console.log('logging back in');
                    }

                    global.activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");

                    // if (borg.pageId === "dashboardPage") {
                    //     dashboardObject.spawnData();
                    // }
                    if (borg.pageId === "activityDetailPage2") {
                        activitiesDetailObj.spawnActivityDetail();
                        activitiesDetailObj.activityStateNib();
                        activitiesDetailObj.activityParticipantsOverlays();
                    }
                }
            }
            xmlhttp.open("GET", url + '?' + ID, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.withCredentials = true;
            xmlhttp.send();


            var xmlHttpTimeout = setTimeout(ajaxTimeout, 5000);

            function ajaxTimeout() {
                xmlhttp.abort();
                //alert("Request timed out-activities table");
                console.log("Request timed out");
                // if (borg.pageId === "dashboardPage") {
                //     dashboardObject.spawnData();
                // }

                if (borg.pageId === "activityDetailPage2") {
                    activitiesDetailObj.spawnActivityDetail();
                    activitiesDetailObj.activityStateNib();
                    activitiesDetailObj.activityParticipantsOverlays();
                }
            }
        }
        else if (isOnline === false) {

            // global.participantGroupsTable = borg.getPersistentItem("talk.track.tables['participantGroups']");
            // global.activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");

            // if (borg.pageId === "dashboardPage") {
            //     dashboardObject.spawnData();
            // }

            if (borg.pageId === "activityDetailPage2") {

                activitiesDetailObj.spawnActivityDetail();
                activitiesDetailObj.activityParticipantsOverlays();
                activitiesDetailObj.activityStateNib();
            }
        }
    }
};

var dashboardObject = {

    spawnData: function () {

        var activitiesTable = global.activitiesTable;

        var loadPage = borg.getPersistentItem("talk.track.tables['activitiesSuccess']");
        var dashboardOverlayArray = [];  //uke
        var dashboardOverlayArray2 = []; //rtr
        var dashboardOverlayArray3 = []; //ut
        var dashCheckTodayDate = new Date();
        var dashCheckTodayDate = dashCheckTodayDate.yyyymmdd();

        function dashLoad1() {
            if (loadPage === true) {
                clearInterval(dashInterval1);

                borg.runAction({
                    "action": "toggleButtonOn",
                    "trigger": "now",
                    "target": "dashboardTabButton"
                });
                borg.runAction({
                    "action": "spawnOnce",
                    "target": "dashboardPage_container",
                    "trigger": "now",
                    "data": {
                        "overlayId": "dashboardHorizClip_container",
                        "relative": "container"
                    }
                });
                borg.runAction({
                    "action": "spawnOnce",
                    "target": "dashboardHorizClip_container",
                    "trigger": "now",
                    "data": {
                        "overlayId": "dashboard_horiz_scroll_data_container",
                        "relative": "container"
                    }
                });
                borg.runAction({
                    "action": "#spawnOnce",
                    "trigger": "now",
                    "data": {
                        "overlayId": "dashboardReadyToReviewOutercontainer",
                        "backgroundImage": "Spine/images/dashboardListViewPanel.png",
                        "type": "container",
                        "x": "17px",
                        "y": "338px",
                        "width": "366px",
                        "height": "527px",
                        "relative": "screen",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "overlays": [
                            {
                                "overlayId": "dashboardReadyToReviewTitleBar",
                                "type": "container",
                                "backgroundImage": "Spine/images/upcomingTripsTitleBar.png",
                                "x": "9px",
                                "y": "6px",
                                "width": "348px",
                                "height": "45px",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top"
                            },
                            {
                                "overlayId": "dashboardKeyEventsTitleTxt"
                            },
                            {
                                "overlayId": "dashboardReadyToReviewDataContainer",
                                "type": "container",
                                "alpha": 0.75,
                                "width": "347px",
                                "height": "464px",
                                "layoutType": "flow",
                                "layoutOptions": {
                                    "margin-top": "0px",
                                    "marginY": "0px",
                                    "paddingY": "0px",
                                    "margin-bottom": "0px",
                                    "margin-left": "0px",
                                    "marginX": "0px",
                                    "paddingX": "0px",
                                    "margin-right": "0px"
                                },
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "x": "10px",
                                "y": "50px",
                                "userScrolling": "vertical"
                            }
                        ]
                    }
                });

                borg.runAction({
                    "action": "#spawnOnce",
                    "trigger": "now",
                    "data": {
                        "overlayId": "noRTRText"
                    }
                });
                borg.runAction({
                    "action": "#spawnOnce",
                    "trigger": "now",
                    "data": {
                        "overlayId": "dashboardUpcomingTripsOuterContainer",
                        "backgroundImage": "Spine/images/dashboardListViewPanel.png",
                        "type": "container",
                        "x": "384px",
                        "y": "338px",
                        "width": "366px",
                        "height": "527px",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "overlays": [
                            {
                                "overlayId": "dashboardUpcomingTripsTitleBar",
                                "type": "container",
                                "backgroundImage": "Spine/images/upcomingTripsTitleBar.png",
                                "x": "9px",
                                "y": "6px",
                                "width": "348px",
                                "height": "45px",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "overlays": [
                                    {
                                        "overlayId": "dashboardUpcomingTripsTitleTxt",
                                        "type": "text",
                                        "text": "<span style='text-shadow:0px -0.5px 0px #044e69'>Upcoming Trips</span>",
                                        "textAlign": "left",
                                        "horizontalAlign": "left",
                                        "verticalAlign": "top",
                                        "width": "325px",
                                        "height": "40px",
                                        "x": "16px",
                                        "y": "15px",
                                        "font": "AkzidenzGroteskPro-Md",
                                        "fontColor": "#FFFFFF",
                                        "size": "1.4em",
                                        "relative": "parent"
                                    }
                                ]
                            },
                            {
                                "overlayId": "dashboardUpcomingTripsDataContainer",
                                "type": "container",
                                "alpha": 0.75,
                                "width": "347px",
                                "height": "464px",
                                "layoutType": "flow",
                                "layoutOptions": {
                                    "margin-top": "0px",
                                    "marginY": "0px",
                                    "paddingY": "0px",
                                    "margin-bottom": "0px",
                                    "margin-left": "0px",
                                    "marginX": "0px",
                                    "paddingX": "0px",
                                    "margin-right": "0px"
                                },
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "x": "10px",
                                "y": "50px",
                                "userScrolling": "vertical"
                            }
                        ]
                    }
                });

                borg.runAction({
                    "action": "#spawnOnce",
                    "trigger": "now",
                    "data": {
                        "overlayId": "noUTText"
                    }
                });

                //uke
                for (i in activitiesTable) {
                    if (activitiesTable[i].keyEvent === true && activitiesTable[i].activityState != "Draft" && activitiesTable[i]._activityDate >= dashCheckTodayDate) {
                        var activityName = (activitiesTable[i].activityName.length > 55) ? activitiesTable[i].activityName.substr(0, 55) + "..." : activitiesTable[i].activityName;
                        var activityDate = activitiesTable[i].activityDate;
                        var venue = (activitiesTable[i].venue.length > 30) ? activitiesTable[i].venue.substr(0, 30) + "..." : activitiesTable[i].venue;
                        var tripName = (activitiesTable[i].tripName.length > 18) ? activitiesTable[i].tripName.substr(0, 18) + "..." : activitiesTable[i].tripName;

                        dashboardOverlayArray.push({

                            "overlayId": "dashboardHorizScrollDataSub_container",
                            "overlays": [
                                {
                                    "overlayId": "dashboardUKEBtn",
                                    "actions": [
                                        {
                                            "action": "toggleButtonOff",
                                            "trigger": "touchUpInside",
                                            "target": "dashboardTabButton"
                                        },
                                        {
                                            "action": "close",
                                            "targets": ["tabBarBlockerDashboard", "tabBarBlockerAllTrips" ]
                                        },
                                        {
                                            "action": "runScriptAction",
                                            "trigger": "touchUpInside",
                                            "target": "#jsBridge",
                                            "data": {
                                                "script": "var activityId=" + i + ";"
                                            }
                                        },
                                        {
                                            "action": "runScriptAction",
                                            "trigger": "touchUpInside",
                                            "target": "#jsBridge",
                                            "data": {
                                                "script": "borg.setPersistentItem('talk.track.switchID'," + i + ");"
                                            }
                                        },
                                        {
                                            "action": "#spawnOnce",
                                            "trigger": "touchUpInside",
                                            "data": {
                                                "overlayId": "imageToPreventUsersFromMashingTheButtons"
                                            }
                                        },
                                        {
                                            "action": "#goToPage",
                                            "trigger": "touchUpInside",
                                            "delay": 0.001,
                                            "data": {
                                                "pageId": "activityDetailPage2",
                                                "transitionType": "crossfade"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "overlayId": "dashboard_UKE_activityLocalTimeStart",
                                    "text": activityDate
                                },
                                {
                                    "overlayId": "ukeTripName",
                                    "text": tripName
                                },
                                {
                                    "overlayId": "dashboard_UKE_ActivityName",
                                    "text": "<span style='text-shadow:0px -0.5px 0px #c5c4bf'><strong>" + activityName + "</strong></span>"
                                },
                                {
                                    "overlayId": "dashboard_UKE_venue",
                                    "text": "<strong>" + venue + "</strong>"
                                }
                            ]
                        });
                    }
                }
                if (dashboardOverlayArray.length == 0) {

                    borg.runAction({
                        "action": "setHiddenAction",
                        "target": "noUKEText",
                        "trigger": "now",
                        "data": {
                            "hidden": false
                        }
                    });
                }
                else if (dashboardOverlayArray.length !== 0) {

                    borg.runAction({
                        "action": "setHiddenAction",
                        "target": "noUKEText",
                        "trigger": "now",
                        "data": {
                            "hidden": true
                        }
                    });

                    moreBorg.containerSpawn(dashboardOverlayArray, 'dashboard_horiz_scroll_data_container', false);
                    dashboardOverlayArray = [];
                }

                //rtr
                for (i in activitiesTable) {
                    if (activitiesTable[i].keyEvent === true && activitiesTable[i].activityState == 'Review' && activitiesTable[i]._activityDate >= dashCheckTodayDate) {
                        var activityName = (activitiesTable[i].activityName.length > 30) ? activitiesTable[i].activityName.substr(0, 30) + "..." : activitiesTable[i].activityName;
                        var activityDate = activitiesTable[i].activityDate;
                        var venue = (activitiesTable[i].venue.length > 30) ? activitiesTable[i].venue.substr(0, 30) + "..." : activitiesTable[i].venue;


                        dashboardOverlayArray2.push({
                            "overlayId": "dashboardReadyToReviewDataSubContainer",
                            "overlays": [
                                {
                                    "overlayId": "dashboardReadyToReviewBtn",
                                    "actions": [
                                        {
                                            "action": "toggleButtonOff",
                                            "trigger": "touchUpInside",
                                            "target": "dashboardTabButton"
                                        },
                                        {
                                            "action": "close",
                                            "targets": ["tabBarBlockerDashboard", "tabBarBlockerAllTrips" ]
                                        },
                                        {
                                            "action": "runScriptAction",
                                            "trigger": "touchUpInside",
                                            "target": "#jsBridge",
                                            "data": {
                                                "script": "var activityId=" + i + ";"
                                            }
                                        },
                                        {
                                            "action": "runScriptAction",
                                            "trigger": "touchUpInside",
                                            "target": "#jsBridge",
                                            "data": {
                                                "script": "borg.setPersistentItem('talk.track.switchID'," + i + ");"
                                            }
                                        },
                                        {
                                            "action": "#spawnOnce",
                                            "trigger": "touchUpInside",
                                            "data": {
                                                "overlayId": "imageToPreventUsersFromMashingTheButtons"
                                            }
                                        },
                                        {
                                            "action": "#goToPage",
                                            "trigger": "touchUpInside",
                                            "delay": 0.001,
                                            "data": {
                                                "pageId": "activityDetailPage2",
                                                "transitionType": "crossfade"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "overlayId": "dashboardReadyToReviewActivityTxt",
                                    "text": activityName

                                },
                                {
                                    "overlayId": "dashboardReadyToReviewDateAndVenueTxt",
                                    "text": "<strong>" + activityDate + " " + venue + "</strong>"
                                }
                            ]
                        });
                    }
                }
                if (dashboardOverlayArray2.length == 0) {

                    borg.runAction({
                        "action": "setHiddenAction",
                        "target": "noRTRText",
                        "trigger": "now",
                        "data": {
                            "hidden": false
                        }
                    });
                }
                else if (dashboardOverlayArray2.length !== 0) {

                    borg.runAction({
                        "action": "setHiddenAction",
                        "target": "noRTRText",
                        "trigger": "now",
                        "data": {
                            "hidden": true
                        }
                    });

                    moreBorg.containerSpawn(dashboardOverlayArray2, 'dashboardReadyToReviewDataContainer', false);
                    dashboardOverlayArray2 = [];
                }

                //ut
                var tripsTable = global.tripsTable;

                for (i in tripsTable) {

                    var summary = (tripsTable[i].summary.length > 119) ? tripsTable[i].summary.substr(0, 119) + "..." : tripsTable[i].summary;
                    var tripName = (tripsTable[i].tripName.length > 35) ? tripsTable[i].tripName.substr(0, 35) + "..." : tripsTable[i].tripName;

                    dashboardOverlayArray3.push({
                        "overlayId": "dashboardUpcomingTripsDataSubContainer" + i,
                        "type": "container",
                        "width": "347px",
                        "height": "120px",
                        "clipToBounds": true,
                        "relative": "parent",
                        "overlays": [
                            {
                                "overlayId": "dashboardUpcomingTripsBtn",
                                "actions": [
                                    {
                                        "action": "toggleButtonOff",
                                        "trigger": "touchUpInside",
                                        "target": "dashboardTabButton"
                                    },
                                    {
                                        "action": "close",
                                        "targets": ["tabBarBlockerDashboard", "tabBarBlockerAllTrips" ]
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "trigger": "touchUpInside",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "var tripIndex=" + i + ";"
                                        }
                                    },
                                    {
                                        "action": "#spawnOnce",
                                        "trigger": "touchUpInside",
                                        "data": {
                                            "overlayId": "imageToPreventUsersFromMashingTheButtons"
                                        }
                                    },
                                    {
                                        "action": "#goToPage",
                                        "trigger": "touchupinside",
                                        "data": {
                                            "pageId": "tripDetailPage",
                                            "transitionType": "slide"
                                        }
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "allTripsObj.spawnOverview(" + i + ");"
                                        }
                                    }
                                ]
                            },
                            {
                                "overlayId": "dashboardUpcomingTripsTripNameTxt",
                                "text": tripName
                            },
                            {
                                "overlayId": "dashboardUpcomingTripsTripDatesTxt",
                                "text": "<strong>" + tripsTable[i].tripRange + "</strong>"
                            },
                            {
                                "overlayId": "dashboardUpcomingTripsSummaryTxt",
                                "text": summary,
                                "lineHeight": "15.0px"

                            }
                        ]
                    });
                }

                if (dashboardOverlayArray3.length == 0) {

                    borg.runAction({
                        "action": "setHiddenAction",
                        "target": "noUTText",
                        "trigger": "now",
                        "data": {
                            "hidden": false
                        }
                    });
                }
                else if (dashboardOverlayArray3.length !== 0) {

                    borg.runAction({
                        "action": "setHiddenAction",
                        "target": "noUTText",
                        "trigger": "now",
                        "data": {
                            "hidden": true
                        }
                    });
                    moreBorg.containerSpawn(dashboardOverlayArray3, 'dashboardUpcomingTripsDataContainer', false);
                    dashboardOverlayArray3 = [];
                }


                borg.runAction({
                    "action": "close",
                    "trigger": "now",
                    "target": "dashboardLoadSpinner"
                });
                borg.runAction({
                    "action": "close",
                    "target": "imageToPreventUsersFromMashingTheButtons",
                    "trigger": "now"
                });
            }
        }

        var dashInterval1 = setInterval(dashLoad1, 100);
    }
};

var activitiesDetailObj = {
    activityStateNib: function () {

        var activitiesTable = global.activitiesTable;
        borg.getOverlayById('activityReadyToReviewNibSwipeArea').onTouchDown = function (info) {
            var start = info.screenX;
            borg.getOverlayById('activityReadyToReviewNibSwipeArea').onTouchMoved = function (info) {
                var end = info.screenX;

                if (activitiesTable[activityId].activityState === 'Review') {
                    if (start < end) {
                        moreBorg.animate('activityReadyToReviewNibImage', 'moveNibRight');
                        borg.runAction({"action": "playSoundAction", "target": "#systemAudio", "data": {"soundFile": "Spine/images/unlock.mp3"}});

                        //data continutity while offline
                        activitiesTable[activityId].activityState = 'Final';
                        borg.setPersistentItem("talk.track.tables['activities']", activitiesTable);

                        borg.setText('activityReadyForReviewMessageText', yyy);

                        var status = "Final";
                        post.activity(activityId, status);
                    }

                }
                else if (activitiesTable[activityId].activityState === 'Final') {
                    if (start > end) {
                        moreBorg.animate('activityReadyToReviewNibImage', 'moveNibLeft');
                        borg.runAction({"action": "playSoundAction", "target": "#systemAudio", "data": {"soundFile": "Spine/images/unlock.mp3"}});

                        //data continutity while offline
                        activitiesTable[activityId].activityState = 'Review';
                        borg.setPersistentItem("talk.track.tables['activities']", activitiesTable);

                        borg.setText('activityReadyForReviewMessageText', xxx);

                        var status = "Review";

                        post.activity(activityId, status);
                    }
                }
            };
        };
    },
    nibX: function () { //Sets the activityDetail Ready for Review Nib to its appropriate X position based on data...
        var activitiesTable = global.activitiesTable;
        var nibXReview = "618.25px";
        var nibXFinal = "664.3px";

        if (activitiesTable[activityId].activityState === 'Review') {
            return nibXReview;
        }
        else if (activitiesTable[activityId].activityState === 'Final') {
            return nibXFinal;
        }
    },
    nibText: function () {
        //        var activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");
        var activitiesTable = global.activitiesTable;
        //Sets the activityDetail Ready for Review Nib to its appropriate X position based on data...
        xxx = "<span style='text-shadow:0px 1px 0px #61d3ec'><strong>This activity is ready for review.</strong></span>";
        yyy = "<span style='text-shadow:0px 1px 0px #61d3ec'><strong>This activity is marked as final.</strong></span>";

        if (activitiesTable[activityId].activityState === 'Review') {
            return xxx;
        }
        else if (activitiesTable[activityId].activityState === 'Final') {
            return yyy;
        }
    },
    spawnActivityDetail: function () {
        var activitiesTable = global.activitiesTable;

        //        var activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");
        //get rid of previous playlist info

        //TODO: add back in if weird behavior arises
        //        ddSort.clear();

        //        alert(JSON.stringify(gVars.oldPlaylists))
        //        if(gVars.oldPlaylists[activityId] != null){
        //
        //            ddSort.clear();
        //            ddSort.playlist = gVars.oldPlaylists[activityId];
        //
        //        }
        //


        //only spawn when data is ready
        var loadPage = borg.getPersistentItem("talk.track.tables['activitiesSuccess']");

        var timeDisp = '';
        if (activitiesTable[activityId].activityStartTime && activitiesTable[activityId].activityEndTime) {
            timeDisp = activitiesTable[activityId].activityStartTime + " - " + activitiesTable[activityId].activityEndTime;
        } else if (!activitiesTable[activityId].activityEndTime && !activitiesTable[activityId].activityStartTime) {
            timeDisp = "N/A"
        }
        else if (!activitiesTable[activityId].activityStartTime) {
            timeDisp = "N/A" + " - " + activitiesTable[activityId].activityEndTime;
        }
        else if (!activitiesTable[activityId].activityEndTime) {
            timeDisp = activitiesTable[activityId].activityStartTime + " - " + "N/A";
        }


        borg.runAction({
            "action": "#spawnOnce",
            "trigger": "now",
            "data": {
                "overlayId": "activityDetailTripDetailsBackButton",
                "actions": [
                    {
                        "action": "close",
                        "trigger": "touchUpInside",
                        "target": "activityDetailTripDetailsBackButton"
                    },
                    {

                        "action": "runScriptAction",
                        "trigger": "touchUpInside",
                        "target": "#jsBridge",
                        "data": {
                            "script": "var tripIndex=" + activitiesTable[activityId].tripId + ";"
                        }
                    },
                    {
                        "action": "#goToPage",
                        "trigger": "touchupinside",
                        "data": {
                            "pageId": "tripDetailPage",
                            "transitionType": "slideback"
                        }
                    },
                    {
                        "action": "runScriptAction",
                        "target": "#jsBridge",
                        "data": {
                            "script": "allTripsObj.spawnItinerary(" + activitiesTable[activityId].tripId + ");"
                        }
                    },
                    {
                        "action": "bringToFront",
                        "target": "itineraryTabContainer"
                    },
                    {
                        "action": "bringToFront",
                        "target": "tabButtonsContainer"
                    }
                ]
            }
        });
        borg.runAction({
            "action": "spawnOnce",
            "target": "activityPageScrollingContainer",
            "trigger": "now",
            "data": {
                "overlayId": "activityDataContainer",
                "relative": "container",
                "x": "",
                "y": "",
                "overlays": [
                    {
                        "overlayId": "activityReadyForReviewContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {
                                "overlayId": "activityReadyForReviewContainerBGImage"
                            },
                            {
                                "overlayId": "activityReadyForReviewMessageText",
                                "text": activitiesDetailObj.nibText()
                            },
                            {
                                "overlayId": "activityReadyForReviewReviewText"
                            },
                            {
                                "overlayId": "activityReadyForReviewFinalText"
                            },
                            {
                                "overlayId": "activityReadyToReviewNibImage",
                                "x": activitiesDetailObj.nibX()
                            },
                            {
                                "overlayId": "activityReadyToReviewNibSwipeArea"
                            }
                        ]
                    },
                    {
                        "overlayId": "tripTitleContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {
                                "overlayId": "tinyTripGlyph"
                            },
                            {
                                "overlayId": "tripTitleText",
                                "text": activitiesTable[activityId].tripName,
                                "x": "",
                                "y": ""
                            }
                        ],
                        "_borderWidth": "1px",
                        "_borderColor": "#0000ff"
                    },
                    {
                        "overlayId": "activityTitleContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {
                                "overlayId": "activityTitleText",
                                "text": "<span style='text-shadow:0px 1px 0px #f3f3f3'><strong>" + activitiesTable[activityId].activityName.substring(0, 80) + "..." + "</strong></span>",
                                "text": activitiesTable[activityId].activityName.substring(0, 80),
                                "x": "",
                                "y": ""
                            }
                        ],
                        "_borderWidth": "1px",
                        "_borderColor": "#ff0000"
                    },
                    {

                        "overlayId": "activityPanelPreContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {
                                "overlayId": "containerSpacer",
                                "x": "",
                                "y": "",
                                "_borderWidth": "1px",
                                "_borderColor": "#0000ff"
                            },
                            {
                                "overlayId": "localTimeContainer",
                                "x": "",
                                "y": "",
                                "overlays": [
                                    {
                                        "overlayId": "activityLocalTimeLabel2",
                                        "x": "",
                                        "y": "",
                                        "_borderWidth": "1px",
                                        "_borderColor": "#ff0000"
                                    },
                                    {
                                        "overlayId": "activityLocalTimeText2",
                                        "text": timeDisp,
                                        "x": "",
                                        "y": "",
                                        "_borderWidth": "1px",
                                        "_borderColor": "#0000ff"
                                    }
                                ],
                                "_borderWidth": "1px",
                                "_borderColor": "#ff00ff"
                            },
                            {
                                "overlayId": "containerSpacer",
                                "x": "",
                                "y": "",
                                "width": "6px",
                                "_borderWidth": "1px",
                                "_borderColor": "#0000ff"
                            },
                            {
                                "overlayId": "dateContainer",
                                "x": "",
                                "y": "",
                                "overlays": [
                                    {
                                        "overlayId": "activityDateLabel2",
                                        "x": "",
                                        "y": "",
                                        "_borderWidth": "1px",
                                        "_borderColor": "#0000ff"
                                    },
                                    {
                                        "overlayId": "activityDateText2",
                                        "text": activitiesTable[activityId].activityDate,
                                        "x": "",
                                        "y": "",
                                        "_borderWidth": "1px",
                                        "_borderColor": "#0000ff"
                                    }
                                ],
                                "_borderWidth": "1px",
                                "_borderColor": "#0000ff"
                            },
                            {
                                "overlayId": "containerSpacer2",
                                "type": "container",
                                "backgroundImage": "",
                                "relative": "screen",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "overlays": [],
                                "x": "",
                                "y": "",
                                "width": "6px",
                                "height": "13px",
                                "_borderWidth": "1px",
                                "_borderColor": "#0000ff"
                            },
                            {
                                "overlayId": "durationContainer",
                                "x": "",
                                "y": "",
                                "overlays": [
                                    {
                                        "overlayId": "activityDurationLabel2",
                                        "x": "",
                                        "y": "",
                                        "_borderWidth": "1px",
                                        "_borderColor": "#0000ff"
                                    },
                                    {
                                        "overlayId": "activityDurationText2",
                                        "text": activitiesTable[activityId].duration,
                                        "x": "",
                                        "y": "",
                                        "_borderWidth": "1px",
                                        "_borderColor": "#0000ff"
                                    }
                                ],
                                "_borderWidth": "1px",
                                "_borderColor": "#ff00ff"
                            },
                            {
                                "overlayId": "containerSpacer3",
                                "type": "container",
                                "backgroundImage": "",
                                "relative": "screen",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "overlays": [],
                                "x": "",
                                "y": "",
                                "width": "6px",
                                "height": "9px",
                                "_borderWidth": "1px",
                                "_borderColor": "#0000ff"
                            },
                            {
                                "overlayId": "venueContainer",
                                "x": "",
                                "y": "",
                                "overlays": [
                                    {
                                        "overlayId": "activityVenueLabel2",
                                        "x": "",
                                        "y": "",
                                        "_borderWidth": "1px",
                                        "_borderColor": "#0000ff"
                                    },
                                    {
                                        "overlayId": "activityVenueText2",
                                        "text": activitiesTable[activityId].venue,
                                        "x": "",
                                        "y": "",
                                        "_borderWidth": "1px",
                                        "_borderColor": "#0000ff"
                                    }
                                ],
                                "_borderWidth": "1px",
                                "_borderColor": "#ff00ff"
                            }
                        ],
                        "_borderWidth": "1px",
                        "_borderColor": "#ff00ff"
                    },
                    {

                        "overlayId": "activityPanelTwoContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {
                                "overlayId": "spacer24",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true,
                                "x": "",
                                "y": "",
                                "width": "25px",
                                "height": "6px"
                            },
                            {
                                "overlayId": "activityLanguageLabel",
                                "x": "",
                                "y": ""
                            },
                            {
                                "overlayId": "spacer25",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true,
                                "x": "",
                                "y": "",
                                "width": "768",
                                "height": "8px"
                            },
                            {
                                "overlayId": "spacer26",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true,
                                "x": "",
                                "y": "",
                                "width": "25px",
                                "height": "7px"
                            },
                            {
                                "overlayId": "activityLanguageText",
                                "text": activitiesTable[activityId].language,
                                "x": "",
                                "y": ""
                            },
                            {
                                "overlayId": "spacer27",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true,
                                "x": "",
                                "y": "",
                                "width": "768px",
                                "height": "15px"
                            },
                            {
                                "overlayId": "spacer28",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true,
                                "x": "",
                                "y": "",
                                "width": "25px",
                                "height": "6.1px"
                            },
                            {
                                "overlayId": "activityYourRoleLabel",
                                "x": "",
                                "y": ""
                            },
                            {
                                "overlayId": "spacer29",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true,
                                "x": "",
                                "y": "",
                                "width": "768px",
                                "height": "8.1px"
                            },
                            {
                                "overlayId": "spacer30",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true,
                                "x": "",
                                "y": "",
                                "width": "25px",
                                "height": "24px"
                            },
                            {
                                "overlayId": "activityYourRoleText",
                                "text": activitiesTable[activityId].yourRole,
                                "x": "",
                                "y": ""
                            },
                            {
                                "overlayId": "spacer31",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true,
                                "x": "",
                                "y": "",
                                "height": "16px",
                                "width": "16px"
                            }
                        ],
                        "_borderWidth": "1px",
                        "_borderColor": "#ff0000"
                    },
                    {

                        "overlayId": "activityProgramContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {
                                "overlayId": "activityDividerLine",
                                "x": "",
                                "y": ""
                            },
                            {
                                "overlayId": "spacer",
                                "x": "",
                                "y": "",
                                "width": "768px",
                                "height": "18px"
                            },
                            {
                                "overlayId": "spacer",
                                "x": "",
                                "y": "",
                                "width": "26px"
                            },
                            {
                                "overlayId": "activityProgramLabel",
                                "x": "",
                                "y": ""
                            },
                            {
                                "overlayId": "spacer",
                                "width": "768px",
                                "height": "14px",
                                "x": "",
                                "y": ""
                            },
                            {
                                "overlayId": "spacer",
                                "x": "",
                                "y": "",
                                "width": "28px"
                            },
                            {
                                "overlayId": "activityProgramText",
                                "text": activitiesTable[activityId].activityNotes, //check the object model
                                "x": "",
                                "y": ""
                            }
                        ]
                    },
                    {
                        "overlayId": "activityParticipantsOuterContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {
                                "overlayId": "activityDividerLine",
                                "x": "",
                                "y": ""
                            },
                            {
                                "overlayId": "spacer96",
                                "x": "",
                                "y": "",
                                "width": "768px",
                                "height": "24px",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true
                            },
                            {

                                "overlayId": "spacer97",
                                "x": "",
                                "y": "",
                                "width": "26px",
                                "height": "12px",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true
                            },
                            {
                                "overlayId": "activityParticipantsLabel",
                                "x": "",
                                "y": ""
                            },
                            // {
                            //     "overlayId" : "noParticipantsLabel",
                            // },                            
                            {

                                "overlayId": "spacer98",
                                "x": "",
                                "y": "",
                                "width": "768px",
                                "height": "12px",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true
                            },
                            {
                                "overlayId": "spacer99",
                                "x": "",
                                "y": "",
                                "height": "60px",
                                "width": "26px",
                                "type": "container",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "borderWidth": "1px",
                                "borderColor": "#FF7F00",
                                "hidden": true
                            },
                            {
                                "overlayId": "activityParticipantsShadowContainer",
                                "x": "",
                                "y": ""
                            }/*,
                             {
                             "overlayId": "spacer",
                             "x": "",
                             "y": "",
                             "width": "768px",
                             "height": "26px"
                             }
                             //cut here
                             {
                             "overlayId": "spacer",
                             "x": "",
                             "y": "",
                             "width": "24px",
                             "height": "26px"
                             },
                             {
                             "overlayId": "activityAttendeesLabel",
                             "x": "",
                             "y": ""
                             },
                             {
                             "overlayId": "spacer",
                             "x": "",
                             "y": "",
                             "width": "600px",
                             "height": "35px"
                             },
                             {
                             "overlayId": "spacer",
                             "x": "",
                             "y": "",
                             "height": "100",
                             "width": "26px"
                             },
                             {
                             "overlayId": "activityAttendeesText",
                             "text": "" + activitiesTable[activityId].attendees,
                             "x": "",
                             "y": ""
                             }*/
                        ]
                    },
                    {

                        "overlayId": "activityRemarksOuterContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {

                                "overlayId": "activityDividerLine",
                                "x": "",
                                "y": ""
                            },
                            {
                                "overlayId": "activityRemarksInnerTopMiddleBottomContainer",
                                "x": "",
                                "y": "",
                                "overlays": [
                                    {

                                        "overlayId": "activityRemarksInnerTopContainer",
                                        "x": "",
                                        "y": "",
                                        "overlays": [
                                            {
                                                "overlayId": "activityRemarksInnerTopContainerImage"
                                            },
                                            {
                                                "overlayId": "activityRemarksLabel"
                                            }
                                        ]
                                    },
                                    {

                                        "overlayId": "activityRemarksInnerMiddleContainer",
                                        "x": "",
                                        "y": ""
                                    },
                                    {

                                        "overlayId": "activityRemarksInnerBottomImage",
                                        "x": "",
                                        "y": ""
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "overlayId": "activityFollowUpNotesOuterContainer",
                        "x": "",
                        "y": "",
                        "overlays": [
                            {
                                "overlayId": "activityDividerLine",
                                "x": "",
                                "y": ""
                            },
                            {

                                "overlayId": "spacer",
                                "x": "",
                                "y": "",
                                "width": "16px"
                            },
                            {
                                "overlayId": "activityFollowUpNotesInnerTopMiddleBottomContainer",
                                "x": "",
                                "y": "",
                                "onTouchUp": "activitiesDetailObj.editFollowUpNotes();",
                                "overlays": [
                                    {
                                        "overlayId": "followUpNotesInnerTopContainer",
                                        "x": "",
                                        "y": "",
                                        "overlays": [
                                            {
                                                "overlayId": "topImage"
                                            },
                                            {
                                                "overlayId": "followUpNotesLabelText"
                                            },
                                            {
                                                "overlayId": "followUpNotesEditButton"
                                            },
                                            {
                                                "overlayId": "followUpNotesEmailButton"
                                            }
                                        ]
                                    },
                                    {
                                        "overlayId": "middle",
                                        "x": "",
                                        "y": "",
                                        "overlays": [
                                            {
                                                "overlayId": "activityFollowUpNotesTextfieldOffscreen",
                                                "type": "textfield",
                                                "relative": "screen",
                                                "x": "-200px",
                                                "y": "-200px"
                                            },
                                            {
                                                "overlayId": "activityFollowUpNotesTextDisplayOnly" + activityId,
                                                "type": "textfield",
                                                "multiline": true,
                                                "isEditable": true,
                                                "saveState": false,
                                                "//saveText": false,
                                                "placeholder": "Enter a note...",
                                                "text": activitiesTable[activityId].followUp,
                                                "x": "",
                                                "y": "",
                                                "textAlign": "left",
                                                "font": "Helvetica",
                                                "fontColor": "#666666",
                                                "size": "1.0em",
                                                "height": "auto",
                                                "width": "700px",
                                                "horizontalAlign": "left",
                                                "verticalAlign": "top",
                                                "relative": "parent",
                                                "actions": [
                                                    {
                                                        "action": "runScriptAction",
                                                        "trigger": "editingbegan",
                                                        "delay": 0.01,
                                                        "target": "#jsBridge",
                                                        "data": {
                                                            "script": "activitiesDetailObj.editFollowUpNotes();"
                                                        }
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        "overlayId": "bottomImage",
                                        "x": "",
                                        "y": ""
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        });


        //activitiesTable[activityId].duration
        if (activitiesTable[activityId].duration == "") {
            //alert('blank');
            borg.runAction({
                "action": "close",
                //"delay" : 2.0,
                "trigger": "now",
                "targets": ["durationContainer", "containerSpacer2"]
            });
        }

        //activitiesTable[activityId].venue
        if (activitiesTable[activityId].venue == "") {
            //alert('blank');
            borg.runAction({
                "action": "close",
                //"delay" : 2.0,
                "trigger": "now",
                "targets": ["venueContainer", "containerSpacer3"]
            });
        }


        //activitiesTable[activityId].language
        if (activitiesTable[activityId].language == "") {
            //alert('blank');
            borg.runAction({
                "action": "close",
                //"delay" : 2.0,
                "trigger": "now",
                "targets": ["activityLanguageText", "activityLanguageLabel", "spacer24", "spacer25", "spacer26"]
            });
        }


        //activitiesTable[activityId].yourRole
        if (activitiesTable[activityId].yourRole == "") {
            //alert('blank');
            borg.runAction({
                "action": "close",
                //"delay" : 2.0,
                "trigger": "now",
                "targets": ["activityYourRoleText", "activityYourRoleLabel", "spacer27", "spacer28", "spacer29", "spacer30"]
            });
        }

        if (activitiesTable[activityId].language == "" && activitiesTable[activityId].yourRole == "") {
            //alert('blank');
            borg.runAction({
                "action": "close",
                //"delay" : 2.0,
                "trigger": "now",
                "target": "spacer31"
            });
        }


        //activityNotes
        //close the activity Program Container if there is no data.
        if (activitiesTable[activityId].activityNotes == "") {
            //alert('blank');
            borg.runAction({
                "action": "close",
                //"delay" : 2.0,
                "trigger": "now",
                "target": "activityProgramContainer"
            });
        }
        //alert(activitiesTable[activityId].activityNotes);

        borg.runAction({
            "action": "close",
            "trigger": "now",
            "target": "activityDetailsLoadSpinner"
        });
        borg.setText("activityFollowUpNotesTextDisplayOnly" + activityId, activitiesTable[activityId].followUp);
        //activitiesDetailObj.activityParticipantsOverlays();

        activityRemarksObj.activityRemarksOverlays();


        borg.runAction({
            "action": "close",
            "target": "imageToPreventUsersFromMashingTheButtons",
            "trigger": "now"
        });

        gVars.prevActivity = activityId
    },
    editFollowUpNotes: function () {


        //        var activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");
        var activitiesTable = global.activitiesTable;

        setTimeout(function(){
            borg.runAction({
                "action": "bringUpKeyboardAction",
                "trigger": "now",
                "target": "activityFollowUpNotesTextfield" + activityId

            });
        },200);

        borg.runAction({
            "action": "#spawn",
            "trigger": "now",
            "data": {
                "overlayId": "editFollowUpNotesContainer",
                "overlays": [
                    {
                        "overlayId": "closeModalDone",
                        "actions": [
                            {
                                "action": "runScriptAction",
                                "target": "#jsBridge",
                                "trigger": "touchUpInside",
                                "source": "activityFollowUpNotesTextfield" + activityId,
                                "data": {
                                    "script": "var occult = '#(textForJavascript)'; activitiesDetailObj.updateFollowupNotes(occult," + activityId + ");"
                                }
                            },
                            {
                                "action": "animate",
                                "trigger": "TouchDown",
                                "target": "followUpNoteTransBlackOut",
                                "data": {
                                    "animationIds": [
                                        "FadeOutQuick"
                                    ]
                                }
                            },
                            {
                                "action": "close",
                                "delay": 1.0,
                                "target": "editFollowUpNotesContainer"
                            }
                        ]
                    },
                    {
                        "overlayId": "activityFollowUpNotesTextfield" + activityId,
                        "type": "textfield",
                        "multiline": true,
                        "isEditable": true,
                        "//saveText": false,
                        "placeholder": "Enter a Note...",
                        "text": activitiesTable[activityId].followUp,
                        "width": "500px",
                        "height": "500px",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "34px",
                        "y": "80px",
                        "relative": "parent",
                        "_borderWidth": "1px",
                        "_borderColor": "#ff00ff"
                    }
                ]
            }
        });

        borg.setText("activityFollowUpNotesTextfield" + activityId, activitiesTable[activityId].followUp);
        moreBorg.animate('editFollowUpNotesContainer', 'animateFUPModalUp');

        borg.runAction({
            "action": "#spawnOnce",
            "trigger": "now",
            "data": {
                "overlayId": "followUpNoteTransBlackOut",
                "type": "image",
                "images": [
                    "Spine/images/darkTransparentBackground.png"
                ]
            }
        });
        borg.runAction({
            "action": "animate",
            "trigger": "now",
            "target": "followUpNoteTransBlackOut",
            "data": {
                "animationIds": [
                    "FadeInQuick"
                ]
            }
        });
        borg.runAction({
            "action": "bringToFront",
            "trigger": "now",
            "target": "editFollowUpNotesContainer"

        });
    },
    emailFollowUpNotes: function () {

        var activitiesTable = global.activitiesTable;
        var currAct = activitiesTable[activityId]

        //        console.log(JSON.stringify(currAct))

        var emailBody = "<strong>" + currAct.tripName + " - " + currAct.activityName + "</strong><br/>" +
            currAct.activityStartTime + " - " + currAct.activityDate + "<br/>"
            + currAct.venue + "<br/><br/>" +
            "<strong>" + "Follow Up Note" + "</strong><br/>" +
            currAct.followUp;


        performAction([
            {
                "action": "#spawnOnce",
                "trigger": "now",
                "relative": "parent",
                "data": {
                    "overlayId": "followUpNotesEmail",
                    "subject": "Follow Up From " + currAct.activityName,
                    "text": emailBody
                }
            }
        ]);

    },
    updateFollowupNotes: function (updateNotes, activityId) {

        borg.setText("activityFollowUpNotesTextDisplayOnly" + activityId, updateNotes);

        //        var activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");
        var activitiesTable = global.activitiesTable;
        var offlineFollowupNote = borg.getPersistentItem("talk.track.offline");

        // For Data Continuity while Offline: Add value to biosTable and update local storage.
        activitiesTable[activityId].followUp = updateNotes;
        borg.setPersistentItem("talk.track.tables['activities']", activitiesTable);

        performAction([
            {action: "animate", trigger: "touchDown", target: "editFollowUpNotesContainer", data: {animationIds: ["animateFUPModalDown"]}},
            {action: "close", delay: 1.0, target: "activityFollowUpNotesTextfield" + activityId},
            {action: "closeKeyboardAction", delay: 0.25, trigger: "now", target: "activityFollowUpNotesTextfieldOffscreen"}
        ]);

        var offlinePost =
        {
            "id": activityId,
            "follow_up": encodeURIComponent(updateNotes)
        };

        if (isOnline) {

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activities/update/" : "https://webapps-jnj-dev.smint.us/api/activities/update/";

            var sendNote = 'data={"id":' + activityId + ', "field": "follow_up", "value": "' + encodeURIComponent(updateNotes) + '"}';

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = xmlhttp.responseText;

                }
            }
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(sendNote);
        }
        else {
            if (offlineFollowupNote.Activity.update.length === 0) {

                offlineFollowupNote.Activity.update.push(offlinePost);
                offlineFollowupNote.hasData = true;

                borg.setPersistentItem("talk.track.offline", offlineFollowupNote);

                borg.clearIntervals();
                pollForOfflineUpdates = setInterval(function () {
                    post.gettingBackOnline();
                }, 5000);

            }
            else {
                var tempArray = [];

                for (var i = 0; i < offlineFollowupNote.Activity.update.length; i++) {
                    var a = offlineFollowupNote.Activity.update[i].id;
                    tempArray.push(a);

                }

                var check = tempArray.indexOf(activityId);
                if (check === -1) {

                    offlineFollowupNote.Activity.update.push(offlinePost);
                    offlineFollowupNote.hasData = true;
                    borg.setPersistentItem("talk.track.offline", offlineFollowupNote);

                    borg.clearIntervals();
                    pollForOfflineUpdates = setInterval(function () {
                        post.gettingBackOnline();
                    }, 5000);

                }
                else {

                    offlineFollowupNote.Activity.update[check].follow_up = updateNotes;
                    offlineFollowupNote.hasData = true;
                    borg.setPersistentItem("talk.track.offline", offlineFollowupNote);

                    borg.clearIntervals();
                    pollForOfflineUpdates = setInterval(function () {
                        post.gettingBackOnline();
                    }, 5000);

                }
            }
        }
    },
    activityParticipantsOverlays: function (activitiesTable) {

        var lastGroup = '';
        //        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        //        var activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");
        //        var participantGroupsTable = borg.getPersistentItem("talk.track.tables['participantGroups']");
        var biosTable = global.biosTable;
        var activitiesTable = global.activitiesTable;
        var participantGroupsTable = global.participantGroupsTable;
        var activityParticipantsOverlays = [];
        var activityParticipants = {};
        var groupLength = 0;
        var groupIndex = -1;
        var groupLenArr = [];

        var jjGroupLength;
        var pulledOut;
        var rows = [];
        activityParticipants2 = [];

        var loadPage = borg.getPersistentItem("talk.track.tables['biosSuccess']");

        function participantsLoad() {

            if (loadPage === true) {
                clearInterval(particiapntInterval);
                for (xx in activitiesTable) { //select the participantGroups for an activity
                    if (activitiesTable[xx].id === activityId) {
                        activityParticipants = activitiesTable[xx].participantsGroups;
                    }
                }

                for (groupid in activityParticipants) { // loop through participant groups

                    if (participantGroupsTable[groupid] == "Johnson & Johnson") {
                        jjGroupLength = activityParticipants[groupid].length
                    }

                    for (var i = 0; i < activityParticipants[groupid].length; i++) { // loop through participant group lists


                        bio_id = activityParticipants[groupid][i];

                        if (biosTable.hasOwnProperty(bio_id)) { // is bio_id in the biographies object?
                            activityParticipants2[bio_id] = biosTable[bio_id];
                            var a = biosTable[bio_id];
                            a.group = participantGroupsTable[groupid];
                            rows.push(a);
                        }
                    }
                }

                activityParticipantsOverlays = [];

                activityParticipants2 = activityParticipants2.filter(function (val) {
                    return !(val === null);
                });

                for (var i in activityParticipants2) {
                    if (activityParticipants2[i].group == null) {
                        activityParticipants2[i].group = "Undefined"
                    } else {
                    }
                }

                activityParticipants2.sort(sort_by('group', true, function (a) {
                    if (a == null) {
                        return "UNDEFINED"
                    } else {
                        return a.toUpperCase()
                    }

                }));

                var groupArr = [];
                var rows2 = [];

                for (var i = 0; i < activityParticipants2.length; i++) {
                    if (activityParticipants2[i].group != lastGroup) {
                        groupArr.sort(sort_by('lastName', true, function (a) {
                            return a.toUpperCase()
                        }));
                        lastGroup = activityParticipants2[i].group
                        for (var j = 0; j < groupArr.length; j++) {
                            rows2.push(groupArr[j]);
                        }

                        groupArr = [];
                        groupArr.push(activityParticipants2[i])

                    } else {
                        groupArr.push(activityParticipants2[i])
                    }
                }

                groupArr.sort(sort_by('lastName', true, function (a) {
                    return a.toUpperCase()
                }));
                for (var j = 0; j < groupArr.length; j++) {
                    rows2.push(groupArr[j]);
                }

                var rows3 = {};
                var numGroups = 0;

                for (var i = 0; i < rows2.length; i++) {
                    var d = rows2[i].id;
                    var name = rows2[i].firstName + " " + rows2[i].lastName;
                    name = (name.length > 27) ? name.substr(0, 27) + "..." : name;
                    var company = (rows2[i].company.length > 55) ? rows2[i].company.substr(0, 55) + "..." : rows2[i].company;
                    var title = (rows2[i].title.length > 55) ? rows2[i].title.substr(0, 55) + "..." : rows2[i].title;
                    rows3[rows2[i].id] = rows2[i];
                    borg.setPersistentItem("talk.track.tables['rows3']", rows3);

                    //alert(rows2[i].group +":"+ lastGroup)

                    if (rows2[i].group != lastGroup || !lastGroup) {

                        numGroups++;
                        row = {
                            "overlayId": "groupTitleBar" + i,
                            "type": "container",
                            "width": "716px",
                            "height": "35px",
                            "backgroundImage": "Spine/images/groupDividerBackground.png",
                            "backgroundPosition": "center-center",
                            "backgroundRepeat": "repeat",
                            "backgroundAlpha": 0.9,
                            "clipToBounds": true,
                            "cornerRadius": "0px",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "lazyLoad": true,
                            "relative": "parent",
                            "overlays": [
                                {
                                    "overlayId": "ab_vert_scroll_datasde_value" + i,
                                    "type": "text",
                                    "text": rows2[i].group,
                                    "textAlign": "left",
                                    "horizontalAlign": "left",
                                    "verticalAlign": "top",
                                    "width": "800px",
                                    "_height": "60px",
                                    "x": "15px",
                                    "y": "9px",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "fontColor": "#FFFFFF",
                                    "size": "1.4em",
                                    "relative": "parent"
                                }
                            ]
                        };
                        activityParticipantsOverlays.push(row);
                        lastGroup = rows2[i].group;
                        groupLength = 0;
                        groupIndex++;
                    }

                    activityParticipantsOverlays.push({
                        "overlayId": "activityParticipantsSubContainer" + i,
                        "type": "container",
                        "clipToBounds": true,
                        "cornerRadius": "0px",
                        "x": "",
                        "y": "",
                        "width": "716px",
                        "height": "102px",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "overlays": [
                            {
                                "overlayId": "activityAttendeeButton" + d,
                                "type": "Button",
                                "width": "716px",
                                "height": "102px",
                                "toggle": true,
                                "radioGroup": "detailAttendees",
                                "images": [
                                    "Spine/images/participantCell.png"
                                ],
                                "imagesOn": [
                                    "Spine/images/participantCell-tap.png"
                                ],
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "x": "",
                                "y": "",
                                "actions": [
                                    {
                                        "action": "runScriptAction",
                                        "trigger": "touchUpInside",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "activitiesDetailObj.activityBioCard(" + d + ");"
                                        }
                                    },
                                    {
                                        "_action": "bringToFront",
                                        "trigger": "touchupinside",
                                        "delay": 0.01,
                                        "targets": [
                                            "redTopBar",
                                            "activityDetailRedTopBarText",
                                            "activityDetailEditActivityRemarksButton",
                                            "activityDetailTripDetailsBackButton",
                                            "presentationModeButton"
                                        ]
                                    }
                                ]
                            },
                            {
                                "overlayId": "activityParticipantsNameText",
                                "text": name
                            },
                            {
                                "overlayId": "activityParticipantsTitleText",
                                "text": title
                            },
                            {
                                "overlayId": "activityParticipantsCompanyText",
                                "text": company
                            },
                            {
                                "overlayId": "activityAttendeeButtonPhoto",
                                "imagesDefault": ["Spine/images/photoFrameAnon.png"],
                                "dynamicSource": "url",
                                "type": "image",
                                "images": [
                                    "$(" + rows2[i].photo + ")"
                                ],
                                "width": "92px",
                                "height": "101px",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "relative": "parent",
                                "x": "0px",
                                "y": "0px",
                                "scaleMode": "aspect-fill",
                                "clipToBounds": true
                            }
                        ]
                    });
                    groupLength++;
                    groupLenArr[groupIndex] = groupLength;
                }

                //code to put JJ on top
                var jjGroupLen = 0;
                var j = -1;
                var savedIndex;
                for (var k = 0; k < activityParticipantsOverlays.length; k++) {
                    if (activityParticipantsOverlays[k].overlayId.indexOf("groupTitleBar") != -1) {
                        j++;
                        //TODO: Put anything else that it might be called in here
                        if (activityParticipantsOverlays[k].overlays[0].text == ("Johnson & Johnson" || "J&J" || "Johnson and Johnson" || "Johnson n Johnson" || "J and J " || "JandJ " || "JnJ")) {
                            jjGroupLen = groupLenArr[j];
                            savedIndex = k;
                        }
                    }
                }

                var jjStuff = activityParticipantsOverlays.splice(savedIndex, jjGroupLen + 1);

                activityParticipantsOverlays = jjStuff.concat(activityParticipantsOverlays);

                //fix one group
                if (numGroups == 0 && rows2.length > 0) {

                    row = {
                        "overlayId": "groupTitleBar" + i,
                        "type": "container",
                        "width": "716px",
                        "height": "35px",
                        "backgroundImage": "Spine/images/groupDividerBackground.png",
                        "backgroundPosition": "center-center",
                        "backgroundRepeat": "repeat",
                        "backgroundAlpha": 0.9,
                        "clipToBounds": true,
                        "cornerRadius": "0px",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "lazyLoad": true,
                        "relative": "parent",
                        "overlays": [
                            {
                                "overlayId": "ab_vert_scroll_datasde_value" + i,
                                "type": "text",
                                "text": lastGroup,
                                "textAlign": "left",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "width": "800px",
                                "_height": "60px",
                                "x": "15px",
                                "y": "9px",
                                "font": "AkzidenzGroteskPro-Md",
                                "fontColor": "#FFFFFF",
                                "size": "1.4em",
                                "relative": "parent"
                            }
                        ]
                    };
                    activityParticipantsOverlays.unshift(row);


                } else {
                }

                //if no participants, close associated overlays, else spawn participants.
                if (activityParticipantsOverlays.length === 0) {
                    borg.runAction({
                        "action": "close",
                        "trigger": "now",
                        "targets": [
                            "activityParticipantsShadowContainer",
                            "spacer99",
                            "spacer98",
                            "spacer97",
                            "spacer96",
                            "activityParticipantsLabel"

                        ]
                    });

                    //conditionally spawn the attendee label data point.
                    var attendeeLabelData = activitiesTable[activityId].attendees;
                    activitiesDetailObj.attendeLabel(attendeeLabelData);

                }
                else if (activityParticipantsOverlays.length >= 1) {
                    moreBorg.replaceOverlays('activityParticipantsShadowContainer', activityParticipantsOverlays);

                    //conditionally spawn the attendee label data point.
                    var attendeeLabelData = activitiesTable[activityId].attendees;
                    activitiesDetailObj.attendeLabel(attendeeLabelData);
                }


            }
            else {
                console.log('no match');
            }
        }

        var particiapntInterval = setInterval(participantsLoad, 250);
    },
    attendeLabel: function (attendeeLabelData) {
        if (attendeeLabelData == "") {
            return;
        }
        else {
            borg.runAction({
                "action": "spawnOnce",
                "target": "activityParticipantsOuterContainer",
                "trigger": "now",
                "data": {
                    "overlayId": "attendeeLabelDataContainer",
                    "type": "container",
                    "relative": "container",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "0px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "0px",
                        "margin-left": "0px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "x": "",
                    "y": "",
                    "width": "768px",
                    "height": "auto",
                    "overlays": [
                        {
                            "overlayId": "spacer",
                            "x": "",
                            "y": "",
                            "width": "768px",
                            "height": "26px"
                        },
                        {
                            "overlayId": "spacer",
                            "x": "",
                            "y": "",
                            "width": "24px",
                            "height": "26px"
                        },
                        {
                            "overlayId": "activityAttendeesLabel",
                            "x": "",
                            "y": ""
                        },
                        {
                            "overlayId": "spacer",
                            "x": "",
                            "y": "",
                            "width": "600px",
                            "height": "35px"
                        },
                        {
                            "overlayId": "spacer",
                            "x": "",
                            "y": "",
                            "height": "26",
                            "width": "26px"
                        },
                        {
                            "overlayId": "activityAttendeesText",
                            "lineHeight": "18px",
                            "text": "" + attendeeLabelData,
                            "x": "",
                            "y": ""
                        }

                    ],
                    "_borderWidth": "1px",
                    "_borderColor": "#0000ff"
                }
            });
        }
    },
    activityBioCard: function (index) {

        var rows3 = borg.getPersistentItem("talk.track.tables['rows3']");

        var i = index;

        borg.setPersistentItem("talk.track.bioCardIndex", i);

        borg.runAction({
            "action": "#spawnOnce",
            "trigger": "now",
            "relative": "parent",
            "data": {
                "overlayId": "activityDetailCloseBioCardBackgroundButton" + index,
                "type": "button",
                "images": [
                    "Spine/images/darkTransparentBackground.png"
                ],
                "imagesDown": [
                    "Spine/images/darkTransparentBackground.png"
                ],
                "actions": [
                    {
                        "action": "animate",
                        "trigger": "touchUpInside",
                        "target": "activityBioCardFixed",
                        "data": {
                            "animationId": "animateBioCardRight"

                        }
                    },
                    {
                        "action": "runScriptAction",
                        "target": "#jsBridge",
                        "data": {
                            "script": "activitiesDetailObj.otherSubscribeActions()"

                        }
                    },
                    {
                        "action": "#subscribe",
                        "trigger": "pageSwipeRightEvent",
                        "data": {
                            "actionId": "animateBioCardRight"
                        }
                    },
                    {
                        "action": "#subscribe",
                        "trigger": "pageSwipeRightEvent",
                        "data": {
                            "actionId": "otherBioCardActions"
                        }
                    }
                ]
            }
        });
        borg.runAction({
            "action": "#spawnOnce",
            "trigger": "now",
            "relative": "parent",
            "data": {
                "overlayId": "activityDetailCloseBioCardBackgroundButton_test" + index,
                "type": "button",
                "width": "768px",
                "height": "1024",
                "actions": [
                    {
                        "action": "close",
                        "delay": 1.0,
                        "trigger": "now",
                        "target": "activityDetailCloseBioCardBackgroundButton_test" + index
                    }
                ]
            }
        });
        borg.runAction({
            "action": "animate",
            "trigger": "now",
            "target": "activityDetailCloseBioCardBackgroundButton" + index,
            "data": {
                "animationIds": [
                    "FadeInQuick"
                ]
            }
        });

        var name = rows3[index].firstName;
        name += " ";
        name += rows3[index].lastName;
        name = (name.length > 20) ? name.substr(0, 20) + "..." : name;

        var photoUrl = rows3[index].photo;

        var title = (rows3[index].title.length > 35) ? rows3[index].title.substr(0, 35) + "..." : rows3[index].title;
        var company = (rows3[index].company.length > 35) ? rows3[index].company.substr(0, 35) + "..." : rows3[index].company;

        var audioId = rows3[index].audioId;
        var fileType = audioId.split('.').pop();
        var filetypeLen = fileType.length + 1
        audioId = audioId.substring(0, audioId.length - filetypeLen);

        borg.runAction({
            "action": "#spawnOnce",
            "trigger": "now",
            "data": {
                "overlayId": "activityBioCardFixed",
                "overlays": [
                    {
                        "overlayId": "activityBioCard",
                        "overlays": [
                            {
                                "overlayId": "activityBioCardTopContainer",
                                "overlays": [
                                    {
                                        "overlayId": "defaultImage"
                                    },
                                    {
                                        "overlayId": "attendee_view_attendee_image",
                                        "images": [
                                            "$(" + photoUrl + ")"
                                        ]
                                    },
                                    {
                                        "overlayId": "contactNameee",
                                        "text": name
                                    },
                                    {
                                        "overlayId": "contactTitle",
                                        "text": "<strong>" + title + "</strong>"
                                    },
                                    {
                                        "overlayId": "tripTopic",
                                        "text": "<strong>" + company + "</strong>"
                                    },
                                    {
                                        "overlayId": "bioAudio_container",
                                        "x": "194px",
                                        "y": "197px",
                                        "overlays": [
                                            {
                                                "overlayId": "bioAudio_container_circle"
                                            },
                                            {
                                                "overlayId": "bioAudio_text"
                                            },
                                            {
                                                "overlayId": "bioAudio_btn" + index,
                                                "type": "button",
                                                "color": "#magic",
                                                "x": "0px",
                                                "y": "0px",
                                                "relative" : "parent",
                                                "horizontalAlign" : "left",
                                                "verticalAlign" : "top",
                                                "width": "200px",
                                                "height": "30px",
                                                "actions": [
                                                    {
                                                        "action": "checkPackageStatus",
                                                        "trigger": "now",
                                                        "source": "#systemPackageDataRegistry",
                                                        "target": "#systemPackageDataRegistry",
                                                        "data": {
                                                            "packageID": audioId,
                                                            "type": fileType
                                                        }
                                                    },
                                                    {
                                                        "action" : "subscribe",
                                                        "target" : "#eventManager",
                                                        "trigger" : "now",
                                                        "data" : {
                                                            "event" : "stateInstallCompleted",
                                                            "actionId" : "closeAudioBlocker"
                                                        }
                                                    },
                                                    {
                                                        "action": "runScriptAction",
                                                        "trigger": "touchUpInside",
                                                        "target": "#jsBridge",
                                                        "data": {
                                                            "script": "biosObj.audioPronunciation('"+ name + "', '" + audioId + "', '" + fileType + "');"
                                                        }
                                                    }
                                                ]
                                            },
                                            {
                                                "overlayId": "bioAudio_container_notAvailable",
                                                "backgroundColor": "#F5F5F5"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "overlayId": "activityBioCardBottomContainer",
                                "overlays": [
                                    {
                                        "overlayId": "activityBioSummaryText",
                                        "text": rows3[index].summary,
                                        "borderColor": "#0000ff"
                                    },
                                    {
                                        "overlayId": "abBioNotesContainer",
                                        "type": "container",
                                        "layoutType": "flow",
                                        "layoutOptions": {
                                            "margin-top": "20px",
                                            "marginY": "0px",
                                            "paddingY": "0px",
                                            "margin-bottom": "35px",
                                            "margin-left": "0px",
                                            "marginX": "0px",
                                            "paddingX": "0px",
                                            "margin-right": "0px"
                                        },
                                        "x": "",
                                        "y": "",
                                        "width": "477px",
                                        "height": "auto",
                                        "relative": "parent",
                                        "horizontalAlign": "left",
                                        "verticalAlign": "top",
                                        "overlays": [
                                            {
                                                "overlayId": "activityFollowUpNotesInnerTopMiddleBottomContainer",
                                                "x": "",
                                                "y": "",
                                                "onTouchUp": "biosObj.editBioNotes(" + index + ");",
                                                "overlays": [
                                                    {
                                                        "overlayId": "bioLibtopImage"
                                                    },
                                                    {
                                                        "overlayId": "bioLibUpNotesLabelText"
                                                    }
                                                ]
                                            },
                                            {
                                                "overlayId": "bioLlibMiddle",
                                                "onTouchDown": "biosObj.editBioNotes(" + index + ");",
                                                "x": "",
                                                "y": "",
                                                "overlays": [
                                                    {
                                                        "overlayId": "bioLibNotesTextfieldOffscreen",
                                                        "type": "textfield",
                                                        "relative": "screen",
                                                        "x": "-200px",
                                                        "y": "-200px"
                                                    },
                                                    {
                                                        "overlayId": "bioLibUpNotesTextDisplayOnly" + index,
                                                        "type": "textfield",
                                                        "multiline": true,
                                                        "isEditable": true,
                                                        "saveState": false,
                                                        "//saveText": false,
                                                        "placeholder": "Enter a note...",
                                                        "text": rows3[index].bioNotes.text,
                                                        "x": "",
                                                        "y": "",
                                                        "textAlign": "left",
                                                        "font": "Helvetica",
                                                        "fontColor": "#666666",
                                                        "size": "1.0em",
                                                        "height": "auto",
                                                        "width": "400px",
                                                        "horizontalAlign": "left",
                                                        "verticalAlign": "top",
                                                        "relative": "parent",
                                                        "actions": [
                                                            {
                                                                "action": "runScriptAction",
                                                                "trigger": "editingbegan",
                                                                "target": "#jsBridge",
                                                                "data": {
                                                                    "script": "biosObj.editBioNotes(" + index + ");"
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "overlayId": "bioLibbottomImage",
                                                "x": "",
                                                "y": ""
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "overlayId": "bottomShadow"
                    }
                ]
            }
        });
        borg.setText("bioLibUpNotesTextDisplayOnly" + index, rows3[index].bioNotes.text);
        borg.runAction({
            "action": "bringToFront",
            "trigger": "now",
            "target": "activityBioCardFixed"
        });

        borg.runAction({
            "action": "animate",
            "trigger": "now",
            "target": "activityBioCardFixed",
            "data": {
                "animationIds": [
                    "animateBioCardLeft"
                ]
            }
        });
    },
    otherSubscribeActions: function () {

        var bioCardIndex = borg.getPersistentItem("talk.track.bioCardIndex");
        borg.runAction({
            "action": "animate",
            "trigger": "TouchDown",
            "target": "activityDetailCloseBioCardBackgroundButton" + bioCardIndex,
            "data": {
                "animationIds": [
                    "FadeOutQuick"
                ]
            }

        });
        borg.runAction({
            "action": "close",
            "trigger": "TouchDown",
            "delay": 0.6,
            "targets": [
                "activityBioCardFixed",
                "activityDetailCloseBioCardBackgroundButton" + bioCardIndex
            ]
        });
        borg.runAction({
            "action": "toggleButtonOff",
            "trigger": "TouchDown",
            "target": "activityAttendeeButton" + bioCardIndex

        });
    }
};

var activityRemarksObj = {
    remsToBeFavorited: {},
    /** Creating a new Activity Remark
     --------------------------------
     1. POST "data" to /activityremarks/add/
     2. "data" should be in this format: {"activity_id": ACTIVITY_ID, "title": "REMARK_TITLE", "text": "REMARK_TEXT"}


     Creating a new Activity Remark from an Existing User Remark
     -------------------------------------------------------------
     1. POST "data" to /activityremarks/copyremark/
     2. "data" should be in this format: {"activity_id": ACTIVITY_ID, "user_remark_id": "USER_REMARK_ID"}

     Creating a new Activity Remark from an Existing User Remark
     -------------------------------------------------------------
     1. POST "data" to /activityremarks/copyremark/
     2. "data" should be in this format: {"activity_id": ACTIVITY_ID, "user_remark_ids": "COMMA_SEPARATED_USER_REMARK_IDS"}
     ex: {"activity_id": 1, "user_remark_ids": "1,2,3"}


     Updating an existing Activity Remark
     --------------------------------------
     1. POST "data" to /activityremarks/update/
     2. "data" should be in this format: {"activity_remark_id": ACTIVITY_REMARK_ID, "title": "REMARK_TITLE", "text": "REMARK_TEXT"}


     Updating Activity Remark sorting
     -----------------------------------
     1. POST "data" to /activityremarks/sort/
     2. "data" should be in this format: {"activity_remarks": "COMMA_SEPARATED_ACTIVITY_REMARK_IDS"}
     ex: {"activity_remarks": "1,3,2"}
     **/
    updateSortPost: function () {

        console.log('upsortpost')
        var len = ddSort.playlist.length;
        var i;
        var order = '';
        var offlineOrder = [];
        for (i = 0; i < len; i++) {
            order += "," + ddSort.playlist[i].id
            offlineOrder.push(ddSort.playlist[i].id)
        }
        order = order.substr(1, order.length - 1);
        var postThis;
        var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activityremarks/sort/" : "https://webapps-jnj-dev.smint.us/api/activityremarks/sort/";
        var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

        if (isOnline) {

            console.log(JSON.stringify(sortingPost))

            //finishing up offline stuff
            if (sortingPost.length > 0) {
                postThis = sortingPost;
                sortingPost = [];
            }
            //regular sort from online
            else {
                var postThis = [
                    {
                        activity_id: activityId,
                        activity_remark_ids: offlineOrder
                    }
                ]
            }
            postThis = JSON.stringify(postThis);
            console.log("" + JSON.stringify(postThis))
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4) {
                    var response = xmlhttp.responseText;
                    var a = JSON.parse(response);
                    if (a.errors.length > 0) {
                        //                        alert('sorting errors!' + JSON.stringify(a.errors[0]))
                        //                        console.log(JSON.stringify(a.errors))
                        console.log(JSON.stringify("ERRORS ARE: "))

                        for (var j = 0; j < a.errors.length; j++) {
                            console.log(JSON.stringify(a.errors[j]))

                            for (var k = 0; k < ddSort.playlist.length; k++) {
                                if (ddSort.playlist[k].id == a.errors[j].activity_remark_id) {
                                    ddSort.playlist.splice(k, 1)
                                    console.log("found one at " + k + " : " + JSON.stringify(ddSort.playlist))
                                } else {
                                }
                            }

                        }
                        console.log("ddsort pl is " + JSON.stringify(ddSort.playlist))
                    } else {
                    }

                }
                else if (xmlhttp.readyState == 4 && xmlhtttp.status == 200) {

                    console.log(JSON.stringify("SORTING FINISHED IN THIS SHIT: "))

                }
                else {
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(postThis);

        }

        else if (!isOnline) {


            var offlinePost =
            {
                "activity_id": activityId,
                "order": offlineOrder
            };

            var offlineTable = borg.getPersistentItem("talk.track.offline");
            offlineTable.wasSorted = true;
            borg.setPersistentItem("talk.track.offline", offlineTable);

            offlineTable = borg.getPersistentItem("talk.track.offline");


            console.log('BEGINING OF offline updatesortpost' + JSON.stringify(offlinePost))

            var inArr = -1;

            $.each(offlineTable.ActivityRemark.order, function (key, value) {
                if (offlineTable.ActivityRemark.order[key].activity_id == activityId) {
                    inArr = key;
                    offlineTable.ActivityRemark.order[key].order = offlinePost.order;
                } else {
                }
            });

            if (inArr == -1) {
                offlineTable.ActivityRemark.order.push(offlinePost);
            } else {
            }
            offlineTable.hasData = true;
            offlineTable.wasSorted = true;

            borg.clearIntervals();
            pollForOfflineUpdates = setInterval(function () {
                post.gettingBackOnline();
            }, 5000);

            var newRemOrder = [];
            var copyRemOrder = [];
            for (var j = 0; j < offlinePost.order.length; j++) {

                //copied remarks
                var str = JSON.stringify(offlinePost.order[j])
                if (str.indexOf('$$') != -1) {
                    copyRemOrder.push(offlinePost.order[j])
                }
                //new remarks
                else if (isNaN(parseInt(offlinePost.order[j]))) {
                    newRemOrder.push(offlinePost.order[j])
                } else {
                }
            }

            gVars.newRemOrder = newRemOrder;
            gVars.copyRemOrder = copyRemOrder;

            if (newRemOrder.length > 0) {
                activityRemarksObj.fixAddOrder();
            }
            //            if (copyRemOrder.length > 0) {
            //                activityRemarksObj.fixCopyOrder();
            //
            //            }
            //
            //            bkgObj.changeOrder();
            //            bkgObj.numAdded = 0;
            //            bkgObj.addedArr = [];

            offlineTable = borg.getPersistentItem("talk.track.offline");
            console.log('SUPER END updatesortpost' + JSON.stringify(offlineTable));

        }
    },
    updatePost: function (remark) {

        //        console.log(JSON.stringify(remark))
        if (isOnline) {

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activityremarks/update/" : "https://webapps-jnj-dev.smint.us/api/activityremarks/update/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var postThis = 'data={"activity_remark_id":' + encodeURIComponent(remark.id) + ', "title": "' + encodeURIComponent(remark.title) + '", "text": "' + encodeURIComponent(remark.text) + '"}';
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {

                    var response = xmlhttp.responseText;
                    console.log("actrem updatePost resp is "+response)
                    activityRemarksObj.updateRememberedPost(remark);
                }
                else {
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(postThis);
            
        }
        else if (!isOnline) {

            var remembered = (remark.remembered) ? true : false;

//            alert('up OFFLINE' + JSON.stringify(remark))
            var offlinePost =
            {
                "id": remark.id,
                "text": remark.text,
                "title": remark.title,
                "remembered": remembered
            };

//            alert(JSON.stringify(offlinePost))

            var offlineTable = borg.getPersistentItem("talk.track.offline");
            var inArr = -1;
            $.each(offlineTable.ActivityRemark.update, function (key, value) {
                if (offlineTable.ActivityRemark.update[key].id == remark.id) {
                    inArr = key;
                    offlineTable.ActivityRemark.update[key].text = offlinePost.text;
                    offlineTable.ActivityRemark.update[key].remark = offlinePost.text;
                    offlineTable.ActivityRemark.update[key].title = offlinePost.title;
                } else {
                }
            });

            if (inArr == -1) {
                offlineTable.ActivityRemark.update.push(offlinePost);
            } else {
            }

            offlineTable.hasData = true;

            borg.clearIntervals();
            pollForOfflineUpdates = setInterval(function () {
                post.gettingBackOnline();
            }, 5000);

            borg.setPersistentItem("talk.track.offline", offlineTable);


            //TODO: onFlipCards
            if (borg.pageId != "FlipCardsPage") {
                bkgObj.changeOrder();
                bkgObj.numAdded = 0;
                bkgObj.addedArr = [];
            } else {

            }


        }
    },
    newUpdatePost: function (remark) {

//        alert(JSON.stringify(remark))
        if (isOnline) {


            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activityremarks/update/" : "https://webapps-jnj-dev.smint.us/api/activityremarks/update/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var postThis = 'data={"activity_remark_id":' + encodeURIComponent(remark.id) + ', "title": "' + encodeURIComponent(remark.title) + '", "text": "' + encodeURIComponent(remark.text) + '"}'

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4) {

                    var response = xmlhttp.responseText;
                    console.log("actrem newupdatePost resp is "+response)
                    activityRemarksObj.updateRememberedPost(remark);
                }
                else {
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(postThis);
        }
        else if (!isOnline) {

            var remembered = (remark.remembered) ? true : false;
            var offlinePost =
            {
                "id": remark.id,
                "text": remark.text,
                "title": remark.title,
                "remembered": remark.remembered
            };

            var offlineTable = borg.getPersistentItem("talk.track.offline");
            var inArr = -1;
            $.each(offlineTable.ActivityRemark.update, function (key, value) {
                if (offlineTable.ActivityRemark.update[key].id == remark.id) {
                    inArr = key;
                    console.log("activityreamrk place2")
                    offlineTable.ActivityRemark.update[key].remark = offlinePost.text;
                    offlineTable.ActivityRemark.update[key].text = offlinePost.text;
                    offlineTable.ActivityRemark.update[key].title = offlinePost.title;
                } else {
                }
            });

            if (inArr == -1) {
                offlineTable.ActivityRemark.update.push(offlinePost);
            } else {
            }

            offlineTable.hasData = true;

            borg.clearIntervals();
            pollForOfflineUpdates = setInterval(function () {
                post.gettingBackOnline();
            }, 5000);

            borg.setPersistentItem("talk.track.offline", offlineTable);

            bkgObj.changeOrder();
            bkgObj.numAdded = 0;
            bkgObj.addedArr = [];

        }
    },
    updateRememberedPost: function (remark) {

        if (isOnline) {
            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activityremarks/remember/" : "https://webapps-jnj-dev.smint.us/api/activityremarks/remember/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

//            alert(JSON.stringify(remark))
//            alert(JSON.stringify(global.activityRemarksTable[remark.id]))
            var remembered = (global.activityRemarksTable[remark.id].remembered) ? true : false;

            var postThis = '{"activity_remark_id":' + encodeURIComponent(remark.id) + ', "remembered": ' + encodeURIComponent(remembered) + '}'
            console.log(postThis)

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

                    var response = xmlhttp.responseText;
                    console.log("rememebred response -- " + response)
                }
                else {
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(postThis);
        }
        //handled in the updatePost method, which gets called first
        else if (!isOnline) {
        }


    },
    copyPost: function () {

        if (bkgObj.addedArr.length == 0) {
            return
        }

        var order = '';
        var j = 0;
        for (; j < bkgObj.addedArr.length; j++) {
            order += "," + bkgObj.addedArr[j].id;
        }
        order = order.substr(1, order.length - 1)

        if (isOnline) {

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activityremarks/copyremark/" : "https://webapps-jnj-dev.smint.us/api/activityremarks/copyremark/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var postThis2 = 'data={"activity_id":' + encodeURIComponent(activityId) + ', "user_remark_ids": "' + order + '"}'

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    var response = xmlhttp.responseText;
                    console.log("GOT A 403 in copy!!!" + response)

                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

                    var response = xmlhttp.responseText;
                    var a = JSON.parse(response);
                    //                    alert(JSON.stringify(response))
                    for (var i = 0; i < a.data.activity_remarks_ids.length; i++) {
                        bkgObj.addedArr[i].id = a.data.activity_remarks_ids[i];
                        ddSort.listItems(playlist_window, addToPlaylist(bkgObj.addedArr[i]));
                    }

                    bkgObj.changeOrder();
                    bkgObj.numAdded = 0;
                    bkgObj.deviceAdded += a.data.activity_remarks_ids.length;
                    bkgObj.addedArr = [];
                }
                else {
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(postThis2);
        }
        else if (!isOnline) {

            bkgObj.deviceAdded += bkgObj.addedArr.length;

            var offlinePost =
            {
                "activity_id": activityId,
                "user_remark_ids": order
            };
            var offlineTable = borg.getPersistentItem("talk.track.offline");

            console.log("TOP OF copyPOST: " + JSON.stringify(offlineTable))

            fakeIndex = borg.getPersistentItem("talk.track.fakeIndex");
            var newRemId = fakeIndex;
            var newRemId2;
            var tempArr = [];
            for (var i = 0; i < bkgObj.addedArr.length; i++) {
                newRemId = nextChar(newRemId);
                newRemId2 = '$$' + newRemId
                tempArr.push(newRemId2);

                bkgObj.addedArr[i].id = newRemId2;
                ddSort.listItems(playlist_window, addToPlaylist(bkgObj.addedArr[i]));
            }

            var inArr = -1;
            $.each(offlineTable.ActivityRemark.copy, function (key, value) {
                if (offlineTable.ActivityRemark.copy[key].activity_id == activityId) {

                    inArr = key;
                    order += ",";
                    offlinePost.user_remark_ids = order + offlineTable.ActivityRemark.copy[key].user_remark_ids;
                    console.log("IN THAT IF AND THIS IS THE OFFLINE Table" + JSON.stringify(offlineTable))
                } else {
                }
            });

            if (inArr != -1) {

                console.log("in the IF! " + JSON.stringify(offlineTable))
                console.log("order is: " + order)
                console.log("tempArr: " + JSON.stringify(tempArr))
                fakeIndexArr = $.merge(tempArr, fakeIndexArr)
                console.log("fake index arr is " + fakeIndexArr)
                offlineTable.ActivityRemark.copy[inArr].fakeIndexArr = fakeIndexArr;
                offlineTable.ActivityRemark.copy[inArr].user_remark_ids = order + offlineTable.ActivityRemark.copy[inArr].user_remark_ids;
                gVars.copyIndex = inArr;
                console.log("END OF IF " + JSON.stringify(offlineTable))

            } else {

                console.log("in the else! of offline copypost" + JSON.stringify(offlineTable))
                console.log("bkgObj.addedArr: " + JSON.stringify(bkgObj.addedArr))
                console.log("fakeIndexArr: " + JSON.stringify(fakeIndexArr))
                console.log("tempArr: " + JSON.stringify(tempArr))
                console.log("offlinePost: " + JSON.stringify(offlinePost))
                console.log("copyIndex1: " + JSON.stringify(gVars.copyIndex))
                fakeIndexArr = tempArr
                offlinePost.fakeIndexArr = fakeIndexArr;
                offlineTable.ActivityRemark.copy.push(offlinePost);
                gVars.copyIndex = offlineTable.ActivityRemark.copy.length - 1;
                console.log("copyIndex2: " + JSON.stringify(gVars.copyIndex))
                console.log("END of else! of offline copypost " + JSON.stringify(offlineTable))
            }
            offlineTable.hasData = true;

            console.log("BEFORE BGONLINE: " + JSON.stringify(offlineTable))
            borg.clearIntervals();
            pollForOfflineUpdates = setInterval(function () {
                post.gettingBackOnline();
            }, 5000);


            borg.setPersistentItem("talk.track.offline", offlineTable);


            borg.setPersistentItem("talk.track.fakeIndex", newRemId);
            bkgObj.changeOrder();
            bkgObj.numAdded = 0;
            bkgObj.addedArr = [];


            //fix ids that had been added
            for (i in global.remarksTable) {
                //                alert(i)
                global.remarksTable[i].id = i;
            }

            //            console.log("Bottom OF copyPOST: " + JSON.stringify(global.remarksTable))

        }
    },
    addPost: function (remark) {

        if (!remark.title || !remark.text) {
            performAction([
                {action: "gotoURLAction", trigger: "now", target: "#systemPage", data: {failureTitle: "Invalid Input", failureMessage: "Please Complete All Fields", url: "alert://localhost/"}}
            ]);
            return;
        }

        if (isOnline) {
            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activityremarks/add/" : "https://webapps-jnj-dev.smint.us/api/activityremarks/add/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var postThis = 'data={"activity_id":' + encodeURIComponent(activityId) + ', "title": "' + encodeURIComponent(remark.title) + '", "text": "' + encodeURIComponent(remark.remark) + '"}'

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    var response = xmlhttp.responseText;
                    console.log("GOT A 403 in add!!!" + response)

                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = xmlhttp.responseText;
                    var a = JSON.parse(response);
                    var newRemId = a.data.activity_remarks_ids[0];
                    gVars.remToSend.id = newRemId;
                    activityRemarksObj.addNewActRemark(gVars.remToSend);
                    bkgObj.deviceAdded++;
                    bkgObj.changeOrder();
                    bkgObj.numAdded = 0;
                    bkgObj.addedArr = [];

                }
                else {
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(postThis);

        }

        else if (!isOnline) {

            bkgObj.deviceAdded++;
            //            alert(JSON.stringify(remark))
            var offlinePost =
            {
                "activity_id": activityId,
                "fakeId": '',
                "title": encodeURIComponent(remark.title),
                "text": encodeURIComponent(remark.remark),
                "remembered": false
            };
            var offlineTable = borg.getPersistentItem("talk.track.offline");

            fakeIndex = borg.getPersistentItem("talk.track.fakeIndex");
            var newRemId = nextChar(fakeIndex);
            borg.setPersistentItem("talk.track.fakeIndex", newRemId);

            //            fakeIndexArr.push(newRemId);
            gVars.remToSend.id = newRemId;

            offlinePost.fakeId = newRemId;
            offlineTable.ActivityRemark.add.push(offlinePost);
            offlineTable.hasData = true;

            borg.clearIntervals();
            pollForOfflineUpdates = setInterval(function () {
                post.gettingBackOnline();
            }, 5000);

            borg.setPersistentItem("talk.track.offline", offlineTable);

            activityRemarksObj.addNewActRemark(gVars.remToSend);
            //TODO: animation fix here for offline

            //TODO: WTF IS THIS
            //            gVars.remarksTable[offlinePost.fakeId] = {
            //                "remark": offlinePost.text,
            //                "id": offlinePost.fakeId,
            //                "title": offlinePost.title
            //            };

            bkgObj.changeOrder();

            //TODO: Should this happen here?
            bkgObj.numAdded = 0;
            bkgObj.addedArr = [];

        }
    },
    deletePost: function () {
        if (isOnline) {
            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activityremarks/delete/" : "https://webapps-jnj-dev.smint.us/api/activityremarks/delete/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var postThis = {
                activity_id: activityId,
                activity_remark_id: gVars.remarkId
            }

            postThis = JSON.stringify(postThis)

            var xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = xmlhttp.responseText;
                    bkgObj.deviceDeleted++;

                    //                    console.log(JSON.stringify(ddSort.playlist))

                    activityRemarksObj.getTable();
                    activitiesObj.getTable();

                    var newPL = ddSort.playlist.filter(function (val) {
                        return !(val.id == gVars.remarkId);
                    });

                    ddSort.playlist = newPL;
                    gVars.len = ddSort.playlist.length;

                    console.log(JSON.stringify(ddSort.playlist))

                    performAction([
                        {
                            "action": "animate",
                            "target": "darkTransparentBackgroundImage",
                            "data": {
                                "animationIds": [
                                    "FadeOutQuick"
                                ]
                            }
                        },
                        {
                            "action": "animate",
                            "target": "editRemarksLibraryModal",
                            "data": {
                                "animationIds": [
                                    "animateModalDown"
                                ]
                            }
                        },
                        {
                            "action": "close",
                            "delay": 0.5,
                            "targets": [
                                "darkTransparentBackgroundImage",
                                "editRemarksContainer",
                                "editRemarksLibraryModal"
                            ]
                        },
                        {
                            "action": "runScriptAction",
                            "target": "#jsBridge",
                            "delay": 0.51,
                            "data": {
                                "script": "bkgObj.changeOrder();"
                            }
                        }
                    ]);

                }

                else if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    var response = xmlhttp.responseText;
                    //                    alert(response)
                }
                else {
                    var response = xmlhttp.responseText;

                }

            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(postThis);

        }
        else if (!isOnline) {

            bkgObj.deviceDeleted++;
            var offlinePost = {
                activity_id: activityId,
                activity_remark_id: gVars.remarkId
            }
            var str = JSON.stringify(offlinePost.activity_remark_id)
            var offlineTable = borg.getPersistentItem("talk.track.offline");
            offlineTable.hasData = true;

            //            console.log("DP gVars.oldPlaylists" + JSON.stringify(gVars.oldPlaylists))
            //copied remarks
            if (str.indexOf('$$') != -1) {

                var currCopyArr = offlineTable.ActivityRemark.copy.filter(function (val) {
                    return (val.activity_id == activityId);
                });

                var othersArr = offlineTable.ActivityRemark.copy.filter(function (val) {
                    return !(val.activity_id == activityId);
                });

                console.log("othersArr " + JSON.stringify(othersArr))

                console.log("currCopyArr" + JSON.stringify(currCopyArr))

                var splitArr = currCopyArr[0].user_remark_ids.split(',');
                var cIndex = currCopyArr[0].fakeIndexArr.indexOf(gVars.remarkId);

                //TODO: might be diff indexes..

                console.log("cind " + cIndex)

                console.log("splitArr1 " + splitArr)
                console.log("fakeIndexArr1 " + fakeIndexArr)
                splitArr.splice(cIndex, 1);
                fakeIndexArr.splice(cIndex, 1);
                console.log("fakeIndexArr2 " + fakeIndexArr)

                if (splitArr.length == 0) {
                    currCopyArr = [];
                } else {

                    console.log("splitArr2 " + splitArr)
                    currCopyArr[0].fakeIndexArr.splice(cIndex, 1);
                    splitArr = splitArr.join();
                    currCopyArr[0].user_remark_ids = splitArr;

                }

                othersArr = currCopyArr.concat(othersArr);
                offlineTable.ActivityRemark.copy = othersArr;

                console.log("AFTER MANIP" + JSON.stringify(offlineTable));


            }
            //new remarks
            else if (isNaN(parseInt(str))) {

                offlineTable.ActivityRemark.add = offlineTable.ActivityRemark.add.filter(function (val) {
                    return !(val.fakeId == gVars.remarkId);
                });


            }
            else {
                offlineTable.ActivityRemark.delete.push(offlinePost);

            }

            console.log("using this to set: " + JSON.stringify(offlineTable))
            borg.setPersistentItem("talk.track.offline", offlineTable);

            //            activityRemarksObj.getTable();
            //            activitiesObj.getTable();

            //            console.log(JSON.stringify(global.activityRemarksTable))

            var newPL = ddSort.playlist.filter(function (val) {
                return !(val.id == gVars.remarkId);
            });

            ddSort.playlist = newPL;
            gVars.len = ddSort.playlist.length;

            performAction([
                {
                    "action": "animate",
                    "target": "darkTransparentBackgroundImage",
                    "data": {
                        "animationIds": [
                            "FadeOutQuick"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "target": "editRemarksLibraryModal",
                    "data": {
                        "animationIds": [
                            "animateModalDown"
                        ]
                    }
                },
                {
                    "action": "close",
                    "delay": 0.5,
                    "targets": [
                        "darkTransparentBackgroundImage",
                        "editRemarksContainer",
                        "editRemarksLibraryModal"
                    ]
                },
                {
                    "action": "runScriptAction",
                    "target": "#jsBridge",
                    "delay": 0.51,
                    "data": {
                        "script": "bkgObj.changeOrder();"
                    }
                }
            ]);

            //            var offlinePost =
            //            {
            //                "activity_id":activityId,
            //                "fakeId":'',
            //                "title":encodeURIComponent(remark.title),
            //                "text":encodeURIComponent(remark.remark)
            //            };
            //            var offlineTable = borg.getPersistentItem("talk.track.offline");
            //
            //            fakeIndex = borg.getPersistentItem("talk.track.fakeIndex");
            //            var newRemId = nextChar(fakeIndex);
            //            borg.setPersistentItem("talk.track.fakeIndex", newRemId);
            //
            //            fakeIndexArr.push(newRemId);
            //            gVars.remToSend.id = newRemId;
            //
            //            offlinePost.fakeId = newRemId;
            //            offlineTable.ActivityRemark.add.push(offlinePost);
            //            offlineTable.hasData = true;
            //
            //            borg.clearIntervals();
            //            pollForOfflineUpdates = setInterval(function () {
            //                post.gettingBackOnline();
            //            }, 5000);
            //
            //            borg.setPersistentItem("talk.track.offline", offlineTable);
            //
            //            activityRemarksObj.addNewActRemark(gVars.remToSend);
            //            bkgObj.changeOrder();
            //
            //
            //
            //            bkgObj.numAdded = 0;
            //            bkgObj.addedArr = [];
            //            //post.postAllUpdates();
        }
    },
    fixAddOrder: function () {

        console.log('fixaddorder')

        var offlineTable = borg.getPersistentItem("talk.track.offline");

        console.log("begining of fixadd order: " + JSON.stringify(offlineTable))
        var oldAdd = offlineTable.ActivityRemark.add;
        var otherAdds = offlineTable.ActivityRemark.add;
        offlineTable.ActivityRemark.add = [];

        otherAdds = otherAdds.filter(function (val) {
            return !(val.activity_id == activityId);
        });

        oldAdd = oldAdd.filter(function (val) {
            return (val.activity_id == activityId);
        });

        console.log("otherAdds: " + JSON.stringify(otherAdds))
        console.log("oldAdd: " + JSON.stringify(oldAdd))
        console.log("newRemOrder: " + JSON.stringify(gVars.newRemOrder))


        var fakeIdObj = {};
        for (var i = 0; i < oldAdd.length; i++) {
            fakeIdObj[oldAdd[i].fakeId] = oldAdd[i];
        }

        //this used to be gVars.newRemOrder.length
        for (var i = 0; i < oldAdd.length; i++) {
            offlineTable.ActivityRemark.add.push(fakeIdObj[gVars.newRemOrder[i]])
        }


        offlineTable.ActivityRemark.add = otherAdds.concat(offlineTable.ActivityRemark.add);

        console.log("end of fixadd order: " + JSON.stringify(offlineTable))

        borg.setPersistentItem("talk.track.offline", offlineTable);
    },
    fixCopyOrder: function () {

        var offlineTable = borg.getPersistentItem("talk.track.offline");
        console.log('fixcopyorder, TOP' + JSON.stringify(offlineTable))
        var oldCopy = offlineTable.ActivityRemark.copy;
        oldCopy[gVars.copyIndex].orderz = oldCopy[gVars.copyIndex].user_remark_ids.split(',')

        var otherActs = [];
        for (var i = 0; i < offlineTable.ActivityRemark.copy.length; i++) {
            if (offlineTable.ActivityRemark.copy[i].activity_id != activityId) {
                otherActs.push(offlineTable.ActivityRemark.copy[i]);
            }
        }

        //TODO: Change this to do only one in the offlinetable
        offlineTable.ActivityRemark.copy = [];

        var fakeIdObj = {};
        for (var i = 0; i < oldCopy[gVars.copyIndex].orderz.length; i++) {
            fakeIdObj[oldCopy[gVars.copyIndex].fakeIndexArr[i]] = oldCopy[gVars.copyIndex].orderz[i];
        }

        var d = [];
        var e = [];
        for (var i = 0; i < gVars.copyRemOrder.length; i++) {

            d.push(fakeIdObj[gVars.copyRemOrder[i]])
            e.push(gVars.copyRemOrder[i])

        }
        d = d.join();
        var offlinePost =
        {
            "activity_id": activityId,
            "user_remark_ids": d,
            "fakeIndexArr": e
        };

        offlineTable.ActivityRemark.copy.push(offlinePost);
        for (var i = 0; i < otherActs.length; i++) {
            offlineTable.ActivityRemark.copy.push(otherActs[i]);
        }

        console.log("BOTTOM OF FIX COPY ORDER  " + JSON.stringify(offlineTable))
        borg.setPersistentItem("talk.track.offline", offlineTable);
    },
    fixUpdatedCopies: function () {

        var offlineTable = borg.getPersistentItem("talk.track.offline");

        console.log('fixUpdatedCOPIES, TOP' + JSON.stringify(offlineTable))
        for (var i = 0; i < gVars.editedCopies.length; i++) {

            for (var j = 0; j < ddSort.playlist.length; j++) {

                if ('"' + ddSort.playlist[j].id + '"' == gVars.editedCopies[i].fakeId) {

                    var theId = ddSort.playlist[j].id;
                    var offlinePost =
                    {
                        "activity_id": gVars.editedCopies[i].activity_id,
                        "title": ddSort.playlist[j].origTit,
                        "text": ddSort.playlist[j].text
                    };

                    offlineTable.ActivityRemark.add.push(offlinePost);

                    for (var k = 0; k < offlineTable.ActivityRemark.update.length; k++) {

                        if (theId == offlineTable.ActivityRemark.update[k].id) {

                            offlineTable.ActivityRemark.update.splice(k, 1);
                        }
                    }

                    //clear the update
                    for (var l = 0; l < offlineTable.ActivityRemark.copy.length; l++) {

                        var myInd;
                        for (var z = 0; z < offlineTable.ActivityRemark.copy[l].fakeIndexArr.length; z++) {
                            if (theId == offlineTable.ActivityRemark.copy[l].fakeIndexArr[z]) {
                                myInd = z;
                            }
                        }

                        var fakeIdStr = offlineTable.ActivityRemark.copy[l].fakeIndexArr.join();
                        var ids = offlineTable.ActivityRemark.copy[l].user_remark_ids.split(",");
                        var strz = JSON.stringify(fakeIdStr)

                        if (strz.indexOf(theId) != -1) {

                            ids.splice(myInd, 1);
                            offlineTable.ActivityRemark.copy[l].user_remark_ids = ids.join();
                            offlineTable.ActivityRemark.copy[l].fakeIndexArr.splice(myInd, 1);

                            if (offlineTable.ActivityRemark.copy[l].fakeIndexArr.length == 0) {

                                offlineTable.ActivityRemark.copy = [];
                            }

                        }
                    }
                }

            }

        }
        borg.setPersistentItem("talk.track.offline", offlineTable);

        console.log('fixUpdatedCOPIES, BOTTOM' + JSON.stringify(offlineTable))
    },
    getTable: function () {
        if (isOnline === true) {

            console.log('getting activityRemarksTable ');

            /*borg.runAction({
                "action": "#spawnOnce",
                "data": {
                    "overlayId": "fireFirstMethod"
                }});*/
            
            borg.runAction({
                "action": "#spawnOnce",
                "data": {
                    "overlayId": "wifi_persistent"
                }});

            packageBrowser.firstAuthMethod();

            var activityRemarksTable = {};

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/activityremarks/" : "https://webapps-jnj-dev.smint.us/api/activityremarks/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var ID = "userid=" + borg.getPersistentItem("talk.track.id");

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

                    clearTimeout(xmlHttpTimeout);

                    var data = xmlhttp.responseText;

                    global.activityRemarksTable = JSON.parse(data).activityRemarks;
                    gVars.remarksTable = JSON.parse(data).activityRemarks;

                    console.log('getting activityRemark table - success');

                    if (borg.pageId === "activityDetailPage2") {

                        activityRemarksObj.activityRemarksOverlays();
                    }

                    borg.setPersistentItem("talk.track.tables['activityRemarks']", JSON.parse(data).activityRemarks);
                    borg.setPersistentItem("talk.track.tables['activityRemarksSuccess']", JSON.parse(data).success);


                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {

                    clearTimeout(xmlHttpTimeout);

                    var data = xmlhttp.responseText;

                    var activityRemarks403 = JSON.parse(data);

                    console.log('getting activityRemark table - failure');
                    console.log('test activityRemark table' + xmlhttp.responseText);

                    var success = activityRemarks403['success'];
                    var status = activityRemarks403['status'];

                    if (status == 'Invalid session.') {

                        login();
                        console.log('logging back in');

                        global.activityRemarksTable = borg.getPersistentItem("talk.track.tables['activityRemarks']");
                        gVars.remarksTable = borg.getPersistentItem("talk.track.tables['ctivityRemarksSuccess']");

                        gVars.prevActivityCopy = activityId;

                        if (borg.pageId === "activityDetailPage2") {

                            activityRemarksObj.activityRemarksOverlays();
                        }
                    }
                }
            };
            xmlhttp.open("GET", url + '?' + ID, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.withCredentials = true;
            xmlhttp.send();

            var xmlHttpTimeout = setTimeout(ajaxTimeout, 5000);

            function ajaxTimeout() {

                console.log('abort activityRemarks');

                xmlhttp.abort();

                global.activityRemarksTable = borg.getPersistentItem("talk.track.tables['activityRemarks']");
                gVars.remarksTable = borg.getPersistentItem("talk.track.tables['activityRemarksSuccess']");

                gVars.prevActivityCopy = activityId;

                if (borg.pageId === "activityDetailPage2") {

                    activityRemarksObj.activityRemarksOverlays();
                }
            }
        }

        else if (isOnline === false) {

            global.activityRemarksTable = borg.getPersistentItem("talk.track.tables['activityRemarks']");
            gVars.remarksTable = borg.getPersistentItem("talk.track.tables['activityRemarksSuccess']");

            gVars.prevActivityCopy = activityId;

            if (borg.pageId === "activityDetailPage2") {

                activityRemarksObj.activityRemarksOverlays();
            }

        }
    },
    activityRemarksOverlays: function () {

        var activityRemarksTable = global.activityRemarksTable;

        //        console.log('pre' + '' + JSON.stringify(gVars.prevActivity));
        //        console.log('regular activity' + '' + JSON.stringify(activityId));

        activityRemarks = {};
        activityRemarks2 = [];


        //different activity
        if (activityId != gVars.prevActivity) {
            console.log('Different Activity populating here' + '' + JSON.stringify(activityId));

            ddSort.clear();
            fakeIndexArr = [];
        }

        //already visited this activity, offline
        if (gVars.oldPlaylists[activityId] && !gVars.cameFromEdit && !isOnline) {

            console.log('first if');
            var tempA = [];
            console.log('already have the most recent offline remarks, POPULATING FROM local storage');
            for (var j = 0; j < gVars.oldPlaylists[activityId].length; j++) {
                activityRemarks2.push(gVars.oldPlaylists[activityId][j]);
                tempA.push(gVars.oldPlaylists[activityId][j]);
            }

        }

        //coming back from updates, offline
        else if (ddSort.playlist.length && !isOnline) {
            console.log('second if');
            var tempA = [];
            for (var j = 0; j < ddSort.playlist.length; j++) {
                activityRemarks2.push(ddSort.playlist[j]);
                tempA.push(ddSort.playlist[j]);
            }
            gVars.oldPlaylists[activityId] = tempA;
            console.log('Came From Editing Modal, POPULATING FROM ddSort.playlist')
            gVars.cameFromEdit = false;

        }

        //coming from dashboard
        else {
            console.log('COMING from DASHBOARD');
            console.log('POPULATING FROM activityRemarksTable')

            for (i in activityRemarksTable) {
                if (activityRemarksTable[i].activityId === activityId) {

                    activityRemarks[activityRemarksTable[i].id] = activityRemarksTable[i];
                    var a = activityRemarksTable[i];
                    a.remark = activityRemarksTable[i].text
                    activityRemarks2.push(a);
                }
            }

            activityRemarks2.sort(sort_by('orderNumber', true, function (a) {
                return a
            }));
            gVars.remarksTable = activityRemarks2;

        }

        var activityRemarksOverlays = [];
        for (var i = 0; i < activityRemarks2.length; i++) {

            var textAddBreakTags = activityRemarks2[i].text;
            textAddBreakTags = textAddBreakTags.replace(/\r\n/g, "<br /> ");

            activityRemarksOverlays.push({
                "overlayId": "innerRemarksContainer" + i,
                "type": "container",
                "layoutType": "flow",
                "layoutOptions": {
                    "margin-top": "10px",
                    "marginY": "0px",
                    "paddingY": "4px",
                    "margin-bottom": "0px",
                    "margin-left": "45px",
                    "marginX": "0px",
                    "paddingX": "0px",
                    "margin-right": "0px"
                },
                "x": "",
                "y": "",
                "width": "732px",
                "height": "auto",
                "contentHeight": "auto",
                "relative": "parent",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "overlays": [
                    {
                        "overlayId": "activityRemarkTitle",
                        "x": "",
                        "y": "",
                        "text": activityRemarks2[i].title,
                        //padding needed to prevent diacritics from being clipped by the overlay's top-margin.
                        "padding": "5px",
                        "_borderWidth": "1px",
                        "_borderColor": "#0000ff"

                    },
                    {
                        "overlayId": "activityRemarkText",
                        "x": "",
                        "y": "",
                        "text": textAddBreakTags,
                        "_borderWidth": "1px",
                        "_borderColor": "#0000ff"
                    }
                ]
            });
        }

        moreBorg.replaceOverlays('activityRemarksInnerMiddleContainer', activityRemarksOverlays);
    },
    addResp: function () {

        console.log("putting back in the PL: addresp: " + gVars.addResp)
        console.log("putting back in the PL: newRemOrder: " + gVars.newRemOrder)
        var offlineTable = borg.getPersistentItem("talk.track.offline");

        for (var i = 0; i < gVars.addResp.length; i++) {

            var currPL = gVars.oldPlaylists[gVars.addActIds[i]];

            var currId = offlineTable.ActivityRemark.add[i].fakeId;
            var worked = false;

            for (var j = 0; j < currPL.length; j++) {

                if (currPL[j].id == currId) {
                    //                    alert(currPL[j].id +" changing to " + gVars.addResp[i])
                    //                    alert(JSON.stringify(activityRemarksObj.remsToBeFavorited))
                    currPL[j].id = gVars.addResp[i];
                    worked = true;

                } else {

                }
            }

            if (worked) {
                gVars.oldPlaylists[gVars.addActIds[i]] = currPL;

            }

        }


        //        for (var i = 0; i < gVars.addResp.length; i++) {
        //            for (var j = 0; j < ddSort.playlist.length; j++) {
        //                if (ddSort.playlist[j].id == gVars.newRemOrder[i]) {
        //                    console.log('hit with' + gVars.addResp[i])
        //                    ddSort.playlist[j].id = gVars.addResp[i]
        //
        //                } else {
        //                }
        //            }
        //        }
    },
    copyResp: function () {

        console.log("putting back in the PL: copyresp: " + gVars.copyResp)
        console.log("putting back in the PL: copyRemOrder: " + gVars.copyRemOrder)
        console.log("COPYACTIDS" + gVars.copyActIds)
        console.log("gVars.oldPlaylists" + JSON.stringify(gVars.oldPlaylists))
        var offlineTable = borg.getPersistentItem("talk.track.offline");

        for (var i = 0; i < gVars.copyResp.length; i++) {

            var currPL = gVars.oldPlaylists[gVars.copyActIds[i]];
            var currId = gVars.copyRemOrder[i];
            var worked = false;

            if (currPL == null) {
                console.log('got a null pl length, returinging')
                return true;
            }
            for (var j = 0; j < currPL.length; j++) {

                if (currPL[j].id == currId) {

                    //                    alert('found it: currPL[j].id then addResp[i]' + currPL[j].id + " : " + gVars.copyResp[i])
                    currPL[j].id = gVars.copyResp[i];
                    worked = true;

                } else {

                }
            }

            if (worked) {
                //                alert("worked!")
                gVars.oldPlaylists[gVars.copyActIds[i]] = currPL;
            }

        }


        //        for (var i = 0; i < gVars.copyResp.length; i++) {
        //
        //            for (var j = 0; j < ddSort.playlist.length; j++) {
        //
        //                if (ddSort.playlist[j].id == gVars.copyRemOrder[i]) {
        //                    ddSort.playlist[j].id = gVars.copyResp[i]
        //
        //                } else {
        //                }
        //            }
        //        }
    },
    makeSortingArr: function () {

        var offlineTable = borg.getPersistentItem("talk.track.offline");

        for (var i in gVars.oldPlaylists) {

            var currPL = gVars.oldPlaylists[i];
            var sortOrd = [];
            for (var j = 0; j < currPL.length; j++) {
                sortOrd.push(currPL[j].id)
            }
            var sortStr = sortOrd.join();
            //            alert(i)

            var tempSort = {
                activity_id: i,
                activity_remark_ids: sortOrd
            }

            sortingPost.push(tempSort);
        }

        //        alert(JSON.stringify(sortingPost))
    },
    getTitle: function (newRemTit) {

        gVars.newRemTit = newRemTit
        console.log(gVars.newRemTit);
    },
    editActRemark: function (i) {

        var offlineTable = borg.getPersistentItem("talk.track.offline");


        var str = JSON.stringify(ddSort.playlist[i].id)
        if (str.indexOf('$$') != -1) {

            str = str.replace(/\\/, "\\\\");

            if (gVars.editedCopies.length === 0) {
                var cpObj = {
                    "activity_id": activityId,
                    "fakeId": str,
                    "title": ddSort.playlist[i].origTit,
                    "text": ddSort.playlist[i].text
                }
                gVars.editedCopies.push(cpObj);
            } else {
                var didUp = false;
                for (var j = 0; j < gVars.editedCopies.length; j++) {

                    if (gVars.editedCopies[j].fakeId == str) {
                        console.log("activityreamrk place3")
                        gVars.editedCopies[j].title = ddSort.playlist[i].origTit
                        gVars.editedCopies[j].text = ddSort.playlist[i].text
                        gVars.editedCopies[j].remark = ddSort.playlist[i].text
                        didUp = true;

                    }
                    else {

                    }
                }
                if (!didUp) {
                    var cpObj = {
                        "activity_id": activityId,
                        "fakeId": str,
                        "title": ddSort.playlist[i].origTit,
                        "text": ddSort.playlist[i].text
                    }
                    gVars.editedCopies.push(cpObj);
                }

            }
        }

        var text = ddSort.playlist[i].text;
        var title = ddSort.playlist[i].origTit;
        gVars.remarkId = ddSort.playlist[i].id;
        gVars.remarkSortIndex = i;

        performAction([
            {
                "action": "animate",
                "target": "darkTransparentBackgroundImage",
                "data": {
                    "animationIds": [
                        "FadeInQuick"
                    ]
                }
            },
            {
                "action": "spawn",
                "target": "editRemarksMasterContainer",
                "data": {
                    "overlayId": "darkTransparentBackgroundImage"
                }
            },
            {
                "action": "spawn",
                "target": "editRemarksMasterContainer",
                "data": {
                    "overlayId": "editRemarksLibraryModal"
                }
            },
            {
                "action": "animate",
                "target": "editRemarksLibraryModal",
                "data": {
                    "animationIds": [
                        "animateModalUp"
                    ]
                }
            }
        ]);

        text = text.replace(/<br\s*[\/]?>/gi, "\n");
        text = $('<div />').html(text).text();

        borg.setText("editRemarkTextfieldTitle", title)
        borg.setText("editRemarkTextfieldBody", text)
    },
    addNewActRemark: function (remark) {

        bkgObj.numAdded++;
        bkgObj.addedArr.push(remark)
        ddSort.listItems(playlist_window, addToPlaylist(remark));
    },
    //FOR NEW REMARK MODAL
    getText: function (newRem) {

        gVars.newRem = newRem
        var remToSend = {
            remark: "",
            title: ""
        };
        remToSend.remark = gVars.newRem;
        remToSend.text = gVars.newRem;
        remToSend.text = remToSend.text.replace(/\n/g, "<br />");
        remToSend.remark = remToSend.text;
        remToSend.title = gVars.newRemTit;
        remToSend.remembered = false;

        if (!remToSend.title.length == 0 || !remToSend.text.length == 0) {
            performAction([
                {
                    "action": "animate",
                    "target": "darkTransparentBackgroundImage",
                    "data": {
                        "animationIds": [
                            "FadeOutQuick"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "target": "newRemarksLibraryModal",
                    "data": {
                        "animationIds": [
                            "animateModalDown"
                        ]
                    }
                },
                {
                    "action": "close",
                    "delay": 1.0,
                    "targets": [
                        "darkTransparentBackgroundImage",
                        "editRemarksContainer",
                        "newRemarksLibraryModal"
                    ]
                }
            ])

        }

        remToSend.orderNumber = 0;
        remToSend.activityId = activityId;
        gVars.remToSend = remToSend;

        setTimeout(function () {
            activityRemarksObj.addPost(remToSend);
        }, 200);
    },
    //FOR EDITING MODAL
    getText2: function (newRem) {

        gVars.newRem = newRem

        var remToSend = {
            remark: "",
            title: ""
        };
        remToSend.remark = gVars.newRem;
        remToSend.text = gVars.newRem;
        remToSend.text = remToSend.text.replace(/\n/g, "<br />");
        remToSend.remark = remToSend.text;
        remToSend.title = gVars.newRemTit;
        remToSend.orderNumber = 0;
        remToSend.activityId = activityId;
        remToSend.id = gVars.remarkId;
        var i = gVars.remarkSortIndex;
        ddSort.playlist[i].text = remToSend.text;
        ddSort.playlist[i].origTit = remToSend.title;
        ddSort.playlist[i].title = remToSend.title;

        performAction([
            {
                "action": "animate",
                "target": "darkTransparentBackgroundImage",
                "data": {
                    "animationIds": [
                        "FadeOutQuick"
                    ]
                }
            },
            {
                "action": "animate",
                "target": "editRemarksLibraryModal",
                "data": {
                    "animationIds": [
                        "animateModalDown"
                    ]
                }
            },
            {
                "action": "close",
                "delay": 0.5,
                "targets": [
                    "darkTransparentBackgroundImage",
                    "editRemarksContainer",
                    "editRemarksLibraryModal"
                ]
            },
            {
                "action": "runScriptAction",
                "target": "#jsBridge",
                "delay": 0.51,
                "data": {
                    "script": "bkgObj.changeOrder();"
                }
            }
        ]);

        setTimeout(function () {
            activityRemarksObj.updatePost(remToSend);
        }, 520);
    }
};

var remarksLibObj = {
    getTable: function () {

        if (isOnline === true) {

            var remarksTable = {};

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/remarks/" : "https://webapps-jnj-dev.smint.us/api/remarks/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var ID = "userid=" + borg.getPersistentItem("talk.track.id");

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    clearTimeout(xmlHttpTimeout);
                    var data = xmlhttp.responseText;
                    global.remarksTable = JSON.parse(data).remarks;
                    borg.setPersistentItem("talk.track.tables['remarks']", JSON.parse(data).remarks);

                    console.log('getting remarks table - success');
                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {

                    clearTimeout(xmlHttpTimeout);
                    var data = xmlhttp.responseText;

                    var remarks403 = JSON.parse(data);

                    console.log('getting remarks table - failure');

                    var success = remarks403['success'];
                    var status = remarks403['status'];

                    if (status == 'Invalid session.') {
                        login();
                        console.log('logging back in');

                        global.remarksTable = borg.getPersistentItem("talk.track.tables['remarks']");
                        gVars.remarksTable = borg.getPersistentItem("talk.track.tables['remarks']");
                    }
                }
            };
            xmlhttp.open("GET", url + '?' + ID, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.withCredentials = true;
            xmlhttp.send();

            var xmlHttpTimeout = setTimeout(ajaxTimeout, 5000);

            function ajaxTimeout() {
                xmlhttp.abort();
                //alert("Request timed out- remarksGetTable");
                console.log("Request timed out");
                global.remarksTable = borg.getPersistentItem("talk.track.tables['remarks']");
                gVars.remarksTable = borg.getPersistentItem("talk.track.tables['remarks']");
            }

        }
        else if (isOnline === false) {
            global.remarksTable = borg.getPersistentItem("talk.track.tables['remarks']");
            gVars.remarksTable = borg.getPersistentItem("talk.track.tables['remarks']");

        }
    },
    getTable2: function () {

        if (isOnline === true) {

            var remarkCatTable = {};

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/remarkcategories/" : "https://webapps-jnj-dev.smint.us/api/remarkcategories/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    clearTimeout(xmlHttpTimeout);
                    var data = xmlhttp.responseText;

                    borg.setPersistentItem("talk.track.tables['remarkCat']", JSON.parse(data).remarkCategories);
                    remarkCatTable = borg.getPersistentItem("talk.track.tables['remarkCat']");
                    global.remarkCatTable = borg.getPersistentItem("talk.track.tables['remarkCat']");
                    console.log('getting remarkCAT table - success');

                    if (borg.pageId === "remarkLibPage") {

                        remarksLibObj.spawnDataRemarksLib();

                        borg.runAction({
                            "action": "runScriptAction",
                            "trigger": "now",
                            "delay": 0.1,
                            "target": "#jsBridge",
                            "data": {
                                "script": "remarksLibObj.toggleRemarkCat2();"
                            }
                        });
                    }
                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    clearTimeout(xmlHttpTimeout);
                    var data = xmlhttp.responseText;

                    remarkCat403 = JSON.parse(data);

                    console.log('getting remarkCAT table - failure');

                    var success = remarkCat403['success'];
                    var status = remarkCat403['status'];

                    if (status == 'Invalid session.') {
                        login();
                        console.log('logging back in');
                    }
                    remarkCatTable = borg.getPersistentItem("talk.track.tables['remarkCat']");

                    if (borg.pageId === "remarkLibPage") {

                        remarksLibObj.spawnDataRemarksLib();

                        borg.runAction({
                            "action": "runScriptAction",
                            "trigger": "now",
                            "delay": 0.1,
                            "target": "#jsBridge",
                            "data": {
                                "script": "remarksLibObj.toggleRemarkCat2();"
                            }
                        });
                    }
                }
            };
            xmlhttp.open("GET", url, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.withCredentials = true;
            xmlhttp.send();

            var xmlHttpTimeout = setTimeout(ajaxTimeout, 5000);

            function ajaxTimeout() {
                xmlhttp.abort();
                //alert("Request timed out - remarkGetTable2");
                console.log("Request timed out");

                global.remarkCatTable = borg.getPersistentItem("talk.track.tables['remarkCat']");

                if (borg.pageId === "remarkLibPage") {

                    remarksLibObj.spawnDataRemarksLib();

                    borg.runAction({
                        "action": "runScriptAction",
                        "trigger": "now",
                        "delay": 0.1,
                        "target": "#jsBridge",
                        "data": {
                            "script": "remarksLibObj.toggleRemarkCat2();"
                        }
                    });
                }
            }

        }
        else if (isOnline === false) {
            global.remarkCatTable = borg.getPersistentItem("talk.track.tables['remarkCat']");

            if (borg.pageId === "remarkLibPage") {

                remarksLibObj.spawnDataRemarksLib();

                borg.runAction({
                    "action": "runScriptAction",
                    "trigger": "now",
                    "delay": 0.1,
                    "target": "#jsBridge",
                    "data": {
                        "script": "remarksLibObj.toggleRemarkCat2();"
                    }
                });
            }
        }
    },
    spawnDataRemarksModal: function () {

        gVars.searchArr2 = [];
        //        borg.setText("searchInputModal", "");

        if (!hideSearch) {
            setTimeout(function () {
                performAction(
                    [
                        {
                            "action": "#spawnOnce",
                            "data": {
                                "overlayId": "stopSearchButtonModal"
                            }
                        },
                        {
                            "_action": "setEnabledAction",
                            "target": "stopSearchButtonModal",
                            "data": {
                                "enabled": false
                            }
                        }

                    ]
                )
            }, 400);
        }
        else {
            performAction([
                {
                    "_action": "close",
                    "trigger": "now",
                    "target": "searchContainerModal"
                },
                {
                    "action": "close",
                    "trigger": "now",
                    "target": "stopSearchButtonModal"
                }
            ])

        }

        var remarksLibOverlayArray = [];
        //        var remarkCatTable = borg.getPersistentItem("talk.track.tables['remarkCat']");
        //        var remarksTable = borg.getPersistentItem("talk.track.tables['remarks']");
        //        var activityRemarksTable = borg.getPersistentItem("talk.track.tables['activityRemarks']");
        var remarkCatTable = global.remarkCatTable
        var remarksTable = global.remarksTable;
        var activityRemarksTable = global.activityRemarksTable;


        var fontSize;
        var fontColor;
        var bgVal;
        var bgPos;
        var bgRep;
        var carat;
        var height;
        var width;
        var totalHeight;
        var img;
        var imgDown;
        var actionsBlock;
        var catIdArray = [];
        var remCatTableArr = [];

        for (i in remarkCatTable) {
            remarkCatTable[i].id = i;
            var a = remarkCatTable[i];
            remCatTableArr.push(a)
            console.log(JSON.stringify(a))
        }

        for (i in remarksTable) {
            gVars.searchArr2.push(remarksTable[i]);
            //            if (remarksTable[i].categoryId === index) {
            //                remarkCatSubSelection[remarksTable[i].id] = remarksTable[i];
            //                remarkCatSubSelection2.push(remarksTable[i]);
            //                //TODO: comment this in if search will be non-global
            //                //                gVars.searchArr.push(remarksTable[i]);
            //            }
        }


        remCatTableArr.sort(sort_by('catName', true, function (a) {
            return a.toUpperCase();
        }));

        for (var i = 0; i < remCatTableArr.length; i++) {
            totalHeight += 72;
            catIdArray.push(remCatTableArr[i].id);

            catIcon = (remCatTableArr[i].catIcon === "") ? "financeFolder.png" : remCatTableArr[i].catIcon;
            fontSize = "1.2em";
            fontColor = '#000000';
            bgVal = (i % 2) ? "Spine/images/paperTexture.png" : "Spine/images/paperTextureDark.png";
            bgPos = "center";
            bgRep = "repeat";
            carat = ">";
            height = "72px";
            width = "472px";
            img = (i % 2) ? "Spine/images/listCell472pt.png" : "Spine/images/listCell472ptDark.png";
            imgDown = "Spine/images/listCell472pt-tap.png";
            actionsBlock = [
                {
                    "_action": "close",
                    "target": "searchContainerModal"
                },
                {
                    "action": "runScriptAction",
                    "target": "#jsBridge",
                    "data": {
                        "script": "remarksLibObj.spawnDataAddRemark(" + remCatTableArr[i].id + ");"
                    }
                },
                {
                    "action": "animate",
                    "trigger": "touchupinside",
                    "target": "doubleWideRemarksContainerToAnimate",
                    "delay": 0,
                    "data": {
                        "animationIds": [
                            "moveDoubleWideToTheLeft"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "target": "remarkLibTitle",
                    "data": {
                        "animationIds": [
                            "FadeOutQuick"
                        ]
                    }
                },
                {
                    "action": "animate",
                    "targets": [
                        "backToRemarkCategoriesButton2",
                        "internalRemarksTitle"
                    ],
                    "data": {
                        "animationIds": [
                            "FadeInQuick"
                        ]
                    }
                }
            ]

            remarksLibOverlayArray.push({
                "overlayId": "remarkCatSelecterSub" + i,
                "type": "container",
                "layoutType": "flow",
                "layoutOptions": {
                    "margin-top": "0px",
                    "marginY": "0px",
                    "paddingY": "0px",
                    "margin-bottom": "0px",
                    "margin-left": "0px",
                    "marginX": "0px",
                    "paddingX": "0px",
                    "margin-right": "0px"
                },
                "clipToBounds": true,
                "width": width,
                "height": "auto",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "overlays": [
                    {
                        "overlayId": "remarksLibCatSelectorBtn" + remCatTableArr[i].id,
                        "images": [img],
                        "imagesDown": [imgDown],
                        "type": "Button",
                        "relative": "screen",
                        "toggle": true,
                        "radioGroup": "remarksCat",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "0px",
                        "borderWidth": "1px",
                        "borderColor": "#333333",
                        "actions": actionsBlock
                    },
                    {
                        "overlayId": "remarksLibCatWrapper",
                        "width": width,
                        "overlays": [
                            {
                                "overlayId": "remarksLibCatSelectorText",
                                "text": remCatTableArr[i].catName,
                                "x": "85px",
                                "y": "27px",
                                "width": width,
                                "size": fontSize,
                                "fontColor": fontColor
                            },
                            {
                                "overlayId": "catFolderIcon",
                                "type": "image",
                                "images": ["Spine/images/" + catIcon],
                                "relative": "parent",
                                "x": "40px",
                                "y": "35px"
                            },
                            {
                                "overlayId": "catFolderBtn" + i,
                                "type": "button",
                                "color": "#magic",
                                "relative": "parent",
                                "width": width,
                                "height": "68px",
                                "actions": actionsBlock
                            }
                        ]
                    }
                ]
            });
        }
        var firstCat = catIdArray[0];
        //alert(JSON.stringify(firstCat));
        borg.setPersistentItem('talk.track.firstCat', firstCat);

        var z;
        moreBorg.containerSpawn(remarksLibOverlayArray, 'remarkCategoriesContainer', false)
        remarksLibOverlayArray = [];
    },
    spawnDataRemarksLib: function () {

        if (!hideSearch) {
            performAction([
                {
                    "action": "#spawnOnce",
                    "data": {
                        "overlayId": "searchContainer"
                    }
                },
                {
                    "action": "#spawnOnce",
                    "data": {
                        "overlayId": "stopSearchButton"
                    }
                }
            ])

        } else {
            performAction([
                {
                    "action": "close",
                    "trigger": "now",
                    "target": "searchContainer"
                },
                {
                    "action": "#close",
                    "data": {
                        "overlayId": "stopSearchButton"
                    }
                }
            ])
        }

        var remarksLibOverlayArray = [];
        var remarkCatTable = global.remarkCatTable
        var remarksTable = global.remarksTable;
        var activityRemarksTable = global.activityRemarksTable;

        var fontSize;
        var fontColor;
        var bgVal;
        var bgPos;
        var bgRep;
        var carat;
        var height;
        var width;
        var totalHeight;
        var img;
        var imgDown;
        var actionsBlock;
        var catIdArray = [];
        var remCatTableArr = [];

        for (i in remarkCatTable) {
            remarkCatTable[i].id = i;
            var a = remarkCatTable[i];
            remCatTableArr.push(a)
        }

        remCatTableArr.sort(sort_by('catName', true, function (a) {
            return a.toUpperCase();
        }));

        for (var i = 0; i < remCatTableArr.length; i++) {
            totalHeight += 72;
            catIdArray.push(remCatTableArr[i].id);

            catIcon = (remCatTableArr[i].catIcon === "") ? "financeFolder.png" : remCatTableArr[i].catIcon;
            fontSize = "1em";
            fontColor = '#FFFFFF';
            bgVal = "";
            bgPos = "";
            bgRep = "";
            carat = ">";
            height = "68px";
            width = "243px";
            img = "Spine/images/categoryCell.png";
            imgDown = "Spine/images/categoryCell-tap.png";
            actionsBlock = [
                {
                    "action": "runScriptAction",
                    "trigger": "touchUpInside",
                    "delay": 0.01,
                    "target": "#jsBridge",
                    "data": {
                        "script": "borg.setPersistentItem('talk.track.remarkToggled'," + remCatTableArr[i].id + ");"

                    }
                },
                {
                    "action": "close",
                    "target": "internalRemarksScrollingContainerInvisible"
                },
                {
                    "action": "#spawnOnce",
                    "delay": 0.01,
                    "trigger": "touchUpInside",
                    "data": {
                        "overlayId": "internalRemarksScrollingContainerInvisible"
                    }
                },
                {
                    "action": "runScriptAction",
                    "delay": 0.01,
                    "target": "#jsBridge",
                    "data": {
                        "script": "remarksLibObj.spawnDataRemarksLib2(" + remCatTableArr[i].id + ");"
                    }
                }
            ]

            //            remCatTableArr[i].catName
            var catNamez = (remCatTableArr[i].catName.length > 27) ? remCatTableArr[i].catName.substr(0, 18) + "..." : remCatTableArr[i].catName;

            remarksLibOverlayArray.push({
                "overlayId": "remarkCatSelecterSub" + i,
                "type": "container",
                "layoutType": "flow",
                "layoutOptions": {
                    "margin-top": "0px",
                    "marginY": "0px",
                    "paddingY": "0px",
                    "margin-bottom": "0px",
                    "margin-left": "0px",
                    "marginX": "0px",
                    "paddingX": "0px",
                    "margin-right": "0px"
                },
                "clipToBounds": true,
                "width": width,
                "height": "auto",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "overlays": [
                    {
                        "overlayId": "remarksLibCatSelectorBtn" + remCatTableArr[i].id,
                        "images": [img],
                        "imagesDown": [imgDown],
                        "type": "Button",
                        "relative": "screen",
                        "toggle": true,
                        "radioGroup": "remarksCat",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "0px",
                        "borderWidth": "1px",
                        "borderColor": "#333333",
                        "actions": actionsBlock
                    },
                    {
                        "overlayId": "remarksLibCatWrapper",
                        "width": width,
                        "overlays": [
                            {
                                "overlayId": "remarksLibCatSelectorText",
                                "text": catNamez,
                                "x": "85px",
                                "y": "27px",
                                "width": width,
                                "size": fontSize,
                                "fontColor": fontColor
                            },
                            {
                                "overlayId": "catFolderIcon",
                                "type": "image",
                                "images": ["Spine/images/" + catIcon],
                                "relative": "parent",
                                "x": "40px",
                                "y": "35px"
                            },
                            {
                                "overlayId": "catFolderBtn" + i,
                                "type": "button",
                                "color": "#magic",
                                "relative": "parent",
                                "width": width,
                                "height": "68px",
                                "actions": actionsBlock
                            }
                        ]
                    }
                ]
            });
        }
        var firstCat = catIdArray[0];

        borg.setPersistentItem('talk.track.firstCat', firstCat);

        var z;
        moreBorg.containerSpawn(remarksLibOverlayArray, 'remarkCatSelecter', false);

        remarksLibOverlayArray = [];
    },
    spawnDataRemarksLib2: function (index) {

        console.log("spawnDataRemarksLib2" + gVars.didSearch + index)
        if (gVars.didSearch) {
            //            moreBorg.toggle("stopSearchButton", "on");
            //            return;

        } else {
        }

        var remarksTable = global.remarksTable;
        var remarksLibOverlayArray2 = [];
        var remarkCatSubSelection = {};
        var remarkCatSubSelection2 = [];

        gVars.searchArr = [];
        borg.setText("searchInput", "")

        for (i in remarksTable) {
            gVars.searchArr.push(remarksTable[i]);
            if (remarksTable[i].categoryId === index) {
                remarkCatSubSelection[remarksTable[i].id] = remarksTable[i];
                remarkCatSubSelection2.push(remarksTable[i]);
                //TODO: comment this in if search will be non-global
                //                gVars.searchArr.push(remarksTable[i]);
            }
        }

        //remarkCatSubSelection2.sort(sort_by('title', true, function (a) {return a.toUpperCase()}));
        //ES: Testing the Sugar libarary's accent-sensitive alphanumeric collation:
//        console.log(JSON.stringify(remarkCatSubSelection2));
        var remarkCatSubSelection3 = remarkCatSubSelection2.sortBy("title");
        //        console.log(JSON.stringify(remarkCatSubSelection3))

        if (remarkCatSubSelection3.length == 0) {

            borg.runAction({
                "action": "setHiddenAction",
                "target": "noRemarksCardText",
                "trigger": "now",
                "data": {
                    "hidden": false
                }
            });
        }

        for (var i = 0; i < remarkCatSubSelection3.length; i++) {

            borg.runAction({
                "action": "setHiddenAction",
                "target": "noRemarksCardText",
                "trigger": "now",
                "data": {
                    "hidden": true
                }
            });

            remarksLibOverlayArray2.push({
                "overlayId": "remarksCardShadowContainer2",
                "type": "container",
                "relative": "parent",
                "borderColor": "#666666",
                "cornerRadius": "4px",
                "borderWidth": "1px",
                "width": "465px",
                "height": "auto",
                "layoutType": "flow",
                "verticalAlign": "top",
                "horizontalAlign": "left",
                "x": "",
                "y": "",
                "overlays": [
                    {
                        "overlayId": "remarksCardBackgroundContainer2",
                        "overlays": [
                            {
                                "overlayId": "remarkCardTitleText",
                                "text": "<strong>" + remarkCatSubSelection3[i].title + "</strong>"
                            },
                            {
                                "overlayId": "remarkCardText",
                                "text": remarkCatSubSelection3[i].remark
                            }
                        ]
                    }
                ]
            });
        }

        borg.runAction({
            "action": "close",
            "trigger": "now",
            "target": "internalRemarksScrollingContainerInvisible"
        });

        borg.runAction({
            "action": "#spawnOnce",
            "data": {
                "overlayId": "internalRemarksScrollingContainerInvisible"
            }});

        moreBorg.containerSpawn(remarksLibOverlayArray2, 'internalRemarksScrollingContainerInvisible', false);
        remarksLibOverlayArray2 = [];

        borg.runAction({
            "action": "close",
            "trigger": "now",
            "target": "remarksLibraryLoadSpinner"
        });
        borg.runAction({
            "action": "close",
            "target": "imageToPreventUsersFromMashingTheButtons",
            "delay": 1.2,
            "trigger": "now"
        });
    },
    resetSearch: function (dontClear) {
        gVars.didSearch = false;
        gVars.didSearch2 = false;
        remarkCatSubSelection2 = [];

        if (!dontClear) {
            borg.setText("searchInput", "");
            borg.setText("searchInputModal", "");
            gVars.searchArr = [];
            gVars.searchArr2 = [];
        } else {
        }
        performAction([
            {
                "_action": "setEnabledAction",
                "target": "stopSearchButton",
                "data": {
                    "enabled": false
                }
            },
            {
                "_action": "setEnabledAction",
                "target": "stopSearchButtonModal",
                "data": {
                    "enabled": false
                }
            }
        ])

        //        gVars.remarksArr = [];
    },
    searchRemarkLib: function (searchTerm) {

        console.log(searchTerm + " : " + gVars.didSearch)

        //not long enough to search yet
        if (searchTerm.length < 3) {

            borg.runAction({
                "action": "setHiddenAction",
                "target": "noRemarksCardText",
                "trigger": "now",
                "data": {
                    "hidden": true
                }
            });

            if (searchTerm.length == 0) {
                //no exit button yet
                performAction([
                    {
                        "action": "setAlphaAction",
                        "target": "stopSearchButton",
                        "data": {
                            "alpha": 0
                        }
                    }

                ]);
            } else {
                performAction([
                    {
                        "action": "setAlphaAction",
                        "target": "stopSearchButton",
                        "data": {
                            "alpha": 1
                        }
                    }
                ]);

            }
            console.log('time to do the shit and reset1')
            performAction([
                {
                    "action": "close",
                    "trigger": "now",
                    "target": "selectRemarkCategoryContainer"
                },
                {
                    "action": "close",
                    "target": "scrollingAddInternalRemarksContainer"
                },
                {
                    "action": "close",
                    "target": "resultsContainer"
                },
                {
                    "action": "runScriptAction",
                    "target": "#jsBridge",
                    "data": {
                        "script": "remarksLibObj.resetSearch(true)"
                    }
                },
                {
                    "action": "spawnOnce",
                    "target": "doubleWideRemarksContainerToAnimate",
                    "data": {
                        "overlayId": "resultsContainer",
                        "type": "container",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "0px",
                        "clipToBounds": true,
                        "height": "799px",
                        "width": "532px",
                        "overlays": [
                            {
                                "overlayId": "scrollingAddInternalRemarksContainer",
                                "height": "720px",
                                "y": "90px"
                            },
                            {
                                "overlayId": "dashboardReTopBar_txt",
                                "text": "<span style='text-shadow:0px -1px 1px #0b7890'>Search Results</span>",
                                "x": "-119px"
                            },
                            {
                                "overlayId": "backToRemarkCategoriesButton",
                                "actions": [
                                    {
                                        "action": "spawn",
                                        "target": "doubleWideRemarksContainerToAnimate",
                                        "data": {
                                            "overlayId": "selectRemarkCategoryContainer"
                                        }
                                    },
                                    {
                                        "action": "animate",
                                        "target": "backToRemarkCategoriesButton",
                                        "data": {
                                            "animationIds": [
                                                "FadeOutQuick"
                                            ]
                                        }
                                    },
                                    {
                                        "action": "close",
                                        "target": "dashboardReTopBar_txt"
                                    },
                                    {
                                        "action": "close",
                                        "target": "scrollingAddInternalRemarksContainer"
                                    },
                                    {
                                        "_action": "setAlphaAction",
                                        "target": "stopSearchButtonModal",
                                        "data": {
                                            "alpha": 0
                                        }
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "remarksLibObj.resetSearch();"
                                        }
                                    },
                                    {
                                        "action": "bringToFront",
                                        "target": "searchContainerModal"
                                    }
                                ]
                            }
                        ]
                    }
                }
            ])

            var remarksLibOverlayArray2 = [];

            remarksLibOverlayArray2.push({
                "overlayId": "remarksCardShadowContainer2",
                "type": "container",
                "relative": "parent",
                "borderColor": "#666666",
                "cornerRadius": "4px",
                "borderWidth": "1px",
                "width": "465px",
                "height": "auto",
                "layoutType": "flow",
                "verticalAlign": "top",
                "alpha": 0,
                "horizontalAlign": "left",
                "x": "",
                "y": "",
                "overlays": [
                    {
                        "overlayId": "remarksCardBackgroundContainer2",
                        "overlays": [
                            {
                                "overlayId": "remarkCardTitleText",
                                "text": "<strong>" + "No Remark Found" + "</strong>"
                            }
                        ]
                    }
                ]
            });

            moreBorg.replaceOverlays('internalRemarksScrollingContainerInvisible', remarksLibOverlayArray2);

            return

        } else {
        }


        if (searchTerm != '' && !gVars.didSearch) {

            remarksLibObj.toggleRemarkCat2(true);
            gVars.didSearch = true;

        } else if (searchTerm == '') {
            //            remarksLibObj.toggleRemarkCat2();
            gVars.didSearch = false;

        } else {
        }

        var remarksTable = global.remarksTable;
        var remarksLibOverlayArray2 = [];


        var close = {
            "action": "close",
            "target": "internalRemarksScrollingContainerInvisible"
        }

        var spawn = {
            "action": "#spawnOnce",
            "data": {
                "overlayId": "internalRemarksScrollingContainerInvisible"
            }

        }

        borg.runAction(close);
        borg.runAction(spawn);


        if (fuzzySearch) {
            var options = {
                keys: ['remark', 'title'],
                threshold: 0.3
            }
            var f = new Fuse(gVars.searchArr, options);
            var matches = f.search(searchTerm);

            var d = {};

            for (var i = 0; i < matches.length; i++) {
                if (d[matches[i].id]) {

                } else {
                    d[matches[i].id] = 0;
                }
                d[matches[i].id]++;
                if (d[matches[i].id] > 1) {
                    matches.splice(i, 1);
                } else {
                }
            }


        } else {

            var matches = gVars.searchArr.filter(
                function (val) {
                    var lower = val.title.toLowerCase();
                    var lowerRem = val.remark.toLowerCase();
                    searchTerm = searchTerm.toLowerCase();
                    if (lower.indexOf(searchTerm) != -1 || lowerRem.indexOf(searchTerm) != -1) {
                        return val;
                    }
                });

            matches = matches.filter(function (val) {
                return !(val === null);
            });

        }


        matches = matches.sortBy("title");

        console.log(JSON.stringify(matches.length))

        var rowOverlays = [];
        var d = 0;

        if (matches.length == 0) {

            remarksLibOverlayArray2.push({
                "overlayId": "remarksCardShadowContainer2",
                "type": "container",
                "relative": "parent",
                "borderColor": "#666666",
                "cornerRadius": "4px",
                "borderWidth": "1px",
                "width": "465px",
                "height": "auto",
                "layoutType": "flow",
                "verticalAlign": "top",
                "horizontalAlign": "left",
                "x": "",
                "y": "",
                "overlays": [
                    {
                        "overlayId": "remarksCardBackgroundContainer2",
                        "overlays": [
                            {
                                "overlayId": "remarkCardTitleText",
                                "text": "<strong>" + "No Remark Found" + "</strong>"
                            }
                        ]
                    }
                ]
            });

        } else {
        }


        for (i in matches) {
            d++;
            if (matches[i].id != null) {

                var title = matches[i].title;
                var id = matches[i].id;
                var origTit = title;
                title = (title.length > 230) ? title.substr(0, 230) + "..." : title;
                var remark = (matches[i].remark.length > 328) ? matches[i].remark.substr(0, 328) + "..." : matches[i].remark;

                remarksLibOverlayArray2.push({
                    "overlayId": "remarksCardShadowContainer2",
                    "type": "container",
                    "relative": "parent",
                    "borderColor": "#666666",
                    "cornerRadius": "4px",
                    "borderWidth": "1px",
                    "width": "465px",
                    "height": "auto",
                    "layoutType": "flow",
                    "verticalAlign": "top",
                    "horizontalAlign": "left",
                    "x": "",
                    "y": "",
                    "overlays": [
                        {
                            "overlayId": "remarksCardBackgroundContainer2",
                            "overlays": [
                                {
                                    "overlayId": "remarkCardTitleText",
                                    "text": "<strong>" + title + "</strong>"
                                },
                                {
                                    "overlayId": "remarkCardText",
                                    "text": remark
                                }
                            ]
                        }
                    ]
                });
            } else {
            }

        }
        moreBorg.containerSpawn(remarksLibOverlayArray2, 'internalRemarksScrollingContainerInvisible', false);
        remarksLibOverlayArray2 = [];
    },
    searchRemarkLibBio: function (searchTerm, resize) {

        //        console.log("search term is "+searchTerm)
        //        console.log(searchTerm + " : " + JSON.stringify(gVars.searchArr3))

        if (resize == true && !gVars.bioResized) {
            console.log('resizezzzzz')
            var close = {
                "action": "close",
                "target": "ab_vert_scroll_container"
            }

            var spawn = {
                "action": "#spawnOnce",
                "data": {
                    "overlayId": "ab_vert_scroll_container",
                    "x": "24px",
                    "y": "400px",
                    "height": "530px",
                    "width": "226px"
                }

            }

            borg.runAction(close);
            borg.runAction(spawn);
            moreBorg.containerSpawn(gVars.bioSearchRez, 'ab_vert_scroll_container', false);

            //TODO: added for post keyboard search toggling - coment out if not working
            localJSONObject.toggleButton()

            return;

        } else if (resize == true && gVars.bioResized) {

            biosObj.spawnDataBioPage2();
            gVars.bioResized = false;
            return
        }
        else {
        }


        //not long enough to search yet
        if (searchTerm.length < 3) {

            if (searchTerm.length == 0) {
                //no exit button yet
                performAction([
                    {
                        "action": "setAlphaAction",
                        "target": "stopSearchButtonBio",
                        "data": {
                            "alpha": 0
                        }
                    }

                ]);
            } else {
                performAction([
                    {
                        "action": "setAlphaAction",
                        "target": "stopSearchButtonBio",
                        "data": {
                            "alpha": 1
                        }
                    }
                ]);

            }
            console.log('time to do the shit and reset in the bios')
            performAction([
                {
                    "action": "close",
                    "trigger": "now",
                    "target": "ab_vert_scroll_container"
                },
                {
                    "action": "runScriptAction",
                    "target": "#jsBridge",
                    "data": {
                        "script": "remarksLibObj.resetSearch(true)"
                    }
                },
                {
                    "action": "spawnOnce",
                    "data": {
                        "overlayId": "ab_vert_scroll_container"
                    }
                }
            ])

            var bioOverlayArray2 = [];

            bioOverlayArray2.push({
                "overlayId": "ab_vert_scroll_sub" + i,
                "type": "container",
                "width": "227px",
                "height": "62px",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "lazyLoad": true,
                "relative": "parent",
                "clipToBounds": true,
                "overlays": [
                    {
                        "overlayId": "ab_vert_trans_btn2z",
                        "type": "Button",
                        "width": "227px",
                        "height": "60px",
                        "images": [
                            "Spine/images/attendeeDivider.png"
                        ],
                        "imagesDown": [
                            "Spine/images/selectedCell.png"
                        ],
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "-1px"
                    },
                    {
                        "overlayId": "ab_vert_scroll_name_valu2ze",
                        "type": "text",
                        "text": "<strong>" + "No Bio Found" + "</strong>",
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "width": "200px",
                        "height": "20px",
                        "x": "10px",
                        "y": "9px",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.0em",
                        "relative": "parent"
                    }
                ]
            });

            moreBorg.replaceOverlays('ab_vert_scroll_container', bioOverlayArray2);
            //            moreBorg.containerSpawn(bioOverlayArray2, 'internalRemarksScrollingContainerInvisible', false);

            //TODO: added for post keyboard search toggling - comment out if not working
            localJSONObject.toggleButton()
            return

        } else {
        }


        if (searchTerm != '' && !gVars.didSearch) {

            remarksLibObj.toggleRemarkCat2(true);
            gVars.didSearch = true;

        } else if (searchTerm == '') {
            //            remarksLibObj.toggleRemarkCat2();
            gVars.didSearch = false;

        } else {
        }

        var remarksTable = global.remarksTable;
        var bioOverlayArray2 = [];


        var close = {
            "action": "close",
            "target": "ab_vert_scroll_container"
        }

        var spawn = {
            "action": "#spawnOnce",
            "data": {
                "overlayId": "ab_vert_scroll_container",
                "x": "24px",
                "y": "400px",
                "height": "340px",
                "width": "226px"
            }

        }

        borg.runAction(close);
        borg.runAction(spawn);


        if (fuzzySearch) {
            var options = {
                keys: ['firstName', 'lastName', 'company', 'title'],
                threshold: 0.2
            }
            var f = new Fuse(gVars.searchArr3, options);
            var termArr = searchTerm.split(' ');
            var matchesArr = [];
            var resArr = [];


            //TODO: Comment back in for two-string searching
//            if (termArr.length > 1) {
//
//                for (var i = 0; i < termArr.length; i++) {
//                    if (termArr[i].length > 2) {
//                        var res = f.search(termArr[i]);
//                        matchesArr.push(res)
//
//                    } else {
//
//                    }
//                }
//                console.log("dual string matches  "+JSON.stringify(matchesArr))
//                var tempArr = []
//                for (var i = 0; i < matchesArr.length; i++) {
//                    resArr = tempArr;
//                    tempArr = resArr.concat(matchesArr[i]).unique()
//                }
//                var matches;
//                gVars.bioResults, matches = tempArr
//
//            } else {
//                var matches = f.search(searchTerm);
//                gVars.bioResults = matches;
//            }


            //TODO: cand comment these out
            var matches = f.search(searchTerm);
            gVars.bioResults = matches;
            //
            var d = {};

            for (var i = 0; i < matches.length; i++) {
                if (d[matches[i].id]) {
                } else {
                    d[matches[i].id] = 0;
                }
                d[matches[i].id]++;
                if (d[matches[i].id] > 1) {
                    matches.splice(i, 1);
                } else {
                }
            }


        } else {

            var matches = gVars.searchArr.filter(
                function (val) {
                    var lower = val.firstName.toLowerCase();
                    var lowerRem = val.lastName.toLowerCase();
                    searchTerm = searchTerm.toLowerCase();
                    if (lower.indexOf(searchTerm) != -1 || lowerRem.indexOf(searchTerm) != -1) {
                        return val;
                    }
                });

            matches = matches.filter(function (val) {
                return !(val === null);
            });

        }

        matches = matches.sortBy("lastName");
        console.log(JSON.stringify(matches.length))

        var rowOverlays = [];
        var d = 0;

        if (matches.length == 0) {

            bioOverlayArray2.push({
                "overlayId": "ab_vert_scroll_subsdd",
                "type": "container",
                "width": "227px",
                "height": "62px",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "lazyLoad": true,
                "relative": "parent",
                "clipToBounds": true,
                "overlays": [
                    {
                        "overlayId": "ab_vert_trans_btn2z",
                        "type": "Button",
                        "width": "227px",
                        "height": "60px",
                        "images": [
                            "Spine/images/attendeeDivider.png"
                        ],
                        "imagesDown": [
                            "Spine/images/selectedCell.png"
                        ],
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "-1px"
                    },
                    {
                        "overlayId": "ab_vert_scroll_name_valu2ze",
                        "type": "text",
                        "text": "<strong>" + "No Bio Found" + "</strong>",
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "width": "200px",
                        "height": "20px",
                        "x": "10px",
                        "y": "9px",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.0em",
                        "relative": "parent"
                    }
                ]
            });

        } else {
        }

        for (i in matches) {
            //
            //            if (first) {
            //                var distFromStart = 0;
            //                first = false;
            //            } else {
            //
            //                var distFromStart = 242 - totalWidth;
            //                distFromStart = Math.abs(distFromStart)
            //            }
            //            totalWidth += 313;

            var distFromStart = 22;

            d++;
            if (matches[i].id != null) {

                //                var title = matches[i].title;
                //                var id = matches[i].id;
                //                var origTit = title;
                //                title = (title.length > 230) ? title.substr(0, 230) + "..." : title;
                //                var remark = (matches[i].remark.length > 328) ? matches[i].remark.substr(0, 328) + "..." : matches[i].remark;

                var name = matches[i].firstName + " " + matches[i].lastName;
                name = (name.length > 18) ? name.substr(0, 18) + "..." : name;
                var company = (matches[i].company.length > 28) ? matches[i].company.substr(0, 28) + "..." : matches[i].company;

                //                alert(name + company)

                bioOverlayArray2.push({
                    "overlayId": "ab_vert_scroll_sub" + i,
                    "type": "container",
                    "width": "227px",
                    "height": "62px",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "lazyLoad": true,
                    "relative": "parent",
                    "clipToBounds": true,
                    "overlays": [
                        {
                            "overlayId": "ab_vert_trans_btn" + matches[i].id,
                            "type": "Button",
                            "width": "227px",
                            "height": "60px",
                            "images": [
                                "Spine/images/attendeeDivider.png"
                            ],
                            "imagesDown": [
                                "Spine/images/selectedCell.png"
                            ],
                            "relative": "parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "0px",
                            "y": "-1px",
                            "toggle": true,
                            "radioGroup": "ab_vert",
                            "actions": [
                                {
                                    "action": "runScriptAction",
                                    "trigger": "toggleOn",
                                    "_delay": 0.1,
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "biosObj.offsetHorzAttendee('" + distFromStart + "', '" + matches[i].id + "' );"
                                    }
                                },
                                {
                                    "action": "runScriptAction",
                                    "trigger": "toggleOn",
                                    "delay": 0.2,
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "biosObj.spawnCard('" + matches[i].id + "');"
                                    }
                                }
                            ]
                        },
                        {
                            "overlayId": "ab_vert_scroll_name_value" + i,
                            "type": "text",
                            "text": "<strong>" + name + "</strong>",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "width": "200px",
                            "height": "20px",
                            "x": "10px",
                            "y": "9px",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#3d3d3d",
                            "size": "1.0em",
                            "relative": "parent"
                        },
                        {
                            "overlayId": "ab_vert_scroll assoc_value" + i,
                            "type": "text",
                            "text": "<strong>" + company + "</strong>",
                            "width": "200px",
                            "height": "20px",
                            "x": "10px",
                            "y": "30px",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#3d3d3d",
                            "size": "0.9em",
                            "relative": "parent"
                        }
                    ]
                });

            } else {
            }


//            console.log("ZZZZZ" + JSON.stringify(bioOverlayArray2))
        }
        moreBorg.containerSpawn(bioOverlayArray2, 'ab_vert_scroll_container', false);
        gVars.bioSearchRez = bioOverlayArray2;

        bioOverlayArray2 = [];
    },
    searchRemarkLibModal: function (searchTerm) {

        //not long enough to search yet
        if (searchTerm.length < 3) {

            if (searchTerm.length == 0) {
                //no exit button yet
                performAction([
                    {
                        "action": "#spawnOnce",
                        "data": {
                            "overlayId": "stopSearchButtonModal"
                        }

                    },
                    {
                        "action": "setAlphaAction",
                        "target": "stopSearchButtonModal",
                        "data": {
                            "alpha": 0


                        }
                    }

                ]);
            } else {
                performAction([
                    {
                        "action": "setAlphaAction",
                        "target": "stopSearchButtonModal",
                        "data": {
                            "alpha": 1
                        }
                    }
                ]);

            }
            console.log('time to do the shit and reset')
            performAction([
                {
                    "action": "close",
                    "trigger": "now",
                    "target": "selectRemarkCategoryContainer"
                },
                {
                    "action": "close",
                    "target": "scrollingAddInternalRemarksContainer"
                },
                {
                    "action": "close",
                    "target": "resultsContainer"
                },
                {
                    "action": "runScriptAction",
                    "target": "#jsBridge",
                    "data": {
                        "script": "remarksLibObj.resetSearch(true)"
                    }
                },
                {
                    "action": "spawnOnce",
                    "target": "doubleWideRemarksContainerToAnimate",
                    "data": {
                        "overlayId": "resultsContainer",
                        "type": "container",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "0px",
                        "clipToBounds": true,
                        "height": "799px",
                        "width": "532px",
                        "overlays": [
                            {
                                "overlayId": "scrollingAddInternalRemarksContainer",
                                "height": "720px",
                                "y": "90px"
                            },
                            {
                                "overlayId": "dashboardReTopBar_txt",
                                "text": "<span style='text-shadow:0px -1px 1px #0b7890'>Search Results</span>",
                                "x": "-119px"
                            },
                            {
                                "overlayId": "backToRemarkCategoriesButton",
                                "actions": [
                                    {
                                        "action": "spawn",
                                        "target": "doubleWideRemarksContainerToAnimate",
                                        "data": {
                                            "overlayId": "selectRemarkCategoryContainer"
                                        }
                                    },
                                    {
                                        "action": "animate",
                                        "target": "backToRemarkCategoriesButton",
                                        "data": {
                                            "animationIds": [
                                                "FadeOutQuick"
                                            ]
                                        }
                                    },
                                    {
                                        "action": "close",
                                        "target": "dashboardReTopBar_txt"
                                    },
                                    {
                                        "action": "close",
                                        "target": "scrollingAddInternalRemarksContainer"
                                    },
                                    {
                                        "_action": "setAlphaAction",
                                        "target": "stopSearchButtonModal",
                                        "data": {
                                            "alpha": 0
                                        }
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "remarksLibObj.resetSearch();"
                                        }
                                    },
                                    {
                                        "action": "bringToFront",
                                        "target": "searchContainerModal"
                                    }
                                ]
                            }
                        ]
                    }
                }
            ])

            var remarksLibOverlayArray2 = [];

            remarksLibOverlayArray2.push({
                "overlayId": "remarksCardShadowContainer",
                "type": "container",
                "relative": "parent",
                "width": "490px",
                "height": "225px",
                "alpha": 0,
                "clipToBounds": true,
                "backgroundImage": "Spine/images/NoRemarksFound.png",
                "verticalAlign": "top",
                "horizontalAlign": "left",
                "x": "",
                "y": ""
            });

            moreBorg.replaceOverlays('scrollingAddInternalRemarksContainer', remarksLibOverlayArray2);

            return

        } else {
        }

        remarkCatSubSelection2 = [];

        console.log(searchTerm + " xxx:xxxx " + gVars.didSearch2)

        if (searchTerm != '' && !gVars.didSearch2) {

            performAction([
                {
                    "action": "close",
                    "target": "resultsContainer"
                },
                {
                    "action": "spawn",
                    "target": "doubleWideRemarksContainerToAnimate",
                    "data": {
                        "overlayId": "resultsContainer",
                        "type": "container",
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "0px",
                        "clipToBounds": true,
                        "height": "799px",
                        "width": "532px",
                        "overlays": [
                            {
                                "overlayId": "scrollingAddInternalRemarksContainer",
                                "height": "720px",
                                "y": "90px"
                            },
                            {
                                "overlayId": "dashboardReTopBar_txt",
                                "text": "<span style='text-shadow:0px -1px 1px #0b7890'>Search Results</span>",
                                "x": "-119px"
                            },
                            {
                                "overlayId": "backToRemarkCategoriesButton",
                                "actions": [
                                    {
                                        "action": "spawn",
                                        "target": "doubleWideRemarksContainerToAnimate",
                                        "data": {
                                            "overlayId": "selectRemarkCategoryContainer"
                                        }
                                    },
                                    {
                                        "action": "animate",
                                        "target": "backToRemarkCategoriesButton",
                                        "data": {
                                            "animationIds": [
                                                "FadeOutQuick"
                                            ]
                                        }
                                    },
                                    {
                                        "action": "close",
                                        "target": "dashboardReTopBar_txt"
                                    },
                                    {
                                        "action": "close",
                                        "target": "scrollingAddInternalRemarksContainer"
                                    },
                                    {
                                        "action": "setAlphaAction",
                                        "target": "stopSearchButtonModal",
                                        "data": {
                                            "alpha": 0
                                        }
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "remarksLibObj.resetSearch();"
                                        }
                                    },
                                    {
                                        "action": "bringToFront",
                                        "target": "searchContainerModal"
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "action": "setEnabledAction",
                    "target": "stopSearchButtonModal",
                    "data": {
                        "enabled": true
                    }
                }
            ])
            gVars.didSearch2 = true;

        }


        var remarksTable = global.remarksTable;
        var remarksLibOverlayArray2 = [];
        var remarkCatSubSelection = {};
        remarkCatSubSelection2 = [];


        if (fuzzySearch) {
            var options = {
                keys: ['remark', 'title'],
                threshold: 0.3
            }
            var f = new Fuse(gVars.searchArr2, options);
            var matches = f.search(searchTerm);

            var d = {};

            for (var i = 0; i < matches.length; i++) {
                if (d[matches[i].id]) {

                } else {
                    d[matches[i].id] = 0;
                }
                d[matches[i].id]++;
                if (d[matches[i].id] > 1) {
                    matches.splice(i, 1);
                } else {
                }
            }

        } else {
            var matches = gVars.searchArr2.filter(
                function (val) {
                    var lower = val.title.toLowerCase();
                    var lowerRem = val.remark.toLowerCase();
                    searchTerm = searchTerm.toLowerCase();
                    if (lower.indexOf(searchTerm) != -1 || lowerRem.indexOf(searchTerm) != -1) {
                        return val;
                    }
                });
            //        matches = matches.filter(function (val) {
            //            return !(val === null);
            //        });


        }


        matches = matches.sortBy("title");

        //        console.log("matches3 : " + JSON.stringify(matches))

        for (i in matches) {

            if (matches.length == 0) {

                remarksLibOverlayArray2.push({
                    "overlayId": "remarksCardShadowContainer",
                    "type": "container",
                    "relative": "parent",
                    "width": "490px",
                    "height": "225px",
                    "clipToBounds": true,
                    "backgroundImage": "Spine/images/NoRemarksFound.png",
                    "verticalAlign": "top",
                    "horizontalAlign": "left",
                    "x": "",
                    "y": ""
                });

            }

            if (i != 'reorder' && i != 'contains') {


                var zz = matches[i].id
                var title = (matches[i].title.length > 40) ? matches[i].title.substr(0, 40) + "..." : matches[i].title;
                var finalText = (matches[i].remark.length > 325) ? matches[i].remark.substr(0, 325) + "..." : matches[i].remark;
                var newBody = matches[i].remark

                newBody = newBody.replace(/\r\n/g, " ");
                newBody = newBody.replace(/\n/g, " ");
                newBody = newBody.replace(/<br\s*[\/]?>/gi, " ");
                newBody = (newBody.length > 400) ? newBody.substr(0, 400) + "..." : newBody;

                console.log("lol : " + zz)

                remarkCatSubSelection2.push(matches[i])
                remarksLibOverlayArray2.push({
                    "overlayId": "remarksCardShadowContainer",
                    "type": "container",
                    "relative": "parent",
                    "width": "490px",
                    "height": "225px",
                    "clipToBounds": true,
                    "backgroundImage": "Spine/images/remarkLibraryCard.png",
                    "verticalAlign": "top",
                    "horizontalAlign": "left",
                    "x": "",
                    "y": "",
                    "onTouchDown": "remarksLibObj.addActRemark(" + i + ");",
                    "overlays": [
                        {
                            "overlayId": "addRemarkButton" + i,
                            "toggle": true,
                            "type": "button",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "458px",
                            "y": "95px",
                            "images": [
                                "Spine/images/plusIcon.png"
                            ],
                            "imagesDown": [
                                "Spine/images/checkButton.png"
                            ],
                            "height": "",
                            "width": "",
                            "actions": [
                                {
                                    "action": "runScriptAction",
                                    "trigger": "now",
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "remarksLibObj.checkForToggle(" + i + ")"
                                    }
                                },
                                {
                                    "action": "runScriptAction",
                                    "trigger": "touchupinside",
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "remarksLibObj.addActRemark(" + i + ")"
                                    }
                                }
                            ]
                        },
                        {
                            "overlayId": "remarkCardTitleText2",
                            "_text": "<span style='color:#ff0000;font-size:30px;text-shadow:2px 2px #000000;'>" + title + ":</span>",
                            "text": "<div style='width:200px;white-space:nowrap;white-space: pre-line;text-overflow:ellipsis;'>" + title + "</div>",
                            "x": "20px",
                            "y": "15px"
                        },
                        {
                            "overlayId": "remarkCardText2",
                            "text": finalText,
                            "x": "20px",
                            "y": "40px"
                        }
                    ]

                });


            } else {
            }
        }

        moreBorg.replaceOverlays('scrollingAddInternalRemarksContainer', remarksLibOverlayArray2);
    },
    spawnDataAddRemark: function (index) {

        var remarksTable = global.remarksTable;
        var remarksLibOverlayArray2 = [];
        var remarkCatSubSelection = {};
        remarkCatSubSelection2 = [];

        for (i in remarksTable) {
            if (remarksTable[i].categoryId === index) {
                //alert(remarksTable[i].id)
                remarkCatSubSelection[remarksTable[i].id] = remarksTable[i];
                remarkCatSubSelection2.push(remarksTable[i]);
            }
        }

        borg.setText("internalRemarksTitle", global.remarkCatTable[index].catName);


        if (remarkCatSubSelection2.length < 1) {
            console.log('nothing')

            remarksLibOverlayArray2.push({
                "overlayId": "remarksCardShadowContainer",
                "type": "container",
                "relative": "parent",
                "width": "490px",
                "height": "625px",
                "clipToBounds": true,
                "verticalAlign": "top",
                "horizontalAlign": "left",
                "x": "",
                "y": "",
                "_borderWidth": "1px",
                "_borderColor": "#0000ff",
                "overlays": [
                    {
                        "overlayId": "remarkCardTitleText2",
                        "text": "<div style='width:200px;white-space:nowrap;white-space: pre-line;text-overflow:ellipsis;'>" + "This Category Has No Remarks" + "</div>",
                        "fontColor": "#a8a8a9",
                        "x": "94px",
                        "y": "275px",
                        "_borderWidth": "1px",
                        "_borderColor": "#0000ff"
                    }
                ]
            });
            moreBorg.replaceOverlays('scrollingAddInternalRemarksContainer', remarksLibOverlayArray2)
            return
        } else {
        }

        remarkCatSubSelection2.sort(sort_by('title', true, function (a) {
            return a.toUpperCase()
        }));
        var i = 0;
        var leng = remarkCatSubSelection2.length;

        console.log('spawnDataAddRemark : ' + JSON.stringify(remarkCatSubSelection2))
        var style = "white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width: 220px;"

        for (i = 0; i < leng; i++) {
            var z = i.toString();
            var zz = remarkCatSubSelection2[i].id
            var title = (remarkCatSubSelection2[i].title.length > 40) ? remarkCatSubSelection2[i].title.substr(0, 40) + "..." : remarkCatSubSelection2[i].title;
            //            var finalText = (remarkCatSubSelection2[i].remark.length > 325) ? remarkCatSubSelection2[i].remark.substr(0, 325) + "..." : remarkCatSubSelection2[i].remark;


            var newBody = remarkCatSubSelection2[i].remark

            //TODO: FINISH THIS ALGO, replace following lines
            //            var finalText = ddSort.addElip(newBody)

            newBody = newBody.replace(/\r\n/g, " ");
            newBody = newBody.replace(/\n/g, " ");
            newBody = newBody.replace(/<br\s*[\/]?>/gi, " ");
            newBody = (newBody.length > 400) ? newBody.substr(0, 400) + "..." : newBody;
            var finalText = newBody;


            remarksLibOverlayArray2.push({
                "overlayId": "remarksCardShadowContainer",
                "type": "container",
                "relative": "parent",
                "width": "490px",
                "height": "225px",

                "clipToBounds": true,
                "backgroundImage": "Spine/images/remarkLibraryCard.png",
                "verticalAlign": "top",
                "horizontalAlign": "left",
                "x": "",
                "y": "",
                "onTouchDown": "remarksLibObj.addActRemark(" + i + ");",
                "overlays": [
                    {
                        "overlayId": "addRemarkButton" + i,
                        "toggle": true,
                        "type": "button",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "458px",
                        "y": "95px",
                        "images": [
                            "Spine/images/plusIcon.png"
                        ],
                        "imagesDown": [
                            "Spine/images/checkButton.png"
                        ],
                        "height": "",
                        "width": "",
                        "actions": [
                            {
                                "action": "runScriptAction",
                                "trigger": "now",
                                "target": "#jsBridge",
                                "data": {
                                    "script": "remarksLibObj.checkForToggle(" + i + ")"
                                }
                            },
                            {
                                "action": "runScriptAction",
                                "trigger": "touchupinside",
                                "target": "#jsBridge",
                                "data": {
                                    "script": "remarksLibObj.addActRemark(" + i + ")"
                                }
                            }
                        ]
                    },
                    {
                        "overlayId": "remarkCardTitleText2",
                        "_text": "<span style='color:#ff0000;font-size:30px;text-shadow:2px 2px #000000;'>" + title + ":</span>",
                        "text": "<div style='width:200px;white-space:nowrap;white-space: pre-line;text-overflow:ellipsis;'>" + title + "</div>",
                        "x": "20px",
                        "y": "15px"
                    },
                    {
                        "overlayId": "remarkCardText2",
                        "text": finalText,
                        "x": "20px",
                        "y": "40px"
                    }
                ]
            });
        }

        borg.runAction({
            "action": "spawnOnce",
            "target": "addRemarksInternalCategoryContainer",
            "trigger": "now",
            "data": {
                "overlayId": "scrollingAddInternalRemarksContainer"
            }
        });

        moreBorg.replaceOverlays('scrollingAddInternalRemarksContainer', remarksLibOverlayArray2);
        //remarksLibOverlayArray2 = [];

        borg.runAction({
            "action": "close",
            "trigger": "now",
            "target": "remarksLibraryLoadSpinner"
        });

        //        if (!hideSearch) {
        //
        //        }
        //        else {
        //            performAction([
        //                {
        //                    "action": "close",
        //                    "trigger": "now",
        //                    "target": "searchContainerModal"
        //                },
        //                {
        //                    "action": "close",
        //                    "trigger": "now",
        //                    "target": "stopSearchButtonModal"
        //                }
        //            ])
        //        }
    },
    checkForToggle: function (index) {

        var activityRemarksTable = global.activityRemarksTable;
        var a = remarkCatSubSelection2[index];
        a.text = remarkCatSubSelection2[index].remark;
        a.orderNumber = 0;
        a.activityId = activityId;

        if (jQuery.inArray(a, bkgObj.addedArr) === -1) {
        } else {
            moreBorg.toggle("addRemarkButton" + index, 'on');
        }
    },
    toggleRemarkCat2: function (off) {

        console.log('ZZZZ   toggling: ' + off)
        var toggledRemark = borg.getPersistentItem('talk.track.remarkToggled');

        if (off) {

            var firstCat = borg.getPersistentItem('talk.track.firstCat');
            var overlay = "remarksLibCatSelectorBtn" + firstCat;

            remarksLibOverlayArray2 = [];
            if (toggledRemark === null) {
                moreBorg.toggle(overlay, "off");
                //                remarksLibObj.spawnDataRemarksLib2(parseInt(firstCat));
            }
            else {
                moreBorg.toggle("remarksLibCatSelectorBtn" + toggledRemark, "off");
                //                remarksLibObj.spawnDataRemarksLib2(toggledRemark);
            }


        } else {

            var firstCat = borg.getPersistentItem('talk.track.firstCat');
            var overlay = "remarksLibCatSelectorBtn" + firstCat;

            remarksLibOverlayArray2 = [];
            if (toggledRemark === null) {
                moreBorg.toggle(overlay, "on");
                remarksLibObj.spawnDataRemarksLib2(parseInt(firstCat));
                gVars.didSearch = false;
            }
            else {
                moreBorg.toggle("remarksLibCatSelectorBtn" + toggledRemark, "on");
                remarksLibObj.spawnDataRemarksLib2(toggledRemark);
                gVars.didSearch = false;
            }
        }
    },
    addActRemark: function (index) {

        //bkgObj.numAdded++;
        //        var activityRemarksTable = borg.getPersistentItem("talk.track.tables['activityRemarks']");
        var activityRemarksTable = global.activityRemarksTable;
        var a = remarkCatSubSelection2[index];
        a.text = remarkCatSubSelection2[index].remark;
        a.orderNumber = 0;
        a.activityId = activityId;

        //activityRemarksTable[remarkCatSubSelection2[index].id] = a;
        //borg.setPersistentItem("talk.track.tables['activityRemarks']", activityRemarksTable);

        if (jQuery.inArray(a, bkgObj.addedArr) === -1) {
            bkgObj.numAdded++;
            bkgObj.addedArr.push(a)
            //ddSort.listItems(playlist_window, addToPlaylist(a));
            moreBorg.toggle("addRemarkButton" + index, 'on');
        } else {
            bkgObj.numAdded--;
            var arrIndex = jQuery.inArray(a, bkgObj.addedArr);
            bkgObj.addedArr.splice(arrIndex, 1);
            moreBorg.toggle("addRemarkButton" + index, 'off');
        }
    }
};

var biosObj = {

    getTable: function (fromFav) {

        if (isOnline === true) {

            var biosTable = {};
            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/biographies/" : "https://webapps-jnj-dev.smint.us/api/biographies/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var ID = "userid=" + borg.getPersistentItem("talk.track.id");

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    clearTimeout(xmlHttpTimeout);

                    var data = xmlhttp.responseText;

                    global.biosTable = JSON.parse(data).biographies;

                    for (i in biosTable) {
                        if (!biosTable[i].bioNotes.text) {
                            biosTable[i].bioNotes.text = "";
                        }
                    }

                    borg.setPersistentItem("talk.track.tables['bios']", global.biosTable);
                    borg.setPersistentItem("talk.track.tables['recentbios']", JSON.parse(data).recent_biographies);
                    borg.setPersistentItem("talk.track.tables['biosSuccess']", JSON.parse(data).success);

                    if (borg.pageId === "biographiesPage" && !fromFav) {
                        biosObj.spawnDataBioPage2();
                        localJSONObject.toggleButton();
                        localJSONObject.blockNavBarBtns();
                    }

                    console.log('getting biosTable table - success');
                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    clearTimeout(xmlHttpTimeout);
                    var data = xmlhttp.responseText;
                    var bios403 = JSON.parse(data);

                    console.log('getting trips table - failure');

                    var success = bios403['success'];
                    var status = bios403['status'];

                    if (status == 'Invalid session.') {
                        //autoLogin occurs with status 403
                        login();
                        console.log('logging back in');
                    }
                    global.biosTable = borg.getPersistentItem("talk.track.tables['bios']");

                    if (borg.pageId === "biographiesPage" && !fromFav) {
                        biosObj.spawnDataBioPage2();
                        localJSONObject.toggleButton();
                        localJSONObject.blockNavBarBtns();
                    }
                }
            }
            xmlhttp.open("GET", url + '?' + ID, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.withCredentials = true;
            xmlhttp.send();


            var xmlHttpTimeout = setTimeout(ajaxTimeout, 5000);

            function ajaxTimeout() {
                xmlhttp.abort();
                //alert("Request timed out - bios");
                console.log("Request timed out");

                global.biosTable = borg.getPersistentItem("talk.track.tables['bios']");

                if (borg.pageId === "biographiesPage" && !fromFav) {
                    biosObj.spawnDataBioPage2();
                    localJSONObject.toggleButton();
                    localJSONObject.blockNavBarBtns();
                }
            }
        }
        else if (isOnline === false) {
            global.biosTable = borg.getPersistentItem("talk.track.tables['bios']");

            if (borg.pageId === "biographiesPage" && !fromFav) {
                biosObj.spawnDataBioPage2();
                localJSONObject.toggleButton();
                localJSONObject.blockNavBarBtns();
            }
        }
    },
    goToActivity: function (activityId) {

        borg.getOverlayById('upcomingActivitiesContainer2' + activityId).onTouchUp = function (info) {

            var action = {
                "action": "toggleButtonOff",
                "trigger": "touchUpInside",
                "target": "biographiesTabButton"
            };
            borg.runAction(action);

            var action2 = {
                "action": "runScriptAction",
                "trigger": "touchUpInside",
                "target": "#jsBridge",
                "data": {
                    "script": "var activityId=" + activityId + ";"
                }
            };
            borg.runAction(action2);

            moreBorg.close('tabBarBlockerBios');

            var action3 = {
                "action": "#goToPage",
                "trigger": "touchUpInside",
                "delay": 0.001,
                "data": {
                    "pageId": "activityDetailPage2",
                    "transitionType": "crossfade"
                }
            };
            borg.runAction(action3);
        };
    },
    spawnCard: function (bioID) {
//        console.log("spawncarddzzTOPSSSZZ")
//        if (lastToggledBio == bioID) {
//            return
//        } else {
//
//        }

        console.log("spawncarddzz")
        var biosTable = global.biosTable;
        var activitiesTable = global.activitiesTable;

        var allParticipantGroups = [];
        var testActivityID;
        var upcomingActivities = [];
        var upcomingActivitiesOverlays = [];

        var dashCheckTodayDate = new Date();
        dashCheckTodayDate = dashCheckTodayDate.yyyymmdd();

        for (i in activitiesTable) {
            allParticipantGroups[activitiesTable[i].id] = activitiesTable[i].participantsGroups;
            for (j in allParticipantGroups[activitiesTable[i].id]) {
                for (var k = 0; k < allParticipantGroups[activitiesTable[i].id][j].length; k++) {
                    if (allParticipantGroups[activitiesTable[i].id][j][k] == bioID) {
                        testActivityID = activitiesTable[i];
                        upcomingActivities.push(testActivityID);
                    }
                }
            }
        }

        upcomingActivities.sort(sort_by('_activityDate', true, function (a) {
            return a.toUpperCase()
        }));

        for (var i = 0; i < upcomingActivities.length; i++) {

            var start, end;
            start = (upcomingActivities[i].activityStartTime == "") ? "no start time in CMS" : upcomingActivities[i].activityStartTime;
            end = (upcomingActivities[i].activityEndTime == "") ? "no end time in CMS" : upcomingActivities[i].activityEndTime;

            if (upcomingActivities[i]._activityDate >= dashCheckTodayDate && upcomingActivities[i].keyEvent === true && upcomingActivities[i].activityState != "Draft") {

                upcomingActivitiesOverlays.push({
                    "overlayId": "upcomingActivitiesContainer",
                    "type": "container",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "0px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "0px",
                        "margin-left": "0px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "relative": "parent",
                    "x": "",
                    "y": "",
                    "width": "438px",
                    "height": "auto",
                    "_borderWidth": "1px",
                    "_borderColor": "#0000ff",
                    "overlays": [
                        {
                            "overlayId": "upcomingActivitiesContainer2" + upcomingActivities[i].id,
                            "type": "container",
                            "layoutType": "flow",
                            "relative": "parent",
                            "x": "",
                            "y": "",
                            "width": "370px",
                            "height": "auto",
                            "_borderWidth": "1px",
                            "_borderColor": "#ff00ff",
                            "onInit": "biosObj.goToActivity(" + upcomingActivities[i].id + ");",
                            "overlays": [
                                {
                                    "overlayId": "upcomingActivitiesOverlays",
                                    "type": "text",
                                    "textAlign": "left",
                                    "text": upcomingActivities[i].activityName + " >",
                                    "x": "",
                                    "y": "",
                                    "width": "438px",
                                    "height": "auto",
                                    "relative": "parent",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "size": "1.2em",
                                    "fontColor": "#0a8caa",
                                    "_borderWidth": "1px",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "upcomingActivitiesOverlays",
                                    "type": "text",
                                    "_padding": "10px",
                                    "textAlign": "left",
                                    "text": upcomingActivities[i].activityDate3 + '&nbsp;-&nbsp;' + start + '-' + end,
                                    "x": "",
                                    "y": "",
                                    "width": "438px",
                                    "height": "auto",
                                    "font": "AkzidenzGroteskPro-Regular",
                                    "size": "1.0em",
                                    "relative": "parent",
                                    "_borderWidth": "1px",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "spacer",
                                    "width": "22px",
                                    "height": "10px",
                                    "x": "",
                                    "y": ""
                                }
                            ]
                        }
                    ]
                });
            }
            else {
                upcomingActivitiesOverlays.push({
                    "overlayId": "upcomingActivitiesContainer",
                    "type": "container",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "0px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "0px",
                        "margin-left": "0px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "relative": "parent",
                    "x": "",
                    "y": "",
                    "width": "438px",
                    "height": "auto",
                    "overlays": [
                        {
                            "overlayId": "upcomingActivitiesContainer2" + upcomingActivities[i].id,
                            "type": "container",
                            "layoutType": "flow",
                            "relative": "parent",
                            "x": "",
                            "y": "",
                            "width": "438px",
                            "height": "auto",
                            "overlays": [
                                {
                                    "overlayId": "upcomingActivitiesOverlays",
                                    "type": "text",
                                    "textAlign": "left",
                                    "text": upcomingActivities[i].activityName,
                                    "x": "",
                                    "y": "",
                                    "width": "438px",
                                    "height": "auto",
                                    "relative": "parent",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "size": "1.2em",
                                    "fontColor": "#000000"
                                },
                                {
                                    "overlayId": "upcomingActivitiesOverlays",
                                    "type": "text",
                                    "_padding": "10px",
                                    "textAlign": "left",
                                    "text": upcomingActivities[i].activityDate3 + '&nbsp;-&nbsp;' + start + '-' + end,
                                    "x": "",
                                    "y": "",
                                    "width": "438px",
                                    "height": "auto",
                                    "font": "AkzidenzGroteskPro-Regular",
                                    "size": "1.0em",
                                    "relative": "parent"
                                },
                                {
                                    "overlayId": "spacer",
                                    "width": "22px",
                                    "height": "10px",
                                    "x": "",
                                    "y": ""
                                }
                            ]
                        }
                    ]
                });

            }
        }

        var ab_name = biosTable[bioID].firstName
        ab_name += " "
        ab_name += biosTable[bioID].lastName;
        //ab_name = (ab_name.length > 25) ? ab_name.substr(0, 25) + "..." : ab_name;

        var ab_title = biosTable[bioID].title;
        ab_title = (ab_title.length > 30) ? ab_title.substr(0, 30) + "..." : ab_title;

        var ab_company = biosTable[bioID].company
        ab_company = (ab_company.length > 33) ? ab_company.substr(0, 33) + "..." : ab_company;

        var ab_audioId = biosTable[bioID].audioId;
        var ab_fileType = ab_audioId.split('.').pop();
        var filetypeLen = ab_fileType.length + 1
        ab_audioId = ab_audioId.substring(0, ab_audioId.length - filetypeLen);


        //edit this for filetype on monday

        var ab = {
            "overlayId": "ab_main_data_container",
            "type": "container",
            "layoutType": "flow",
            "layoutOptions": {
                "margin-top": "0px",
                "marginY": "0px",
                "paddingY": "0px",
                "margin-bottom": "0px",
                "margin-left": "0px",
                "marginX": "0px",
                "paddingX": "0px",
                "margin-right": "0px"
            },
            "height": "570px",
            "width": "499px",
            "relative": "parent",
            "horizontalAlign": "left",
            "verticalAlign": "top",
            "x": "",
            "y": "",
            "_borderWidth": "1px",
            "_borderColor": "#ff0000",
            "overlays": [
                {
                    "overlayId": "ab_main_data_sub_container",
                    "type": "container",
                    "height": "230px",
                    "width": "499px",
                    "x": "",
                    "y": "",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "relative": "parent",
                    "_borderColor": "#0000ff",
                    "overlays": [
                        {
                            "overlayID": "detailsFlowContainer",
                            "type": "container",
                            "layoutType": "flow",
                            "layoutOptions": {
                                "margin-top": "30px",
                                "marginY": "0px",
                                "paddingY": "0px",
                                "margin-bottom": "0px",
                                "margin-left": "0px",
                                "marginX": "0px",
                                "paddingX": "0px",
                                "margin-right": "0px"
                            },
                            "width": "270px",
                            "height": "200px",
                            "verticalAlign": "top",
                            "horizontalAlign": "left",
                            "x": "204px",
                            "y": "36px",
                            "overlays": [
                                {
                                    "overlayId": "ab_name_value" + bioID,
                                    "type": "text",
                                    "text": "<strong>" + ab_name + "</strong>",
                                    "height": "auto",
                                    "width": "268px",
                                    "fontColor": "#3d3d3d",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "textAlign": "left",
                                    "x": "",
                                    "y": "",
                                    "size": "1.5em",
                                    "relative": "parent",
                                    "horizontalAlign": "left",
                                    "verticalAlign": "top",
                                    "_borderWidth": "1px",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "ab_title_value",
                                    "type": "text",
                                    "text": "<strong>" + ab_title + "</strong>",
                                    "fontColor": "#3d3d3d",
                                    "x": "",
                                    "y": "",
                                    "horizontalAlign": "left",
                                    "verticalAlign": "top",
                                    "size": "1.0em",
                                    "height": "20px",
                                    "width": "268px",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "textAlign": "left",
                                    "relative": "parent",
                                    "_borderWidth": "1px",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "ab_company_value",
                                    "type": "text",
                                    "text": "<strong>" + ab_company + "</strong>",
                                    "fontColor": "#3d3d3d",
                                    "x": "",
                                    "y": "",
                                    "horizontalAlign": "left",
                                    "verticalAlign": "top",
                                    "size": "1.0em",
                                    "height": "20px",
                                    "width": "268px",
                                    "font": "AkzidenzGroteskPro-Md",
                                    "textAlign": "left",
                                    "relative": "parent",
                                    "_borderWidth": "1px",
                                    "_borderColor": "#0000ff"
                                },
                                {
                                    "overlayId": "bioAudio_container",
                                    "x": "",
                                    "y": "",
                                    "overlays": [
                                        {
                                            "overlayId": "bioAudio_container_circle"
                                        },
                                        {
                                            "overlayId": "bioAudio_text"
                                        },
                                        {
                                            "overlayId": "bioAudio_btn" + i,
                                            "type": "button",
                                            "color": "#magic",
                                            "x": "0px",
                                            "y": "0px",
                                            "relative" : "parent",
                                            "horizontalAlign" : "left",
                                            "verticalAlign" : "top",
                                            "width": "200px",
                                            "height": "30px",
                                            "actions": [
                                                {
                                                    "action": "checkPackageStatus",
                                                    "trigger": "now",
                                                    "source": "#systemPackageDataRegistry",
                                                    "target": "#systemPackageDataRegistry",
                                                    "data": {
                                                        "packageID": ab_audioId,
                                                        "type": ab_fileType
                                                    }
                                                },
                                                {
                                                    "action" : "subscribe",
                                                    "target" : "#eventManager",
                                                    "trigger" : "now",
                                                    "data" : {
                                                        "event" : "stateInstallCompleted",
                                                        "actionId" : "closeAudioBlocker"
                                                    }
                                                },
                                                {
                                                    "action": "runScriptAction",
                                                    "trigger": "touchUpInside",
                                                    "target": "#jsBridge",
                                                    "data": {
                                                        "script": "biosObj.audioPronunciation('"+ ab_name + "', '" + ab_audioId + "', '" + ab_fileType + "');"
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            "overlayId": "bioAudio_container_notAvailable"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "overlayId": "defaultImage",
                            "type": "image",
                            "images": ["Spine/images/photoFrameAnon.png"],
                            "width": "153px", //159
                            "height": "198px", //204
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "relative": "parent",
                            "x": "32px",
                            "y": "31px"
                        },
                        {
                            "overlayId": "attendee_view_attendee_image",
                            "imagesDefault": ["Spine/images/photoFrameAnon.png"],
                            "dynamicSource": "url",
                            "type": "image",
                            "images": [
                                "$(" + biosTable[bioID].photo + ")"
                            ],
                            "width": "136px", //159  // 153 //117
                            "height": "182px", //204  // 198 //164
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "relative": "parent",
                            "x": "42px",
                            "y": "40px",
                            "scaleMode": "aspect-fill",
                            "clipToBounds": true,
                            "_borderWidth": "4px",
                            "_borderColor": "#0000ff"
                        },
                        {
                            "overlayId": "bioLibPhotoFrame",
                            "_draggable": true
                        },
                        {
                            "overlayId": "ab_fav_btnz" + bioID,
                            "type": "button",
                            "toggle": true,
                            "height": "50px",
                            "width": "50px",
                            "x": "427px",
                            "y": "-3px",
                            "images": [
                                "Spine/images/favButton.png"
                            ],
                            "imagesDown": [
                                "Spine/images/favButton-tap.png"
                            ],
                            "relative": "Parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "actions": [
                                {
                                    "action": "runScriptAction",
                                    "trigger": "now",
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "biosObj.toggleFav('" + bioID + "');"
                                    }
                                },
                                {
                                    "action": "runScriptAction",
                                    "trigger": "touchUpInside",
                                    "delay": 0.01,
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "biosObj.routeFav('" + bioID + "');"
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "overlayId": "spacer",
                    "width": "22px",
                    "height": "10px",
                    "x": "",
                    "y": ""
                },
                {
                    "overlayId": "descco", //bioNotes will go here
                    "type": "container",
                    "width": "520px",
                    "height": "auto",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "0px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "0px",
                        "margin-left": "30px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "relative": "parent",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "borderColor": "#0000ff",
                    "overlays": [
                        {
                            "overlayId": "ab_description_value",
                            "type": "text",
                            "padding": "10px",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": biosTable[bioID].summary,
                            "height": "auto",
                            "width": "460px",
                            "relative": "parent",
                            "fontColor": "#3d3d3d",
                            "_borderWidth": "1px",
                            "_borderColor": "#0000ff",
                            "size": "1.0em"
                        }
                    ]
                },

                {
                    "overlayId": "abDescDetail",
                    "type": "container",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "0px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "0px",
                        "margin-left": "30px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "x": "",
                    "y": "",
                    "width": "460px",
                    "height": "auto",
                    "relative": "parent",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "_borderWidth": "3px",
                    "_borderColor": "#ff0000",
                    "overlays": [
                        {
                            "overlayId": "ab_description_value2",
                            "type": "text",
                            "padding": "5px",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": "Participant in Upcoming Activities",
                            "height": "auto",
                            "width": "438px",
                            "relative": "parent",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#3d3d3d",
                            "_borderWidth": "1px",
                            "_borderColor": "#0000ff",
                            "x": "",
                            "y": "",
                            "size": "0.9em"
                        }
                    ]
                },
                {
                    "overlayId": "abBioNotesContainer",
                    "type": "container",
                    "layoutType": "flow",
                    "layoutOptions": {
                        "margin-top": "20px",
                        "marginY": "0px",
                        "paddingY": "0px",
                        "margin-bottom": "35px",
                        "margin-left": "30px",
                        "marginX": "0px",
                        "paddingX": "0px",
                        "margin-right": "0px"
                    },
                    "x": "",
                    "y": "",
                    "width": "477px",
                    "height": "auto",
                    "relative": "parent",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "overlays": [
                        {
                            "overlayId": "activityFollowUpNotesInnerTopMiddleBottomContainer",
                            "x": "",
                            "y": "",
                            "onTouchDown": "biosObj.editBioNotes(" + bioID + ");",
                            "overlays": [
                                {
                                    "overlayId": "bioLibtopImage"
                                },
                                {
                                    "overlayId": "bioLibUpNotesLabelText"
                                }
                            ]
                        },
                        {
                            "overlayId": "bioLlibMiddle",
                            "onTouchDown": "biosObj.editBioNotes(" + bioID + ");",
                            "x": "",
                            "y": "",
                            "overlays": [
                                {
                                    "overlayId": "bioLibNotesTextfieldOffscreen",
                                    "type": "textfield",
                                    "relative": "screen",
                                    "x": "-200px",
                                    "y": "-200px"
                                },
                                {
                                    "overlayId": "bioLibUpNotesTextDisplayOnly" + bioID,
                                    "type": "textfield",
                                    "multiline": true,
                                    "isEditable": true,
                                    "saveState": false,
                                    "//saveText": false,
                                    "placeholder": "Enter a note...",
                                    "text": biosTable[bioID].bioNotes.text,
                                    "x": "",
                                    "y": "",
                                    "textAlign": "left",
                                    "font": "Helvetica",
                                    "fontColor": "#666666",
                                    "size": "1.0em",
                                    "height": "auto",
                                    "width": "400px",
                                    "horizontalAlign": "left",
                                    "verticalAlign": "top",
                                    "relative": "parent",
                                    "actions": [
                                        {
                                            "action": "runScriptAction",
                                            "trigger": "editingbegan",
                                            "target": "#jsBridge",
                                            "data": {
                                                "script": "biosObj.editBioNotes(" + bioID + ");"
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            "overlayId": "bioLibbottomImage",
                            "onTouchDown": "biosObj.editBioNotes(" + bioID + ");",
                            "x": "",
                            "y": ""
                        }
                    ]
                }
            ]
        };

        moreBorg.close('ab_main_data_container');
        moreBorg.containerSpawn(ab, 'ab_main_container', false);
        borg.setText("bioLibUpNotesTextDisplayOnly" + bioID, biosTable[bioID].bioNotes.text);
        moreBorg.containerSpawn(upcomingActivitiesOverlays, 'abDescDetail', false);
        borg.runAction({
            "action": "close",
            "target": "imageToPreventUsersFromMashingTheButtons",
            "delay": 1.2,
            "trigger": "now"
        });
        lastToggledBio = bioID;
    },
    audioPronunciation: function (bioName, audioId, filetype) {
            console.log("play the sound for " + bioName + ", which is ID " + audioId + "." + filetype);

            var action = {
                "action": "playSoundAction",
                "trigger": "now",
                "target": "#systemAudio",
                "data": {
                    "soundFile": "/Library/Application Support/Content/" + audioId + "." + filetype
                }
            };
                
            borg.runAction(action);
    },
    closeAudioBlocker: function () {
        //setTimeout(function(){alert("hgereerewrere");},1);

        borg.runAction({
            "action": "close",
            "trigger": "now",
            "target": "bioAudio_container_notAvailable"
        });
    },
    editBioNotes: function (bioID) {

        //        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        var biosTable = global.biosTable;
        var rows3 = borg.getPersistentItem("talk.track.tables['rows3']");

        setTimeout(function(){
            borg.runAction({
                "action": "bringUpKeyboardAction",
                "trigger": "now",
                "target": "activityFollowUpNotesTextfield" + bioID
            });
        },300);


        if (!biosTable[bioID].bioNotes.id || biosTable[bioID].bioNotes.createdOffline === true) {

            var bioNoteID = guid();

            if (borg.pageId === 'activityDetailPage2') {

                rows3[bioID].bioNotes.id = bioNoteID;
                rows3[bioID].bioNotes.createdOffline = true;
                borg.setPersistentItem("talk.track.tables['rows3']", rows3);
            }

            global.biosTable[bioID].bioNotes.id = bioNoteID;
            global.biosTable[bioID].bioNotes.createdOffline = true;
            borg.setPersistentItem("talk.track.tables['bios']", biosTable);

            borg.runAction({
                "action": "#spawn",
                "trigger": "now",
                "data": {
                    "overlayId": "editFollowUpNotesContainer",
                    "overlays": [
                        {
                            "overlayId": "closeModalDone", //donebutton
                            "actions": [
                                {
                                    "action": "runScriptAction",
                                    "target": "#jsBridge",
                                    "trigger": "touchUpInside",
                                    "source": "activityFollowUpNotesTextfield" + bioID,
                                    "data": {
                                        "script": "var bioNoteText = '#(textForJavascript)'; biosObj.createBioNotes(bioNoteText," + bioID + ");"
                                    }
                                },
                                {
                                    "action": "animate",
                                    "trigger": "TouchDown",
                                    "target": "followUpNoteTransBlackOut",
                                    "data": {
                                        "animationIds": [
                                            "FadeOutQuick"
                                        ]
                                    }
                                },
                                {
                                    "action": "close",
                                    "delay": 1.0,
                                    "target": "editFollowUpNotesContainer"
                                }
                            ]
                        },
                        {
                            "overlayId": "activityFollowUpNotesTextfield" + bioID,
                            "type": "textfield",
                            "multiline": true,
                            "isEditable": true,
                            "//saveText": false,
                            "placeholder": "Enter a note...",
                            "text": biosTable[bioID].bioNotes.text,
                            "width": "500px",
                            "height": "500px",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "34px",
                            "y": "80px",
                            "relative": "parent",
                            "_borderWidth": "1px",
                            "_borderColor": "#ff00ff"
                        }
                    ]
                }
            });
        }
        else {

            borg.runAction({
                "action": "#spawn",
                "trigger": "now",
                "data": {
                    "overlayId": "editFollowUpNotesContainer",
                    "overlays": [
                        {
                            "overlayId": "closeModalDone",
                            "actions": [
                                {
                                    "action": "runScriptAction",
                                    "target": "#jsBridge",
                                    "trigger": "touchUpInside",
                                    "source": "activityFollowUpNotesTextfield" + bioID,
                                    "data": {
                                        "script": "var bioNoteText = '#(textForJavascript)'; biosObj.updateBioNotes(bioNoteText," + bioID + ");"
                                    }
                                },
                                {
                                    "action": "animate",
                                    "trigger": "TouchDown",
                                    "target": "followUpNoteTransBlackOut",
                                    "data": {
                                        "animationIds": [
                                            "FadeOutQuick"
                                        ]
                                    }
                                },
                                {
                                    "action": "close",
                                    "delay": 1.0,
                                    "target": "editFollowUpNotesContainer"
                                }
                            ]
                        },
                        {
                            "overlayId": "activityFollowUpNotesTextfield" + bioID,
                            "type": "textfield",
                            "multiline": true,
                            "isEditable": true,
                            "//saveText": false,
                            "placeholder": "Enter a note...",
                            "text": biosTable[bioID].bioNotes.text,
                            "width": "500px",
                            "height": "500px",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "34px",
                            "y": "80px",
                            "relative": "parent",
                            "_borderWidth": "1px",
                            "_borderColor": "#ff00ff"
                        }
                    ]
                }
            });
        }

        moreBorg.animate('editFollowUpNotesContainer', 'animateFUPModalUp');

        borg.runAction({
            "action": "#spawnOnce",
            "trigger": "now",
            "data": {
                "overlayId": "followUpNoteTransBlackOut",
                "type": "image",
                "images": [
                    "Spine/images/darkTransparentBackground.png"
                ]
            }
        });
        borg.runAction({
            "action": "animate",
            "trigger": "now",
            "target": "followUpNoteTransBlackOut",
            "data": {
                "animationIds": [
                    "FadeInQuick"
                ]
            }
        });
        borg.runAction({
            "action": "bringToFront",
            "trigger": "now",
            "target": "editFollowUpNotesContainer"

        });
    },
    createBioNotes: function (bioNoteText, bioID) {

        //        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        var biosTable = global.biosTable;
        var rows3 = borg.getPersistentItem("talk.track.tables['rows3']");
        var offlineBioNote = borg.getPersistentItem("talk.track.offline");

        var bioNoteID = biosTable[bioID].bioNotes.id;

        console.log('bionoteID' + bioNoteID);
        console.log('bionotetext' + bioNoteText);

        borg.setText("bioLibUpNotesTextDisplayOnly" + bioID, bioNoteText);

        performAction([
            {action: "animate", trigger: "touchDown", target: "editFollowUpNotesContainer", data: {animationIds: ["animateFUPModalDown"]}},
            {action: "close", delay: 1.0, target: "activityFollowUpNotesTextfield" + bioID},
            {action: "closeKeyboardAction", delay: 0.10, trigger: "now", target: "bioLibNotesTextfieldOffscreen"}
        ]);

        //For data continuity if offline.
        if (borg.pageId === 'activityDetailPage2') {

            rows3[bioID].bioNotes.text = bioNoteText;
            borg.setPersistentItem("talk.track.tables['rows3']", rows3);
        }
        biosTable[bioID].bioNotes.text = bioNoteText;
        borg.setPersistentItem("talk.track.tables['bios']", biosTable);

        var offlinePost =
        {
            "biography_id": bioID,
            "notes": encodeURIComponent(bioNoteText)
        };

        if (isOnline) {
            var ID = "userid=" + borg.getPersistentItem("talk.track.id");
            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/biographynotes/add/" : "https://webapps-jnj-dev.smint.us/api/biographynotes/add/";

            var sendNote = 'data={"biography_id":' + bioID + ', "notes": "' + encodeURIComponent(bioNoteText) + '"}';

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = xmlhttp.responseText;

                }
            }
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(sendNote);

        }
        else {
            if (offlineBioNote.BioNote.add.length === 0) {

                offlineBioNote.BioNote.add.push(offlinePost);
                offlineBioNote.hasData = true;

                borg.setPersistentItem("talk.track.offline", offlineBioNote);

                borg.clearIntervals();
                pollForOfflineUpdates = setInterval(function () {
                    post.gettingBackOnline();
                }, 5000);


            }
            else {
                var tempArray = [];

                for (var i = 0; i < offlineBioNote.BioNote.add.length; i++) {
                    var a = offlineBioNote.BioNote.add[i].biography_id;
                    tempArray.push(a);
                }

                var check = tempArray.indexOf(bioID);
                if (check === -1) {

                    offlineBioNote.BioNote.add.push(offlinePost);
                    offlineBioNote.hasData = true;
                    borg.setPersistentItem("talk.track.offline", offlineBioNote);

                    borg.clearIntervals();
                    pollForOfflineUpdates = setInterval(function () {
                        post.gettingBackOnline();
                    }, 5000);


                }
                else {

                    console.log('not -1, so its in here and the index is' + check);

                    offlineBioNote.BioNote.add[check].notes = bioNoteText;
                    offlineBioNote.hasData = true;
                    borg.setPersistentItem("talk.track.offline", offlineBioNote);

                    borg.clearIntervals();
                    pollForOfflineUpdates = setInterval(function () {
                        post.gettingBackOnline();
                    }, 5000);
                }
            }
        }
    },
    updateBioNotes: function (bioNoteText, bioID) {
        //        var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        var biosTable = global.biosTable;
        var rows3 = borg.getPersistentItem("talk.track.tables['rows3']");
        var offlineBioNote = borg.getPersistentItem("talk.track.offline");

        var bioNoteID = biosTable[bioID].bioNotes.id;

        borg.setText("bioLibUpNotesTextDisplayOnly" + bioID, bioNoteText);

        performAction([
            {action: "animate", trigger: "touchDown", target: "editFollowUpNotesContainer", data: {animationIds: ["animateFUPModalDown"]}},
            {action: "close", delay: 1.0, target: "activityFollowUpNotesTextfield" + bioID},
            {action: "closeKeyboardAction", delay: 0.10, trigger: "now", target: "bioLibNotesTextfieldOffscreen"}
        ]);

        // For Data Continuity while Offline: Add value to local storage.
        biosTable[bioID].bioNotes.text = bioNoteText;
        borg.setPersistentItem("talk.track.tables['bios']", biosTable);

        if (borg.pageId === 'activityDetailPage2') {
            //activity detail
            rows3[bioID].bioNotes.text = bioNoteText;
            borg.setPersistentItem("talk.track.tables['rows3']", rows3);
        }

        var offlinePost =
        {
            "biography_id": bioID,
            "notes": encodeURIComponent(bioNoteText)
        };

        if (isOnline) {
            var ID = "userid=" + borg.getPersistentItem("talk.track.id");
            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/biographynotes/update/" : "https://webapps-jnj-dev.smint.us/api/biographynotes/update/";

            var sendNote = 'data={"biography_note_id":' + bioNoteID + ', "notes": "' + encodeURIComponent(bioNoteText) + '"}';

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = xmlhttp.responseText;
                }
            }
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(sendNote);

        }
        else {
            if (offlineBioNote.BioNote.update.length === 0) {

                offlineBioNote.BioNote.update.push(offlinePost);
                offlineBioNote.hasData = true;

                borg.setPersistentItem("talk.track.offline", offlineBioNote);

                borg.clearIntervals();

                pollForOfflineUpdates = setInterval(function () {
                    post.gettingBackOnline();
                }, 5000);

            }
            else {
                var tempArray = [];

                for (var i = 0; i < offlineBioNote.BioNote.update.length; i++) {
                    var a = offlineBioNote.BioNote.update[i].biography_id;
                    tempArray.push(a);

                }
                var check = tempArray.indexOf(bioID);
                if (check === -1) {

                    offlineBioNote.BioNote.update.push(offlinePost);
                    offlineBioNote.hasData = true;
                    borg.setPersistentItem("talk.track.offline", offlineBioNote);

                    borg.clearIntervals();

                    pollForOfflineUpdates = setInterval(function () {
                        post.gettingBackOnline();
                    }, 5000);

                }
                else {

                    console.log('not -1, so its in here and the index is' + check);

                    offlineBioNote.BioNote.update[check].notes = bioNoteText;
                    offlineBioNote.hasData = true;
                    borg.setPersistentItem("talk.track.offline", offlineBioNote);

                    borg.clearIntervals();
                    pollForOfflineUpdates = setInterval(function () {
                        post.gettingBackOnline();
                    }, 5000);
                }
            }
        }
    },
    //horizontal container
    spawnDataBioPage: function (sh) {
        borg.runAction({
            "action": "setHiddenAction",
            "targets": ["noRecentBio", "noFavBio"],
            "trigger": "now",
            "data": {
                "hidden": true
            }
        });


        //bundleJump support - check whether objects are empty (typical after a bundle jump. If so, use the persistent itme.)
        var checkBioObj = jQuery.isEmptyObject(global.biosTable);
        var checkActObj = jQuery.isEmptyObject(global.activitiesTable);

        if (checkBioObj) {
            var biosTable = borg.getPersistentItem("talk.track.tables['bios']");
        }
        else if (!checkBioObj) {
            var biosTable = global.biosTable;
        }

        if (checkActObj) {
            var activitiesTable = borg.getPersistentItem("talk.track.tables['activities']");
        }
        else if (!checkActObj) {
            var activitiesTable = global.activitiesTable;
        }

        var bioPageOverlaysArray = [];
        var allParticipantGroups = [];
        var allBioIds = [];
        var uniqueBioIds = [];
        var upcomingBios = [];
        var upcomingBiosWithNotes = [];

        for (i in activitiesTable) {
            allParticipantGroups[activitiesTable[i].id] = activitiesTable[i].participantsGroups;
            for (j in allParticipantGroups[activitiesTable[i].id]) {
                for (var k = 0; k < allParticipantGroups[activitiesTable[i].id][j].length; k++) {
                    bio_id = allParticipantGroups[activitiesTable[i].id][j][k];
                    allBioIds.push(bio_id);
                }
            }
        }

        $.each(allBioIds, function (i, el) {
            if ($.inArray(el, uniqueBioIds) === -1) uniqueBioIds.push(el);
        });

        for (var z = 0; z < uniqueBioIds.length; z++) {
            var x = uniqueBioIds[z]
            for (xs in biosTable) {
                if (biosTable[xs].id == x) {
                    upcomingBios[x] = biosTable[x];
                }
            }
        }

        upcomingBios = upcomingBios.filter(function (val) {
            return !(val === null);
        });

        upcomingBios.sort(sort_by('lastName', true, function (a) {
            return a.toUpperCase()
        }));

        borg.runAction({
            "action": "spawnOnce",
            "target": "bio_page_container",
            "trigger": "now",
            "data": {
                "overlayId": "bio_page_horz_scroll_clip_container",
                "relative": "container",
                "type": "container",
                "backgroundImage": "",
                "x": "0px",
                "y": "103px",
                "width": "768px",
                "height": "230px",
                "relative": "parent",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "clipToBounds": true,
                "overlays": [
                    {
                        "overlayId": "bio_page_horiz_scroll_data_container",
                        "type": "container",
                        "width": "768px",
                        "height": "240px",
                        "layoutType": "flow",
                        "layoutOptions": {
                            "_margin-top": "0px",
                            "_marginY": "20px",
                            "_paddingY": "20px",
                            "_margin-bottom": "0px",
                            "_margin-left": "20px",
                            "_marginX": "60px",
                            "paddingX": "15px",
                            "_margin-right": "20px"
                        },
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "0px",
                        "userScrolling": "horizontal",
                        "overlays": []
                    }
                ]
            }
        });

        var totalWidth = -3;
        var first = true;

        if (upcomingBios.length === 0) { // overlays to show when there are no upcoming participants / bios....

            borg.runAction({
                "action": "setHiddenAction",
                "target": "noUpcomingBio",
                "trigger": "now",
                "data": {
                    "hidden": false
                }
            });
            moreBorg.replaceOverlays('bio_page_horiz_scroll_data_container', emptyOverlayArray);
        }
        else if (upcomingBios.length !== 0) {

            for (var i = 0; i < upcomingBios.length; i++) {

                if (first) {
                    var distFromStart = 0;
                    first = false;
                } else {
                    var distFromStart = 255 - totalWidth;
                    distFromStart = Math.abs(distFromStart)
                }
                totalWidth += 59;

                var title = (upcomingBios[i].title.length > 25) ? upcomingBios[i].title.substr(0, 25) + "..." : upcomingBios[i].title;

                var defaultAvatar = (pushToProd) ? "https://webapps-jnj-dev.smint.us/static/images/defaultBiographyImage.png" : "https://webapps-jnj-dev.smint.us/static/images/defaultBiographyImage.png";

                if (upcomingBios[i].photo === defaultAvatar) { //noPhoto

                    var name = upcomingBios[i].firstName + " " + upcomingBios[i].lastName;
                    name = (name.length > 21) ? name.substr(0, 21) + "..." : name;
                    var company = (upcomingBios[i].company.length > 25) ? upcomingBios[i].company.substr(0, 25) + "..." : upcomingBios[i].company;

                    var cardBackground = "Spine/images/attendeeCardBigBody.png";

                    bioPageOverlaysArray.push({

                        "overlayId": "bio_page_horiz_scroll_data_sub_container" + i,
                        "type": "container",
                        "width": "348px",
                        "height": "226px",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "relative": "parent",
                        "backgroundImage": cardBackground,
                        "lazyLoad": true,
                        "overlays": [
                            {//No Image Name
                                "overlayId": "bio_page_horiz_scroll_name_value" + i,
                                "type": "text",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "text": "<strong>" + name + "</strong>",
                                "height": "30px",
                                "width": "348px",
                                "font": "AkzidenzGroteskPro-Md",
                                "textAlign": "center",
                                "relative": "parent",
                                "x": "0px",
                                "y": "85px",
                                "fontColor": "#000000",
                                "size": "1.6em"
                            },
                            {//No Image Title
                                "overlayId": "bio_page_horiz_scroll_title_value" + i,
                                "type": "text",
                                "text": "<strong>" + title + "</strong>",
                                "width": "348px",
                                "height": "30px",
                                "x": "0px",
                                "y": "115px",
                                "textAlign": "center",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "font": "AkzidenzGroteskPro-Md",
                                "fontColor": "#097e98",
                                "size": "1.3em",
                                "relative": "parent"
                            },
                            {//No Image Company
                                "overlayId": "bio_page_horiz_scroll_company_value" + i,
                                "type": "text",
                                "text": "<strong>" + company + "</strong>",
                                "width": "348px",
                                "height": "30px",
                                "x": "0px",
                                "y": "140px",
                                "textAlign": "center",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "font": "AkzidenzGroteskPro-Md",
                                "fontColor": "#097e98",
                                "size": "1.3em",
                                "relative": "parent"
                            },
                            {//No Image Trans Button
                                "overlayId": "bio_page_horz_scroll_trans_btn" + upcomingBios[i].id,
                                "type": "Button",
                                "width": "348px",
                                "height": "226px",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "x": "0px",
                                "y": "0px",
                                "actions": [
                                    {
                                        "action": "toggleButtonOn",
                                        "trigger": "touchUpInside",
                                        "target": "ab_vert_trans_btn" + upcomingBios[i].id
                                    },
                                    {
                                        "action": "close",
                                        "trigger": "touchUpInside",
                                        "target": "ab_image"
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "trigger": "touchUpInside",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "biosObj.checkForClose('" + upcomingBios[i].id + "');"
                                        }
                                    }
                                ]
                            }
                        ]
                    });
                }
                else { //Photo
                    var firstName = upcomingBios[i].firstName;
                    firstName = (firstName.length > 16) ? firstName.substr(0, 16) + "..." : firstName;
                    var lastName = upcomingBios[i].lastName;
                    lastName = (lastName.length > 18) ? lastName.substr(0, 18) + "..." : lastName;
                    var cardBackground = "Spine/images/bioCardWideBody.png";
                    var photoUrl = upcomingBios[i].photo;
                    var company = (upcomingBios[i].company.length > 20) ? upcomingBios[i].company.substr(0, 20) + "..." : upcomingBios[i].company;

                    bioPageOverlaysArray.push({

                        "overlayId": "bio_page_horiz_scroll_data_sub_container" + i,
                        "type": "container",
                        "width": "348px",
                        "height": "226px",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "relative": "parent",
                        "backgroundImage": cardBackground,
                        "lazyLoad": true,
                        "overlays": [
                            {
                                "overlayId": "defaultImage",
                                "type": "image",
                                "images": ["Spine/images/photoFrameAnon.png"],
                                "width": "83px",
                                "height": "110px",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "relative": "parent",
                                "_draggable": true,
                                "x": "26px",
                                "y": "46.5px"
                            },
                            {//With Photo Photo
                                "overlayId": "attendee_view_attendee_image",
                                "imagesDefault": ["Spine/images/photoFrameAnon.png"],
                                "dynamicSource": "url",
                                "type": "image",
                                "images": [
                                    "$(" + photoUrl + ")"
                                ],
                                "width": "83px",
                                "height": "110px",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "relative": "parent",
                                "x": "26px",
                                "y": "46.5px",
                                "scaleMode": "aspect-fill",
                                "clipToBounds": true
                            },
                            {//With PHoto First Name

                                "overlayId": "bio_page_horiz_scroll_first_name_value" + i,
                                "type": "text",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "text": firstName,
                                "height": "30px",
                                "width": "216px",
                                "font": "AkzidenzGroteskPro-Regular",
                                "textAlign": "left",
                                "relative": "parent",
                                "x": "125px",
                                "y": "52px",
                                "fontColor": "#000000",
                                "size": "1.6em",
                                "_borderWidth": "1px",
                                "_borderColor": "#0000ff"
                            },
                            {//With Photo Last Name
                                "overlayId": "bio_page_horiz_scroll_last_name_value" + i,
                                "type": "text",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "text": lastName,
                                "height": "30px",
                                "width": "216px",
                                "font": "AkzidenzGroteskPro-Md",
                                "textAlign": "left",
                                "relative": "parent",
                                "x": "125px",
                                "y": "80px",
                                "fontColor": "#000000",
                                "size": "1.5em",
                                "_borderWidth": "1px",
                                "_borderColor": "#0000ff"
                            },
                            {//With Photo Title
                                "overlayId": "bio_page_horiz_scroll_title_value" + i,
                                "type": "text",
                                "text": "<strong>" + title + "</br>" + company + "</strong>",
                                "height": "30px",
                                "width": "216px",
                                "x": "125px",
                                "y": "112px",
                                "textAlign": "left",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "font": "AkzidenzGroteskPro-Md",
                                "fontColor": "#097e98",
                                "size": "1.1em",
                                "relative": "parent",
                                "_borderWidth": "1px",
                                "_borderColor": "#0000ff"
                            },
                            {//With Photo Trans But
                                "overlayId": "bio_page_horz_scroll_trans_btn" + upcomingBios[i].id,
                                "type": "Button",
                                "width": "348px",
                                "height": "226px",
                                "relative": "parent",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "x": "0px",
                                "y": "0px",
                                "actions": [
                                    {
                                        "action": "toggleButtonOn",
                                        "trigger": "touchUpInside",
                                        "target": "ab_vert_trans_btn" + upcomingBios[i].id
                                    },
                                    {
                                        "action": "close",
                                        "trigger": "touchUpInside",
                                        "target": "ab_image"
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "_delay": 0.1,
                                        "trigger": "toggleOn",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "biosObj.offsetVertAttendee('" + distFromStart + "');"
                                        }
                                    },
                                    {
                                        "action": "runScriptAction",
                                        "trigger": "touchUpInside",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "biosObj.checkForClose('" + upcomingBios[i].id + "');"
                                        }
                                    }
                                ]
                            }
                        ]
                    });
                }
            }
            moreBorg.replaceOverlays('bio_page_horiz_scroll_data_container', bioPageOverlaysArray);
            bioPageOverlaysArray = [];
        }
    },
    spawnRecentBiosHorizontalContainer: function () {

        borg.runAction({
            "action": "setHiddenAction",
            "targets": ["noFavBio", "noUpcomingBio"],
            "trigger": "now",
            "data": {
                "hidden": true
            }
        });

        var recentBiosOverlaysArray = [];
        var recentBiosDataArray = [];
        var biosTable = global.biosTable;
        var recentbiosarray = borg.getPersistentItem("talk.track.tables['recentbios']");

        for (var i = 0; i < recentbiosarray.length; i++) {
            var a = biosTable[recentbiosarray[i]];
            recentBiosDataArray.push(a);
        }

        recentBiosDataArray.sort(sort_by('lastName', true, function (a) {
            return a.toUpperCase()
        }));
        for (var i = 0; i < recentBiosDataArray.length; i++) {

            var title = (recentBiosDataArray[i].title.length > 25) ? recentBiosDataArray[i].title.substr(0, 25) + "..." : recentBiosDataArray[i].title;

            var defaultAvatar = (pushToProd) ? "https://webapps-jnj-dev.smint.us/static/images/defaultBiographyImage.png" : "https://webapps-jnj-dev.smint.us/static/images/defaultBiographyImage.png";

            //noPhoto
            if (recentBiosDataArray[i].photo === defaultAvatar) {

                var name = recentBiosDataArray[i].firstName + " " + recentBiosDataArray[i].lastName;
                name = (name.length > 21) ? name.substr(0, 21) + "..." : name;
                var company = (recentBiosDataArray[i].company.length > 25) ? recentBiosDataArray[i].company.substr(0, 25) + "..." : recentBiosDataArray[i].company;

                var cardBackground = "Spine/images/attendeeCardBigBody.png";

                recentBiosOverlaysArray.push({
                    "overlayId": "bio_page_horiz_scroll_data_sub_container" + i,
                    "type": "container",
                    "width": "348px",
                    "height": "226px",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "relative": "parent",
                    "backgroundImage": cardBackground,
                    "lazyLoad": true,
                    "overlays": [
                        {
                            "overlayId": "bio_page_horiz_scroll_name_value" + i,
                            "type": "text",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": "<strong>" + name + "</strong>",
                            "height": "30px",
                            "width": "348px",
                            "font": "AkzidenzGroteskPro-Md",
                            "textAlign": "center",
                            "relative": "parent",
                            "x": "0px",
                            "y": "85px",
                            "fontColor": "#000000",
                            "size": "1.6em"
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_title_value" + i,
                            "type": "text",
                            "text": "<strong>" + title + "</strong>",
                            "width": "348px",
                            "height": "30px",
                            "x": "0px",
                            "y": "115px",
                            "textAlign": "center",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#097e98",
                            "size": "1.3em",
                            "relative": "parent"
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_company_value" + i,
                            "type": "text",
                            "text": "<strong>" + company + "</strong>",
                            "width": "348px",
                            "height": "30px",
                            "x": "0px",
                            "y": "140px",
                            "textAlign": "center",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#097e98",
                            "size": "1.3em",
                            "relative": "parent"
                        },
                        {
                            "overlayId": "bio_page_horz_scroll_trans_btn" + recentBiosDataArray[i].id,
                            "type": "Button",
                            "width": "348px",
                            "height": "226px",
                            "relative": "parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "0px",
                            "y": "0px",
                            "actions": [
                                {
                                    "action": "toggleButtonOn",
                                    "trigger": "touchUpInside",
                                    "target": "ab_vert_trans_btn" + recentBiosDataArray[i].id
                                },
                                {
                                    "action": "close",
                                    "trigger": "touchUpInside",
                                    "target": "ab_image"
                                },
                                {
                                    "_action": "runScriptAction",
                                    "_delay": 0.1,
                                    "trigger": "toggleOn",
                                    "target": "#jsBridge",
                                    "data": {
                                        //"script":"biosObj.offsetVertAttendee('" + distFromStart + "');"
                                    }
                                },
                                {
                                    "action": "runScriptAction",
                                    "trigger": "touchUpInside",
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "biosObj.checkForClose('" + recentBiosDataArray[i].id + "');"
                                    }
                                }
                            ]
                        }
                    ]
                });

            }
            else { //with photo
                var firstName = recentBiosDataArray[i].firstName;
                firstName = (firstName.length > 16) ? firstName.substr(0, 16) + "..." : firstName;
                var lastName = recentBiosDataArray[i].lastName;
                lastName = (lastName.length > 18) ? lastName.substr(0, 18) + "..." : lastName;
                var cardBackground = "Spine/images/bioCardWideBody.png";
                var photoUrl = recentBiosDataArray[i].photo;
                var company = (recentBiosDataArray[i].company.length > 20) ? recentBiosDataArray[i].company.substr(0, 20) + "..." : recentBiosDataArray[i].company;

                recentBiosOverlaysArray.push({
                    "overlayId": "bio_page_horiz_scroll_data_sub_container" + i,
                    "type": "container",
                    "width": "348px",
                    "height": "226px",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "relative": "parent",
                    "backgroundImage": cardBackground,
                    "lazyLoad": true,
                    "overlays": [
                        {
                            "overlayId": "defaultImage",
                            "type": "image",
                            "images": ["Spine/images/photoFrameAnon.png"],
                            "width": "83px",
                            "height": "110px",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "relative": "parent",
                            "_draggable": true,
                            "x": "26px",
                            "y": "46.5px"
                        },
                        {//With Photo Photo
                            "overlayId": "attendee_view_attendee_image",
                            "imagesDefault": ["Spine/images/photoFrameAnon.png"],
                            "dynamicSource": "url",
                            "type": "image",
                            "images": [
                                "$(" + photoUrl + ")"
                            ],
                            "width": "83px",
                            "height": "110px",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "relative": "parent",
                            "x": "26px",
                            "y": "46.5px",
                            "scaleMode": "aspect-fill",
                            "clipToBounds": true
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_first_name_value" + i,
                            "type": "text",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": firstName,
                            "height": "30px",
                            "width": "216px",
                            "font": "AkzidenzGroteskPro-Regular",
                            "textAlign": "left",
                            "relative": "parent",
                            "x": "125px",
                            "y": "52px",
                            "fontColor": "#000000",
                            "size": "1.6em",
                            "_borderWidth": "1px",
                            "_borderColor": "#0000ff"
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_last_name_value" + i,
                            "type": "text",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": lastName,
                            "height": "30px",
                            "width": "216px",
                            "font": "AkzidenzGroteskPro-Md",
                            "textAlign": "left",
                            "relative": "parent",
                            "x": "125px",
                            "y": "80px",
                            "fontColor": "#000000",
                            "size": "1.5em",
                            "_borderWidth": "1px",
                            "_borderColor": "#0000ff"
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_title_value" + i,
                            "type": "text",
                            "text": "<strong>" + title + "</br>" + company + "</strong>",
                            "height": "30px",
                            "width": "216px",
                            "x": "125px",
                            "y": "112px",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#097e98",
                            "size": "1.1em",
                            "relative": "parent",
                            "_borderWidth": "1px",
                            "_borderColor": "#0000ff"
                        },
                        {
                            "overlayId": "bio_page_horz_scroll_trans_btn" + recentBiosDataArray[i].id,
                            "type": "Button",
                            "width": "348px",
                            "height": "226px",
                            "relative": "parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "0px",
                            "y": "0px",
                            "actions": [
                                {
                                    "action": "toggleButtonOn",
                                    "trigger": "touchUpInside",
                                    "target": "ab_vert_trans_btn" + recentBiosDataArray[i].id
                                },
                                {
                                    "action": "close",
                                    "trigger": "touchUpInside",
                                    "target": "ab_image"
                                },
                                {
                                    "action": "runScriptAction",
                                    "trigger": "touchUpInside",
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "biosObj.checkForClose('" + recentBiosDataArray[i].id + "');"
                                    }
                                }
                            ]
                        }
                    ]
                });
            }
        }

        if (recentBiosDataArray.length == 0) {

            borg.runAction({
                "action": "setHiddenAction",
                "target": "noRecentBio",
                "trigger": "now",
                "data": {
                    "hidden": false
                }
            });
            moreBorg.replaceOverlays('bio_page_horiz_scroll_data_container', emptyOverlayArray);
        }
        else if (recentBiosDataArray.length !== 0) {
            borg.runAction({
                "action": "setHiddenAction",
                "target": "noRecentBio",
                "trigger": "now",
                "data": {
                    "hidden": true
                }
            });
            moreBorg.replaceOverlays('bio_page_horiz_scroll_data_container', recentBiosOverlaysArray);
        }
        //bioPageOverlaysArray = [];
    },
    spawnFav: function () {

        borg.runAction({
            "action": "setHiddenAction",
            "targets": ["noRecentBio", "noUpcomingBio"],
            "trigger": "now",
            "data": {
                "hidden": true
            }
        });

        var favOverlaysArray = [];
        var favBiosDataArray = [];
        var biosTable = global.biosTable;
        var favzArr = [];

        for (var i in biosTable) {

            if (biosTable[i].favorite == true || biosTable[i].favorite == 'add') {
                favBiosDataArray.push(biosTable[i]);
            } else {
            }
        }

        console.log(JSON.stringify(favBiosDataArray))

        for (var i = 0; i < favzArr.length; i++) {
            var a = biosTable[favzArr[i]];
            favBiosDataArray.push(a);
        }

        favBiosDataArray.sort(sort_by('lastName', true, function (a) {
            return a.toUpperCase()
        }));
        for (var i = 0; i < favBiosDataArray.length; i++) {

            var title = (favBiosDataArray[i].title.length > 25) ? favBiosDataArray[i].title.substr(0, 25) + "..." : favBiosDataArray[i].title;

            var defaultAvatar = (pushToProd) ? "https://webapps-jnj-dev.smint.us/static/images/defaultBiographyImage.png" : "https://webapps-jnj-dev.smint.us/static/images/defaultBiographyImage.png";

            //noPhoto
            if (favBiosDataArray[i].photo === defaultAvatar) {

                var name = favBiosDataArray[i].firstName + " " + favBiosDataArray[i].lastName;
                name = (name.length > 21) ? name.substr(0, 21) + "..." : name;
                var company = (favBiosDataArray[i].company.length > 25) ? favBiosDataArray[i].company.substr(0, 25) + "..." : favBiosDataArray[i].company;

                var cardBackground = "Spine/images/attendeeCardBigBody.png";

                favOverlaysArray.push({
                    "overlayId": "bio_page_horiz_scroll_data_sub_container" + i,
                    "type": "container",
                    "width": "348px",
                    "height": "226px",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "relative": "parent",
                    "backgroundImage": cardBackground,
                    "lazyLoad": true,
                    "overlays": [
                        {
                            "overlayId": "bio_page_horiz_scroll_name_value" + i,
                            "type": "text",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": "<strong>" + name + "</strong>",
                            "height": "30px",
                            "width": "348px",
                            "font": "AkzidenzGroteskPro-Md",
                            "textAlign": "center",
                            "relative": "parent",
                            "x": "0px",
                            "y": "85px",
                            "fontColor": "#000000",
                            "size": "1.6em"
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_title_value" + i,
                            "type": "text",
                            "text": "<strong>" + title + "</strong>",
                            "width": "348px",
                            "height": "30px",
                            "x": "0px",
                            "y": "115px",
                            "textAlign": "center",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#097e98",
                            "size": "1.3em",
                            "relative": "parent"
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_company_value" + i,
                            "type": "text",
                            "text": "<strong>" + company + "</strong>",
                            "width": "348px",
                            "height": "30px",
                            "x": "0px",
                            "y": "140px",
                            "textAlign": "center",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#097e98",
                            "size": "1.3em",
                            "relative": "parent"
                        },
                        {
                            "overlayId": "bio_page_horz_scroll_trans_btn" + favBiosDataArray[i].id,
                            "type": "Button",
                            "width": "348px",
                            "height": "226px",
                            "relative": "parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "0px",
                            "y": "0px",
                            "actions": [
                                {
                                    "action": "toggleButtonOn",
                                    "trigger": "touchUpInside",
                                    "target": "ab_vert_trans_btn" + favBiosDataArray[i].id
                                },
                                {
                                    "action": "close",
                                    "trigger": "touchUpInside",
                                    "target": "ab_image"
                                },
                                {
                                    "_action": "runScriptAction",
                                    "_delay": 0.1,
                                    "trigger": "toggleOn",
                                    "target": "#jsBridge",
                                    "data": {
                                        //"script":"biosObj.offsetVertAttendee('" + distFromStart + "');"
                                    }
                                },
                                {
                                    "action": "runScriptAction",
                                    "trigger": "touchUpInside",
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "biosObj.checkForClose('" + favBiosDataArray[i].id + "');"
                                    }
                                }
                            ]
                        }
                    ]
                });

            }
            else { //with photo
                var firstName = favBiosDataArray[i].firstName;
                firstName = (firstName.length > 16) ? firstName.substr(0, 16) + "..." : firstName;
                var lastName = favBiosDataArray[i].lastName;
                lastName = (lastName.length > 18) ? lastName.substr(0, 18) + "..." : lastName;
                var cardBackground = "Spine/images/bioCardWideBody.png";
                var photoUrl = favBiosDataArray[i].photo;
                var company = (favBiosDataArray[i].company.length > 20) ? favBiosDataArray[i].company.substr(0, 20) + "..." : favBiosDataArray[i].company;

                favOverlaysArray.push({
                    "overlayId": "bio_page_horiz_scroll_data_sub_container" + i,
                    "type": "container",
                    "width": "348px",
                    "height": "226px",
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "relative": "parent",
                    "backgroundImage": cardBackground,
                    "lazyLoad": true,
                    "overlays": [
                        {
                            "overlayId": "defaultImage",
                            "type": "image",
                            "images": ["Spine/images/photoFrameAnon.png"],
                            "width": "83px",
                            "height": "110px",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "relative": "parent",
                            "_draggable": true,
                            "x": "26px",
                            "y": "46.5px"
                        },
                        {//With Photo Photo
                            "overlayId": "attendee_view_attendee_image",
                            "imagesDefault": ["Spine/images/photoFrameAnon.png"],
                            "dynamicSource": "url",
                            "type": "image",
                            "images": [
                                "$(" + photoUrl + ")"
                            ],
                            "width": "83px",
                            "height": "110px",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "relative": "parent",
                            "x": "26px",
                            "y": "46.5px",
                            "scaleMode": "aspect-fill",
                            "clipToBounds": true
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_first_name_value" + i,
                            "type": "text",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": firstName,
                            "height": "30px",
                            "width": "216px",
                            "font": "AkzidenzGroteskPro-Regular",
                            "textAlign": "left",
                            "relative": "parent",
                            "x": "125px",
                            "y": "52px",
                            "fontColor": "#000000",
                            "size": "1.6em",
                            "_borderWidth": "1px",
                            "_borderColor": "#0000ff"
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_last_name_value" + i,
                            "type": "text",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "text": lastName,
                            "height": "30px",
                            "width": "216px",
                            "font": "AkzidenzGroteskPro-Md",
                            "textAlign": "left",
                            "relative": "parent",
                            "x": "125px",
                            "y": "80px",
                            "fontColor": "#000000",
                            "size": "1.5em",
                            "_borderWidth": "1px",
                            "_borderColor": "#0000ff"
                        },
                        {
                            "overlayId": "bio_page_horiz_scroll_title_value" + i,
                            "type": "text",
                            "text": "<strong>" + title + "</br>" + company + "</strong>",
                            "height": "30px",
                            "width": "216px",
                            "x": "125px",
                            "y": "112px",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#097e98",
                            "size": "1.1em",
                            "relative": "parent",
                            "_borderWidth": "1px",
                            "_borderColor": "#0000ff"
                        },
                        {
                            "overlayId": "bio_page_horz_scroll_trans_btn" + favBiosDataArray[i].id,
                            "type": "Button",
                            "width": "348px",
                            "height": "226px",
                            "relative": "parent",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "x": "0px",
                            "y": "0px",
                            "actions": [
                                {
                                    "action": "toggleButtonOn",
                                    "trigger": "touchUpInside",
                                    "target": "ab_vert_trans_btn" + favBiosDataArray[i].id
                                },
                                {
                                    "action": "close",
                                    "trigger": "touchUpInside",
                                    "target": "ab_image"
                                },
                                {
                                    "action": "runScriptAction",
                                    "trigger": "touchUpInside",
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "biosObj.checkForClose('" + favBiosDataArray[i].id + "');"
                                    }
                                }
                            ]
                        }
                    ]
                });
            }
        }


        if (favOverlaysArray.length == 0) {

            borg.runAction({
                "action": "setHiddenAction",
                "target": "noFavBio",
                "trigger": "now",
                "data": {
                    "hidden": false
                }
            });
            moreBorg.replaceOverlays('bio_page_horiz_scroll_data_container', emptyOverlayArray);
        }
        else if (favOverlaysArray.length !== 0) {
            borg.runAction({
                "action": "setHiddenAction",
                "target": "noFavBio",
                "trigger": "now",
                "data": {
                    "hidden": true
                }
            });
            moreBorg.replaceOverlays('bio_page_horiz_scroll_data_container', favOverlaysArray);
        }

        //bioPageOverlaysArray = [];
    },
    //vertical container
    spawnDataBioPage2: function () {

        var biosTable = global.biosTable;
        var bioPageOverlaysArray2 = [];
        var firstBioIdArray = [];

        gVars.searchArr3 = [];
        //        borg.setText("searchInputModal", "");

        setTimeout(function () {
            performAction(
                [
                    {
                        "action": "#spawnOnce",
                        "data": {
                            "overlayId": "stopSearchButtonBio"
                        }
                    },
                    {
                        "_action": "setEnabledAction",
                        "target": "stopSearchButtonBio",
                        "data": {
                            "enabled": false
                        }
                    }

                ]
            )
        }, 400)

        performAction([
            {
                "action": "#spawn",
                "trigger": "now",
                "data": {
                    "overlayId": "searchContainerBio"
                }
            },
            {
                "action": "#spawnOnce",
                "trigger": "now",
                "data": {
                    "overlayId": "ab_vert_scroll_container",
                    "x": "24px",
                    "y": "400px",
                    "height": "530px"
                }
            }

        ]);

        var totalWidth = 18;
        var first = true;

        for (i  in biosTable) {

            firstBioIdArray.push(i);

            if (first) {
                var distFromStart = 0;
                first = false;
            } else {

                var distFromStart = 242 - totalWidth;
                distFromStart = Math.abs(distFromStart)
            }
            totalWidth += 313;

            var name = biosTable[i].firstName + " " + biosTable[i].lastName;
            name = (name.length > 18) ? name.substr(0, 18) + "..." : name;
            var company = (biosTable[i].company.length > 28) ? biosTable[i].company.substr(0, 28) + "..." : biosTable[i].company;

            bioPageOverlaysArray2.push({
                "overlayId": "ab_vert_scroll_sub" + i,
                "type": "container",
                "width": "227px",
                "height": "62px",
                "horizontalAlign": "left",
                "verticalAlign": "top",
                "lazyLoad": true,
                "relative": "parent",
                "clipToBounds": true,
                "overlays": [
                    {
                        "overlayId": "ab_vert_trans_btn" + biosTable[i].id,
                        "type": "Button",
                        "width": "227px",
                        "height": "60px",
                        "images": [
                            "Spine/images/attendeeDivider.png"
                        ],
                        "imagesDown": [
                            "Spine/images/selectedCell.png"
                        ],
                        "relative": "parent",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "x": "0px",
                        "y": "-1px",
                        "toggle": true,
                        "radioGroup": "ab_vert",
                        "actions": [
                            {
                                "action": "runScriptAction",
                                "trigger": "toggleOn",
                                "_delay": 0.1,
                                "target": "#jsBridge",
                                "data": {
                                    "script": "biosObj.offsetHorzAttendee('" + distFromStart + "', '" + biosTable[i].id + "' );"
                                }
                            },
                            {
                                "action": "runScriptAction",
                                "trigger": "toggleOn",
                                "delay": 0.2,
                                "target": "#jsBridge",
                                "data": {
                                    "script": "biosObj.spawnCard('" + biosTable[i].id + "');"
                                }
                            }
                        ]
                    },
                    {
                        "overlayId": "ab_vert_scroll_name_value" + i,
                        "type": "text",
                        "text": "<strong>" + name + "</strong>",
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "width": "200px",
                        "height": "20px",
                        "x": "10px",
                        "y": "14px",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "1.0em",
                        "relative": "parent"
                    },
                    {
                        "overlayId": "ab_vert_scroll assoc_value" + i,
                        "type": "text",
                        "text": "<strong>" + company + "</strong>",
                        "width": "200px",
                        "height": "20px",
                        "x": "10px",
                        "y": "35px",
                        "textAlign": "left",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "font": "AkzidenzGroteskPro-Md",
                        "fontColor": "#3d3d3d",
                        "size": "0.9em",
                        "relative": "parent"
                    }
                ]
            });
            gVars.searchArr3.push(biosTable[i])
        }

        //alert(JSON.stringify(bioPageOverlaysArray2));
        moreBorg.containerSpawn(bioPageOverlaysArray2, 'ab_vert_scroll_container', false);
        bioPageOverlaysArray2 = [];

        var firstBio = firstBioIdArray[0];
        borg.setPersistentItem('talk.track.firstBio', firstBio);

        borg.runAction({
            "action": "close",
            "trigger": "now",
            "target": "biosPageLoadSpinner"
        });
        localJSONObject.tbPostSearch();
    },
    offsetVertAttendee: function (position) {

        // offsetAmount = (60 * position) - 60;
        /*performAction([
         {action:"setContentOffsetAction", trigger:"toggleOn", target:"ab_vert_scroll_container", data:{absolutePostion:true, animated:true, y:position + 'px'}}
         ]);*/
    },
    offsetHorzAttendee: function (position, index) {

        borg.setPersistentItem('talk.track.bioToggled', index);
        //  offsetAmount2 = (298 * position) - 160;

        /*performAction([
         {action:"setContentOffsetAction", trigger:"touchUpInside", target:"bio_page_horiz_scroll_data_container", data:{absolutePostion:true, animated:true, x:position + 'px'}}
         ]);*/
    },
    checkForClose: function (bioId) {
//        console.log(JSON.stringify(gVars))
        if (gVars.didSearch || gVars.didSearch2) {

            var a = jQuery.inArray(global.biosTable[bioId], gVars.bioResults);

            if (a != -1) {
                performAction([
                    {
                        "action": "toggleButtonOn",
                        "trigger": "touchUpInside",
                        "target": "ab_vert_trans_btn" + global.biosTable[bioId].id
                    }
                ]);

            } else {
                performAction([
                    {
                        "action": "setAlphaAction",
                        "target": "stopSearchButtonBio",
                        "data": {
                            "alpha": 0
                        }
                    },
                    {
                        "action": "runScriptAction",
                        "target": "#jsBridge",
                        "data": {
                            "script": "remarksLibObj.searchRemarkLibBio('');biosObj.spawnDataBioPage2();"
                        }
                    },
                    {
                        "action": "closeKeyboardAction",
                        "targets": ["searchInputBio"]
                    },
                    {
                        "action": "close",
                        "targets": [
                            "searchCloseKeyboardBio"
                        ]
                    }
                ]);
                gVars.toggleFromSearch = bioId;
            }

        } else {
            return
        }
    },
    routeFav: function (bioId) {

        console.log("BIZ ID ISZZZ  "+bioId)

        console.log(bioId + " addFav and faketoggle is : " + gVars.fakeToggle)


//        if (gVars.fakeToggle) {
//            gVars.fakeToggle = false;
//            console.log("NOT DOING ANYTHING in add")
//            return;
//        } else {
//            console.log("OKAY, doing things in add")
//        }

        var biosTable = global.biosTable

        //        console.log(JSON.stringify(biosTable))
        var status = biosTable[bioId].favorite;

        console.log('addFav status is' + " : " + status+ " fakeToggle is : " + gVars.fakeToggle)
        if (status == true ) {
            console.log('deleting')
            biosObj.deleteFav(bioId)
            return;
        } else {

        }


        if (isOnline) {

            //            if (biosTable[bioId].favorite == true) {
            //                biosObj.deleteFav(bioId);
            //                return
            //            } else {
            //            }

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/biographyfavorite/add/" : "https://webapps-jnj-dev.smint.us/api/biographyfavorite/add/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var postThis = '{"biography_id":' + encodeURIComponent(bioId) + '}'

            //            alert(JSON.stringify(postThis))
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    var response = xmlhttp.responseText;
                    console.log("GOT A 403 in BIOadd!!!" + response)

                }
                if (xmlhttp.readyState == 4 && xmlhttp.status == 500) {
                    var response = xmlhttp.responseText;
                    console.log("GOT A 500 in BIOadd!!!" )

                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = xmlhttp.responseText;
                    console.log("200 add: " + xmlhttp.responseText);
                    var a = JSON.parse(response);
                    lastToggledSuccess[bioId] = true;
                    //                    alert(JSON.stringify(a))
                    //                    var newRemId = a.data.activity_remarks_ids[0];
                    //                    gVars.remToSend.id = newRemId;
                    //                    activityRemarksObj.addNewActRemark(gVars.remToSend);
                    //                    bkgObj.changeOrder();
                    //                    bkgObj.numAdded = 0;
                    //                    bkgObj.addedArr = [];

                }
                else {
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(postThis);

            biosObj.getTable(true);
        }

        else if (!isOnline) {

            console.log('offlineadd')

            var status = biosTable[bioId].favorite;

            console.log('offline addFav status is' + " : " + status)

            var offlinePost =
            {
                "biography_id": bioId
            };
            var offlineTable = borg.getPersistentItem("talk.track.offline");

            var addInd = -1;
            var deleteInd = -1;

            for (var i = 0; i < offlineTable.BiographyFavorite.add.length; i++) {

                if (offlineTable.BiographyFavorite.add[i].biography_id == bioId) {
                    addInd = i;
                } else {
                }

            }

            for (var i = 0; i < offlineTable.BiographyFavorite.delete.length; i++) {

                if (offlineTable.BiographyFavorite.delete[i].biography_id == bioId) {
                    deleteInd = i;
                } else {
                }

            }

            console.log('index is : ' + addInd)
            if (addInd == -1) {
                console.log('pushing add')
                offlineTable.BiographyFavorite.add.push(offlinePost);
                global.biosTable[bioId].favorite = true;
                borg.setPersistentItem("talk.track.tables['bios']", global.biosTable);
                //                azz = bioId

                if (deleteInd != -1) {
                    var taken = offlineTable.BiographyFavorite.delete.splice(deleteInd, 1);
                    global.biosTable[taken[0].biography_id].favorite = true;
                    borg.setPersistentItem("talk.track.tables['bios']", global.biosTable);
                    //                    alert('deleteindex in add')
                    //                    alert(JSON.stringify(taken))
                    //                    alert(JSON.stringify(global.biosTable[taken[0].biography_id]))
                } else {
                }

                biosTable[bioId].favorite = 'add'
                offlineTable.hasData = true;

            } else {
                //                offlineTable.BiographyFavorite.add.splice(addInd, 1)

            }
            borg.clearIntervals();
            pollForOfflineUpdates = setInterval(function () {
                post.gettingBackOnline();
            }, 5000);

            borg.setPersistentItem("talk.track.offline", offlineTable);

        }
    },
    deleteFav: function (bioId) {

        console.log("delete faketoggle is: " + gVars.fakeToggle)
//        if (gVars.fakeToggle) {
//            gVars.fakeToggle = false;
//            console.log("NOT DOING ANYTHING in delete")
//            return;
//        } else {
//            console.log("OKAY, doing things in DELETE")
//        }

        var biosTable = global.biosTable;
        var status = biosTable[bioId].favorite;
        console.log('deleteFav status is' + " : " + status)


        if (isOnline) {

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/biographyfavorite/delete/" : "https://webapps-jnj-dev.smint.us/api/biographyfavorite/delete/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var postThis = '{"biography_id":' + encodeURIComponent(bioId) + '}'

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {

                if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    var response = xmlhttp.responseText;
                    console.log("GOT A 403 in BIOremove!!!" + response)

                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var response = xmlhttp.responseText;
                    console.log("200 remove: " + xmlhttp.responseText);
                    var a = JSON.parse(response);
                    //                    alert(JSON.stringify(a))
                    //                    var newRemId = a.data.activity_remarks_ids[0];
                    //                    gVars.remToSend.id = newRemId;
                    //                    activityRemarksObj.addNewActRemark(gVars.remToSend);
                    //                    bkgObj.changeOrder();
                    //                    bkgObj.numAdded = 0;
                    //                    bkgObj.addedArr = [];

                }
                else {
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.send(postThis);

            biosObj.getTable(true);

        }

        else if (!isOnline) {

            var offlinePost =
            {
                "biography_id": bioId
            };
            var offlineTable = borg.getPersistentItem("talk.track.offline");

            console.log(offlinePost)

            var deleteInd = -1;
            var addInd = -1;
            for (var i = 0; i < offlineTable.BiographyFavorite.delete.length; i++) {

                if (offlineTable.BiographyFavorite.delete[i].biography_id == bioId) {
                    deleteInd = i;

                } else {
                }

            }

            for (var i = 0; i < offlineTable.BiographyFavorite.add.length; i++) {

                if (offlineTable.BiographyFavorite.add[i].biography_id == bioId) {
                    addInd = i;
                } else {
                }

            }

            if (deleteInd == -1) {
                console.log('pushing delete')
                offlineTable.BiographyFavorite.delete.push(offlinePost);
                global.biosTable[bioId].favorite = false;
                borg.setPersistentItem("talk.track.tables['bios']", global.biosTable);
                if (addInd != -1) {
                    var taken = offlineTable.BiographyFavorite.add.splice(addInd, 1);
                    global.biosTable[taken[0].biography_id].favorite = false;
                    borg.setPersistentItem("talk.track.tables['bios']", global.biosTable);
                    //                    alert('addindex in delete')
                    //                    alert(JSON.stringify(taken))
                    //                    alert(JSON.stringify(global.biosTable[taken[0].biography_id]))
                } else {
                }

                offlineTable.hasData = true;
                biosTable[bioId].favorite = 'delete'

            } else {
                console.log('wierd else')
                //                offlineTable.BiographyFavorite.delete.splice(deleteInd, 1)
            }

            borg.clearIntervals();
            pollForOfflineUpdates = setInterval(function () {
                post.gettingBackOnline();
            }, 5000);

            borg.setPersistentItem("talk.track.offline", offlineTable);

        }
    },
    toggleFav: function (bioId) {

        console.log("togglefav"+bioId)
        var offlineTable = borg.getPersistentItem("talk.track.offline");
        var biosTable = global.biosTable

        var status = biosTable[bioId].favorite;

        console.log("TOGGLE FAV BRO  " + status)
        if (status == 'add') {

            gVars.fakeToggle = true;
            console.log("TOGGLE ON 1" )
            moreBorg.toggle("ab_fav_btnz" + biosTable[bioId].id, "on")

        } else if (status == true) {

            gVars.fakeToggle = true;
            console.log("TOGGLE ON 2" )
            moreBorg.toggle("ab_fav_btnz" + biosTable[bioId].id, "on")

        } else if (status == 'delete') {

            gVars.fakeToggle = true;
            console.log("TOGGLE OFF 1" )
            moreBorg.toggle("ab_fav_btnz" + biosTable[bioId].id, "off")

        } else {

            gVars.fakeToggle = true;
            console.log("TOGGLE OFF 2" )
            moreBorg.toggle("ab_fav_btnz" + biosTable[bioId].id, "off")
        }
    }
};

var participantGroupsObj = {
    getTable: function () {

        if (isOnline === true) {

            var participantGroupsTable = {};

            var url = (pushToProd) ? "https://webapps-jnj.smint.us/api/participantgroups/" : "https://webapps-jnj-dev.smint.us/api/participantgroups/";

            var cookie = 'sessionid=' + borg.getPersistentItem("talk.track.cookie");

            var ID = "userid=" + borg.getPersistentItem('talk.track.id');

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    clearTimeout(xmlHttpTimeout);

                    var data = xmlhttp.responseText;

                    global.participantGroupsTable = JSON.parse(data).participantGroups;

                    borg.setPersistentItem("talk.track.tables['participantGroups']", JSON.parse(data).participantGroups);
                    //participantGroupsTable = borg.getPersistentItem("talk.track.tables['participantGroups']");
                    //global.participantGroupsTable = participantGroupsTable;
                    console.log('getting partGroups table - success');
                }
                else if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
                    clearTimeout(xmlHttpTimeout);
                    var data = xmlhttp.responseText;

                    var partGroups403 = JSON.parse(data);

                    console.log('getting partGroups table - failure');

                    var success = partGroups403['success'];
                    var status = partGroups403['status'];

                    if (status == 'Invalid session.') {
                        //autoLogin occurs with status 403
                        login();
                        console.log('logging back in');

                        global.participantGroupsTable = borg.getPersistentItem("talk.track.tables['participantGroups']");
                    }

                }
            };
            xmlhttp.open("GET", url, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.setRequestHeader("Cookie", cookie);
            xmlhttp.setRequestHeader("Cache-Control", "max-age=0");
            xmlhttp.withCredentials = true;
            xmlhttp.send();

            var xmlHttpTimeout = setTimeout(ajaxTimeout, 5000);

            function ajaxTimeout() {
                xmlhttp.abort();
                console.log("Request timed out");

                global.participantGroupsTable = borg.getPersistentItem("talk.track.tables['participantGroups']");
            }
        }
        else {
            global.participantGroupsTable = borg.getPersistentItem("talk.track.tables['participantGroups']");
        }
    }
};

var calendarObj = {
    spawnCalendar: function () {

        calOverlays = [];
        calendarData = {};
        var tripNum = 0;
        var lastTrip;
        var currAct;

        var biosTable = global.biosTable;
        var activitiesTable = global.activitiesTable;
        var tripsTable = global.tripsTable;

        for (i in tripsTable) {
            calendarData[tripsTable[i].id] = tripsTable[i];
            currAct = [];
            for (j in activitiesTable) {
                if (activitiesTable[j].tripId == tripsTable[i].id) {
                    currAct.push(activitiesTable[j])
                }
            }
            calendarData[tripsTable[i].id].activities = currAct;
        }

        var paperColor = 0;

        for (i  in calendarData) {
            var bgVal = '';
            paperColor = 0;
            //var name = activitiesTable[i].activityName.substr(0, 101);
            //var pNotes = activitiesTable[i].planningNotes.substr(0, 123);
            //name = (name.length > 100) ? name += "..." : name;
            //pNotes = (pNotes.length > 122) ? pNotes += "..." : pNotes;
            //peopleStr = (peopleStr.length > 122) ? peopleStr += "..." : peopleStr;
            bgVal = (i % 2) ? "Spine/images/paperTexture.png" : "Spine/images/paperTextureDark.png";


            if (calendarData[i].tripName != lastTrip) {

                var tName = calendarData[i].tripName;
                tripNum++;
                row = {
                    "overlayId": "ab_vert_scroll_subz2" + i,
                    "type": "container",
                    "width": "770px",
                    "height": "35px",
                    "backgroundImage": "Spine/images/calendarTripDivider.png",
                    "clipToBounds": true,
                    "_draggable": true,
                    "horizontalAlign": "left",
                    "verticalAlign": "top",
                    "lazyLoad": true,
                    "relative": "parent",
                    "onTouchUp": "calendarObj.goToTripBriefing(" + i + ");",
                    "overlays": [
                        {
                            "overlayId": "ab_vert_scroll_date_value" + i,
                            "type": "text",
                            "text": "<strong>" + tName + "</strong>" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + calendarData[i].tripRange + "&nbsp;>",
                            "textAlign": "left",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "width": "800px",
                            "_height": "60px",
                            "x": "52px",
                            "y": "12px",
                            "font": "AkzidenzGroteskPro-Md",
                            "fontColor": "#FFFFFF",
                            "size": "1.3em",
                            "relative": "parent"
                        },
                        {
                            "overlayId": "ab_vert_scroll_date_value_btn" + i,
                            "type": "button",
                            "horizontalAlign": "left",
                            "verticalAlign": "top",
                            "width": "800px",
                            "_height": "60px",
                            "borderWidth": "1px",
                            "x": "0px",
                            "y": "0px",
                            "color": "#magic",
                            "relative": "parent",
                            "actions": [
                                {
                                    "action": "runScriptAction",
                                    "target": "#jsBridge",
                                    "data": {
                                        "script": "allTripsObj.spawnOverview(" + calendarData[i].id + ");"
                                    }
                                },
                                {
                                    "action": "#goToPage",
                                    "trigger": "touchupinside",
                                    "data": {
                                        "pageId": "tripDetailPage",
                                        "transitionType": "slide",
                                        "//transitionDuration": 0.5
                                    }
                                }
                            ]
                        }
                    ]
                }
                calOverlays.push(row);
                lastTrip = calendarData[i].tripName
            }

            var j;
            var actLeng = calendarData[i].activities.length;

            //TODO: add method when asset comes in-- placeholder activity
            if (actLeng == 0) {
                calOverlays.splice(calOverlays.length - 1, 1)
            }

            for (j = 0; j < actLeng; j++) {

                try {
                    paperColor++;
                    var actRow;
                    bgVal = '';
                    bgVal = (paperColor % 2) ? "Spine/images/paperTexture.png" : "Spine/images/paperTextureDark.png";
                    var actColor = '';
                    actColor = (calendarData[i].activities[j].keyEvent == true && calendarData[i].activities[j].activityState != "Draft") ? "#f30617" : "#black";
                    var name = calendarData[i].activities[j].activityName.substr(0, 67);
                    name = (calendarData[i].activities[j].keyEvent == true && calendarData[i].activities[j].activityState != "Draft") ? name + " >" : name;
                    name = (name.length > 66) ? name += "..." : name;
                    var venue = calendarData[i].activities[j].venue.substr(0, 32);
                    venue = (venue.length > 21) ? venue += "..." : venue;
                    var comm = calendarData[i].activities[j].itineraryNotes.substr(0, 144);
                    comm = (comm.length > 143) ? comm += "..." : comm;
                    var draftImg = '';
                    draftImg = (calendarData[i].activities[j].activityState == "Draft") ? "Spine/images/calendarDraftBadge.png" : "Spine/images/calen2darDraftBadge.png";
                    var useKey1 = '';
                    useKey1 = (calendarData[i].activities[j].keyEvent == true && calendarData[i].activities[j].activityState != "Draft") ? "runScriptAction" : "azzzzdkfkfkfkf";
                    var useKey2 = '';
                    useKey2 = (calendarData[i].activities[j].keyEvent == true && calendarData[i].activities[j].activityState != "Draft") ? "#goToPage" : "azzzzdkfkfkfkf";
                    var conditionalClose = '';
                    conditionalClose = (calendarData[i].activities[j].keyEvent == true) ? "close" : "doNothing";
                    var conditionalSpawn = '';
                    conditionalSpawn = (calendarData[i].activities[j].keyEvent == true) ? "#spawnOnce" : "doNothing";
                    actRow = {
                        "overlayId": "ab_vert_scroll_subz" + calendarData[i].id + calendarData[i].activities[j].activityName,
                        "type": "container",
                        "width": "770px",
                        "height": "210px",
                        "backgroundImage": bgVal,
                        "backgroundPosition": "center",
                        "backgroundRepeat": "repeat",
                        "clipToBounds": false,
                        "borderColor": "#616161",
                        "borderWidth": "1px",
                        "horizontalAlign": "left",
                        "verticalAlign": "top",
                        "lazyLoad": true,
                        "relative": "parent",
                        "overlays": [
                            {
                                "overlayId": "dateTitle" + j + i,
                                "type": "text",
                                "text": "Date",
                                "textAlign": "left",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "width": "70px",
                                "height": "60px",
                                "x": "27px",
                                "y": "55px",
                                "font": "AkzidenzGroteskPro-Md",
                                "fontColor": "#3d3d3d",
                                "size": "1.1em",
                                "relative": "parent"
                            },
                            {
                                "overlayId": "venueTitle" + j + i,
                                "type": "text",
                                "text": "Venue",
                                "textAlign": "left",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "width": "70px",
                                "height": "60px",
                                "x": "181px",
                                "y": "55px",
                                "font": "AkzidenzGroteskPro-Md",
                                "fontColor": "#3d3d3d",
                                "size": "1.1em",
                                "relative": "parent"
                            },
                            {
                                "overlayId": "topicTitle" + j + i,
                                "type": "text",
                                "text": "Itinerary Notes",
                                "textAlign": "left",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "width": "200px",
                                "height": "60px",
                                "x": "27px",
                                "y": "130px",
                                "font": "AkzidenzGroteskPro-Md",
                                "fontColor": "#3d3d3d",
                                "size": "1.1em",
                                "relative": "parent"
                            },
                            {
                                "overlayId": "tripName" + j + i,
                                "type": "text",
                                "text": "<strong>" + name + "</strong>",
                                "textAlign": "left",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "width": "768px",
                                "height": "80px",
                                "x": "27px",
                                "y": "18px",
                                "font": "AkzidenzGroteskPro-Md",
                                "fontColor": actColor,
                                "size": "1.5em",
                                "relative": "parent"
                            },
                            {
                                "overlayId": "tripDate" + j + i,
                                "type": "text",
                                "text": "<strong>" + calendarData[i].activities[j].activityDate2 + "</strong>",
                                "textAlign": "left",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "width": "768px",
                                "height": "80px",
                                "x": "27px",
                                "y": "77px",
                                "font": "AkzidenzGroteskPro-Md",
                                "size": "1.4em",
                                "relative": "parent"
                            },
                            {
                                "overlayId": "tripVenue" + j + i,
                                "type": "text",
                                "text": "<strong>" + venue + "</strong>",
                                "textAlign": "left",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "width": "180px",
                                "height": "60px",
                                "x": "181px",
                                "y": "77px",
                                "font": "AkzidenzGroteskPro-Md",
                                "size": "1.4em",
                                "relative": "parent"
                            },
                            {
                                "overlayId": "tripTopic" + j + i,
                                "type": "text",
                                "text": comm,
                                "textAlign": "left",
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "width": "718px",
                                "height": "100px",
                                "x": "27px",
                                "y": "152px",
                                "font": "AkzidenzGroteskPro-Md",
                                "size": "1.2em",
                                "relative": "parent"
                            },
                            {
                                "overlayId": "actButton" + j + i,
                                "type": "button",
                                "width": "768px",
                                "height": "210px",
                                "x": "0px",
                                "y": "0px",
                                "color": "#magic",
                                "clipToBounds": true,
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "lazyLoad": true,
                                "relative": "parent",
                                "actions": [
                                    {
                                        "action": useKey1,
                                        "trigger": "touchUpInside",
                                        "target": "#jsBridge",
                                        "data": {
                                            "script": "activityId = calendarData[" + i + "].activities[" + j + "].id"
                                        }
                                    },
                                    {
                                        "action": useKey2,
                                        "trigger": "touchUpInside",
                                        "data": {
                                            "pageId": "activityDetailPage2",
                                            "transitionType": "slide"
                                        }
                                    },
                                    {
                                        "action": conditionalClose,
                                        "target": "tabBarBlockerAllTrips"
                                    },
                                    {
                                        "action": conditionalSpawn,
                                        "trigger": "touchUpInside",
                                        "data": {
                                            "overlayId": "imageToPreventUsersFromMashingTheButtons"
                                        }
                                    }
                                ]
                            },
                            {
                                "overlayId": "tripDraft" + j + i,
                                "type": "image",
                                "images": [draftImg],
                                "horizontalAlign": "left",
                                "verticalAlign": "top",
                                "x": "698px",
                                "y": "0px",
                                "relative": "parent"
                            }
                        ],
                        "actions": [
                            {
                                "action": "bringToFront",
                                "delay": 0.5,
                                "trigger": "now",
                                "target": "tripDraft" + j + i
                            }
                        ]
                    }
                    calOverlays.push(actRow);
                }
                catch (err) {
                }
            }
            //       calOverlays.push(row);

        }


        //alert(JSON.stringify(calOverlays));
        //alert(calOverlays.length);

        if (calOverlays.length == 0) {

            borg.runAction({
                "action": "setHiddenAction",
                "target": "allTripsNoTrips",
                "trigger": "now",
                "data": {
                    "hidden": false
                }
            });
        }
        else if (calOverlays.length !== 0) {

            borg.runAction({
                "action": "setHiddenAction",
                "target": "allTripsNoTrips",
                "trigger": "now",
                "data": {
                    "hidden": true
                }
            });
        }

        //moreBorg.replaceOverlays('calendar_vert_scroll_container', calOverlays);
        moreBorg.containerSpawn(calOverlays, 'calendar_vert_scroll_container', false);
        calOverlays = [];


        borg.runAction({
            "action": "close",
            "target": "imageToPreventUsersFromMashingTheButtons",
            "delay": 1.2,
            "trigger": "now"
        });
    },
    goToTripBriefing: function (i) {

        borg.runAction({
            "action": "#spawnOnce",
            "trigger": "touchUpInside",
            "data": {
                "overlayId": "imageToPreventUsersFromMashingTheButtons"
            }
        });
        borg.runAction({
            "action": "#goToPage",
            "trigger": "touchupinside",
            "data": {
                "pageId": "tripDetailPage",
                "transitionType": "slide",
                "//transitionDuration": 0.5
            }
        });
        borg.runAction({
            "action": "runScriptAction",
            "target": "#jsBridge",
            "data": {
                "script": "allTripsObj.spawnOverview(" + i + ");"
            }
        });
    }
};

Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};



maze.roomRef = {
    "12DjT8l5suGMpdqbqqeN" : {
        "exits" : {
            "north" : true,
            "west" : true
        },
        "wallInfo" : {
            "writing" : "xx",
            "order" : -1
        },
        "checked" : true
    },
    "hY3XpppsWpb7JJ4fFJCn" : {
        "exits" : {
            "east" : true
        },
        "wallInfo" : {
            "writing" : "B",
            "order" : 32
        },
        "checked" : true
    },
    "j9QkolkwEwAvrWo5vcTm" : {
        "exits" : {
            "north" : true
        },
        "wallInfo" : {
            "writing" : "9",
            "order" : 35
        },
        "checked" : true
    },
    "BPjI24aKLIlkBtqtIuYT" : {
        "exits" : {
            "south" : true
        },
        "wallInfo" : {
            "writing" : "j",
            "order" : 12
        },
        "checked" : true
    },
    "DmCqQBeWbi6jaCCAoJhl" : {
        "exits" : {
            "west" : true,
            "north" : true,
            "south" : true,
            "east" : true
        },
        "wallInfo" : {
            "writing" : "j",
            "order" : 42
        },
        "checked" : true
    },
    "DT9YsTCdPrpRE2PlmBGY" : {
        "exits" : {
            "east" : true
        },
        "wallInfo" : {
            "writing" : "a",
            "order" : 34
        },
        "checked" : true
    },
    "Z1ncQYDyFaFluKtqu0Zk" : {
        "exits" : {
            "south" : true,
            "west" : true
        },
        "wallInfo" : {
            "writing" : "xx",
            "order" : -1
        },
        "checked" : true
    },
    "9aEWJUiMTjWrmJrdiv8q" : {
        "exits" : {
            "north" : true
        },
        "wallInfo" : {
            "writing" : "w",
            "order" : 25
        },
        "checked" : true
    },
    "UaL64Oxo7Xb90T3wqXKH" : {
        "exits" : {
            "west" : true
        },
        "wallInfo" : {
            "writing" : "S",
            "order" : 37
        },
        "checked" : true
    },
    "Gc0E9qEeJjc1RdlR6Da1" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "D",
            "order" : 10
        },
        "checked" : true
    },
    "1KF1GC0360fXD6Ch781l" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "xx",
            "order" : -1
        },
        "checked" : true
    },
    "jaJDUDFwl02Bk0RygZpL" : {
        "exits" : {
            "east" : true,
            "south" : true,
            "west" : true
        },
        "wallInfo" : {
            "writing" : "S",
            "order" : 23
        },
        "checked" : true
    },
    "DPMeLpdxSGKZlmRJf5Go" : {
        "exits" : {
            "west" : true,
            "north" : true,
            "east" : true
        },
        "wallInfo" : {
            "writing" : "2",
            "order" : 44
        },
        "checked" : true
    },
    "TAtWGC5FD0sNvPkapYFZ" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "1",
            "order" : 47
        },
        "checked" : true
    },
    "iED8ZvAhD4SwCHyvNHc5" : {
        "exits" : {
            "east" : true
        },
        "wallInfo" : {
            "writing" : "E",
            "order" : 28
        },
        "checked" : true
    },
    "zL83R4HeoPmUkKjbpSa1" : {
        "exits" : {
            "south" : true
        },
        "wallInfo" : {
            "writing" : "b",
            "order" : 21
        },
        "checked" : true
    },
    "jkiZQwume76huwSWmCy7" : {
        "exits" : {
            "east" : true,
            "west" : true,
            "south" : true,
            "north" : true
        },
        "wallInfo" : {
            "writing" : "xx",
            "order" : -1
        },
        "checked" : true
    },
    "N0VMWPgBGY6l1zMsEpAN" : {
        "exits" : {
            "south" : true,
            "north" : true
        },
        "wallInfo" : {
            "writing" : "y",
            "order" : 15
        },
        "checked" : true
    },
    "o5yOnPP7xmKxAgJnP52k" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "t",
            "order" : 29
        },
        "checked" : true
    },
    "rtnWJPfyvBZ7m8IVkEyt" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "e",
            "order" : 20
        },
        "checked" : true
    },
    "326QnXDLd2xJymMxm634" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "g",
            "order" : 38
        },
        "checked" : true
    },
    "EYUS5OiZQzY8MVc57NtG" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "h",
            "order" : 31
        },
        "checked" : true
    },
    "JJ2LfXRtFYxPQAwJKycK" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "k",
            "order" : 19
        },
        "checked" : true
    },
    "Rqv6B8mEqYNSG6UnI1tv" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "1",
            "order" : 17
        },
        "checked" : true
    },
    "05v9J8lTfQqdhI9eOQje" : {
        "exits" : {
            "south" : true,
            "west" : true,
            "east" : true
        },
        "wallInfo" : {
            "writing" : "c",
            "order" : 8
        },
        "checked" : true
    },
    "96vQAHr8XdiQRXZZdoSV" : {
        "exits" : {
            "east" : true,
            "north" : true
        },
        "wallInfo" : {
            "writing" : "xx",
            "order" : -1
        },
        "checked" : true
    },
    "8PouSvy39sVc62MQlT0Q" : {
        "exits" : {
            "east" : true
        },
        "wallInfo" : {
            "writing" : "F",
            "order" : 22
        },
        "checked" : true
    },
    "28fBC5gv9JumFWO3B5oE" : {
        "exits" : {
            "west" : true,
            "east" : true,
            "south" : true
        },
        "wallInfo" : {
            "writing" : "xx",
            "order" : -1
        },
        "checked" : true
    },
    "YHJVjiMKxD5aGZnKwC9v" : {
        "exits" : {
            "east" : true
        },
        "wallInfo" : {
            "writing" : "i",
            "order" : 40
        },
        "checked" : true
    },
    "FjfKovd1EXizIwE3NTgG" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "e",
            "order" : 16
        },
        "checked" : true
    },
    "YKBEBOnTM7CPyXANyRZ6" : {
        "exits" : {
            "south" : true
        },
        "wallInfo" : {
            "writing" : "H",
            "order" : 11
        },
        "checked" : true
    },
    "HCkXEe75NS5tDKAz0b2m" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "I",
            "order" : 30
        },
        "checked" : true
    },
    "x2TviZti0i9LdyAYVAgw" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "k",
            "order" : 43
        },
        "checked" : true
    },
    "69lT2vF0MG7qHbbdmO2M" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "xx",
            "order" : -1
        },
        "checked" : true
    },
    "dh1WTxYp3eXTmaQutwUE" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "2",
            "order" : 9
        },
        "checked" : true
    },
    "JfNT8GAzR7AHspP8MooW" : {
        "exits" : {
            "south" : true,
            "east" : true
        },
        "wallInfo" : {
            "writing" : "v",
            "order" : 13
        },
        "checked" : true
    },
    "yoavf8vy9WqRJjefVR88" : {
        "exits" : {
            "east" : true,
            "north" : true
        },
        "wallInfo" : {
            "writing" : "xx",
            "order" : -1
        },
        "checked" : true
    },
    "JWIB4SizuTp94gqWqyeZ" : {
        "exits" : {
            "south" : true
        },
        "wallInfo" : {
            "writing" : "L",
            "order" : 39
        },
        "checked" : true
    },
    "TXcx5X0z10wxblqR6O2L" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "j",
            "order" : 26
        },
        "checked" : true
    },
    "PpbA7Pj1WyzVGl3X7byE" : {
        "exits" : {
            "west" : true
        },
        "wallInfo" : {
            "writing" : "n",
            "order" : 18
        },
        "checked" : true
    },
    "YXlSFBh9rX4UCvORlheP" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "V",
            "order" : 33
        },
        "checked" : true
    },
    "bAcq8878gdk0buRq14oh" : {
        "exits" : {
            "north" : true
        },
        "wallInfo" : {
            "writing" : "F",
            "order" : 46
        },
        "checked" : true
    },
    "UQ2uL4tkvkzARZ9sdW9p" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "j",
            "order" : 14
        },
        "checked" : true
    },
    "UaTZvxnGmOt3hmliR1jw" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "L",
            "order" : 24
        },
        "checked" : true
    },
    "b9jMNrxhDtKUMsOkCSOn" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "J",
            "order" : 27
        },
        "checked" : true
    },
    "YD1UmeYeRMijZdz5gaAL" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "3",
            "order" : 41
        },
        "checked" : true
    },
    "soIN8sPQhv8QHHoVBjkU" : {
        "exits" : {
            "north" : true
        },
        "wallInfo" : {
            "writing" : "k",
            "order" : 45
        },
        "checked" : true
    },
    "gNs8D5NBeuJ6mGbsAOiQ" : {
        "exits" : {

        },
        "wallInfo" : {
            "writing" : "z",
            "order" : 36
        },
        "checked" : true
    }
}