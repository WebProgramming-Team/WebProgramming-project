// === 전역 변수 ===
let canvas, ctx;
let ballX, ballY, ballRadius, dx, dy;
let paddleX, paddleHeight, paddleWidth;
let rightPressed = false;
let leftPressed = false;
let isGameOver = false;
let isPaused = false;   //일시정지 버튼

//점수 용 전역변수
let score = 0;

// 배경이미지 용 전역변수
const imagePaths = ["images/a1.png", "images/a2.png", "images/a3.png", "https://i.pinimg.com/736x/d0/13/64/d01364ef9f3634159e0769a4dcd4fde7.jpg"];
let images = [];
let imgCount = 0;
let flag = 0;


//이 아래는 벽돌배열입니다.


//벽돌에 대응되는 태그들
const destructibleElements = [
  { selector: ".lab:nth-of-type(1)", label: "<div>" },
  { selector: ".lab:nth-of-type(2)", label: "<table>" },
  { selector: "#wordList", label: "#wordList" },
  { selector: "#innerTest", label: "#innerTest" },
  { selector: "#image", label: "#image" },
  { selector: "#colorTable", label: "#colorTable" },
  { selector: "#target", label: "#target" },
  { selector: "#container", label: "#container" },
  { selector: "#hangman", label: "#hangman" },
  { selector: ".lab:nth-of-type(2)", label: "<table>" },
  { selector: ".lab:nth-of-type(2)", label: "<table>" },
  { selector: ".lab:nth-of-type(2)", label: "<table>" },
  { selector: ".lab:nth-of-type(2)", label: "<table>" },
  { selector: ".lab:nth-of-type(2)", label: "<table>" },
  { selector: ".lab:nth-of-type(2)", label: "<table>" }
];

// 벽돌 관련 설정
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 120;
const brickHeight = 40;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;


// bricks 초기화 시 아래처럼
let bricks = [];
createBricks();

const playjsHTML = `
<header>
<div id="title">
      Play with JS!
    </div>
<div id="ctime">
</div>
<nav>
<ul>
<li><a class="main-menu" href="#">Basic JS</a></li>
<li><a class="main-menu" href="#">Hangman</a></li>
<li><a class="main-menu" href="#">JQuery</a></li>
<li><a class="main-menu" href="#">Advanced JS</a></li>
</ul>
</nav>
</header>
<div id="content">
<!-- Put contents here. -->
<div class="lab">
<h3> 덧셈 계산기 </h3>
<form name="myform">
        첫번째 정수:
        <input id="x"/><br/>
        두번째 정수:
        <input id="y"/><br/>
        합계:
        <input id="sum"/><br/>
<input id="addButton" type="button" value="계산"/>
</form>
</div>

<div class="lab">
<h3>구구단 표</h3>
<table border='2'>
<tr>
<th>2단</th>
<th>3단</th>
<th>4단</th>
<th>5단</th>
<th>6단</th>
<th>7단</th>
<th>8단</th>
<th>9단</th>
</tr>
<tr><td>2×1=2</td><td>3×1=3</td><td>4×1=4</td><td>5×1=5</td><td>6×1=6</td><td>7×1=7</td><td>8×1=8</td><td>9×1=9</td></tr>
<tr><td>2×2=4</td><td>3×2=6</td><td>4×2=8</td><td>5×2=10</td><td>6×2=12</td><td>7×2=14</td><td>8×2=16</td><td>9×2=18</td></tr>
<tr><td>2×3=6</td><td>3×3=9</td><td>4×3=12</td><td>5×3=15</td><td>6×3=18</td><td>7×3=21</td><td>8×3=24</td><td>9×3=27</td></tr>
<tr><td>2×4=8</td><td>3×4=12</td><td>4×4=16</td><td>5×4=20</td><td>6×4=24</td><td>7×4=28</td><td>8×4=32</td><td>9×4=36</td></tr>
<tr><td>2×5=10</td><td>3×5=15</td><td>4×5=20</td><td>5×5=25</td><td>6×5=30</td><td>7×5=35</td><td>8×5=40</td><td>9×5=45</td></tr>
<tr><td>2×6=12</td><td>3×6=18</td><td>4×6=24</td><td>5×6=30</td><td>6×6=36</td><td>7×6=42</td><td>8×6=48</td><td>9×6=54</td></tr>
<tr><td>2×7=14</td><td>3×7=21</td><td>4×7=28</td><td>5×7=35</td><td>6×7=42</td><td>7×7=49</td><td>8×7=56</td><td>9×7=63</td></tr>
<tr><td>2×8=16</td><td>3×8=24</td><td>4×8=32</td><td>5×8=40</td><td>6×8=48</td><td>7×8=56</td><td>8×8=64</td><td>9×8=72</td></tr>
<tr><td>2×9=18</td><td>3×9=27</td><td>4×9=36</td><td>5×9=45</td><td>6×9=54</td><td>7×9=63</td><td>8×9=72</td><td>9×9=81</td></tr>
</table>
</div>

<div class="lab">
<h3>숫자 맞추기 게임</h3>
<p>이 게임은 컴퓨터가 생성한 숫자를 맞추는 게임입니다<br/>
      숫자는 1부터 100 사이에 있습니다.</p><br/>
<form>
        숫자:
        <input id="user" size="5" type="text"/>
<input id="numGuess" type="button" value="확인"/>
<input id="numReplay" type="button" value="다시시작"/>
<br/><br/>
        추측횟수:
        <input id="guesses" size="5" type="text"/>
        힌트: 
        <input id="result" size="16" type="text"/>
<input id="randomNum" size="16" type="text"/>
</form>

</div>
<div class="lab">
<h3>단어장</h3><br/>
<button class="wordButton" id="addWord">단어 추가</button>
<button class="wordButton" id="showWordList">단어 리스트 보기</button>
<button class="wordButton" id="sortWord">단어 정렬</button>
<button class="wordButton" id="shuffleWord">단어 섞기</button>
<br/><br/><p><strong>단어 리스트</strong></p><br/>
<!-- 여기서 우리가 수행한 문자열 출력 -->
<div id="wordList"></div>
</div>
<div class="lab">
<h2> innerHTML TEST </h2>
<p id="innerTest">여기를 눌러 보세요.</p>
</div>
<div class="lab">
<img height="200" id="image" src="img1.jpg" width="350"/>
<input id="imageButton" type="button" value="눌러보세요">
</input></div>
<div class="lab">
<h3>색상 테이블 출력하기</h3>
<input id="ctCreate" type="button" value="출력하기">
<input id="ctRemove" type="button" value="없애기">
<div id="colorTable"></div>
</input></input></div>
<div class="lab">
<div id="target">
      This is a Text.
    </div>
<button id="stopColor">중지</button>
</div>
<div class="lab">
<h3>상자 이동하기</h3>
<p>
<button id="moveBox">Click Me</button>
</p>
<div id="container">
<div id="animate"></div>
</div>
</div>
<div id="hangman">
<div>
<img alt="hangman" id="hangmanpic" src="hangman/hangman6.gif">
</img></div>
<div id="clue">Press New Game to play!</div>
<div>
<input id="hguess" maxlength="1 /" size="1" type="text"/>
<button disabled="disabled" id="guessButton">Guess</button>
</div>
<div id="newgamearea">
<button id="newGame">New Game</button>
</div>
<div id="guessstr"></div>
</div>
</div>
<footer>
<p>Web programming, Spring 2025</p>
<p>Created by 202411235 강동훈</p>
</footer>
`;
document.getElementById("labArea").innerHTML = playjsHTML;

$(window).ready(function() {
	// 메인 메뉴에서의 동작
  // 메뉴 버튼 연결
	$("#start-button").on("click", showLevelSelectionPage);
	$("#back-button-inlevel").on("click", showMainMenu);
	$(".game-start").on("click", init);

	// 키보드 이벤트 연결
	$(document).on("keydown", function (e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  });

  $(document).on("keyup", function (e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
  });


  $("#restartBtn").on("click", function () {
    $(this).hide();       //버튼 숨기기
    isGameOver = false;   //게임 상태 초기화
    score = 0;            //점수 초기화
    init();               //게임 재시작
  });


  // === 버튼 이벤트 연결 ===
  $("#startBtn").on("click", function () {
    if (isPaused) {
      isPaused = false;
      requestAnimationFrame(draw);
    }
  });

  $("#pauseBtn").on("click", function () {
    isPaused = true;
  });

  // 이미지 로드 확인
  brickImage.onload = () => {
    console.log("벽돌 이미지 로드 완료");
  };
  brickImage.onerror = () => {
    console.error("벽돌 이미지 로드 실패!");
    alert("벽돌 이미지 로드 실패! 게임을 시작할 수 없습니다. 'bricks.jpg' 파일이 있는지 확인해주세요.");
  };

  showMainMenu();
});



function showLevelSelectionPage() {
	$("#main-menu").hide();
	$("#level-selection").show();

  $("#game-area").hide();         //게임 영역 숨김
  $("#startBtn, #pauseBtn, #restartBtn").hide();  //버튼 숨김
}

//==메인 메뉴로 돌아갈 때==
function showMainMenu() {
	$("#main-menu").show();
	$("#level-selection").hide();

  $("#game-area").hide();         //게임 영역 숨김
  $("#startBtn, #pauseBtn, #restartBtn").hide();
}

function init() {
	$("#level-selection").hide();
  $("#main-menu").hide();             //  이것도 필요!
  $("#game-area").show();            //  이거 반드시 있어야 함!!
  $("#gameCanvas").show();
  $("#game-buttons").show();
  $("#startBtn, #pauseBtn").show();   // 재시작,일시정지 버튼 숨기기
  $("#restartBtn").hide();     //  게임오버 재시작 버튼은 감춤

  canvas = $("#gameCanvas")[0];
  ctx = canvas.getContext("2d");

  //새 게임 로드시 벽돌 다시 초기화
  createBricks();

  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  ballRadius = 10;
  dx = 4;
  dy = -4;

  paddleHeight = 10;
  paddleWidth = 180;
  paddleX = (canvas.width - paddleWidth) / 2;
  rightPressed = false;
  leftPressed = false;

  draw();
}


//태그가 연결된 벽돌 생성
function createBricks() {
  let index = 0;
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = {
        x: 0, y: 0, status: 1,
        targetSelector: destructibleElements[index]?.selector,
        tagLabel: destructibleElements[index]?.label
      };
      index++;
    }
  }
}


//벽돌 이미지
const brickImage = new Image();
brickImage.src = "image/bricks.jpg";

//벽돌 그리기 함수
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        if (brickImage.complete) {
          ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
        } 

        // 태그 이름 텍스트 표시
        if (b.tagLabel) {
          ctx.font = "12px Arial";
          ctx.fillStyle = "#fff";
          ctx.fillText(b.tagLabel, brickX + 10, brickY + 20);
        }

      }
    }
  }
}

//벽돌과의 충돌 처리
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        if (
          ballX > b.x &&
          ballX < b.x + brickWidth &&
          ballY > b.y &&
          ballY < b.y + brickHeight
          ) {
          dy = -dy;
        b.status = 0;
        score+=10;

        //해당 태그 제거
        const labArea = document.querySelector("#labArea");
        const target = labArea?.querySelector(b.targetSelector);
        if (target) target.remove();

      }
    }
  }
}
}

//점수 그리기 함수
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#f99c05";
  ctx.fillText("Score: " + score, 8, 20);
}

//게임 클리어 축하
function checkClear() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) return false;
    }
  }
  return true;
}

//공 그리기 함수
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#26a6d8";
  ctx.fill();
  ctx.closePath();
}

//막대 그리기 함수
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0f0";
  ctx.fill();
  ctx.closePath();
}

//===draw 함수 시작===
function draw() {
	console.log("draw() 실행");
  if (isGameOver || isPaused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);  //화면 초기화

  drawBricks();  // 벽돌부터 그림
  drawBall();  //공 그림
  drawPaddle();  //막대 그림
  drawScore();        // 점수 표시
  collisionDetection();

  // 벽 충돌 처리
  if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) dx = -dx;
  if (ballY + dy < ballRadius) dy = -dy;
  else if (ballY + dy > canvas.height - ballRadius) {
    // 막대 충돌 확인
    const buffer = 10;  //판정 범위 개선(끝에 닿아도 생존)
    if (ballX > paddleX-buffer && ballX < paddleX + paddleWidth+buffer) {
      dy = -dy;
    } else {
      isGameOver = true; // 다시 그리지 않도록 플래그 설정
      alert("게임 오버! 최종점수: "+score+"\n");
      $("#startBtn,#pauseBtn").hide();   // 재시작,일시정지 버튼 숨기기
      $("#restartBtn").show();  // 게임 오버 후 다시 시작 버튼만 보이기 
      return; // draw() 탈출
    }
  }

  ballX += dx;
  ballY += dy;

  // 막대 이동
  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 8;
  else if (leftPressed && paddleX > 0) paddleX -= 8;

  //클리어 메세지
  if (checkClear()) {
    isGameOver = true;
    setTimeout(() => {
      alert("🎉 클리어! 점수: " + score + "\n다시 시작합니다.");
      document.location.reload();
    }, 10);
    return;
  }

  requestAnimationFrame(draw);
}


