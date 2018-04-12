
// Variables
var listSizeGrid = document.getElementById("listSizeGrid");
var stepSize = 2;
var optionsGridSize = 100;
var game;
var players = [];

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
    //alert("kann losgehen");
    game = new GameState();
    var i;
    var dd_players = document.getElementById("players");
    var amountPlayers = dd_players.options[dd_players.selectedIndex].value;
    for (i=0; i<amountPlayers; i++){
      players[i] = new Player(i);
      //alert(players[i].id + 1);
    }
    //Display Game State in the Progress Window
    updateDisplayGameProgress();
    //alert(game.activePlayer);
  }
}

// new Round
function showImage(e){
  e.style.backgroundColor = "blue";
  //alert(game.activePlayer);
  //alert(players[game.activePlayer]);
  var clicksLeft = players[game.activePlayer].getClicksLeft();
  if(clicksLeft > 0){
    players[game.activePlayer].updateClicksLeft();
    //alert(clicksLeft);
  }
  else{
    //e.style.backgroundColor = "yellow";
  }

}

function updateDisplayGameProgress(){
  document.getElementById("activePlayer").innerHTML = game.activePlayer + 1;
  document.getElementById("currentRound").innerHTML = game.currentRound + 1;
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
      //console.log(data);
      //console.log(data.items);
      for (var i = 0; i < data.items.length; i++) {
        results[i] = data.items[i].link;
        //console.log(data.items[i].link);
      }
    }
  });
  console.log(results);
  return results;
}


// Create the Grid
function createGrid(){
  // Variables
  var dropdown = document.getElementById("listSizeGrid");
  var gridSize = dropdown.options[dropdown.selectedIndex].value;
  var container = document.getElementById("playArea");
  var i;
  img_pair_id = [gridSize/2] // length is half of the amount of the images in the grid -> gridSize
  // Setup -> Delete previous images
  $("#playArea").empty();
  // Fill with new Images
  var linkedImages = 2;
  var counter = 0;
  for (i=0; i<gridSize; i++){
    var image = document.createElement("div");
    image.className = "image";

    var image_id = "image_" + String(i);
    image.id = image_id;
    container.appendChild(image);
  }
  // Add the click event
  container.addEventListener("click", function(e){

    showImage(e.target);

    if(players[game.activePlayer].getClicksLeft() === 0){
      $("#playArea").children().css("background-color","yellow");
      game.nextPlayer();
      //alert(players[game.activePlayer]);
      players[game.activePlayer].setClicksLeft(2);
      updateDisplayGameProgress();

    }


  });
}

// Classes

class GameState{

  constructor () {
    this.activePlayer = 0;
    this.currentRound = 0;
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
