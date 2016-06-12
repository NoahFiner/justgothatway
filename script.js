var mx = 0; // mouse x
var my = 0; // mouse y
var wh = window.innerHeight;
var ww = window.innerWidth;
var mouseMessageFadeTimeout;
var levelStarted = false;
var currLevel = 0;

//shows the level. development only
var hidePath = true;

var levels = [
  [['s', 10, 10, 10, 10], ['r', 10, 10, 80, 10], ['d', 80, 10, 10, 50], ['l', 50, 60, 40, 10], ['e', 50, 60, 10, 10]],
  [['s', 80, 10, 10, 10], ['l', 10, 10, 80, 10], ['d', 10, 10, 10, 50], ['r', 10, 60, 40, 10], ['e', 50, 60, 10, 10]]
];

var updateSizes = function() {
  wh = window.innerHeight;
  ww = window.innerWidth;
};

var gameElemClasses = {l: "left", r: "right", u: "up", d: "down", s: "start", e: "end"};

//a should be ['l/r/u/p/s/e', x1, y1, w, h] in %
var createElem = function(a) {
  $("#game-outer").append("<div class='game-elem "+gameElemClasses[a[0]]+"' style='top: "+a[2]+"%; left: "+a[1]+"%; height: "+a[4]+"%; width: "+a[3]+"%'></div>");
};

var initLevel = function(level, wonParam) {
  var won = wonParam || 0;
  $(".start").removeClass("disabled");
  levelStarted = false;
  if(wonParam) {
    $(".game-elem").remove();
    for(i = 0; i < level.length; i++) {
      createElem(level[i]);
    }
    if(hidePath) {
      $(".game-elem").addClass("hidden");
    }
  }
  $(".game-elem").addClass("hide-pointers");
  $(".start").mouseenter(function() {
    instructions("", "", false);
    if(levelStarted === false) {
      startLevel();
    }
  });
};

var startLevel = function() {
  $(".start").addClass("disabled");
  $(".game-elem").removeClass("hide-pointers");
  levelStarted = true;
  $("#hover-lose").mouseenter(function() { //lose
    if(levelStarted) {
      instructions("Whoops", "Looks like someone was too reckless.", true);
      initLevel(levels[currLevel]);
    }
  });
  $(".end").mouseenter(function() {
    if(levelStarted) {
      instructions("You did it", "That was some top-notch work back there.", true);
      initLevel(levels[currLevel + 1], true);
    }
  });
};

var instructions = function(header, info, visibility) {
  if(visibility) {
    $("#mouse-message-outer, #mouse-message-outer > .pretty").removeClass("hidden");
    $("#mouse-message-header").html(header);
    $("#mouse-message").html(info);
    clearTimeout(mouseMessageFadeTimeout);
    mouseMessageFadeTimeout = setTimeout(function() {
      hideMouseMessage();
    }, 5000);
  } else {
    $("#mouse-message-outer, #mouse-message-outer > .pretty").addClass("hidden");
    setTimeout(function() {
      $("#mouse-message-header, #mouse-message").html("");
    }, 350);
  }
};

$(document).ready(function() {
  initLevel(levels[currLevel], true);
  $(window).resize(function() {
    updateSizes();
  });
});

$(document).on("mousemove", function(e) {
  mx = e.pageX;
  my = e.pageY;
  $("#mouse-message-outer").css({left: mx, top: my});
});
