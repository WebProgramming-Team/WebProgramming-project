// === 전역 변수 ===
let canvas, ctx;
let ballX, ballY, ballRadius, dx, dy, ran = 0; // v_s는 속도의 제곱, ran은 난수
let paddleX, paddleHeight, paddleWidth;
let rightPressed = false;
let leftPressed = false;
let isGameOver = false;
let isPaused = false;   //일시정지 버튼
let igIdx = 0; // 인게임 음악 인덱스
const v_s = 128;

//점수 용 전역변수
let score = 0;

// 음악용
const gameOverMusicPath = ["musics/gameover/cd-stop.mp3", "musics/gameover/u-died.mp3"];
const gameOverMusic = [];
const ingameMusicPath = ["musics/ingame/iwbtb.mp3", "musics/ingame/train.mp3"];
const ingameMusic = [];
const menuMusic = new Audio("musics/etc/main.mp3");

for (let i = 0; i < gameOverMusicPath.length; i++) {
  const goPath = gameOverMusicPath[i];
  const igPath = ingameMusicPath[i];
  const audio1 = new Audio(goPath);
  const audio2 = new Audio(igPath);
  gameOverMusic.push(audio1);
  ingameMusic.push(audio2);

  ingameMusic[i].loop = true;
  ingameMusic[i].volume = 0.25;
  gameOverMusic[i].volume = 0.25;
}
ingameMusic[1].volume = ingameMusic[1].volume*0.6;
menuMusic.volume = 0.2;
menuMusic.loop = true;


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
const brickRowCount = 6;
const brickColumnCount = 5;
const brickWidth = 180;
const brickHeight = 40;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

//벽돌 이미지
const brickImage = new Image();
brickImage.src = "images/bricks.jpg";

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
<img height="200" id="image" src="projects/easy-mode/img1.jpg" width="350"/>
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
<img alt="hangman" id="hangmanpic" src="projects/easy-mode/hangman/hangman6.gif">
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

$(window).ready(function() {
	// 메인 메뉴에서의 동작
  // 메뉴 버튼 연결
	$("#start-button").on("click", showLevelSelectionPage);
  $("#options-button").on("click", showOptions);
  $("#guitar-button").on("click", showGuitar);
	$(".game-start").on("click", init);
  // 메인메뉴로 가는 버튼
	$(".back-button").on("click", showMainMenu);


	// 키보드 이벤트 연결
	$(document).on("keydown", function (e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  });

  $(document).on("keyup", function (e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
  });


  // === 버튼 이벤트 연결 ===
  $("#restartBtn").on("click", function () {
    init();               //게임 재시작
  });

  $("#startBtn").on("click", function () {
    if (isPaused) {
      isPaused = false;
      requestAnimationFrame(draw);
    }
  });

  $("#pauseBtn").on("click", function () {
    isPaused = true;
  });

  $("#volume-bar").on("input", function() {
    let vol = $(this).val();
    $("#volume").html(vol);

    setVolume(vol);
  })

  $("#music-select").on("input", function() {
    igIdx = $(this).val();
  })

  // 이미지 로드 확인
  brickImage.onload = () => {
    console.log("벽돌 이미지 로드 완료");
  };
  brickImage.onerror = () => {
    console.error("벽돌 이미지 로드 실패!");
    alert("벽돌 이미지 로드 실패! 게임을 시작할 수 없습니다. 'bricks.jpg' 파일이 있는지 확인해주세요.");
  };

  // 음악 담당
  gameOverMusic[0].addEventListener("ended", function() {
    gameOverMusic[1].play();
  })
  
  $("#menu-music-button, #intro-to-main").on("click", function () {
    menuMusic.play();
  })
});


function showLevelSelectionPage() {
	$("#main-menu").hide();
	$("#level-selection").show();

  $("#game-area").hide();         //게임 영역 숨김
  $("#startBtn, #pauseBtn, #restartBtn").hide();  //버튼 숨김
}

function showOptions() {
  $("#main-menu").hide();
  $("#options").show();
}

function showGuitar() {
  $("#main-menu").hide();
  $("#guitar").show();
}

//==메인 메뉴로 돌아갈 때==
function showMainMenu() {
	$(".menu-page").hide();

  $("#main-menu").show();

  $("#game-area").hide();         //게임 영역 숨김
  $("#startBtn, #pauseBtn, #restartBtn, #ingame-to-menu-button").hide();

  stopMusic();
  menuMusic.play();
}

function init() {
  initShowHide();
  stopMusic();
  ingameMusic[igIdx].play();

  canvas = $("#gameCanvas")[0];
  ctx = canvas.getContext("2d");

  //새 게임 로드시 벽돌 다시 초기화
  createBricks();

  // 뒷배경 초기화(쉬움 모드)
  document.getElementById("labArea").innerHTML = playjsHTML;

  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  ballRadius = 10;
  dx = Math.floor(Math.random() * 16 - 8);
  dy = -Math.sqrt(v_s - dx*dx);
  console.log(dx, dy, dx*dx+dy*dy);

  paddleHeight = 10;
  paddleWidth = 180;
  paddleX = (canvas.width - paddleWidth) / 2;
  rightPressed = false;
  leftPressed = false;

  isGameOver = false;   //게임 상태 초기화
  score = 0;

  draw();
}

function initShowHide() {
  $(".menu-page").hide();             //  이것도 필요!
  $("#game-area").show();            //  이거 반드시 있어야 함!!
  $("#gameCanvas").show();
  $("#game-buttons").show();
  $("#startBtn, #pauseBtn").show();   // 재시작,일시정지 버튼 보이기
  $("#restartBtn, #ingame-to-menu-button").hide();     //  게임오버 시 출력되었던 버튼 숨김
  $("#game-over-massage").hide();
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
      // 아래는 난수를 이용해 공이 바에 튕길때 각도를 약간 조절해주는 코드
      ran = Math.random() * 5 - 2.5;
      console.log("dx, ran: ", dx, ran);
      if (((dx+ran) < 2 && (dx+ran > -2)) && (Math.floor(Math.random() * 6) == 0)) {
        dx *= 3;
        console.log("dx *3: ", dx, ran);
      }
      while ((v_s - (dx+ran)*(dx+ran) <= 0) || ((dx + ran < 0.5) && (dx + ran > -0.5))) {
        ran = Math.random() * 5 - 2.5;
        console.log("ran 다시: ", dx, ran);
      }
      dx += ran;
      dy = -Math.sqrt(v_s - dx*dx);
    } else {
      isGameOver = true; // 다시 그리지 않도록 플래그 설정
      gameOver();
      return; // draw() 탈출
    }
  }

  ballX += dx;
  ballY += dy;

  // 막대 이동
  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 12;
  else if (leftPressed && paddleX > 0) paddleX -= 12;

  requestAnimationFrame(draw);

  //클리어 메세지
  if (checkClear()) {
    isGameOver = true;
    stopMusic();
    setTimeout(() => {
      alert("🎉 클리어! 점수: " + score + "\n다시 시작합니다.");
      document.location.reload();
    }, 10);
    return;
  }
}

// 게임 오버 처리
function gameOver() {
  $("#startBtn,#pauseBtn").hide();   // 재시작,일시정지 버튼 숨기기
  $("#restartBtn, #ingame-to-menu-button").show();  // 게임 오버 후 다시 시작 버튼만 보이기
  $("#game-over-massage").show();
  stopMusic();
  gameOverMusic[0].play();
}

function stopMusic() {
  for (let i = 0; i < gameOverMusic.length; i++) {
    gameOverMusic[i].pause();
    gameOverMusic[i].currentTime = 0;
    ingameMusic[i].pause();
    ingameMusic[i].currentTime = 0;
  }
  menuMusic.pause();
  menuMusic.currentTime = 0;
}

function setVolume(vol) {
  vol = vol / 100 * 0.5;
  gameOverMusic.forEach(function(audio) {
    audio.volume = vol;
  })
  ingameMusic.forEach(function(audio) {
    audio.volume = vol;
  })
  ingameMusic[1].volume = ingameMusic[1].volume * 0.8;
  menuMusic.volume = vol;
}

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



