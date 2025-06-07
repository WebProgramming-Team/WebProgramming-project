// window.onload=setClock; 

function calc() {
	var x=document.getElementById('x').value;  //글상자에서 받는건 text형태, 즉 문자열 형태. 그냥더하면 문자열concate
	var y=document.getElementById('y').value;
	var sum=parseInt(x)+parseInt(y);  //정수로 변환 후 더해주어야 함.
	document.getElementById('sum').value=sum;
}

// var computerNumber=53; //글로벌변수, 정답
var computerNumber=Math.floor(Math.random()*100+1);
var nGuesses=0;

function numGuess() {
	document.getElementById('randomNum').value=computerNumber;
	var i;  //읽은값이 문자열이니까 숫자로 변환해줘야함
	var result="";  //힌트메세지 저장 위한 변수
	var number=parseInt(document.getElementById('user').value);
	nGuesses++;
	i=document.getElementById('user').value;
	document.getElementById('guesses').value=nGuesses;
	if(number==computerNumber){
		result='정답입니다! '+i+'입니다.'
		document.getElementById('result').value='정답입니다! '+i+'입니다.'
	}
	else if (number>computerNumber) {
		document.getElementById('result').value='정답보다 큽니다!'
	}
	else
		document.getElementById('result').value='정답보다 작습니다!'
}

function replay(){
	computerNumber=Math.floor(Math.random()*100+1);
	document.getElementById('randomNum').value=computerNumber;
	document.getElementById('guesses').value="";
	document.getElementById('user').value="";
	document.getElementById('result').value='';
	nGuesses=0;
}

function setClock() {
	let now=new Date();
	m=now.getMonth();
	if(now.getMonth()==3)
		m="April";
	else if(now.getMonth()==4)
		m="May";
	else if(now.getMonth()==5)
		m="June";
	else if(now.getMonth()==6)
		m="July";

	let s=m+" "+ now.getDate()+". "+ now.getHours()+" : "+now.getMinutes()+" : "+now.getSeconds();
	var table = document.getElementById('ctime');
	if(table != null){
	document.getElementById('ctime').innerHTML=s;
	}
	setTimeout(setClock,1000);
}
//setClock(); 이렇게 하면 헤드영역에서 호출
//함수 실행을 어디서 하는가? 강의자료에서 한거는 스크립트 html에 한거. body 태그 안에 div 태그.. <script>안에..
//브라우저는 인터프리터로 동작, body가 실행됨과 동시에, 웹페이지 로딩. p태그를 브라우저가 인지--> dom모델 만듦. 시간이 출력된 p태그를 
//이미 브라우저가 알 고 있음. playjs파일이 우리는 head에서 읽음. <script src=''...> body가 돔모델을 만들기도 전에 호출해버림.
//body로드 직전이기 때문에, id가 ctime인 것을 브라우저가 인식할 수 없음. 방법은 script 바디에 넣기.. 근데 비추
//그럼 페이지가 로드가 완료된 시점에 작동하게 하면 됨. 바디안의 태그에 대한 돔 모델을 다 만들고 작동하도록 만들면 ok
//js파일의 가장 첫줄에, window.onload=setCTime; 이벤트에 대해서 다음의 동작을 수행. 이건 정의가 와야하므로 ()넣으면 안됨


//전역변수들
var WORD_LIST=["obdurate","verisimilitude","defenestrate","ovsequious","dissonant","today","idempotent","word"];
var MAX_GUESSES=6;

var guesses="" //사용자가 추측한 문자들의 문자열
var guessCount=MAX_GUESSES; //남아있는 최대 추측 횟수, 맞히지 못할때마다 1씩 감소
var word;  //현재 게임에서 선택된 단어

// 게임초기화
function newGame() {
    // 랜덤 단어 선택
	var index = parseInt(Math.random() * WORD_LIST.length);
	word = WORD_LIST[index];

    // 초기화
	guesses = "";
	guessCount = MAX_GUESSES;
	document.getElementById("hguess").value="";

    // 버튼 활성화
	document.getElementById("guessButton").disabled = false;

    // 화면 초기화
	updatePage();
}

/*
function updatePage() {
    // 1. hangman 이미지 업데이트
    document.getElementById("hangmanpic").src = "hangman/hangman" + guessCount + ".gif";

    // 2. clue 문자열 갱신
    let clue = "";
    for (let i = 0; i < word.length; i++) {
        let ch = word.charAt(i);
        if (guesses.indexOf(ch) >= 0) {
            clue += ch + " ";
        } else {
            clue += "_ ";
        }
    }
    document.getElementById("clue").innerHTML = clue;

    // 3. 승리 판정 (clue에 _ 가 하나도 없으면 승리)
    if (clue.indexOf("_")<0) {
        document.getElementById("guessstr").innerHTML="You Win";
    }

    // 4. 패배 판정
    if (guessCount === 0) {
        document.getElementById("guessstr").innerHTML="You Lose";
    }

    // 5. guess 문자열 출력
    document.getElementById("guessstr").innerHTML = "Guesses: " + guesses;
}
*/



function updatePage() {
    // 이미지 업데이트
    // hangman${guessCount+}.gif 배팅사용하기
	document.getElementById("hangmanpic").src = "hangman/hangman" + guessCount + ".gif";

    //word 업데이트 될때마다 clue string은 계속 변함
    // 단어 힌트 만들기
	var clue = "";
	var allRevealed = true;
	for (var i = 0; i < word.length; i++) {
		var c = word.charAt(i);
		if (guesses.indexOf(c) !== -1) {
			clue += c + " ";
		} else {
			clue += "_ ";
			allRevealed = false;
		}
	}



	document.getElementById("clue").innerHTML = clue;
    //태그나 아이디, 클래스 이름 여러개일수도 있음. 여러개 반환하면안됨.

    // 추측한 문자 출력

	document.getElementById("guessstr").innerHTML = "Guesses : " + guesses;

    // 승패 판정
	if (allRevealed) {
		// document.getElementById("clue").innerHTML += "<br> You win!";
		document.getElementById("guessstr").innerHTML="You Win";
		// document.getElementById("guessbutton").disabled = true;
	} else if (guessCount === 0) {
		// document.getElementById("clue").innerHTML += "<br> You lose! 단어는: " + word;
		document.getElementById("guessstr").innerHTML="You Lose";
		// document.getElementById("guessbutton").disabled = true;
	}
}



//사용자입력 읽기. input 태그의 값 읽기, 이미 guesses에 포함되었다면 return.
//새로운 문자라면, guesses에 추가. cocatenate. 
//틀렸을때, 내가 입력한(letter)가 word에 없으면 guesscount 감소.
//str.indexOf('c') --> str 에서 c의 인덱스를 알려줘. abcd(0123) . 여러개면 맨 처음만나는 index
//어쨋든 있으면 return은 0보다 같거나 큰값. 즉 음수이면 없다. 
//감소는 word에 letter가 없을경우, 입력하는 족족 guesses가 출력.
function guessLetter() {
	var letter=document.getElementById("hguess").value;
	var clueString=document.getElementById("clue");
	var cluestr=clueString.innerHTML;

	if(guesses.indexOf(letter)>=0||guessCount==0||cluestr.indexOf("_")<0){
		return;
	}
	guesses+=letter;
	if(word.indexOf(letter)<0){
		guessCount--;
	}

	updatePage();
}




// function guessLetter() {
//     var letter = document.getElementById("hguess").value.toLowerCase();
//     document.getElementById("hguess").value = ""; // 입력창 비우기

//     // 유효성 검사
//     if (letter === "" || letter.length !== 1 || !/^[a-z]$/.test(letter)) {
//         alert("알파벳 하나만 입력해주세요.");
//         return;
//     }

//     // 이미 입력한 문자이거나 게임 끝났으면 무시
//     if (guesses.includes(letter) || guessCount === 0 || !document.getElementById("guessbutton").disabled === false) {
//         return;
//     }

//     // 새로운 문자면 추가
//     guesses += letter;

//     // 틀린 경우 기회 차감
//     if (word.indexOf(letter) === -1) {
//         guessCount--;
//     }

//     // 화면 갱신
//     updatePage();
// }


function showWordList() {
	var a=WORD_LIST;
	var s1=""
	var s2=""
	s1=a.toString();
	s2=a.join(", ");
	// document.getElementById('wordList').innerHTML=s1;
	document.getElementById('wordList').innerHTML=s2;
}
//join 과 toString 을 비교해보자.

function addWord() {
	var p=WORD_LIST;
	var promptObj=prompt('추가할 단어를 입력하세요. : ');
	if(promptObj==null){
		alert("입력된 단어가 없습니다.");
		return;
	}
	var returnString="";
	var wLenth=p.length;
	var isExist=false;
	for(var i=0;i<wLenth;i++){
		if(promptObj==p[i]){
			isExist=true;
			break;
		}
	}
	if(isExist){
		returnString="이미 존재하는 단어입니다. 추가할 수 없습니다";
		alert(returnString);
	}
	else{
		returnString= promptObj+" 단어를 추가합니다!";
		alert(returnString);
		WORD_LIST.push(promptObj);
		showWordList();
	}



}
//prompt 함수를 통해 사용자 입력을 받으면 됨. 이미 존재하면, "이미 존재합니다" 알림창 생성. 배열에 없는 문자열일 경우, 
//맨 뒤에 추가하고, 바로 갱신된 배열을 출력

function sortWord(){
	WORD_LIST.sort();
	showWordList();
}
//가장 간단, 배열 정렬하고 문자열로 출력

function shuffleWord(){
	for(let i=WORD_LIST.length-1;i>0;i--){
		let j=Math.floor(Math.random()*(i+1));
		let k=WORD_LIST[i];  //temp 변수
		WORD_LIST[i]=WORD_LIST[j];
		WORD_LIST[j]=k;

	}
	document.getElementById("wordList").innerHTML=WORD_LIST.join(", ");

}
//일단 제일 뒤 인덱스 만들면, 0 1 2 3 4 번째 인덱스 모두 다 처음으로 이동가능
//j 와 i의 인덱스 값 맞바꾸기, swap
//다음에 올 랜덤값 i=0~3으로 바뀜. i에 의해 최댓값이 달라짐. 결정된거 빼고 나머지 섞기
//i=0일때까지가 아니라, 두개 남으면 그냥 끝내면 ok, 핵심은 random index의 범위 0~0.9에서 잘 만들기

function innerTest() {
	let str=prompt();
	// document.getElementById("innerTest").innerHTML=str;
	document.getElementById("innerTest").innerText=str;
}

//<strong style="color:blue">푸른</strong>바다 
//태그가 브라우저에 의해 해석이 되어서 실행이 된다. (innerHTML의 특징)
//innerText -->  사용자 입력을 온전히 텍스트로만 저장

function changeImage(){
	// var img1=document.getElementById("image").src="잘나온폭포.jpg"
	// var img2=document.getElementById("image").src="건국대학교 로고.jpg"
	// document.getElementById("image").src="잘나온폭포.jpg"

	var img=document.getElementById("image");
	console.log(img.src);

	var bimg=document.getElementById("image");
	var sarray=bimg.src.split('/');
	var str=sarray[sarray.length-1]; //이게 파일 이름에 해당함.
	if(str=="img1.jpg")
		bimg.src="img2.jpg";
	else
		bimg.src="img1.jpg";
}
//배열에 넣고 0이면 1 1이면 0 이렇게 할수도 있음..
//돔 모델에 전체 경로가 저장됨. 우리는 파일 이름만 필요함. 경로는 마지막에 있고, 슬레시로 구분되어 있음

var colorNames=["maroon","red","orange","yellow","olive","purple","fuchsia","white","lime","green","navy","blue","aqua","teal","black","silver","gray"];

function createColorTable() {

	var colordiv=document.getElementById("colorTable");

	for(var i=0;i<=colorNames.length-1;i++){
		var node=document.createElement("div");
		node.setAttribute("class","ctbox"); //없던 attribute 인 class 를 새로 만듦. 이건 set사용해야함
		node.innerHTML=colorNames[i];
		node.style.display="inline-block";
		node.style.width="60px";
		node.style.padding="10px";
		node.style.backgroundColor=colorNames[i];
		colordiv.appendChild(node);
	};
}

function removeColorTable() {
	// removechild
	var parent=document.getElementById("colorTable");
	var child=parent.getElementsByClassName("ctbox");
	// var child=parent.querySelectorAll(".ctbox");
	//돔 모델에 정의되어있는 property로 선택
	//var child=parent.childNodes; -->자식 노드를 배열로 갖고있음
	// for(var i=0;i < child.length;i++){
	// 	parent.removeChild(child[i]);
	// }
	while(child[0]){
		parent.removeChild(child[0]);
	}
	//child[0] 가 없어질때 까지 지움
	//또는 돔트리의 상관관계를 이용해서 first child 라는 property를 통해 접근.
}


let colorInterval; // 인터벌 ID 저장 변수

function changeColor(){
	colorInterval= setInterval(flashText,1000);
}

function flashText() {
	var elem=document.getElementById("target");
	elem.style.color=(elem.style.color=="red")?"blue":"red";
	elem.style.backgroundColor=(elem.style.backgroundColor=="green")?"yellow":"green";
}

function stopTextColor() {
  clearInterval(colorInterval); // 인터벌 멈춤5.
}

//로드 라는 이벤트에 대해 함수가 핸들러로 정의되어있음. 시계를 보여주는 함수를 실행시키면 됨
// window.onload=pageLoad;

// function pageLoad() {
// 	setCTime();
// 	changeColor();   //이건 실행시키기 위해 함수

// 	var b1=document.querySelector("#add");
// 	b1.onclick=calc;  //이벤트 핸들러 추가

// 	var b2=document.querySelector("#numGuess")
// 	b2
// 	var b3=document.querySelector("#numReplay")


// }
// document.addEvenetListener("DOMContentLoaded",changeColor);


//div의 포지션은 앱솔루트.
//빨강이는 top right 같은 좌표로 결정. 노란색 div의 왼쪽 끝에 붙어있다가, 대각선 방향으로 이동. top 과 left만 있으면 됨.
//top 과 left가 같은 간격으로 증가. 5초 ms지날때 마다 좌표값 1씩 증가. 주기적으로 시간이 경과할때마다 동작하도록.
//근데 무한히 가면 안되니까 끝에오면 딱 멈춰야함. setInterval을 멈추는건 clearInterval
//0,0의 기준이 브라우저가 아니라 컨테이너가 기준. 부모는 position relative 이제 이게 기준

//setInterval 은 딱 한번만 호출

window.onload=pageLoad;
function pageLoad(){
	setClock();
	changeColor();
	document.querySelector("#addButton").onclick=calc;

	document.querySelector("#numGuess").onclick=numGuess;
	document.querySelector("#numReplay").onclick=replay;

	document.querySelector("#addWord").onclick=addWord;
	document.querySelector("#showWordList").onclick=showWordList;
	document.querySelector("#sortWord").onclick=sortWord;
	document.querySelector("#shuffleWord").onclick=shuffleWord;

	document.querySelector("#innerTest").onclick=innerTest;

	document.querySelector("#imageButton").onclick=changeImage;

	document.querySelector("#ctCreate").onclick=createColorTable;
	document.querySelector("#ctRemove").onclick=removeColorTable;

	document.querySelector("#stopColor").onclick=stopTextColor;

	document.querySelector("#guessButton").onclick=guessLetter;
	document.querySelector("#newGame").onclick=newGame;

	var b1=document.querySelector("#moveBox");
	b1.onclick=myMove;
}

// let redBox;

// function moveBox() {
// 	redBox= setInterval(setBox,5);
// }

// function setBox() {
// 	var box=document.getElementById("animate");
// 	box.style.top=box.style.top+1;
// 	box.style.left=box.style.left+1;
// }

function myMove(){
	var elem= document.querySelector("#animate");
	var pos=0;
	var id=setInterval(frame,5);
	function frame(){
		if(pos==350){
			clearInterval(id);
		}else{
			pos++;
			elem.style.top=pos+'px';
			elem.style.left=pos+'px';
		}
	}
}
