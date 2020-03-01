function signin1(){
	document.getElementById("up").style.display = "none";


	//document.getElementById("password").style.color = "red";
	//document.getElementById("password").style.background = "white";
	//document.getElementById("password").style.display = "block";

	document.getElementById("password").classList.add("animation");
	document.getElementById("username").classList.add("animation");
	//document.getElementById("signin").classList.add("animation");

	document.getElementById("signin").style.color = "white";
	document.getElementById("signin").style.background = "#2d2d52";
	document.getElementById("signin").style.display = "block";

	//document.getElementById("signin").style.color = "red";
}

function signin2(){
	document.getElementById("in").style.display = "none";


	//document.getElementById("password").style.color = "red";
	//document.getElementById("password").style.background = "white";
	//document.getElementById("password").style.display = "block";

	document.getElementById("password").classList.add("animation");
	document.getElementById("username").classList.add("animation");
	//document.getElementById("signin").classList.add("animation");

	document.getElementById("signup").style.color = "white";
	document.getElementById("signup").style.background = "#2d2d52";
	document.getElementById("signup").style.display = "block";

	//document.getElementById("signin").style.color = "red";
}

let form = document.getElementById('formwrap');
form.onsubmit = function(e){
	e.preventDefault();
}