var mx = 0; // mouse x
var my = 0; // mouse y
var wh = window.innerHeight;
var ww = window.innerWidth;
var mouseMessageFadeTimeout, mouseMessageStartTimeout, timerInterval;
var levelStarted = false;
var currLevel = 0;
var timeLeft = 0;
var drawX = 0;
var drawY = 0;
var timeLeft = 1;
var timeAllowed = 1;

//shows the level. development only
var hidePath = true;

//success messages
successHeaders = ["That was dank.", "You did it!", "Great work!", "Excellent work.", "That was surprisingly quick.", "You're good at just going that way."];
successInfos = ["Great work back there!", "That was some top-notch work.", "I doubt you'll do better next time.", "Can you really beat that?", "It just gets harder from here.", "I doubt you can do better than that though.", "Your parents would be proud of you."];

//failure messages
failureHeaders = ["Yikes!", "Whoops", "Nope", "Really?", "Come on", "Wow", "It was that way!", "That was it?", "Ugh..."];
failureInfos = ["Looks like you didn't just go that way.", "Honestly, you just had to go that way.", "You should have gone that way, seriously.", "Why didn't you just go that way?", "All you had to do was go that way.", "If you had just gone that way, maybe things would have turned out better.", "How could someone not just go that way?", "Was it that hard to just go that way?"];

//t = time
var levels = [
  [['t', 30], ['s', 50, 30, 10], ['u', 30, 10], ['r', 40, 10], ['d', 70, 10], ['l', 60, 10], ['u', 20, 10], ['l', 30, 10], ['u', 40, 10], ['e', 10]],
  [['t', 30], ['s', 10, 10, 10], ['r', 80, 10], ['d', 50, 10], ['l', 40, 10], ['u', 20, 10], ['l', 30, 10], ['d', 20, 10], ['l', 20, 10], ['e', 10]],
  [['t', 30], ['s', 80, 10, 10], ['l', 50, 10], ['d', 30, 10], ['r', 40, 10], ['d', 30, 10], ['l', 60, 10], ['u', 30, 10], ['e', 10]],
];

var updateSizes = function() {
  wh = window.innerHeight;
  ww = window.innerWidth;
};

var updateTimer = function() {
  timeLeft--;
  $("#timer-inner").css("width", timeLeft/timeAllowed*100 + "%");
  setTimeout(function() {$("#timer").html(timeLeft);}, 500);
  if(timeLeft <= 0) {
    instructions(failureHeaders[Math.floor(Math.random()*failureHeaders.length)], failureInfos[Math.floor(Math.random()*failureInfos.length)], true);
    initLevel(levels[currLevel]);
  }
};

var gameElemClasses = {l: "left", r: "right", u: "up", d: "down", s: "start", e: "end"};

//a should be ['l/r/u/p', dist, width] in % or ['t', time] or ['s', x, y, width] or ['e', width]
var createElem = function(a) {
  switch(a[0]) {
    case 't': //timer
      timeAllowed = a[1];
      timeLeft = timeAllowed;
      break;
    case 's': //start
      $("#game-outer").append("<div class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+a[1]+"%; top: "+a[2]+"%; height: "+a[3]+"%; width: "+a[3]+"%'></div>");
      drawX = a[1];
      drawY = a[2];
      break;
    case 'r': //right
      $("#game-outer").append("<div class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[2]+"%; width: "+a[1]+"%'></div>");
      drawX += a[1];
      break;
    case 'd': //down
      $("#game-outer").append("<div class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[1]+"%; width: "+a[2]+"%'></div>");
      drawY += a[1];
      break;
    case 'l': //left
      drawX -= (a[1] - a[2]);
      $("#game-outer").append("<div class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[2]+"%; width: "+a[1]+"%'></div>");
      break;
    case 'u': //up
      drawY -= (a[1] - a[2]);
      $("#game-outer").append("<div class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[1]+"%; width: "+a[2]+"%'></div>");
      break;
    case 'e': //end
      $("#game-outer").append("<div class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[1]+"%; width: "+a[1]+"%'></div>");
      break;
    default: //old system
      $("#game-outer").append("<div class='game-elem "+gameElemClasses[a[0]]+"' style='top: "+a[2]+"%; left: "+a[1]+"%; height: "+a[4]+"%; width: "+a[3]+"%'></div>");
      break;
  }
};

var initLevel = function(level, wonParam) {
  var won = wonParam || 0;
  clearTimeout(timerInterval);
  timeLeft = timeAllowed;
  $("#timer-inner").css("width", "0%");
  $("#timer").addClass("hidden");
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
  $(".game-elem").focus();
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
  $("#timer").removeClass("hidden");
  $("#timer").html(timeAllowed);
  $("#timer-inner").css("width", "100%");
  timerInterval = setInterval(function() {
    updateTimer();
  }, 1000);
  $("#hover-lose").mouseenter(function() { //lose
    if(levelStarted) {
      instructions(failureHeaders[Math.floor(Math.random()*failureHeaders.length)], failureInfos[Math.floor(Math.random()*failureInfos.length)], true);
      initLevel(levels[currLevel]);
    }
  });
  $(".end").mouseenter(function() {
    if(levelStarted) {
      instructions(successHeaders[Math.floor(Math.random()*successHeaders.length)], successInfos[Math.floor(Math.random()*successInfos.length)], true);
      currLevel += 1;
      initLevel(levels[currLevel], true);
    }
  });
};

var instructions = function(header, info, visibility) {
  if(visibility) {
    $("#mouse-message-outer, #mouse-message-outer > .pretty").removeClass("hidden");
    $("#mouse-message-header").html(header);
    $("#mouse-message").html(info);
    clearTimeout(mouseMessageStartTimeout);
    clearTimeout(mouseMessageFadeTimeout);
    mouseMessageFadeTimeout = setTimeout(function() {
      instructions("", "", false);
    }, 5000);
  } else {
    $("#mouse-message-outer, #mouse-message-outer > .pretty").addClass("hidden");
    clearTimeout(mouseMessageStartTimeout);
    clearTimeout(mouseMessageFadeTimeout);
    mouseMessageStartTimeout = setTimeout(function() {
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
