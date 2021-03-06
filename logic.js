
// Variables
var listSizeGrid = document.getElementById("listSizeGrid");
var stepSize = 2;
var optionsGridSize = 11;
var game;
var players = [];
var pair_id_last_checked;
var card_id_last_checked;


// Create Dropdown Menu for Grid Size
var i;
var counter = 0;
for (i=0; i<(optionsGridSize * stepSize); i = i + stepSize) {
  var op = new Option();
  op.value = i;
  op.text = i;
  // Set default value
  if (counter == 10) {
    op.setAttribute("selected", "selected");
  }
  //
  listSizeGrid.options.add(op);
  counter++;
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
    row.id = "tr_player_" + String(i);
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

function updateImageSize(){
  var sizeValue = document.getElementById("sizeSlider").value;
  var images = document.getElementsByClassName("image");

  for (var i = 0; i < images.length; i++) {
    images[i].style.width = String(sizeValue) + "%";
    images[i].style.height = String(sizeValue) + "%";
  }

}

function updateDisplayGameProgress(){
  //document.getElementById("activePlayer").innerHTML = game.activePlayer + 1;
  //document.getElementById("currentRound").innerHTML = game.currentRound + 1;
  //document.getElementById("clicksleft").innerHTML = players[game.activePlayer].getClicksLeft();;
  var element = "tr_player_" + String(game.activePlayer);
  document.getElementById(element).style.backgroundColor = "yellow";
  //updateScoreboard();
}

function toggleUI(){

  var options_display = document.getElementById("options").style.display;


  if (options_display == "block") {
    document.getElementById("gameProgress").style.display = "block";
    document.getElementById("options").style.display = "none";
  }
  else {
    document.getElementById("gameProgress").style.display = "none";
    document.getElementById("options").style.display = "block";
  }

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
      //console.log(results);
      return results;
    }
  });
  //console.log(results);
  $(document).ajaxComplete(function() {
    return results;
  });
}

function prepareGame(){
  var searchMode = document.getElementById("list_searchmode").value;

  switch (searchMode) {
    case "gif":
      getGIF();
      break;
    case "google":
      getImages(1,1,[]);
      break;
    default:
      break;
  }

  toggleUI();
}

function getGIF(){

  var search_term = document.getElementById("searchterm").value;
  var apikey = "PZB8IP2K7Y94";
  var ratio = "&ar_range=standard";

  var url = "https://api.tenor.com/v1/search?tag=" + search_term + "&key=" +
            apikey + ratio;

  jQuery.ajax({
    url: url,
    method: "GET",
    success: function(data){
      //console.log(data);
      var links = [];
      for (var i = 0; i < data.results.length; i++) {
        links[i] = data.results[i].media[0].mediumgif.url;
      }
      startGame(links);
      //console.log(links);
    }
  });
}

function getImages(startIndex, iterations, links){
  var input = document.getElementById("searchterm").value;

  if (input == "") {
    alert("Insert something into searchfield");
  }
  else {
    // iterations = 1 -> 20 results will be returned
    var searchType = "&searchType=image";
    var start = "&start=" + String(startIndex);
    var url = "https://www.googleapis.com/customsearch/v1?key=AIzaSyCQcUbvvePw13aqQhlFm_4SAa7qToWMTB4&cx=010254913791562954874:fjogwmwaykw&q=" + input + searchType + start;
    var results = [];

    jQuery.ajax({
      url: url,
      method: "GET",
      success: function(data){
        for (var i = 0; i < data.items.length; i++) {
          results[i] = data.items[i].link;
        }

        links = links.concat(results);

        if (iterations == 0) {
          console.log(links);
          startGame(links);
        }
        else {
          // new call of the function
          startIndex += 10;
          iterations--;
          getImages(startIndex, iterations, links);
        }

      }
    });
  }
}

// Start the Game
function startGame(links){
  deleteGrid(); //Delete previously created grid
  createGrid(links);
  // Check if a Grid has been created
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
    deleteScoreboard();
    initScoreboard();
    updateDisplayGameProgress();

  }
}

function deleteGrid(){
  $("#playArea").empty();
}

// Create the Grid
function createGrid(links){
  // Variables
  var dropdown = document.getElementById("listSizeGrid");
  var gridSize = dropdown.options[dropdown.selectedIndex].value;
  var container = document.getElementById("playArea");
  memoryArray = [gridSize];
  imagesArray = [gridSize];
  img_pair_id = [gridSize/2] // length is half of the amount of the images in the grid -> gridSize
  // Fill with new Images
  for (i=0; i<gridSize; i++){
    memoryArray[i] = createImages(i,links);

    var image = document.createElement("div");
    var gif = document.createElement("img");

    gif.src = memoryArray[i].url;
    gif.className = "gif";
    gif.style.display = "none";

    // Debugging
    /*
    var debugTextCardId = document.createElement("h2");
    debugTextCardId.innerHTML = memoryArray[i].card_id;
    var debugTextPairId = document.createElement("h2");
    debugTextPairId.innerHTML = memoryArray[i].pair_id;
    image.appendChild(debugTextCardId);
    image.appendChild(debugTextPairId);
    */
    //

    image.appendChild(gif);

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

    if (e.target.tagName == "DIV" && e.target.className == "image") {
      showImage(e.target);
    }

  });
}

function showImage(e){
  // Wieviele Clicks hat der Spieler noch?
  var clicksLeft = players[game.activePlayer].getClicksLeft();
  // Damit Karte nicht doppelt gedrückt werden kann
  if (e.id != card_id_last_checked || (e.id == card_id_last_checked && clicksLeft == 2) ) {
    // Die Karte aufdecken
    //e.style.backgroundImage = "url('" + memoryArray[e.id].url + "')";
    //e.style.backgroundSize = "cover";
    e.childNodes[0].style.display = "block";
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
          e.childNodes[0].style.display = "none";
          lastimage.childNodes[0].style.display = "none";
        }, 1000);
        players[game.activePlayer].updateClicksLeft();
        game.nextPlayer();
        players[game.activePlayer].setClicksLeft(2);
      }
    }

    // Update die letzte gedrückte Karte
    card_id_last_checked = e.id;
    // Update the UI
    deleteScoreboard();
    initScoreboard();
    updateDisplayGameProgress();
  }
}

function newGame() {
  toggleUI();
  deleteGrid();
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
