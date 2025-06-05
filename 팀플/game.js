// === 전역 변수 ===
let canvas, ctx;
let ballX, ballY, ballRadius, dx, dy, ran = 0;
let paddleX, paddleHeight, paddleWidth;
let rightPressed = false;
let leftPressed = false;
let isGameOver = true;
let isPaused = false;
let igIdx = 0;
const v_s_fast = 128;
const v_s_slow = 72;
let v_s = v_s_fast;

//점수 용 전역변수
let score = 0;

// 게임 오버
let uDiedMsg;

//폭탄 사진
const bombImg = new Image();
bombImg.src = 'images/bomb.jpg';

// 음악용
const gameOverMusicPath = ["musics/gameover/cd-stop.mp3", "musics/gameover/u-died.mp3"];
const gameOverMusic = [];
const ingameMusicPath = ["musics/ingame/iwbtb.mp3", "musics/ingame/train.mp3", "musics/ingame/acidrain.mp3"];
const ingameMusic = [];
const menuMusic = new Audio("musics/etc/main.mp3");

for (let i = 0; i < ingameMusicPath.length; i++) {
  const igPath = ingameMusicPath[i];
  const audio2 = new Audio(igPath);

  ingameMusic.push(audio2);

  ingameMusic[i].loop = true;
  ingameMusic[i].volume = 0.25;
}
for (let i = 0; i < gameOverMusicPath.length; i++) {
  const goPath = gameOverMusicPath[i];
  const audio1 = new Audio(goPath);

  gameOverMusic.push(audio1);

  gameOverMusic[i].volume = 0.25;
}
ingameMusic[1].volume = ingameMusic[1].volume * 0.6;
menuMusic.volume = 0.2;
menuMusic.loop = true;


//이 아래는 벽돌배열입니다.

//벽돌에 대응되는 태그들
const destructibleElements = [
  { selector: "#title", label: "타이틀 제거", effect: "remove" },
  { selector: ".lab.calculator", label: "계산기 색상", effect: "changeColor", color: "red" },
  { selector: ".lab.gugudan", label: "구구단 강조", effect: "changeColor", color: "skyblue" },
  { selector: ".lab.numGame", label: "숫자맞추기", effect: "changeColor", color: "black" }
];

// 벽돌 관련 설정
let brickRowCount = 6;
let brickColumnCount = 8;
const brickWidth = 118;
const brickHeight = 40;
const brickPadding = 2;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

//벽돌 이미지
const brickImage = new Image();
brickImage.src = "images/bricks.jpg";

// bricks 초기화 시 아래처럼
let bricks = [];
createBricks();

//브라우저 로딩시 실행.
$(window).ready(function() {
  canvas = $("#gameCanvas")[0];
  ctx = canvas.getContext("2d");
  $("#game-wrapper").hide();
  $("#start-button").on("click", showLevelSelectionPage);
  $("#options-button").on("click", showOptions);
  $("#guitar-button").on("click", showGuitar);
  $(".game-start").on("click", init);
  $(".back-button").on("click", showMainMenu);

  $(this).on("mousemove", function(e) {
    paddleX = e.pageX;
    if (paddleX >= canvas.width - paddleWidth) {
      paddleX = canvas.width - paddleWidth;
    }
    else if (paddleX <= 0) {
      paddleX = 0;
    }

  });


  $(".bs-radio").on("change", function() {
    $(".bs-label").removeClass("selected");

    $(this).parent(".bs-label").addClass("selected");
  });

  $(".volume-bar").on("input", function() {
    let vol = $(this).val();

    $(".volume-bar").val(vol);
    $(".volume").html(vol);

    setVolume(vol);
  });

  $("#music-select").on("input", function() {
    igIdx = $(this).val();
  });

  $(document).on("keydown", function(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  });

  $(document).on("keyup", function(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;

    if (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "e") {
      if (isPaused) {
        isPaused = false;
        $("#pause-panel").hide();
        $("html").css({"cursor":"none"});
        requestAnimationFrame(draw);
      }
      else {
        isPaused = true;
        $("#pause-panel").show();
        $("html").css({"cursor":"default"});
      }
      console.log("isPaused is ", isPaused);
    }

    if (e.key.toLowerCase() === "r") {
      stopMusic();
      isGameOver = true;
      clearTimeout(uDiedMsg);
      setTimeout(function() {
        init();
      }, 10);
    }
    if (e.key.toLowerCase() === "q") {
      showMainMenu();
    }
  });

  brickImage.onload = () => {
    console.log("벽돌 이미지 로드 완료");
  };
  brickImage.onerror = () => {
    console.error("벽돌 이미지 로드 실패!");
    alert("벽돌 이미지 로드 실패! 게임을 시작할 수 없습니다. 'bricks.jpg' 파일이 있는지 확인해주세요.");
  };

  gameOverMusic[0].addEventListener("ended", function() {
    gameOverMusic[1].play();
  })

  $("#menu-music-button, #intro-to-main").on("click", function() {
    menuMusic.play();
  })
});


function showLevelSelectionPage() {
  $("#main-menu").hide();
  $("#level-selection").show();

  $("#game-wrapper").hide();
}

function showOptions() {
  $("#main-menu").hide();
  $("#options").show();
}

function showGuitar() {
  $("#main-menu").hide();
  $("#guitar").show();
}

function showMainMenu() {
  $(".menu-page").hide();

  $("#main-menu").show();

  $("#game-wrapper").hide();
  $("#ps").hide();
  $("html").css({"cursor":"default"});

  isGameOver = true;
  isPaused = false;
  stopMusic();
  menuMusic.play();
}

function init() {
  if (!isGameOver) {
    console.log("게임오버상태가 아니므로 init()을 호출할 수 없음");
    return;
  }
  isGameOver = false;
  isPaused = false;
  $("#pan").css({"background-color":"transparent"});

  initShowHide();
  stopMusic();
  ingameMusic[igIdx].play();

  bricks = [];
  createBricks();

  let ballSpeed = $(".bs-label.selected .bs-radio").val();
  if (ballSpeed == "slow") {
    v_s = v_s_slow;
    console.log("속도 느림");
  } else if (ballSpeed == "fast") {
    v_s = v_s_fast;
    console.log("속도 빠름");
  } else {
    console.log("???? 속도 왜이럼");
  }

  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  ballRadius = 10;
  dx = Math.floor(Math.random() * 16 - 8);
  dy = -Math.sqrt(v_s - dx * dx);
  console.log(dx, dy, dx * dx + dy * dy);

  paddleHeight = 10;
  paddleWidth = 180;
  paddleX = (canvas.width - paddleWidth) / 2;
  rightPressed = false;
  leftPressed = false;

  score = 0;

  if (intervalId) {
    clearInterval(intervalId);
  }
  blockDownCount = 0;
  intervalId = setInterval(() => {
    if (!isPaused && !isGameOver) {
      moveBricksDown();
      collisionDetection();
      blockDownCount++;
    }
    if (blockDownCount >= 3) {
      clearInterval(intervalId);
    }
  }, 5000);


  requestAnimationFrame(draw);
}

function initShowHide() {
  $(".menu-page").hide();
  $("#game-wrapper").show();
  $("#gameCanvas").show();
  $("#ps").show();
  $(".pop-up-massage").hide();
  $("#pause-panel").hide();

  $("html").css({"cursor":"none"});
   //실습 iframe 업데이트
  updateIframe(); 
}

function createBricks(addRow = false) {
  const bombCount = 2;
  const bombPositions = [];

  // 폭탄 위치 랜덤 지정
  while (bombPositions.length < bombCount) {
    const c = Math.floor(Math.random() * brickColumnCount);
    const r = addRow ? 0 : Math.floor(Math.random() * brickRowCount);
    const key = `${c}-${r}`;
    if (!bombPositions.includes(key)) {
      bombPositions.push(key);
    }
  }

  // 벽돌 행 추가 모드
  if (addRow) {
    for (let c = 0; c < brickColumnCount; c++) {
      if (!bricks[c]) bricks[c] = [];

      // 한 칸씩 아래로 밀기
      for (let r = bricks[c].length - 1; r >= 0; r--) {
        bricks[c][r + 1] = { ...bricks[c][r] };
        bricks[c][r + 1].y += brickHeight + brickPadding;
      }

      const isBomb = bombPositions.includes(`${c}-0`);
      const element = destructibleElements[Math.floor(Math.random() * destructibleElements.length)];

      bricks[c][0] = {
        x: c * (brickWidth + brickPadding) + brickOffsetLeft,
        y: brickOffsetTop,
        status: 1,
        isBomb: isBomb,
        targetSelector: element?.selector,
        tagLabel: element?.label,
        effect: element?.effect,
        color: element?.color
      };
    }
  }

  // 처음부터 전체 벽돌 만들기
  else {
    let index = 0;
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        const isBomb = bombPositions.includes(`${c}-${r}`);
        const element = destructibleElements[index % destructibleElements.length];

        bricks[c][r] = {
          x: c * (brickWidth + brickPadding) + brickOffsetLeft,
          y: r * (brickHeight + brickPadding) + brickOffsetTop,
          status: 1,
          isBomb: isBomb,
          targetSelector: element?.selector,
          tagLabel: element?.label,
          effect: element?.effect,
          color: element?.color
        };

        index++;
      }
    }
  }
}


function moveBricksDown() {
  if (isGameOver) {
    return;
  }

  createBricks(true);

  let currentMaxRowY = 0;
  for (let c = 0; c < brickColumnCount; c++) {
    if (bricks[c] && bricks[c].length > 0) {
      for (let r = bricks[c].length - 1; r >= 0; r--) {
        const brick = bricks[c][r];
        if (brick && brick.status === 1) {
          currentMaxRowY = Math.max(currentMaxRowY, brick.y + brickHeight);
          break;
        }
      }
    }
  }

  const gameOverLine = canvas.height - paddleHeight - ballRadius;

  if (currentMaxRowY >= gameOverLine) {
    isGameOver = true;
    clearInterval(intervalId);
    gameOver();
    return;
  }

  console.log("벽돌 내려옴");
}

let intervalId = setInterval(() => {
  moveBricksDown();
  collisionDetection();
}, 5000);

function draw() {
  console.log("draw() 실행");
  if (isGameOver || isPaused) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();

  collisionDetection();

  bounceBall();

  ballX += dx;
  ballY += dy;

  if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 12;
  else if (leftPressed && paddleX > 0) paddleX -= 12;

  if (checkClear()) {
    isGameOver = true;
    clearInterval(intervalId);
    stopMusic();
    setTimeout(() => {
      alert("🎉 클리어! 점수: " + score + "\n다시 시작합니다.");
      document.location.reload();
    }, 10);
    return;
  }

  requestAnimationFrame(draw);
}

function bounceBall() {
  if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) dx = -dx;

  if (ballY + dy < ballRadius) dy = -dy;
  else if (ballY + dy > canvas.height - ballRadius) {
    const buffer = 10;
    if (ballX > paddleX - buffer && ballX < paddleX + paddleWidth + buffer) {
      ran = Math.random() * 5 - 2.5;
      temp = dx;
      console.log("dx, ran: ", dx, ran);
      if (((dx + ran) < 3 && (dx + ran > -3)) && (Math.floor(Math.random() * 3) == 0)) {
        dx *= 3;
        console.log("dx *3: ", dx, ran);
      }
      else if (((dx + ran) > 9 || (dx + ran < -9)) && (Math.floor(Math.random() * 3) == 0)) {
        dx /= 3;
        console.log("dx /3: ", dx, ran);
      }
      let count = 0;
      while ((v_s - (dx + ran) * (dx + ran) <= 0) || ((dx + ran < 0.5) && (dx + ran > -0.5))) {
        ran = Math.random() * 5 - 2.5;
        console.log("ran 다시: ", dx, ran);
        count++;
        if (count == 5) {
          dx = 0;
          console.log("무한루프로 dx재설정: ", dx, ran);
          break;
        }
      }
      dx += ran;
      if (temp * dx < 0) {
        dx = -dx;
        console.log("x방향 재설정 현재 temp, dx: ", temp, dx);
      }
      dy = -Math.sqrt(v_s - dx * dx);
      console.log("최종 v: ", dx, dy, dx * dx + dy * dy);
    }
    else {
      isGameOver = true;
      gameOver();
      return;
    }
  }
}

function gameOver() {
  stopMusic();
  gameOverMusic[0].play();
  drawBall();
  $("#pan").css({"background-color":"red"});

  uDiedMsg = setTimeout(function() {
    $(".pop-up-massage").fadeIn(200);
  }, 1000);
}

function stopMusic() {
  for (let i = 0; i < gameOverMusic.length; i++) {
    gameOverMusic[i].pause();
    gameOverMusic[i].currentTime = 0;
  }
  ingameMusic.forEach(function(audio) {
    audio.pause();
    audio.currentTime = 0;
  })
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

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    if (bricks[c]) {
      for (let r = 0; r < bricks[c].length; r++) {
        const b = bricks[c][r];
        if (b && b.status === 1) {
          if (brickImage.complete) {
            ctx.drawImage(brickImage, b.x, b.y, brickWidth, brickHeight);
          }

          if (b.tagLabel) {
            ctx.font = "12px Arial";
            //ctx.textAlign = "center";
            // ctx.textBaseline = "middle";
            ctx.fillStyle = b.isBomb ? "red" : "#fff";
            const label = b.isBomb ? "💣" : b.tagLabel;
            ctx.fillText(label, b.x + 10, b.y + 20);
          }
        }
      }
    }
  }
}

function destroyBrick(c, r) {
  const b = bricks[c][r];
  if (b.status === 0) return;

  b.status = 0;
  score += 10;

  const iframe = document.getElementById("labFrame");
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  if (!iframeDoc) return;

  // 대상 요소 찾기
  const target = iframeDoc.querySelector(b.targetSelector);
  if (!target) return;

  // 효과에 따라 처리
  if (b.effect === "remove") {
    target.remove();
  } else if (b.effect === "changeColor" && b.color) {
    target.style.backgroundColor = b.color;
  }

  // 폭탄이면 주변도 연쇄 파괴
  if (b.isBomb) {
    const directions = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
    ];
    for (const [dc, dr] of directions) {
      const nc = c + dc;
      const nr = r + dr;
      if (
        nc >= 0 && nc < brickColumnCount &&
        nr >= 0 && nr < (bricks[nc] ? bricks[nc].length : 0)
        ) {
        destroyBrick(nc, nr);
    }
  }
}
}



function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    if (bricks[c]) {
      for (let r = 0; r < bricks[c].length; r++) {
        let b = bricks[c][r];
        if (b && b.status === 1) {
          if (
            ballX > b.x &&
            ballX < b.x + brickWidth &&
            ballY > b.y &&
            ballY < b.y + brickHeight
            ) {
            dy = -dy;
          destroyBrick(c, r);

          const labArea = document.querySelector("#labArea");
          const target = labArea?.querySelector(b.targetSelector);
          if (target) target.remove();
        }
      }
    }
  }
}
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#f99c05";
  ctx.fillText("Score: " + score, 8, 20);
}

function checkClear() {
  for (let c = 0; c < brickColumnCount; c++) {
    if (bricks[c]) {
      for (let r = 0; r < bricks[c].length; r++) {
        if (bricks[c][r] && bricks[c][r].status === 1) return false;
      }
    }
  }
  return true;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#26a6d8";
  if (isGameOver) {
    ctx.fillStyle = "red";
  }
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0f0";
  ctx.fill();
  ctx.closePath();
}

//아이프레임 영역을 업데이트
function updateIframe() {
  const htmlCode = `<header>
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
  <div class="scaled">
    <div id="content">
      <!-- Put contents here. -->
      <div class="lab calculator">
        <h3> 덧셈 계산기 </h3>
        <form name="myform">
          첫번째 정수:
          <input id="x" /><br/>
          두번째 정수:
          <input id="y" /><br/>
          합계:
          <input id="sum" /><br/>
          <input type="button" value="계산" id="addButton" />
        </form>
      </div>

      <div class="lab gugudan">
        <!-- 테이블 테두리는 collapse, 가운데 정렬, trtd와 관련은 반복문, 테이블 관련은 css, text align ceter같은거. -->
        <!-- html 문서에 바로 스크립트 열고 집어넣기,trtd가 8개 -->
        <h3>구구단 표</h3>
        <table border="2">
          <tr>
            <script>
              for(i=2;i<=9;i=i+1){
                document.write("<th>"+i+"단"+"</th>");
              }
            </script>
          </tr>

          <script>
            for(k=1;k<=9;k=k+1){
              document.write("<tr>");
              for(j=2;j<=9;j=j+1){
                document.write("<td>"+j+"x"+k+"="+j*k+"</td>");
              }
              document.write("</tr>");
            }


          </script>
        </table>
      </div>

      <div class="lab numGame">
        <h3>숫자 맞추기 게임</h3>
        <p>이 게임은 컴퓨터가 생성한 숫자를 맞추는 게임입니다<br>
        숫자는 1부터 100 사이에 있습니다.</p><br>
        <form>
          숫자:
          <input type="text" id="user" size="5">
          <input type="button" value="확인"  id="numGuess">
          <input type="button" value="다시시작"  id="numReplay">
          <br><br>
          추측횟수:
          <input type="text" id="guesses" size="5">
          힌트: 
          <input type="text" id="result" size="16">
          <input type="text" id="randomNum" size="16">
        </form>

      </form>

    </div>

    <div class="lab wordBook">
      <h3>단어장</h3><br>
      <button class="wordButton"  id="addWord" >단어 추가</button>
      <button class="wordButton"  id="showWordList" >단어 리스트 보기</button>
      <button class="wordButton"  id="sortWord" >단어 정렬</button>
      <button class="wordButton"  id="shuffleWord" >단어 섞기</button>
      <br><br><p><strong>단어 리스트</strong></p><br>


      <!-- 여기서 우리가 수행한 문자열 출력 -->
      <div id="wordList"></div> 
    </div>

    <div class="lab clickHere">
      <h2> innerHTML TEST </h2>
      <p id="innerTest">여기를 눌러 보세요.</p>
    </div>

    <div class="lab image-toggle">
      <img src="projects/easy-mode/img1.jpg" id="image" width="350" height="200">
      <input type="button" id="imageButton" value="눌러보세요" />
    </div>

    <div class="lab colorList">
      <h3>색상 테이블 출력하기</h3>
      <input type="button" id="ctCreate" value="출력하기"/>
      <input type="button" id="ctRemove" value="없애기" />
      <div id="colorTable"></div>
    </div>

    <div class="lab flashBox">
      <div id="target">
        This is a Text.
      </div>
      <button id="stopColor">중지</button>
    </div>

    <div class="lab movingBox">
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
        <img id="hangmanpic" src="projects/easy-mode/hangman/hangman6.gif" alt="hangman" />
      </div>
      <div id="clue">Press New Game to play!</div>
      <div>
        <input id="hguess" type="text" size="1" maxlength="1 /">
        <button id="guessButton" disabled="disabled">Guess</button>
      </div>
      <div id="newgamearea">
        <button id="newGame">New Game</button>
      </div>
      <div id="guessstr"></div>
    </div>

  </div>
</div>
<footer>
  <p>Web programming, Spring 2025</p>
  <p>Created by 202411235 강동훈</p>
</footer>`;

//css 코드의 시작
const cssCode=`*{margin: 0; padding: 0;}

body {
  font-family:  "Winky Sans", sans-serif;
  background-color: white;
}

li {list-style: none;}
a{text-decoration: none;}
img{border: 0;}

header {
  width: 100%;
  margin: 0 auto;     /* 가운데 정렬 */
  /*height: 80px;*/
  background-color: #f6f9d4;
  position: fixed;
  top: 0;
  padding: 40px 30px 0 30px ;

  z-index: 100;
}

#title {
  height: 40px;
  text-align: center;
  font-size: 30px;
  font-weight: bold;

}

header>nav{height: 40px; overflow: hidden;}

#ctime{
  width: 250px;
  height: 36px;
  float: right;
  border: 1px dashed orange;
  border-radius: 15px;
  text-align: center;
  line-height: 36px;
}

.main-menu{
  display: block;
  float: left;
  width: 100px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  color: black;
  text-decoration: underline;

}

#content{
  margin-top: 120px;
  padding: 10px;
}

footer{
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
  background-color: #d2f299;
  box-sizing: border-box;
}

footer>p{
  font-weight: bold;
  text-align: center;
}

.lab{
  padding: 10px;
  border: 1px solid black;
  margin-top: 10px;
}

table {
  border-collapse: collapse ;
  width:20px;
  text-align: center;
}

.wordButton{
  display: inline-block;
  width: 150px;
}

#wordList{
  font-size: 24px;
  font-weight: bold;
  color: blue;
}

#hangman{
  text-align: center;
}

#newgamearea{
  margin-top: 2em;
}

#clue,#guessstr{
  font-family: monospace;
  font-size: 2em;
  padding:1em;
}


#container {
  width: 400px;
  height: 400px;
  position: relative;
  background-color: yellow;

  z-index: 1;
}

#animate {
  width: 50px;
  height: 50px;
  position: absolute;
  background-color: red;

  z-index: 2;
}`;   //css 코드의 끝

//js 코드의 시작
const jsCode=`console.log("JS 동작 중!")
console.log("Hello from JS!");


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
      else if(now.getMonth==5)
      m="June";

      let s=m+" "+ now.getDate()+". "+ now.getHours()+" : "+now.getMinutes()+" : "+now.getSeconds();
      var table = document.getElementById('ctime');
      if(table != null){
        document.getElementById('ctime').innerHTML=s;
      }
      setTimeout(setClock,1000);
    }

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




    function updatePage() {
      document.getElementById("hangmanpic").src = "projects/easy-mode/hangman/hangman" + guessCount + ".gif";

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




    function changeImage(){
      var img=document.getElementById("image");
      console.log(img.src);

      var bimg=document.getElementById("image");
      var sarray=bimg.src.split('/');
      var str=sarray[sarray.length-1]; //이게 파일 이름에 해당함.
      if(str=="img1.jpg")
      bimg.src="projects/easy-mode/img2.jpg";
      else
      bimg.src="projects/easy-mode/img1.jpg";
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
`;


const css = `<style>${cssCode}</style>`;
const js = `<script>${jsCode}<\/script>`;

const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
              ${css}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Sour+Gummy:ital,wght@0,100..900;1,100..900&family=Winky+Sans:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
            </head>
          <body>
              ${htmlCode}
              ${js}
          </body>
        </html>
`;

const iframe = document.getElementById("labFrame");
const doc = iframe.contentDocument || iframe.contentWindow.document;
doc.open();
doc.write(fullHTML);
doc.close();
}
