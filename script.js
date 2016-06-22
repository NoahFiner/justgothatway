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
var gameActive = false;
var totalDeaths = 0;
var bonusCount = 0;
var origTime, endTime;
var gm = "classic"; //classic or random
var livesLeft = 3;

function mobileCheck() {
 if (navigator.userAgent.match(/Android/i) ||
     navigator.userAgent.match(/webOS/i) ||
     navigator.userAgent.match(/iPhone/i) ||
     navigator.userAgent.match(/iPad/i) ||
     navigator.userAgent.match(/iPod/i) ||
     navigator.userAgent.match(/BlackBerry/i) ||
     navigator.userAgent.match(/Windows Phone/i)) {
    return true;
  } else {
    return false;
  }
}

var finish = function(lossParam) {
  var loss = lossParam || 0;
  instructions("", "", false);
  if(loss) {
    $("#win-title").html("You lost...");
  } else {
    $("#win-title").html("You won!");
  }
  $("#final-score").html("Final score: <strong>"+score+"</strong>");
  $("#end-outer").removeClass("hidden");
  $("#win-title > span").removeClass("hidden");
  for(i = 0; i < 25; i++) {
    $("#fireworks-background").append("<div class='firework inactive' style='left: "+(Math.random()*75 + 12.5)+"%; top: "+(Math.random()*75 + 10)+"%; transform: rotate("+(Math.random()*720-360)+"deg);'></div>");
  }
  setTimeout(function() {
    $(".intro-title, .intro-subtitle").removeClass("hidden");
    $(".firework").removeClass("inactive");
  }, 500);
  setTimeout(function() {
    $(".firework").fadeOut(500, function() {$(this).remove();});
    $("#menu-button").removeClass("hidden");
    $("#deaths").html("<strong>"+totalDeaths+"</strong> deaths");
    $("#levels").html("<strong>"+currLevel+"</strong> levels");
    $("#bonuses").html("<strong>"+bonusCount+"</strong> bonuses");
    var time = new Date();
    $("#seconds").html("<strong>"+Math.round((time.getTime()-origTime)/1000)+"</strong> seconds");
    $("#stats > li, #stats").removeClass("hidden");
  }, 3500);
  clearTimeout(timerInterval);
};

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
  $("#intro-outer").removeClass("hidden");
  $("#menu-button, #end-outer, #final-score").addClass("hidden");
  currLevel = 0;
  totalDeaths = 0;
  bonusCount = 0;
  livesLeft = 3;
  score = -250;
  $(".intro-title:not(#win-title) > span").removeClass("hidden");
  setTimeout(function() {
    $(".intro-subtitle").removeClass("hidden");
  }, 1000);
  if(errorBool === false) {
    setTimeout(function() {
      $("#intro-info, #gamemode-info").removeClass("hidden");
    }, 1500);
    setTimeout(function() {
      $("#intro-button, #gamemode-button").removeClass("hidden");
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
  [['t', 25], ['s', 0, 10, 10], ['r', 30, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['r', 15, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['r', 20, 10], ['e', 10], ['m', 10, 10, 100, 10, 2000, 10]],
  [['t', 30], ['s', 0, 45, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['u', 25, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['u', 25, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['u', 25, 10], ['e', 10], ['m', 10, 45, 90, 45, 2500, 10], ['m', 90, 60, 10, 60, 3000, 10]],
  [['t', 25], ['s', 10, 45, 10], ['l', 20, 10], ['d', 20, 10], ['r', 70, 10], ['u', 20, 10], ['r', 12, 10], ['d', 10, 10], ['e', 10], ['m', 30, 50, 30, 90, 2000, 10], ['m', 40, 50, 40, 90, 3000, 10], ['m', 50, 50, 50, 90, 2500, 10]],
  [['t', 30], ['s', 10, 40, 10], ['d', 10, 10], ['r', 50, 10], ['d', 15, 10], ['l', 50, 10], ['d', 15, 10], ['r', 65, 10], ['u', 60, 10], ['e', 10], ['m', 0, 50, 90, 50, 2000, 10], ['m', 0, 65, 90, 65, 2500, 10], ['m', 0, 80, 90, 80, 2750]],
  [['t', 30], ['s', 0, 0, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['m', 5, 5, 75, 75, 3000, 10], ['e', 10]],
  [['t', 15], ['s', 10, 10, 10], ['d', 50, 10], ['r', 10, 10], ['d', 20, 10], ['e', 10], ['m', 10, 20, 10, 90, 2000, 10], ['m', 0, 60, 60, 60, 2250, 10]],
  [['t', 15], ['s', 90, 80, 10], ['l', 80, 10], ['u', 30, 10], ['r', 60, 10], ['e', 10], ['m', 90, 90, 20, 40, 2000, 10], ['m', 90, 40, 20, 90, 2000, 10]],
  [['t', 40], ['s', 10, 10, 10], ['d', 80, 10], ['r', 20, 10], ['u', 90, 10], ['r', 20, 10], ['d', 80, 10], ['r', 20, 10], ['u', 90, 10], ['r', 20, 10], ['d', 80, 10], ['e', 10], ['m', 10, 30, 90, 70, 3000, 10], ['m', 90, 30, 10, 70, 3000, 10], ['m', 90, 45, 10, 45, 1376, 10]],
  [['t', 15], ['s', 0, 45, 10], ['r', 90, 10], ['e', 10], ['m', 10, 60, 30, 30, 2000, 10], ['m', 50, 60, 30, 30, 4000, 10], ['m', 50, 60, 70, 30, 4000, 10], ['m', 90, 60, 70, 30, 4000, 10]],
  [['t', 5], ['s', 10, 45, 10], ['r', 80, 10], ['e', 10], ['m', 30, 30, 30, 60, 500, 10], ['m', 60, 60, 60, 30, 400, 10]],
  [['t', 15], ['s', 45, 0, 10], ['d', 90, 10], ['e', 10], ['m', 70, 0, 30, 40, 2000, 10], ['m', 70, 20, 30, 60, 1750, 10], ['m', 70, 40, 30, 80, 1500, 10]],
  [['t', 15], ['s', 10, 10, 10], ['d', 80, 10], ['r', 15, 10], ['u', 80, 10], ['r', 15, 10], ['d', 50, 10], ['r', 20, 10], ['u', 30, 10], ['e', 10]],
  [['t', 20], ['s', 0, 45, 10], ['r', 20, 10], ['d', 10, 10], ['r', 60, 10], ['d', 10, 10], ['r', 20, 10], ['e', 10], ['m', 0, 55, 60, 55, 4000, 10], ['m', 30, 55, 90, 55, 4000, 10]],
  [['t', 15], ['s', 10, 90, 10], ['u', 40, 10], ['r', 20, 10], ['u', 50, 10], ['r', 32, 10], ['d', 40, 10], ['l', 27, 10], ['d', 20, 10], ['r', 40, 10], ['e', 10], ['m', 10, 60, 80, 60, 2000, 10]],
  [['t', 20], ['s', 0, 0, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['e', 10], ['m', 0, 30, 30, 0, 2500, 10], ['m', 0, 50, 50, 0, 4000, 10], ['m', 0, 70, 70, 0, 2000, 10], ['m', 0, 90, 90, 0, 3000, 10]],
  [['t', 22], ['s', 0, 0, 10], ['r', 90, 10], ['d', 90, 10], ['e', 10], ['m', 20, 0, 100, 80, 2250, 10], ['m', 50, 0, 100, 50, 4000, 10], ['m', 70, 0, 100, 30, 2000, 10], ['m', 90, 0, 100, 10, 3000, 10]],
  [['t', 12], ['s', 45, 45, 10], ['u', 30, 10], ['l', 30, 10], ['d', 60, 10], ['r', 60, 10], ['u', 60, 10], ['r', 20, 10], ['e', 10]],
  [['t', 30], ['s', 45, 0, 10], ['r', 10, 10], ['d', 15, 10], ['l', 30, 10], ['d', 15, 10], ['r', 20, 10], ['d', 15, 10], ['l', 30, 10], ['d', 15, 10], ['r', 20, 10], ['d', 15, 10], ['l', 35, 10], ['d', 12, 10], ['l', 40, 10], ['e', 10], ['m', 45, 10, 45, 50, 5000, 10], ['m', 45, 30, 45, 70, 5000, 10], ['m', 45, 50, 45, 90, 5000, 10], ['m', 45, 50, 45, 90, 5000, 10], ['m', 45, 70, 45, 110, 5000, 10], ['m', 45, 90, 45, 130, 5000, 10]],
  [['t', 30], ['s', 60, 0, 10], ['d', 90, 10], ['l', 25, 10], ['u', 70, 10], ['e', 10], ['m', 20, 20, 80, 20, 3000, 10], ['m', 20, 30, 80, 30, 2750, 10], ['m', 20, 40, 80, 40, 2500, 10], ['m', 20, 50, 80, 50, 2250, 10], ['m', 20, 60, 80, 60, 2000, 10], ['m', 20, 70, 80, 70, 1750, 10]],
  [['t', 25], ['s', 0, 10, 10], ['r', 30, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['r', 15, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['r', 20, 10], ['e', 10], ['m', 10, 10, 100, 10, 2000, 10], ['m', 10, 20, 100, 20, 3333, 10]],
  [['t', 5], ['s', 0, 45, 10], ['r', 50, 10], ['d', 10, 10], ['r', 10, 10], ['e', 10], ['m', 20, 30, 20, 70, 750, 10], ['m', 30, 30, 30, 70, 666, 10]]
];

var overlap = function(elem1, elem2) {
  p1 = elem1[0].getBoundingClientRect();
  p2 = elem2[0].getBoundingClientRect();
  return !(p1.right < p2.left ||
           p1.left > p2.right ||
           p1.bottom < p2.top ||
           p1.top > p2.bottom);
};

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
    if(gm === "classic") {
      initLevel(levels[currLevel]);
    } else if(gm === "endless") {
      initLevel([]);
    }
  }
};

var addBonus = function(points, desc) {
  if(bonuses.length < 5) {
    bonusCount++;
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
    $("#game-outer").append("<div id='mt"+this.num+"' class='game-elem moving-tile disabled' id='mt"+this.num+"' style='left: "+this.coords[0][0]+"%; top: "+this.coords[0][1]+"%; height: "+this.width+"%; width: "+this.width+"%'></div>");
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
var createElem = function(a, num) {
  switch(a[0]) {
    case 't': //timer
      timeAllowed = a[1];
      timeLeft = timeAllowed;
      break;
    case 's': //start
      $("#game-outer").append("<div id='game-elem"+num+"' class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+a[1]+"%; top: "+a[2]+"%; height: "+a[3]+"%; width: "+a[3]+"%'></div>");
      drawX = a[1];
      drawY = a[2];
      break;
    case 'r': //right
      $("#game-outer").append("<div id='game-elem"+num+"' class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[2]+"%; width: "+a[1]+"%'></div>");
      drawX += a[1];
      break;
    case 'd': //down
      $("#game-outer").append("<div id='game-elem"+num+"' class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[1]+"%; width: "+a[2]+"%'></div>");
      drawY += a[1];
      break;
    case 'l': //left
      drawX -= (a[1] - a[2]);
      $("#game-outer").append("<div id='game-elem"+num+"' class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[2]+"%; width: "+a[1]+"%'></div>");
      break;
    case 'u': //up
      drawY -= (a[1] - a[2]);
      $("#game-outer").append("<div id='game-elem"+num+"' class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[1]+"%; width: "+a[2]+"%'></div>");
      break;
    case 'e': //end
      $("#game-outer").append("<div id='game-elem"+num+"' class='game-elem "+gameElemClasses[a[0]]+"' style='left: "+drawX+"%; top: "+drawY+"%; height: "+a[1]+"%; width: "+a[1]+"%'></div>");
      break;
    case 'm': //moving tile
      movingTiles.push(new MovingTile(movingTiles.length, a[1], a[2], a[3], a[4], a[5], a[6]));
      break;
    default: //old system
      $("#game-outer").append("<div id='game-elem"+num+"' class='game-elem "+gameElemClasses[a[0]]+"' style='top: "+a[2]+"%; left: "+a[1]+"%; height: "+a[4]+"%; width: "+a[3]+"%'></div>");
      break;
  }
};

var undoElem = function(a, num) {
  var elem = $("#game-elem"+num);
  elem.remove();
  switch(a[0]) {
    case 'r': //right
      drawX -= a[1];
      break;
    case 'd': //down
      drawY -= a[1];
      break;
    case 'l': //left
      drawX += (a[1] - a[2]);
      break;
    case 'u': //up
      drawY += (a[1] - a[2]);
      break;
    }
};

var initLevel = function(level, wonParam) {
  //functions for randomized levels
  function genRandElem(wonParam) {
    var directs = ['u', 'd', 'l', 'r'];
    var addAmt = 0;
    var directChoice = directs[Math.floor(Math.random()*directs.length)];
    if(directChoice === 'u' || directChoice === 'l') {
      addAmt = 10;
    }
    return [directChoice, Math.floor(Math.random()*50+10+addAmt), 10];
  }

  function createRandElem() {
    var randElem = genRandElem();
    while(randElem[0] === rl[rl.length - 1][0] || // can't go back on itself
          (randElem[0] === 'u' && rl[rl.length - 1][0] === 'd') ||
          (randElem[0] === 'd' && rl[rl.length - 1][0] === 'u') ||
          (randElem[0] === 'l' && rl[rl.length - 1][0] === 'r') ||
          (randElem[0] === 'r' && rl[rl.length - 1][0] === 'l') ||
          (randElem[0] === 'd' && drawY + randElem[1] >= 90) || //can't go out of bounds
          (randElem[0] === 'u' && drawY - randElem[1] <= 0) ||
          (randElem[0] === 'r' && drawX + randElem[1] >= 90) ||
          (randElem[0] === 'l' && drawX - randElem[1] <= 0)) {
      randElem = genRandElem();
    }
    rl.push(randElem);
    createElem(rl[rl.length - 1], rl.length - 1);
  }

  function testIntersect(id) {
    var elem = $("#game-elem"+id);
    if(id >= 3) {
      for(i = 2; i < id - 1; i++) {
        if(overlap(elem, $("#game-elem"+i))) {
          return true;
        }
      }
    }
    return false;
  }

  var won = wonParam || 0;
  clearTimeout(timerInterval);
  clearTimeout(scoreHideTimeout);
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

    if(gm === "classic") {
      if(currLevel >= levels.length) {
        setTimeout(function() {finish();}, 2500);
      } else {
        for(i = 0; i < level.length; i++) {
          createElem(level[i], i);
        }
        for(i = 0; i < movingTiles.length; i++) {
          movingTiles[i].init();
        }
        if(hidePath) {
          $(".game-elem").addClass("hidden");
        }
      }
    } else if(gm === "endless") {
      var rl = [['t', Math.floor(Math.random()*5+25)], ['s', Math.floor(Math.random()*90), Math.floor(Math.random()*90), 10]];
      for(i = 0; i < rl.length; i++) {
        createElem(rl[i], i);
      }
      var intersectAttempts = 0;
      while(rl.length <= 8) {
        createRandElem();
        intersectAttempts = 0;
        while(testIntersect(rl.length - 1)) {
          intersectAttempts++;
          undoElem(rl[rl.length - 1], rl.length - 1);
          rl.pop();
          createRandElem();
          if(intersectAttempts >= 100) {
            for(i = 2; i < rl.length; i++) { //restart if the level is a doo doo
              undoElem(rl[rl.length - 1], rl.length - 1);
              rl.pop();
            }
          }
        }
      }
      rl.push(['e', 10]);
      createElem(rl[rl.length - 1], rl.length - 1);
      for(i = 0; i < movingTiles.length; i++) {
        movingTiles[i].init();
      }
      if(hidePath) {
        $(".game-elem").addClass("hidden");
      }
    }
  } else {
    if(gm === "endless") {
      livesLeft--;
      if(livesLeft <= 0) {
        finish(true); //rip in death
      }
    }
  }
  $(".game-elem").addClass("hide-pointers");
  $(".game-elem").focus();
  $(".moving-tile").addClass("disabled");
  $(".start").mouseenter(function() {
    instructions("", "", false);
    if(levelStarted === false && gameActive) {
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
  $(".game-elem:not(.end)").removeClass("hide-pointers");
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
      totalDeaths++;
      if(gm === "classic") {
        instructions(failureHeaders[Math.floor(Math.random()*failureHeaders.length)], failureInfos[Math.floor(Math.random()*failureInfos.length)], true);
      } else {
        instructions(failureHeaders[Math.floor(Math.random()*failureHeaders.length)], failureInfos[Math.floor(Math.random()*failureInfos.length)] + " You have "+(livesLeft-1)+" lives left.", true);
      }
      if(gm === "classic") {
        initLevel(levels[currLevel]);
      } else if(gm === "endless") {
        initLevel([]);
      }
    }
  });

  //in random levels, the end might cross over a path
  //so the end can only be activated once the user hovers over the second-to-last path
  var finalId = $(".end").attr("id");
  var secondFinalPath = $("#game-elem"+(finalId[9] - 2));
  secondFinalPath.mouseenter(function() {
    $(".end").removeClass("hide-pointers");
  });
  $(".end").mouseenter(function() {
    if(levelStarted && !($(".end").hasClass("hide-pointers"))) {
      resetBonuses();

      //bonuses
      addBonus(timeLeft, "extra time");
      addBonus(currLevel + 1, "level difficulty");
      if(perfectRound) {
        addBonus(25, "perfect round");
      }
      if(((currLevel + 1) % 10) === 0) {
        addBonus(50, "level "+(currLevel+1));
      }
      if(timeAllowed - timeLeft <= 5) {
        addBonus(25, "under 5s");
      }
      if(timeAllowed - timeLeft > 5 && timeAllowed - timeLeft <= 10) {
        addBonus(15, "under 10s");
      }
      if(timeAllowed - timeLeft > 10 && timeAllowed - timeLeft <= 15) {
        addBonus(5, "under 15s");
      }
      if(timeLeft <= 2) {
        addBonus(25, "barely made it");
      }
      perfectRound = true;
      // for(i = 0; i < 4; i++) {
      //   generatePityBonus();
      // }


      instructions(successHeaders[Math.floor(Math.random()*successHeaders.length)], successInfos[Math.floor(Math.random()*successInfos.length)], true);
      currLevel += 1;
      if(gm === "classic") {
        initLevel(levels[currLevel], true);
      } else if(gm === "endless") {
        initLevel([], true);
      }
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
  gameActive = true;
  var time = new Date();
  origTime = time.getTime();
  if(chooseMostRecentLevel) {
    currLevel = levels.length - 1;
  }
  initLevel(levels[currLevel], true);
  $(".start").addClass("disabled");
  clearTimeout(introCirclesInterval);
  $("#intro-outer").addClass("hidden");
  setTimeout(function() {
    $(".start").removeClass("disabled");
    $(".intro-title > span, .intro-subtitle, #intro-info, #gamemode-info #intro-button, #gamemode-button, #stats > li, #stats").addClass("hidden");
  }, 1000);
};

var gamemodes = [["classic", "Work through "+levels.length+" levels with infinite lives for the highest score and lowest time."], ["endless", "Play as many randomly generated levels as you can with three lives."]];
var toggleGamemode = function() {
  if(gm === "classic") {
    gm = "endless";
    $("#gamemode-info").html("<strong style='font-size: 30px'>"+gamemodes[1][0]+"</strong><br>"+gamemodes[1][1]);
  } else {
    gm = "classic";
    $("#gamemode-info").html("<strong style='font-size: 30px'>"+gamemodes[0][0]+"</strong><br>"+gamemodes[0][1]);
  }
};

$(document).ready(function() {
  $("#gamemode-info").html("<strong style='font-size: 35px'>"+gamemodes[0][0]+"</strong><br>"+gamemodes[0][1]);
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
