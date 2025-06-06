$(document).ready(function(){
	var output = "Window()의 가로 크기 : " + $(window).width();
        output += "<br>Window()의 세로 크기 : " + $(window).height();
        output += "<br>innerWidth의 크기 : " + window.innerWidth;
        output += "<br>innerHeight의 크기 : " + window.innerHeight;
        output += "<br>outerWidth의 크기 : " + window.outerWidth;
        output += "<br>outerHeight의 크기 : " + window.outerHeight;

    console.log(output);

    function rotateLeft() {
      startIndex = (startIndex - 1 + imageSources.length) % imageSources.length;
      renderCarousel();
    }

    function rotateRight() {
      startIndex = (startIndex + 1) % imageSources.length;
      renderCarousel();
    }

    function showSelectedIndex() {
      const selectedIndex = (startIndex + 2) % imageSources.length;
      alert("현재 선택된 이미지 인덱스: " + selectedIndex);
    }


});