$(document).ready(function(){
	var output = "Window()의 가로 크기 : " + $(window).width();
        output += "<br>Window()의 세로 크기 : " + $(window).height();
        output += "<br>innerWidth의 크기 : " + window.innerWidth;
        output += "<br>innerHeight의 크기 : " + window.innerHeight;
        output += "<br>outerWidth의 크기 : " + window.outerWidth;
        output += "<br>outerHeight의 크기 : " + window.outerHeight;

    console.log(output);

});