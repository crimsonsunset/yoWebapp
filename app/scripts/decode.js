/**
 * @author Joe Sangiorgio
 * JS Backend for Code Tests
 */

//globals
var verbose = false;
var isDev = true;
var url = (isDev) ? "http://0.0.0.0:5000" : "http://challenge2.airtime.com:7182/"

START_ROUTE = "/start"
EXITS_ROUTE = "/exits"
MOVE_ROUTE = "/move"
WALL_ROUTE = "/wall"
REPORT_ROUTE = "/report"

var maze = (function () {
    var maze = {}
    maze.startRoom = ""
    maze.roomRef = {}
    maze.directionPriority = ["south", "west", "east", "north"]
    maze.queue = []
    maze.workingRooms=[]
    maze.brokenRooms=[]
    maze.message = ""

    function init() {
        start();
    }

    init();

    //util wrapper functions
    function start() {
        $.ajax({
            url: url + START_ROUTE,
            type: "GET",
            success: function (data) {
                var d = (JSON.parse(String(data)));
                maze.startRoom = d.roomId
                console.log("startRoom is: " + maze.startRoom)
                //                maze.newRoom(maze.startRoom)
                //                maze.search(maze.startRoom)
                maze.dfs(maze.startRoom)
            }
        });
    }

    maze.newRoom = function (currRoom) {
        maze.examineRoom(currRoom)
        maze.checkWall(currRoom)
    }

    maze.search = function (currRoom) {
        _.each(maze.directionPriority, function (e, i, l) {
            if (maze.roomRef[currRoom].exits[e]) {
                maze.moveToRoom(currRoom, e)
            }
        });
    }

    maze.examineRoom = function (roomId) {

        $.ajax({
            url: url + EXITS_ROUTE + "?roomId=" + roomId,
            type: "GET",
            async: false,
            success: function (data) {
                var d = (JSON.parse(String(data)));
                maze.roomRef[roomId] = {}
                maze.roomRef[roomId].exits = {}
                _.each(d.exits, function (e, i, l) {
                    maze.roomRef[roomId].exits[e] = maze.examineRoom(roomId,e)
                });

                console.log("examined")
            }
        });
    }

    maze.checkWall = function (roomId) {

        $.ajax({
            url: url + WALL_ROUTE + "?roomId=" + roomId,
            type: "GET",
            async: false,
            success: function (data) {
                var d = (JSON.parse(String(data)));
                if (!maze.roomRef[roomId].wallInfo) {
                    maze.roomRef[roomId].wallInfo = d
                } else {
                    //arleady in ref obj, dont add to it
                }
                maze.roomRef[roomId].checked = true;
                console.log("checked")
            }
        });


    }

    maze.moveToRoom = function (roomId, exit) {
        $.ajax({
            url: url + MOVE_ROUTE + "?roomId=" + roomId + "&exit=" + exit,
            type: "GET",
            success: function (data) {
                console.log(data)
                var d = (JSON.parse(String(data)));
                var newId = d.roomId
                console.log("moving " + exit + " from room Id: " + roomId + " to a new room: " + newId)
                if (!maze.roomRef[newId]) {
                    maze.roomRef[newId] = {}
                    maze.examineRoom(newId)
                    return newId;
                    //                    maze.dfs(newId)
                    //                    maze.newRoom(newId)

                } else {
                    console.log("already here, and checked is: " + maze.roomRef[newId].checked)
                    return false;
                    //arleady in ref obj, dont add to it
                }
            }
        });
    }

    maze.collectData = function(){
        console.log("collecting data bro")
        _.each(maze.roomRef, function (e, i, l) {
            if (e.wallInfo.order == -1) {
                maze.brokenRooms.push(i)
            } else {
                //                console.log(e.wallInfo)
                var d = {
                    "writing": e.wallInfo.writing,
                    "order": e.wallInfo.order
                }
                maze.workingRooms.push(d)
            }
        });

        //        console.log(maze.brokenRooms)
        //        console.log("---=====================---------")
        //        console.log(maze.workingRooms)
        maze.workingRooms.sort(sort_by('order', true, function (a) {
            return a
        }));
        //        console.log("---=====================---------")
        //        console.log(maze.workingRooms)
        //
        _.each(maze.workingRooms, function (e, i, l) {
            maze.message+= e.writing
        });

        console.log(maze.message)
        maze.sendReport();

    }

    maze.sendReport = function () {
        $.ajax({
            url: url + REPORT_ROUTE,
            type: "POST",
            async: false,
            data: {
                roomIds: maze.brokenRooms,
                challenge: maze.message
            },
            success: function (data) {
                var d = (String(data));
                console.log(d)
            }
        });
    }

    //aux functions
    maze.set = function (name, field) {
        this[name] = field
    }

    //validation functions
    maze.validatePBO = function (isFirst) {

    }

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

    //      procedure DFS(G,v):
    //          label v as discovered
    //         for all edges from v to w in G.adjacentEdges(v) do
    //                  if vertex w is not labeled as discovered then
    //                  recursively call DFS(G,w)


    //      procedure DFS-iterative(G,v):
    //          let S be a stack
    //          S.push(v)
    //          while S is not empty
    //                v ← S.pop()
    //                if v is not labeled as discovered:
    //                        label v as discovered
    //                    for all edges from v to w in G.adjacentEdges(v) do
    //                            S.push(w)

    maze.dfs = function(currRoom){
        maze.queue.push(currRoom)
        while(maze.queue.length != 0){
            var useRoom = maze.queue.pop()
                            maze.newRoom(useRoom)
            var d = maze.moveToRoom(useRoom);
            console.log(d)
//            if (maze.moveToRoom() != false) {
//                maze.newRoom(useRoom)
//                _.each(maze.roomRef[useRoom].exits, function (e, i, l) {
//
//
//
//                    maze.queue.push(currRoom)
//                });
//            }

        }

    }

    maze.dfs2 = function(currRoom){
        maze.newRoom(currRoom)
        _.each(maze.roomRef[currRoom].exits, function (e, i, l) {
            console.log(i)
            maze.moveToRoom(currRoom, i)
        });
    }

    return maze;
}());


//prototype overrides
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
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