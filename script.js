var mx = 0; // mouse x
var my = 0; // mouse y
var wh = window.innerHeight;
var ww = window.innerWidth;
var mouseMessageFadeTimeout, mouseMessageStartTimeout, timerInterval, introCirclesInterval, scoreHideTimeout;
var levelStarted = false;
var currLevel = 0;
var timeLeft = 0;
var drawX = 0;
var drawY = 0;
var timeLeft = 1;
var timeAllowed = 1;
var movingTiles = [];
var score = -250;
var bonuses = [];
var perfectRound = true;
var consoleBonus = false;
var errorBool = false;
console.log("Why are you looking at the backend of the game? If you want, set consoleBonus to true for some free points.");

function mobileCheck() {
 if (navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)) {
    return true;
  } else {
    return false;
  }
}

var errorMessage = function(msg, desc) {
  errorBool = true;
  $("#message-outer").removeClass("hidden");
  $(".intro-title").html("<span class='pretty pretty-title hidden'>"+msg+"</span>");
  $(".intro-subtitle").html(desc);
};

var undoErrorMessage = function() {
  errorBool = false;
  $("#message-outer").addClass("hidden");
  $(".intro-title").addClass("hidden");
  $(".intro-subtitle").addClass("hidden");
};

//intro animation
var introAnimation = function() {
  $(".intro-title > span").removeClass("hidden");
  setTimeout(function() {
    $(".intro-subtitle").removeClass("hidden");
  }, 1000);
  if(errorBool === false) {
    setTimeout(function() {
      $("#intro-info").removeClass("hidden");
    }, 1500);
    setTimeout(function() {
      $("#intro-button").removeClass("hidden");
    }, 2000);
  }
};

var introCirclesInit = function() {
  for(i = 0; i < 100; i++) {
    $("#circle-background").append("<div class='circle disabled delay"+Math.floor(Math.random()*4)+"' id='circle"+i+"' style='top: "+(Math.random()*99-5)+"%; left: "+(Math.random()*99-5)+"%'></div>");
  }
  introCirclesInterval = setInterval(function() {introCircles();}, 500);
};

var introCircles = function() {
  $(".circle").addClass("disabled");
  for(i = 0; i < 4; i++) {
    $("#circle"+Math.floor(Math.random()*100)).removeClass("disabled");
  }
};

//success messages
successHeaders = ["Good job.", "You did it!", "Great work!", "Excellent work.", "That was surprisingly quick.", "You're good at just going that way."];
successInfos = ["That wasn't supposed to be hard, though.", "That should have been easier, though.", "Like you'll do better next time.", "The next level is much harder.", "It just gets harder from here.", "Even though that was meant to be easy.", "Your parents would be proud of you.", "It really took that long to win, though?"];

//failure messages
failureHeaders = ["Whoops", "Nope", "Really?", "Come on", "Wow", "Seriously?", "That's not the way", "Nah"];
failureInfos = ["Looks like you didn't just go that way.", "Honestly, you just had to go that way.", "You should have gone that way.", "Why didn't you just go that way?", "All you had to do was go that way.", "All you had to do was go that way.", "Did you really not go that way?", "You need to go that way next time."];

//shows the level. development only
var hidePath = true;

//chooses most recent level. for testing new levels.
var chooseMostRecentLevel = false;

//t = time
var levels = [
  [['t', 15], ['s', 10, 45, 10], ['r', 80, 10], ['e', 10]],
  [['t', 15], ['s', 10, 80, 10], ['u', 50, 10], ['r', 50, 10], ['e', 10]],
  [['t', 15], ['s', 40, 80, 10], ['u', 40, 10], ['r', 15, 10], ['d', 30, 10], ['e', 10]],
  [['t', 15], ['s', 20, 80, 10], ['r', 40, 10], ['u', 20, 10], ['r', 20, 10], ['u', 20, 10], ['e', 10]],
  [['t', 20], ['s', 10, 10, 10], ['r', 40, 10], ['d', 50, 10], ['l', 20, 10], ['u', 30, 10], ['l', 50, 10], ['e', 10]],
  [['t', 30], ['s', 50, 30, 10], ['u', 30, 10], ['r', 40, 10], ['d', 70, 10], ['l', 60, 10], ['u', 20, 10], ['l', 30, 10], ['u', 40, 10], ['e', 10]],
  [['t', 15], ['s', 80, 45, 10], ['l', 80, 10], ['e', 10], ['m', 30, 20, 30, 60, 1000, 10]],
  [['t', 15], ['s', 10, 10, 10], ['r', 60, 10], ['d', 60, 10], ['e', 10], ['m', 40, 0, 90, 50, 1000, 10]],
  [['t', 25], ['s', 10, 80, 10], ['u', 70, 10], ['r', 30, 10], ['d', 10, 10], ['r', 30, 10], ['e', 10], ['m', 10, 70, 10, 0, 4000, 10], ['m', 40, 20, 0, 20, 4000, 10]],
  [['t', 25], ['s', 0, 10, 10], ['r', 30, 10], ['d', 10, 10], ['r', 10, 10], ['u', 20, 10], ['r', 20, 10], ['d', 10, 10], ['r', 10, 10], ['u', 20, 10], ['r', 20, 10], ['e', 10], ['m', 10, 10, 100, 10, 2000, 10]]
  // [['t', 30], ['m', 80, 90, 70, 70, 500, 10], ['s', 10, 10, 10], ['r', 80, 10], ['d', 50, 10], ['l', 40, 10], ['u', 20, 10], ['l', 30, 10], ['d', 20, 10], ['l', 20, 10], ['e', 10]],
  // [['t', 30], ['s', 80, 10, 10], ['l', 50, 10], ['d', 30, 10], ['r', 40, 10], ['d', 30, 10], ['l', 60, 10], ['u', 30, 10], ['e', 10]],
];

var updateSizes = function() {
  wh = window.innerHeight;
  ww = window.innerWidth;
  if(wh > ww) {
    $("#game-outer, #hover-lose").addClass("vertical");
  } else {
    $("#game-outer, #hover-lose").removeClass("vertical");
  }
};

var updateTimer = function() {
  timeLeft--;
  $("#timer-inner").css("width", timeLeft/timeAllowed*100 + "%");
  setTimeout(function() {$("#timer").html(timeLeft);}, 500);
  if(timeLeft <= 10) {
    $("#everything-outer").addClass("flash");
    setTimeout(function() {$("#everything-outer").removeClass("flash");}, 100);
  }
  if(timeLeft <= 0) {
    instructions(failureHeaders[Math.floor(Math.random()*failureHeaders.length)], failureInfos[Math.floor(Math.random()*failureInfos.length)], true);
    initLevel(levels[currLevel]);
  }
};

var addBonus = function(points, desc) {
  if(bonuses.length < 5) {
    bonuses.push([points, desc]);
    $("#score-outer").append("<p class='pretty pretty-invert hidden delay"+bonuses.length+"'><strong>+"+points+"</strong> "+desc+"</p>");
  }
};

var resetBonuses = function() {
  bonuses = [];
  $("#score-outer > *:not(#score)").remove();
};

var MovingTile = function(num, x1, y1, x2, y2, time, width) {
  this.num = num;
  this.coords = [[x1, y1], [x2, y2]];
  this.time = time;
  this.width = 10 || width;
  this.state = true;
  this.init = function() {
    $("#game-outer").append("<div class='game-elem moving-tile disabled' id='mt"+this.num+"' style='left: "+this.coords[0][0]+"%; top: "+this.coords[0][1]+"%; height: "+this.width+"%; width: "+this.width+"%'></div>");
    var that = this;
    this.toggleState();
    this.interval = setInterval(function() {
      that.toggleState();
    }, time);
  };
  this.toggleState = function() {
    var coordState = 0;
    if(this.state) {
      this.state = false;
      coordState = 1;
    } else {
      this.state = true;
    }
    $("#mt"+this.num).animate({
                              left: this.coords[coordState][0]+"%",
                              top: this.coords[coordState][1]+"%"}, time);
  };
  this.destroy = function() {
    $("#mt"+this.num).remove();
    clearInterval(this.interval);
  };
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
    case 'm': //moving tile
      movingTiles.push(new MovingTile(movingTiles.length, a[1], a[2], a[3], a[4], a[5], a[6]));
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
    score += 250;
    for(i = 0; i < bonuses.length; i++) {
      score += bonuses[i][0];
    }
    $("#score").html("score <strong>"+score+"</strong>");
    clearTimeout(scoreHideTimeout);
    setTimeout(function() {
      $("#score-outer > *").removeClass("hidden");
      clearTimeout(scoreHideTimeout);
      scoreHideTimeout = setTimeout(function() {
        $("#score-outer > *:not(#score)").addClass("hidden");
        setTimeout(function() {
          resetBonuses();
        }, 1000);
      }, 5000);
    }, 250);
    for(i = 0; i < movingTiles.length; i++) {
      movingTiles[i].destroy();
    }
    movingTiles = [];
    $(".game-elem").remove();
    for(i = 0; i < level.length; i++) {
      createElem(level[i]);
    }
    for(i = 0; i < movingTiles.length; i++) {
      movingTiles[i].init();
    }
    if(hidePath) {
      $(".game-elem").addClass("hidden");
    }
  }
  $(".game-elem").addClass("hide-pointers");
  $(".game-elem").focus();
  $(".moving-tile").addClass("disabled");
  $(".start").mouseenter(function() {
    instructions("", "", false);
    if(levelStarted === false) {
      startLevel();
    }
  });
};

var generatePityBonus = function() {
  var pityDescs = ["freebie", "free points", "just because", "since you look good today", "to make you feel good", "so you feel proud", "meh", "here you go", "sure", "why not?", "quick, take this", "hot potato with points"];
  addBonus(Math.ceil(Math.random()*5), pityDescs[Math.floor(Math.random()*pityDescs.length)]);
};

var startLevel = function() {
  $(".start").addClass("disabled");
  $(".moving-tile").removeClass('disabled');
  $(".game-elem").removeClass("hide-pointers");
  levelStarted = true;
  $("#timer").removeClass("hidden");
  $("#score-outer > *").addClass("hidden");
  $("#timer").html(timeAllowed);
  $("#timer-inner").css("width", "100%");
  timerInterval = setInterval(function() {
    updateTimer();
  }, 1000);
  $("#hover-lose, .moving-tile").mouseenter(function() { //lose
    //quick problem: if the user doesn't move the mouse they don't lose
    if(levelStarted) {
      perfectRound = false;
      instructions(failureHeaders[Math.floor(Math.random()*failureHeaders.length)], failureInfos[Math.floor(Math.random()*failureInfos.length)], true);
      initLevel(levels[currLevel]);
    }
  });
  $(".end").mouseenter(function() {
    if(levelStarted) {

      //bonuses
      if(consoleBonus) {
        addBonus(25, "console bonus");
      }
      addBonus(timeLeft, "extra time");
      addBonus(currLevel + 1, "level difficulty");
      if(perfectRound) {
        addBonus(75, "perfect round");
      }
      if(timeAllowed - timeLeft <= 5) {
        addBonus(50, "under 5s");
      }
      if(timeAllowed - timeLeft > 5 && timeAllowed - timeLeft <= 10) {
        addBonus(25, "under 10s");
      }
      if(timeAllowed - timeLeft > 10 && timeAllowed - timeLeft <= 15) {
        addBonus(10, "under 15s");
      }
      perfectRound = true;
      if(Math.random() < 0.005) {
        addBonus(20000, "ridiculous luck, GG");
      }
      if(Math.random() < 0.025) {
        addBonus(2000, "crazy luck");
      }
      if(Math.random() < 0.1) {
        addBonus(100, "luck");
      }
      if(Math.random() < 0.1) {
        addBonus(0, "bad luck");
      }
      // for(i = 0; i < 4; i++) {
      //   generatePityBonus();
      // }


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

var startGame = function() {
  if(chooseMostRecentLevel) {
    currLevel = levels.length - 1;
  }
  initLevel(levels[currLevel], true);
  $(".start").addClass("disabled");
  clearTimeout(introCirclesInterval);
  $("#intro-outer").fadeOut(500, function() {$("#intro-outer").remove();});
  setTimeout(function() {
    $(".start").removeClass("disabled");
  }, 1000);
};

$(document).ready(function() {
  if(mobileCheck()) {
    errorMessage("This game doesn't work on mobile.", "Just go that way uses CSS3 cursors which, obviously, aren't available on touchscreens.");
  }
  introAnimation();
  introCirclesInit();
  updateSizes();
  $(window).resize(function() {
    updateSizes();
  });
});

$(document).on("mousemove", function(e) {
  mx = e.pageX;
  my = e.pageY;
  $("#mouse-message-outer").css({left: mx, top: my});
});
