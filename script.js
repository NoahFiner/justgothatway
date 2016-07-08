var mx = 0; // mouse x
var my = 0; // mouse y
var wh = window.innerHeight;
var ww = window.innerWidth;
var mouseMessageFadeTimeout, mouseMessageStartTimeout, timerInterval, introCirclesInterval, scoreHideTimeout, fireworkTimeout, fireworkHideTimeout, bonusResetTimeout, hoverCheckInterval, textHideTimeout;
var levelStarted = false;
var currLevel = 0;
var timeLeft = 0;
var drawX = 0;
var drawY = 0;
var timeLeft = 1;
var timeAllowed = 1;
var movingTiles = [];
var texts = [];
var score = -250;
var bonuses = [];
var perfectRound = true;
var consoleBonus = false;
var errorBool = false;
var gameActive = false;
var totalDeaths = 0;
var bonusCount = 0;
var levelCount = 0;
var origTime, endTime;
var gm = "classic"; //classic or endless
var livesLeft = 3;
var optionsHidden = true;
var endlessHighscore = 0, classicHighscore = 0;
var startingLevel = 0;
var highestLevel = 0;
var lastEndCoords = [0, 0];
var difficulty = "normal";
var firstLevel = true;

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
  firstLevel = true;
  $("#score-outer > *").addClass("hidden");
  var lossType = lossParam || 0;
  instructions("", "", false);
  if(lossType === "endless") {
    $("#win-title").html("You lost...");
  } else if(lossType === "quit") {
    $("#win-title").html("You quit...");
  } else {
    $("#win-title").html("You won!");
  }
  if(gm === "classic") {
    if(currLevel > highestLevel) {
      highestLevel = currLevel;
      if(highestLevel === 50) {
        highestLevel = 49;
      }
      setCookie("highestLevel", highestLevel, 99999);
      $("input[name='starting-level']").attr("max", parseInt(highestLevel) + 1);
      if(highestLevel >= 4) {
        $("#endless").removeClass("disabled");
      }
    }
    if(score > parseInt(classicHighscore)) {
      classicHighscore = score;
      setCookie("classicHighscore", score, 99999);
    }
    $("#highscore").html("Highscore: <strong>"+classicHighscore+"</strong>");
  } else {
    if(score > parseInt(endlessHighscore)) {
      endlessHighscore = score;
      setCookie("endlessHighscore", score, 99999);
    }
    $("#highscore").html("Highscore: <strong>"+endlessHighscore+"</strong>");
  }

  $("#classic-highscore").html(classicHighscore);
  $("#endless-highscore").html(endlessHighscore);
  $("#final-score").html("Final score: <strong>"+score+"</strong>");
  $("#end-outer").removeClass("hidden");
  $("#win-title > span").removeClass("hidden");

  setTimeout(function() {
    $(".intro-title, .intro-subtitle, #highscore").removeClass("hidden");
    firework(50, 45, 25);
  }, 500);

  setTimeout(function() {
    $("#menu-button").removeClass("hidden");
    $("#deaths").html("<strong>"+totalDeaths+"</strong> deaths");
    $("#levels").html("<strong>"+levelCount+"</strong> levels");
    $("#bonuses").html("<strong>"+bonusCount+"</strong> bonuses");
    var time = new Date();
    $("#seconds").html("<strong>"+Math.round((time.getTime()-origTime)/1000)+"</strong> seconds");
    $("#stats > li, #stats").removeClass("hidden");
    $("#score-outer > *").addClass("hidden");
  }, 3500);
  clearInterval(timerInterval);
  clearInterval(hoverCheckInterval);
};

var firework = function(x, y, amt) {
  clearTimeout(fireworkTimeout);
  clearTimeout(fireworkHideTimeout);
  $("#fireworks-styling").html(".firework.inactive { left: "+x+"% !important; top: "+y+"% !important; opacity: 0 !important; transform: rotate(0deg) !important; }");
  for(i = 0; i < amt; i++) {
    $("#fireworks-background").append("<div class='firework inactive' style='left: "+(Math.random()*100 + x - 50)+"%; top: "+(Math.random()*100 + y - 50)+"%; transform: rotate("+(Math.random()*720-360)+"deg);'></div>");
  }
  fireworkTimeout = setTimeout(function() {$(".firework").removeClass("inactive");}, 50);
  fireworkHideTimeout = setTimeout(function() {
    $(".firework").fadeOut(500, function() {$(this).remove();});
  }, 3000);
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

//cookies yum
var setCookie = function(name, val, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = "" + name + "=" + val + "; " + expires;
};

var getCookie = function(name) {
  var findString = name + "=";
  var cookieArray = document.cookie.split(';');
  for(var i = 0; i < cookieArray.length; i++) {
    if(cookieArray[i].search(findString) != -1) {
      return (cookieArray[i].substr(findString.length,
                                  cookieArray[i].length - findString.length)
                                  .replace(/=/g, ""));
    }
  }
  return "";
};


//intro animation
var introAnimation = function() {
  $("#intro-outer").removeClass("hidden");
  $("#menu-button, #end-outer, #final-score, #highscore").addClass("hidden");
  currLevel = startingLevel; //probably 0
  totalDeaths = 0;
  bonusCount = 0;
  levelCount = 0;
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
successHeaders = ["Good job!", "You did it!", "Great work!", "Excellent work!", "That was quick.", "You're good at going that way.", "Oh look, you did it.", "That was impressive."];
successInfos = ["That wasn't supposed to be hard, though.", "You could have done that much faster, though.", "Like you'll do better next time.", "The next level is much harder.", "It just gets harder from here.", "That was supposed to be easy, though.", "Your parents would be proud of you.", "It really took that long to win, though?", "At least that will be easy to improve on.", "You still have a lot of room for improvement, though.", "Could you have done that any slower, though?"];

//failure messages
failureHeaders = ["Whoops", "Nope", "Really?", "Come on", "Wow", "Seriously?", "Nah"];
failureInfos = ["Looks like you didn't go that way.", "Honestly, you just had to go that way.", "You should have just gone that way.", "Why didn't you just go that way?", "All you had to do was go that way.", "You just had to go that way.", "Did you really not go that way?", "Even your grandparents could have just gone that way."];

//shows the level. development only
var hidePath = true;

//chooses most recent level. for testing new levels.
var chooseMostRecentLevel = false;

//t = time
var levels = [
  [['t', 15], ['s', 10, 45, 10], ['r', 80, 10], ['e', 10], ['i', 60, 30, "Move your mouse right."]],
  [['t', 15], ['s', 10, 80, 10], ['u', 50, 10], ['r', 50, 10], ['e', 10], ['i', 50, 70, "Move your mouse up."], ['i', 50, 30, "Now move right."]],
  [['t', 15], ['s', 40, 80, 10], ['u', 40, 10], ['r', 15, 10], ['d', 30, 10], ['e', 10], ['i', 10, 70, 'Go up.'], ['i', 40, 60, 'Now right.'], ['i', 70, 60, 'You can figure this one out yourself.']],
  [['t', 20], ['s', 10, 80, 10], ['r', 40, 10], ['u', 20, 10], ['r', 30, 10], ['u', 20, 10], ['l', 40, 10], ['e', 10], ['i', 10, 50, "Hey, you're pretty good at just going that way."], ['i', 0, 0, ""], ['i', 30, 30, "You're on your own now."], ['i', 0, 0, ""], ['i', 20, 50, "Oh yeah, also make sure you don't run out of time."]],
  [['t', 15], ['s', 10, 10, 10], ['r', 50, 10], ['d', 50, 10], ['l', 20, 10], ['u', 30, 10], ['l', 50, 10], ['e', 10]],
  [['t', 25], ['s', 50, 30, 10], ['u', 30, 10], ['r', 40, 10], ['d', 70, 10], ['l', 60, 10], ['u', 20, 10], ['l', 30, 10], ['u', 40, 10], ['e', 10], ['i', 0, 0, ""], ['i', 0, 0, ""], ['i', 0, 30, "By the way, if you get bored of the<br>classic gamemode, you can check<br>out endless in the main menu."], ['i', 0, 50, "Not like you will, though."]],
  [['t', 15], ['s', 80, 45, 10], ['l', 80, 10], ['e', 10], ['m', 30, 20, 30, 60, 1000, 10]],
  [['t', 15], ['s', 10, 10, 10], ['r', 60, 10], ['d', 60, 10], ['e', 10], ['m', 40, 0, 90, 50, 3000, 10]],
  [['t', 25], ['s', 10, 80, 10], ['u', 70, 10], ['r', 30, 10], ['d', 10, 10], ['r', 30, 10], ['e', 10], ['m', 10, 70, 10, 0, 4000, 10], ['m', 40, 20, 0, 20, 4000, 10]],
  [['t', 25], ['s', 0, 10, 10], ['r', 30, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['r', 15, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['r', 20, 10], ['e', 10], ['m', 10, 10, 100, 10, 2000, 10]],
  [['t', 30], ['s', 0, 45, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['u', 25, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['u', 25, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['u', 25, 10], ['e', 10], ['m', 10, 45, 90, 45, 2500, 10], ['m', 90, 60, 10, 60, 3000, 10]],
  [['t', 25], ['s', 10, 45, 10], ['l', 20, 10], ['d', 20, 10], ['r', 70, 10], ['u', 20, 10], ['r', 12, 10], ['d', 10, 10], ['e', 10], ['m', 30, 50, 30, 90, 4000, 10], ['m', 40, 50, 40, 90, 6000, 10], ['m', 50, 50, 50, 90, 5000, 10]],
  [['t', 30], ['s', 10, 40, 10], ['d', 10, 10], ['r', 50, 10], ['d', 15, 10], ['l', 50, 10], ['d', 15, 10], ['r', 65, 10], ['u', 60, 10], ['e', 10], ['m', 0, 50, 90, 50, 4000, 10], ['m', 0, 65, 90, 65, 5000, 10], ['m', 0, 80, 90, 80, 5500]],
  [['t', 30], ['s', 0, 0, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['r', 15, 10], ['d', 15, 10], ['e', 10], ['m', 5, 5, 75, 75, 3000, 10]],
  [['t', 15], ['s', 10, 10, 10], ['d', 50, 10], ['r', 10, 10], ['d', 20, 10], ['e', 10], ['m', 10, 20, 10, 90, 2000, 10], ['m', 0, 60, 60, 60, 2250, 10]],
  [['t', 15], ['s', 90, 80, 10], ['l', 80, 10], ['u', 30, 10], ['r', 60, 10], ['e', 10], ['m', 90, 90, 20, 40, 2000, 10], ['m', 90, 40, 20, 90, 2000, 10]],
  [['t', 40], ['s', 10, 10, 10], ['d', 80, 10], ['r', 20, 10], ['u', 90, 10], ['r', 20, 10], ['d', 80, 10], ['r', 20, 10], ['u', 90, 10], ['r', 20, 10], ['d', 80, 10], ['e', 10], ['m', 10, 30, 90, 70, 3000, 10], ['m', 90, 30, 10, 70, 3000, 10], ['m', 90, 45, 10, 45, 1376, 10]],
  [['t', 15], ['s', 0, 45, 10], ['r', 90, 10], ['e', 10], ['m', 10, 60, 30, 30, 2000, 10], ['m', 50, 60, 30, 30, 2000, 10], ['m', 50, 60, 70, 30, 2000, 10], ['m', 90, 60, 70, 30, 2000, 10]],
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
  [['t', 5], ['s', 0, 45, 10], ['r', 50, 10], ['d', 10, 10], ['r', 10, 10], ['e', 10], ['m', 20, 30, 20, 70, 750, 10], ['m', 30, 30, 30, 70, 666, 10]],
  [['t', 10], ['s', 45, 0, 10], ['d', 80, 10], ['r', 20, 10], ['e', 10], ['m', 30, 10, 70, 10, 3000, 10], ['m', 30, 20, 70, 20, 3000, 10], ['m', 30, 30, 70, 30, 3000, 10], ['m', 30, 40, 70, 40, 3000, 10], ['m', 30, 50, 70, 50, 1500, 10]],
  [['t', 30], ['s', 10, 30, 10], ['r', 70, 10], ['d', 12, 10], ['l', 80, 10], ['e', 10], ['m', 20, 30, 20, 42, 1500, 10], ['m', 30, 42, 30, 30, 1500, 10], ['m', 40, 30, 40, 42, 1500, 10], ['m', 50, 42, 50, 30, 1500, 10], ['m', 60, 30, 60, 42, 1500, 10]],
  [['t', 15], ['s', 0, 40, 10], ['r', 10, 10], ['d', 10, 10], ['r', 70, 10], ['e', 10], ['m', 0, 50, 100, 50, 1500]],
  [['t', 25], ['s', 0, 40, 10], ['r', 10, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['r', 12, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['r', 12, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['r', 12, 10], ['d', 10, 10], ['r', 12, 10], ['u', 20, 10], ['e', 10], ['m', 20, 40, 80, 50, 1500, 10]],
  [['t', 3], ['s', 0, 0, 10], ['r', 50, 10], ['d', 50, 10], ['e', 10]],
  [['t', 3], ['s', 0, 0, 10], ['d', 30, 10], ['r', 30, 10], ['d', 20, 10], ['e', 10]],
  [['t', 5], ['s', 0, 0, 10], ['d', 40, 10], ['r', 60, 10], ['d', 10, 10], ['e', 10], ['m', 40, 20, 40, 60, 2000, 10]],
  [['t', 1], ['s', 45, 0, 10], ['d', 50, 10], ['e', 10]],
  [['t', 1], ['s', 45, 0, 10], ['d', 50, 10], ['e', 10], ['m', 0, 30, 90, 30, 1000, 10]],
  [['t', 20], ['s', 0, 30, 10], ['r', 80, 10], ['d', 11, 10], ['l', 90, 10], ['d', 11, 10], ['e', 10], ['m', 10, 41, 20, 30, 1000, 10], ['m', 30, 41, 40, 30, 1000, 10], ['m', 50, 41, 60, 30, 1000, 10]],
  [['t', 10], ['s', 0, 35, 10], ['u', 10, 10], ['r', 90, 10], ['d', 20, 10], ['e', 10], ['m', 0, 0, 90, 90, 1000, 10], ['m', 40, 30, 40, 70, 2000, 10], ['m', 70, 30, 20, 90, 750]],
  [['t', 10], ['s', 45, 0, 10], ['d', 90, 10], ['l', 20, 10], ['e', 10], ['m', 0, 30, 90, 30, 730, 10], ['m', 20, 40, 90, 30, 580, 10], ['m', 0, 70, 90, 30, 809, 10], ['m', 0, 80, 90, 30, 1000, 10]],
  [['t', 20], ['s', 10, 0, 10], ['d', 10, 10], ['r', 70, 10], ['d', 70, 10], ['l', 80, 10], ['u', 65, 10], ['e', 10], ['m', 0, 10, 60, 10, 3000, 10], ['m', 80, 60, 80, 0, 3000, 10], ['m', 90, 80, 0, 80, 3000, 10]],
  [['t', 30], ['s', 0, 0, 10], ['r', 50, 10], ['d', 30, 10], ['l', 60, 10], ['d', 30, 10], ['r', 60, 10], ['e', 10], ['m', 30, -10, 30, 0, 1000, 10], ['m', 30, 10, 30, 20, 1000, 10], ['m', 30, 20, 30, 30, 1000, 10], ['m', 30, 40, 30, 50, 1000, 10], ['m', 30, 50, 30, 60, 1000, 10], ['m', 30, 70, 30, 80, 1000, 10], ['m', 30, 80, 30, 90, 1000, 10]],
  [['t', 20], ['s', 80, 0, 10], ['d', 80, 10], ['l', 50, 10], ['u', 75, 10], ['e', 10], ['m', 80, 40, 40, 50, 1000, 10], ['m', 80, 50, 40, 60, 1000, 10], ['m', 80, 60, 40, 70, 1000, 10]],
  [['t', 5], ['s', 45, 0, 10], ['d', 90, 10], ['r', 20, 10], ['e', 10], ['m', 35, 10, 55, 90, 1000, 10]],
  [['t', 30], ['s', 39, 0, 10], ['d', 90, 10], ['r', 12, 10], ['u', 90, 10], ['e', 10], ['m', 34, 10, 34, 70, 2000, 10], ['m', 45, 70, 45, 10, 2000, 10], ['m', 56, 10, 56, 70, 2000, 10]],
  [['t', 3], ['s', 0, 45, 10], ['r', 70, 10], ['d', 20, 10], ['e', 10], ['m', 0, 0, 90, 90, 500, 10], ['m', 30, 45, 60, 10, 657, 10], ['m', 70, 80, 20, 10, 800, 10]],
  [['t', 4], ['s', 0, 0, 10], ['r', 80, 10], ['d', 60, 10], ['l', 40, 10], ['e', 10], ['m', 90, 0, 50, 90, 1000, 10]],
  [['t', 50], ['s', 0, 45, 10], ['r', 50, 10], ['e', 10], ['m', 20, 10, 20, 60, 2000, 10], ['m', 20, 20, 20, 70, 2000, 10], ['m', 20, 30, 20, 80, 2000, 10], ['m', 30, 10, 30, 60, 2000, 10], ['m', 30, 20, 30, 70, 2000, 10], ['m', 30, 30, 30, 80, 2000, 10], ['m', 40, 10, 40, 60, 2000, 10], ['m', 40, 20, 40, 70, 2000, 10], ['m', 40, 30, 40, 80, 2000, 10], ['m', 50, 10, 50, 60, 2000, 10], ['m', 50, 20, 50, 70, 2000, 10], ['m', 50, 30, 50, 80, 2000, 10], ['m', 60, 10, 60, 60, 2000, 10], ['m', 60, 20, 60, 70, 2000, 10], ['m', 60, 30, 60, 80, 2000, 10], ['m', 60, 40, 60, 90, 2000, 10], ['m', 60, 0, 60, 50, 2000, 10], ['m', 70, 10, 70, 60, 2000, 10], ['m', 70, 20, 70, 70, 2000, 10], ['m', 70, 30, 70, 80, 2000, 10], ['m', 80, 20, 80, 70, 2000, 10]]
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

var Text = function(num, x1, y1, text) {
  this.num = num;
  this.coords = [x1, y1];
  this.text = text;
  this.shown = false;
  this.hide = function() {
    $("#t"+this.num).addClass("hidden");
  };
  this.init = function() {
    var that = this;
    $("#game-outer").append("<h1 id=t"+this.num+" class='pretty hidden text' style='left: "+this.coords[0]+"%; top: "+this.coords[1]+"%;'>"+this.text+"</h1>");
    $("#game-elem"+(this.num+2)).mouseenter(function() {
      if(levelStarted) {
        that.shown = true;
        $("#t"+that.num).removeClass("hidden");
      }
    });
    $("#game-elem"+(this.num+3)).mouseenter(function() {
      if(levelStarted && that.shown) {
        that.hide();
      }
    });
  };
  this.init();
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
    case 'i': //instructions
      texts.push(new Text(texts.length, a[1], a[2], a[3], a[4]));
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
  clearInterval(timerInterval);
  clearTimeout(scoreHideTimeout);
  clearInterval(hoverCheckInterval);
  timeLeft = timeAllowed;
  $("#timer-inner").css("width", "0%");
  $("#timer").addClass("hidden");
  $(".text").addClass("hidden");
  for(i = 0; i < texts.length; i++) {
    texts[i].shown = false;
  }
  $(".start").removeClass("disabled");
  if(currLevel != 50) {
    $("#quit-button").removeClass("hidden");
  }
  levelStarted = false;
  if(wonParam) {
    clearTimeout(fireworkTimeout);
    clearTimeout(fireworkHideTimeout);
    clearTimeout(scoreHideTimeout);
    if(currLevel > 0 && $(".end").length > 0 && !(firstLevel)) {
      var fireworkOffset = $(".end").offset();
      firework(fireworkOffset.left*100/window.innerWidth, fireworkOffset.top*100/window.innerHeight, 10);
    }
    firstLevel = false;
    score += 250;
    for(i = 0; i < bonuses.length; i++) {
      score += bonuses[i][0];
    }
    $("#score").html("score <strong>"+score+"</strong>");
    clearTimeout(bonusResetTimeout);
    setTimeout(function() {
      clearTimeout(bonusResetTimeout);
      clearTimeout(scoreHideTimeout);
      $("#score-outer > *").removeClass("hidden");
      clearTimeout(scoreHideTimeout);
      scoreHideTimeout = setTimeout(function() {
        $("#score-outer > *:not(#score)").addClass("hidden");
        clearTimeout(bonusResetTimeout);
        bonusResetTimeout = setTimeout(function() {
          resetBonuses();
        }, 1000);
      }, 5000);
    }, 250);
    for(i = 0; i < movingTiles.length; i++) {
      movingTiles[i].destroy();
    }
    $(".moving-tile").attr("id", "");
    $(".moving-tile").addClass("old");
    $(".old").addClass("hidden");
    setTimeout(function() {
      $(".old").remove();
    }, 250);
    movingTiles = [];
    $(".text").addClass("hidden");
    $(".text").addClass("old-text");
    clearTimeout(textHideTimeout);
    textHideTimeout = setTimeout(function() {
      $(".old-text").remove();
    }, 250);
    texts = [];
    $(".game-elem:not(.old-text):not(.old)").remove();

    if(gm === "classic") {
      clearTimeout(scoreHideTimeout);
      if(currLevel > highestLevel) {
        highestLevel = currLevel;
        if(highestLevel === 50) {
          highestLevel = 49;
        }
        setCookie("highestLevel", highestLevel, 99999);
        if(highestLevel >= 4) {
          $("#endless").removeClass("disabled");
        }
      }
      if(score > parseInt(classicHighscore)) {
        classicHighscore = score;
        setCookie("classicHighscore", score, 99999);
      }

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
      clearTimeout(scoreHideTimeout);
      if(score > parseInt(endlessHighscore)) {
        endlessHighscore = score;
        setCookie("endlessHighscore", score, 99999);
      }
      var amtOfLevels = Math.floor(-((Math.pow(10, 20/(currLevel+20))))+11) + 1;
      var baseTime, timeMultiplier;
      switch(difficulty) {
        case "normal":
          baseTime = Math.ceil(2*amtOfLevels);
          timeMultiplier = 8*(Math.pow(6*Math.E, (-0.1*(currLevel+5)))) + 1;
          break;
        case "hard":
          baseTime = Math.ceil(1.75*amtOfLevels);
          timeMultiplier = 4*(Math.pow(6*Math.E, (-0.1*(currLevel+5)))) + 1;
          break;
        case "ridiculous":
          baseTime = Math.ceil(1.5*amtOfLevels);
          timeMultiplier = 2*(Math.pow(6*Math.E, (-0.1*(currLevel+5)))) + 1;
          break;
        case "impossible":
          baseTime = Math.ceil(1.25*amtOfLevels);
          timeMultiplier = (Math.pow(6*Math.E, (-0.1*(currLevel+5)))) + 1;
          break;
      }
      // console.log("basetime: "+baseTime);
      // console.log("multiplier: "+timeMultiplier);
      var validStartCoords = [Math.floor(Math.random()*90), Math.floor(Math.random()*90)];
      while((validStartCoords[0] > lastEndCoords[0] - 10) &&
            (validStartCoords[0] < lastEndCoords[0] + 10) &&
            (validStartCoords[1] > lastEndCoords[1] - 10) &&
            (validStartCoords[1] < lastEndCoords[1] + 10)) {
        validStartCoords = [Math.floor(Math.random()*90), Math.floor(Math.random()*90)];
      }
      var rl = [['t', Math.ceil(baseTime*timeMultiplier)], ['s', validStartCoords[0], validStartCoords[1], 10]];
      for(i = 0; i < rl.length; i++) {
        createElem(rl[i], i);
      }
      var intersectAttempts = 0;
      while(rl.length <= amtOfLevels) {
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
      endOffset = $(".end").offset();
      lastEndCoords = [endOffset.left*100/window.innerWidth, endOffset.top*100/window.innerHeight];
      if(hidePath) {
        $(".game-elem").addClass("hidden");
      }
    }
  } else {
    if(gm === "endless") {
      livesLeft--;
      if(livesLeft <= 0) {
        finish(gm); //rip in death
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
  function lose() {
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
  }

  function hoveringMTs() {
    for(i = 0; i < movingTiles.length; i++) {
      var node = "#mt"+i;
      var p = $(node).offset();
      if (mx >= p.left && mx <= p.left + $(node).width() &&
          my >= p.top && my <= p.top + $(node).height()) {
        return true;
      }
    }
    return false;
  }

  clearTimeout(fireworkHideTimeout);
  $(".firework").fadeOut(500, function() {$(this).remove();});

  clearTimeout(textHideTimeout);
  $(".old-text").remove();
  $(".start").addClass("disabled");
  $("#quit-button").addClass("hidden");
  $(".moving-tile").removeClass('disabled');
  $(".game-elem:not(.end)").removeClass("hide-pointers");
  levelStarted = true;
  $("#timer").removeClass("hidden");
  $("#score-outer > *").addClass("hidden");
  $("#timer").html(timeAllowed);
  $("#timer-inner").css("width", "100%");
  hoverCheckInterval = setInterval(function() {
    if(hoveringMTs()) {
      lose();
    }
  }, 150);
  timerInterval = setInterval(function() {
    updateTimer();
  }, 1000);
  $("#hover-lose, .moving-tile").mouseenter(function() { //lose
    //quick problem: if the user doesn't move the mouse they don't lose
    lose();
  });

  //in random levels, the end might cross over a path
  //so the end can only be activated once the user hovers over the second-to-last path
  var finalId = $(".end").attr("id");
  var finalPath = $("#game-elem"+(finalId.substring(9) - 1));
  finalPath.mouseenter(function() {
    $(".end").removeClass("hide-pointers");
  });
  $(".end").mouseenter(function() {
    if(levelStarted && !($(".end").hasClass("hide-pointers"))) {
      levelCount++;
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
      if(gm === "endless" && difficulty != "normal") {
        switch(difficulty) {
          case "hard":
            addBonus(25, "difficulty bonus");
            break;
          case "ridiculous":
            addBonus(50, "difficulty bonus");
            break;
          case "impossible":
            addBonus(100, "difficulty bonus");
            break;
        }
      }
      if(timeAllowed - timeLeft <= 3) {
        addBonus(35, "under 3s");
      }
      if(timeAllowed - timeLeft > 3 && timeAllowed - timeLeft <= 5) {
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
  if(startingLevel >= 0 && startingLevel <= highestLevel && gm === "classic") {
    currLevel = startingLevel;
  } else {
    currLevel = 0;
  }
  if(chooseMostRecentLevel) {
    currLevel = levels.length - 1;
  }
  initLevel(levels[currLevel], true);
  resetBonuses();
  $(".start").addClass("disabled");
  $("#quit-button").removeClass("hidden");
  clearTimeout(introCirclesInterval);
  $("#intro-outer").addClass("hidden");
  setTimeout(function() {
    $(".start").removeClass("disabled");
    $(".intro-title > span, .intro-subtitle, #intro-button, #intro-info, #gamemode-info #intro-button, #gamemode-button, #stats > li, #stats").addClass("hidden");
  }, 1000);
};

var gamemodes = [["classic", "Work through "+levels.length+" levels with infinite lives for the highest score and lowest time."], ["endless", "Play as many randomly generated levels as you can with three lives."]];
var setGamemode = function(gamemode) {
  gm = gamemode;
  if(gm === "classic") {
    $("#starting-level").removeClass("hidden delay3");
    $("#difficulty").addClass("hidden delay3");
    $("#starting-level").addClass("delay3");
    $("#difficulty").removeClass("delay3");
    $("#intro-button").html("start<br><span class='start-sub'>"+gm+", level "+(startingLevel+1)+"</span>");
  } else {
    $("#starting-level").addClass("hidden");
    $("#difficulty").removeClass("hidden");
    $("#starting-level").removeClass("delay3");
    $("#difficulty").addClass("delay3");
    $("#intro-button").html("start<br><span class='start-sub'>"+gm+", "+difficulty+"</span>");
  }
};

var setOptionState = function(hidden) {
  optionsHidden = hidden;
  if(hidden) {
    $("#options-outer").addClass("hidden");
  } else {
    $("#options-outer").removeClass("hidden");
  }
};

$(document).ready(function() {
  $(document).keydown(function(e) { //pressing enter reloads the page for some reason
    if(e.keyCode === 13) { //enter
      e.preventDefault();
      if($("input[name='starting-level']").is(":focus") && !($("#options-outer").hasClass("hidden"))) {
        $("input[name='starting-level']").blur();
        setOptionState(true);
      }
    }
    if(e.keyCode === 27) { //esc
      if(!($("#options-outer").hasClass("hidden"))) {
        setOptionState(true);
      }
    }
  });

  if(getCookie("classicHighscore") === "") {
    setCookie("classicHighscore", "0", 99999);
  } else {
    classicHighscore = getCookie("classicHighscore");
  }

  if(getCookie("endlessHighscore") === "") {
    setCookie("endlessHighscore", "0", 99999);
  } else {
    endlessHighscore = getCookie("endlessHighscore");
  }

  if(getCookie("highestLevel") === "") {
    setCookie("highestLevel", "0", 99999);
  } else {
    highestLevel = getCookie("highestLevel");
  }
  if(highestLevel === 50) {
    highestLevel = 49;
  }
  $("input[name='starting-level']").attr("max", parseInt(highestLevel) + 1);

  $("#classic-highscore").html(classicHighscore);
  $("#endless-highscore").html(endlessHighscore);
  if(highestLevel >= 4) {
    $("#endless").removeClass("disabled");
  }

  $("#gamemode-info").html("<strong style='font-size: 35px'>"+gamemodes[0][0]+"</strong><br>"+gamemodes[0][1]);
  $(".gamemode-option").click(function() {
    $(".gamemode-option").removeClass("selected");
    $(this).addClass("selected");
    setGamemode($(this).attr("id"));
  });
  $("#options-outer").click(function(event) {
    if(!$(event.target).closest('#options').length &&
       !$(event.target).is('#options')) {
      setOptionState(true);
    }
  });
  $("input[name='starting-level']").change(function() {
    if(highestLevel === 50) {
      highestLevel = 49;
    }
    if(parseInt($(this).val()) >= 1 && parseInt($(this).val()) <= (highestLevel + 1)) {
      $(this).removeClass("invalid");
      startingLevel = parseInt($(this).val()) - 1;
      if(gm === "classic") {
        $("#intro-button").html("start<br><span class='start-sub'>classic, level "+(startingLevel+1)+"</span>");
      }
    } else {
      $(this).addClass("invalid");
      startingLevel = 0;
      if(gm === "classic") {
        $("#intro-button").html("start<br><span class='start-sub'>classic, level "+(startingLevel+1)+"</span>");
      }
    }
  });
  $("#difficulty-select").change(function() {
    difficulty = $("#difficulty-select option:selected").text();
    $("#intro-button").html("start<br><span class='start-sub'>"+gm+", "+difficulty+"</span>");
  });

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
  bounding = $("#mouse-message-outer")[0].getBoundingClientRect();
  if(my >= window.innerHeight - $("#mouse-message-outer").height() - 25) {
    my = window.innerHeight - $("#mouse-message-outer").height() - 25;
  }
  if(mx >= window.innerWidth - $("#mouse-message-outer").width() - 25) {
    mx = window.innerWidth - $("#mouse-message-outer").width() - 25;
  }
  $("#mouse-message-outer").css({left: mx, top: my});
});
