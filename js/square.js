class Square {

  constructor(_x,_y, value) {
    this.x = _x;
    this.y = _y;
    this.value = value;
    this.verified = false;
  }

  show(){
    if(!this.verified){
    		fill(255);
    }else{
      fill(216, 232, 234);
    }
		strokeWeight(4);
		stroke(2);
		rect(this.x * SQUARE_SIZE,this.y * SQUARE_SIZE,SQUARE_SIZE,SQUARE_SIZE);
		textSize(30);
		fill(0);
		stroke(0);
    text("" + this.value, this.x*SQUARE_SIZE + SQUARE_SIZE/2 - 15,this.y*SQUARE_SIZE+ SQUARE_SIZE/2 + 10);
  }


  isClicked(x, y){
    let clicked = false;
		if(x>= this.x*SQUARE_SIZE && x<this.x*SQUARE_SIZE +SQUARE_SIZE){
			if(y>= this.y*SQUARE_SIZE && y<this.y*SQUARE_SIZE +SQUARE_SIZE){
        clicked = true;
      }
    }
    return clicked;
	}
}
