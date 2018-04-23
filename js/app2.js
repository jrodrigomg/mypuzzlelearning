

//Configuration game
const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;
const SQUARE_SIZE = 100;
const PLAYERS_COUNT = 1;

//What leawrn?
const ORDER_ASCENDING = 0;
const ORDER_DESCENDING = 1;

const ASCENDING_MESSAGE = "Ascending order";
const DESCENDING_MESSAGE = "Descending order";

let squares_count;

//Game variables
let squares = [];
let resultOptions = [];
let sortOptions = [];
let players = [];
let generation = 0;
let alives = PLAYERS_COUNT;
let fast;
let lastSpeed = 10;
let mytime;
let winings=0;
let order = 0;
let genericQuestion;
let startButton;
let selectOrder;

// //Para la red neuronal
let model;
let bestScore = 0;


function setup(){
  squares_count = CANVAS_WIDTH/SQUARE_SIZE; //apply for height to!
  createCanvas(CANVAS_WIDTH,CANVAS_HEIGHT);

  generalInfo= createElement('h3', '');
  generalInfo.position(20, CANVAS_HEIGHT + 200);

  genericQuestion = createElement('h3', 'What to learn?');
  genericQuestion.position(20, CANVAS_HEIGHT + 100);

  selectOrder = createSelect();
  selectOrder.position(20, CANVAS_HEIGHT + 150);
  selectOrder.option(ASCENDING_MESSAGE);
  selectOrder.option(DESCENDING_MESSAGE);


  startButton = createButton('Start!');
  startButton.position(20, CANVAS_HEIGHT + 250);
  startButton.mousePressed(startEverything);

}

function startEverything(){
    fast = createSlider(200,8000,8000);
    fast.position(20, CANVAS_HEIGHT + 150);
    order = getOrder();
    initialize();
    startTime();
    //noLoop();
    startButton.remove();
    selectOrder.remove();
    genericQuestion.elt.innerHTML = "How fast?";
}

//Inicializa todo para un nuevo juego.
function initialize(){
  removerTextoPlayer();
  //assign variables
  squares = [];
  resultOptions = [];
  sortOptions = [];
  alives = PLAYERS_COUNT;

  //Creamos las opciones de 0 a 99
  let options = [];
  for(let i =0; i< 100;i++){
    options.push(i)
  }

  //creamos los cuadrados
  for (let i=0; i< squares_count; i++){
    squares[i] = [];
    for(let j=0; j<squares_count; j++){
      //Escogemos una opcion
      let index = floor(random(1, options.length));
      let val = options[index];
      //Cramos el cuadrado
      squares[i][j] = new Square(i,j,val);
      //Quitamos la opcion para que no se vuelva a repetir!
      //Y lo colocamos en nuestras verdaderas opciones.
		  resultOptions.push(val);
      options.splice(index,1);
    }
  }

  //hacemos copia del array.
  sortOptions = resultOptions.slice();
  //Ordenamos el array
  let sortFunction = getSortFunction();
  sortOptions.sort(sortFunction);

  createPlayers();
}

//GET the choise of user.
function getOrder(){
  let selectedValue = selectOrder.selected();
  switch (selectedValue) {
    case DESCENDING_MESSAGE:
      order = ORDER_DESCENDING;
      break;
    default:
      order = ORDER_ASCENDING;
  }
  return order;
}



//Get the function to learn.
function getSortFunction(){
  //Sort in ascending order
  let sortAscending = function(a, b){return a-b};
  //Sort in descending order
  let sortDescending = function(a, b){return b-a};

  let sortFunction;
  switch (order) {
    case ORDER_ASCENDING:
      sortFunction = sortAscending;
      break;
    default:
      sortFunction = sortDescending;
  }

  return sortFunction;
}

function removerTextoPlayer(){
  for(let i=0;i<players.length;i++){
    players[i].info.remove();
  }
}


function createPlayers(){
  for(let i=0; i<PLAYERS_COUNT;i++){
    let player = players[i];
    let model = null;
    if(player)
      model = player.model;
    players[i] = new Player(i,model);
  }
}



function mousePressed(){
  // for (var i = 0; i< squares.length; i++){
	// 	for (var j=0; j< squares.length; j++){
  //     let square = squares[i][j];
	// 		if(square.isClicked(mouseX, mouseY)){
  //       players[0].addAnswer(square.value);
	// 		}
	// 	}
	// }
}

function startTime(value){
  lastSpeed = value;
  if(mytime){
    clearInterval(mytime);
  }

  mytime = setInterval(function(){
    tomarDesiciones();
  },value);
}

function draw(){

  background(0);
  if(fast){
      let fastValue = fast.value();
      if(lastSpeed != fastValue)
        startTime(fastValue);
      generalInfo.elt.innerHTML = "Info:  best score:" + bestScore + " count(win):" + winings;
      dibujarCuadrados();
      dibujarJugadores();
  }
}

 function tomarDesiciones(){
  for(let i=0;i<players.length;i++){
    let player = players[i];
    if(player.onGame){
      setTimeout(function(){
        player.guessChoice().then((correct)=>{
          if(!correct){
            let allDead = verificarGameOver();
            alives--;
            if(allDead){
              setTimeout(function(){
                console.log("Game over! restart");
                initialize();
              },500);
              return;
            }
          }
        });
      },500);
    }
  }
  draw();
}

function verificarGameOver(){
  let allDead = true;
  for(let i=0;i<players.length;i++){
    let player = players[i];
    if(player.onGame)
      allDead = false;
  }
  return allDead;
}

function dibujarJugadores(){
  for (let i=0; i< players.length;i++){
    players[i].showAcerts();
  }
}

//Dibuja todos los cuadrados
function dibujarCuadrados(){
  for (let i=0; i< squares_count; i++){
    for(let j=0; j<squares_count; j++){
      squares[i][j].show();
    }
  }
}
