class Player {
  constructor(index,model) {
    this.score = 0;
    this.correctOptions = [];
    this.r = random(255);
    this.g = random(255);
    this.b = random(255);
    this.index = index;
    this.onGame = true;
  	this.info= createElement('h3', '');
  	this.info.position(CANVAS_WIDTH+ 100, index*40);
    this.info.style("color:rgb("+this.r+", "+this.g+", "+this.b+");");
    //Este será nuestra nueva tabla a comparar, debido a que son varios jugadores con diferentes opciones.
    this.playerOptions = resultOptions.slice();
    if(model=== null){
      //Creamos nuestro modelo
      this.model = tf.sequential();
      //Agregando el primer layer
      // this.model.add(tf.layers.dense({units: squares_count*squares_count, inputShape:[squares_count*squares_count], activation:"relu"}));
      this.model.add(tf.layers.dense({units: squares_count*squares_count, inputShape:[squares_count*squares_count]}));
      //Agregando el segundo layer
      // this.model.add(tf.layers.dense({units: squares_count*squares_count}));
      //TODO: Improve this model... add more layers.
      // Prepare the model for training: Specify the loss and the optimizer.
      this.model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
    }else{
      this.model = model;
    }
  }

  //Predict or make a choice
  async guessChoice(){
      let inputs = this.getInputs(); //get the inputs serialize
      let input_tf = tf.tensor2d([inputs], [1,squares_count*squares_count]);
      //Predict the action we need to set up.
      let output_tf =  await this.model.predict(input_tf).data();
      //Take the arg Max of the guess, and convert it into i,j format
      let result = this.formatGuess(output_tf);
      let x = result[0];//i
      let y = result[1];//j
      let val = squares[x][y].value;

      let indexCorrect = this.correctOptions.length;
      //Obtenemos el valor que tocaría responder, la respuesta correcta.
      let correctAnswer = sortOptions[indexCorrect];
      // console.log("output:", val, "Correct:", correctAnswer);
      // console.log("input choice:");
      // input_tf.print();
      // console.log("output choise:",output_tf);
      //console.log("choice:", x, ",", y);

      return this.addAnswer(val);
  }


  formatGuess(guess){
    let index = 0;
    let result =[];
    let minProbability = -100;
    for(let i =0; i<squares_count; i++){
      for(let j = 0; j<squares_count;j++){
        if(guess[index] > minProbability){
          minProbability = guess[index];
          result = [i,j]
        }
        index++;
      }
    }
    return result;
  }

  //Serialize the inputs
  getInputs(){
    let inputs = [];
    for(let i=0; i< this.playerOptions.length;i++){
      inputs[i] = this.playerOptions[i] / 100;
    }
    return inputs;
  }

  showAcerts(){
    let results = this.getResults();
    this.info.elt.innerHTML = results;
  }

  getResults(){
    let res = "Player " + this.index + " on game:"+this.onGame+" score:" + this.score +" correct answers:";
    for(let i=0; i<this.correctOptions.length;i++){
      res += this.correctOptions[i] + ",";
    }
    return res;
  }

  async addAnswer(answer){
    await this.trainModel();
    if(this.verifyAnswer(answer)){
      this.correctOptions.push(answer);
      this.score++;
      if(this.score == squares_count*squares_count){
        bestScore = this.score
        this.onGame = false;
        winings++;
      }
    }else{
      this.onGame = false;
      if(this.score > bestScore)
        bestScore = this.score
    }
    return this.onGame;
  }


  async trainModel(){
    let inputs = this.getInputs(); //get the inputs serialize
    let input_tf = tf.tensor2d([inputs], [1,squares_count*squares_count]);
    let outputs = this.getOutputTrainModel();
    let outputs_tf = tf.tensor2d([outputs], [1,squares_count*squares_count]);
    // console.log("input train:");
    // input_tf.print();
    // console.log("output train:");
    // outputs_tf.print();
    await this.model.fit(input_tf,outputs_tf,{epochs:3}).then(()=>{
      //  console.log("Entrenado!");
    });
  }

  getOutputTrainModel(){
    let indexCorrect = this.correctOptions.length;
    //Obtenemos el valor que tocaría responder, la respuesta correcta.
    let val = sortOptions[indexCorrect];
    let outputs = [];
    let index=0;
    for(let i=0; i<squares_count;i++){
      for(let j=0; j<squares_count;j++){
        if(squares[i][j].value == val)
          outputs[index] = 100;
        else
          outputs[index] = 0;
        index++;
      }
    }
    return outputs;
  }


  verifyAnswer(answer){
    //Si se repite está jodido...
    let correct = this.verifyRepeated(answer);
    //Verificamos la respuesta
    correct = correct && this.verifyOptions(answer);
    //Pero debe de estar vivo aún..
    correct = correct && this.onGame;
    return correct;
  }

  //Verifica la siguiente respuesta corresponde a la respuesta que se escogió
  verifyOptions(answer){
    //El tamaño del array será nuestro index para ver si la siguiente repuesta es la correcta
    let indexCorrect = this.correctOptions.length;
    //Obtenemos el valor que tocaría responder, la respuesta correcta.
    let val = sortOptions[indexCorrect];
    //Verificamos nuestra respuesta
    if(answer == val){
      this.removeOption(answer);
      return true;
    }
    return false;
  }

  removeOption(answer){
    for(let i=0; i< this.playerOptions.length;i++){
      let val = this.playerOptions[i];
      if(val==answer)
        this.playerOptions[i] = 200;
    }
  }

  //Si ya está repetida la pregunta...
  verifyRepeated(answer){
    for(let i=0; i < this.correctOptions.length;i++){
      if(this.correctOptions[i] == answer){
        return false;
      }
    }
    return true;
  }

}
