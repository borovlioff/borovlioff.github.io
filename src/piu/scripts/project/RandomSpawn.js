
// Put any global functions etc. here


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
}

function getHeight(){
	let height = 0;
	const position = getRandomIntInclusive(0,1);
	if(position == 0 ){
		height = 0;
	}
	else{
		height = runtime.layout.height;
	}
	return height;
}