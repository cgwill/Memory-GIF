
// Variables
var listSizeGrid = document.getElementById("listSizeGrid");
var stepSize = 2;
var optionsGridSize = 100;
var game;
var players = [];
var urlArray = ["https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5dr76Z7jgENR79hQHHLM3fCFPQrg1C_1680x8400",
"https://images.pexels.com/photos/126407/pexels-photo-126407.jpeg?auto=compress&cs=tinysrgb&h=350",
"https://metrouk2.files.wordpress.com/2017/11/capture16.png?w=748&h=706&crop=1",
"http://r.ddmcdn.com/s_f/o_1/cx_0/cy_157/cw_1327/ch_1327/w_720/APL/uploads/2013/01/smart-cat-article.jpg"];
var pair_id_last_checked;
var card_id_last_checked;

// Create Dropdown Menu for Grid Size
var i;
for (i=0; i<(optionsGridSize * stepSize); i = i + stepSize) {
  var op = new Option();
  op.value = i;
  op.text = i;
  listSizeGrid.options.add(op);
}

// Start the Game
function startGame(){
  // Check if a Grid has been created
  createGrid();
  if(document.getElementById("playArea").children.length === 0){
    alert("please select grid size");
  }
  else{
    // Game can be created
    var i;
    var dd_players = document.getElementById("players");
    var amountPlayers = dd_players.options[dd_players.selectedIndex].value;
    game = new GameState(amountPlayers);
    for (i=0; i<amountPlayers; i++){
      players[i] = new Player(i);
    }
    //Display Game State in the Progress Window
    updateDisplayGameProgress();
    deleteScoreboard();
    initScoreboard();
  }
}

function createImages(i,url){
    var card_id = i;
    var pair_id = Math.floor(i * 0.5);
    var memory = new MemoryImage(card_id,pair_id,url[pair_id]);

    return memory;
  }

function deleteScoreboard(){
  $("#tbody_scoreboard").empty();
}

function initScoreboard(){

  var scoreboard = document.getElementById("tbody_scoreboard");
  for (var i = 0; i < game.amountPlayer; i++) {

    var row = document.createElement("tr");
    //var place = document.createElement("td");
    var player = document.createElement("td");
    var score = document.createElement("td");

    //place.innerHTML = i + 1;
    player.innerHTML = "Player " + String(players[i].id + 1);
    score.innerHTML = String(players[i].score);

    //row.appendChild(place);
    row.appendChild(player);
    row.appendChild(score);

    scoreboard.appendChild(row);

  }

}

// new Round
function showImage(e){
  // Wieviele Clicks hat der Spieler noch?
  var clicksLeft = players[game.activePlayer].getClicksLeft();
  // Damit Karte nicht doppelt gedrückt werden kann
  if (e.id != card_id_last_checked || (e.id == card_id_last_checked && clicksLeft == 2) ) {
    // Die Karte aufdecken
    e.style.backgroundImage = "url('" + memoryArray[e.id].url + "')";
    e.style.backgroundSize = "cover";
    // Noch beide Clicks übrig?
    if (clicksLeft == 2) {
      // Die last pair_id updaten
      pair_id_last_checked = memoryArray[e.id].pair_id;
      players[game.activePlayer].updateClicksLeft();
    }
    // Noch EINEN click übrig
    else {
      var lastimage = document.getElementById(card_id_last_checked);
      //Das richtige Pair gefunden
      if (pair_id_last_checked == memoryArray[e.id].pair_id && card_id_last_checked != e.id) {
        // Delay von 1 sekunde bevor die Karten verschwinden
        setTimeout(function(){
          e.style.visibility = "hidden";
          lastimage.style.visibility = "hidden";
        }, 1000);
        players[game.activePlayer].score++;
        //players[game.activePlayer].updateClicksLeft();
        players[game.activePlayer].setClicksLeft(2);
      }
      //NICHT das richtige Pair gefunden
      else {
        setTimeout(function(){
          e.style.backgroundImage = "none";
          lastimage.style.backgroundImage = "none";
        }, 1000);
        players[game.activePlayer].updateClicksLeft();
        game.nextPlayer();
      }
    }

    // Update die letzte gedrückte Karte
    card_id_last_checked = e.id;
    // Update the UI
    updateDisplayGameProgress();
    deleteScoreboard();
    initScoreboard();
  }
}

function updateDisplayGameProgress(){
  document.getElementById("activePlayer").innerHTML = game.activePlayer + 1;
  document.getElementById("currentRound").innerHTML = game.currentRound + 1;
  //updateScoreboard();
}

function searchForImages(startIndex){

  var searchType = "&searchType=image";
  var start = "&start=" + String(startIndex);
  var input = document.getElementById("searchterm").value;
  var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyCQcUbvvePw13aqQhlFm_4SAa7qToWMTB4&cx=010254913791562954874:fjogwmwaykw&q=" + input + searchType + start;
  var results =[];

  jQuery.ajax({
    url: url,
    method: "GET",
    success: function(data){
      for (var i = 0; i < data.items.length; i++) {
        results[i] = data.items[i].link;
      }
      return results;
    }
  });

}


// Create the Grid
function createGrid(){
  // Variables
  var dropdown = document.getElementById("listSizeGrid");
  var gridSize = dropdown.options[dropdown.selectedIndex].value;
  var container = document.getElementById("playArea");
  memoryArray = [gridSize];
  imagesArray = [gridSize];
  var i;
  img_pair_id = [gridSize/2] // length is half of the amount of the images in the grid -> gridSize
  // Setup -> Delete previous images
  $("#playArea").empty();
  // Fill with new Images
  for (i=0; i<gridSize; i++){
    var image = document.createElement("div");
    memoryArray[i] = createImages(i,urlArray);
    //image.style.backgroundImage = "url('" + memoryArray[i].url + "')";
    //image.style.backgroundSize = "cover";
    // Debugging
    var debugTextCardId = document.createElement("h2");
    debugTextCardId.innerHTML = memoryArray[i].card_id;
    var debugTextPairId = document.createElement("h2");
    debugTextPairId.innerHTML = memoryArray[i].pair_id;
    image.appendChild(debugTextCardId);
    image.appendChild(debugTextPairId);
    //

    image.className = "image";

    var image_id = String(i);
    image.id = image_id;
    imagesArray[i] = image;

    //container.appendChild(image);
  }

  shuffle(imagesArray);

  imagesArray.forEach(function(element){
    container.appendChild(element);
  });

  // Add the click event
  container.addEventListener("click", function(e){

    if (e.target.tagName == "DIV") {
      showImage(e.target);
    }

  });
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Classes

class GameState{

  constructor (player) {
    this.activePlayer = 0;
    this.currentRound = 0;
    this.amountPlayer = player;
  }

  nextPlayer(){

    if(this.activePlayer != (players.length - 1)){
      this.activePlayer++;
    }
    else{
      this.nextRound();
    }
  }

  nextRound(){
    this.activePlayer = 0;
    this.currentRound++;
  }

}

class Player{

  constructor(id){
    this.id = id;
    this.clicksLeft = 2;
    this.score = 0;
  }

  setClicksLeft(x){
    this.clicksLeft = x;
  }

  updateClicksLeft(){
    this.clicksLeft = this.clicksLeft - 1;
  }

  getClicksLeft(){
    return this.clicksLeft;
  }

  setScore(x){
    this.score = x;
  }

  getScore(){
    return this.score;
  }
}


class MemoryImage {

  constructor(card_id, pair_id, url) {
    this.card_id = card_id;
    this.pair_id = pair_id;
    this.url = url;
  }

  getCardId(){
    return this.card_id;
  }

  getPairId(){
    return this.pair_id;
  }

}
