// === 전역 변수 ===

//테크니컬한 쪽
let canvas, ctx; // 캔버스 쪽

//키 입력 관련
let rightPressed = false;
let leftPressed = false;
let isGameOver = true;
let isPaused = false;

//공 크기 관련
let ballX, ballY, ballRadius, dx, dy, ran = 0;

//아래의 블럭 바 관련
let paddleX, paddleHeight, paddleWidth;
const paddleImage = new Image();
paddleImage.src = "images/paddle-asset/joystickVer2.png";


//공 속도 관련
const v_s_fast = 128;//빠름일때 공 속도
const v_s_slow = 72;//느림일때 공 속도
let v_s = v_s_slow;//기본 속도 = 느림
//난이도 관련
let difficulty; //이건 난이도를 정함 -> Select-Mode에서 결정 후 넘겨받음
let difficultyStr = ["easy", "normal", "hard"];

// 테스트용 updateIframe에 css 쪽 보면 씀
let testFlag = true;

//하드모드 시간제한 변수
let hardModeTimer = null;
let timerDisplay = null;
let remainingTime = 60;

//점수 용 전역변수
let score = 0;
let scoreEffects = [];  // 여러 개 동시에 떠오르게 하기 위해 배열로

//경고 효과
let warningEffect = null;

// 게임 오버
let uDiedMsg;

//설정에서 바꿀 수 있는 것들

//공 이미지
var ballImage = new Image();

// 음악용
const gameOverMusicPath = ["musics/gameover/cd-stop.mp3", "musics/gameover/u-died.mp3"];
const gameOverMusic = [];
const ingameMusicPath = ["musics/ingame/iwbtb.mp3", "musics/ingame/train.mp3", "musics/ingame/acidrain.mp3"];
const ingameMusic = [];
const menuMusic = new Audio("musics/etc/main.mp3");
let igIdx = 0;//인게임 뮤직 변수에서 어떤 값을 플레이할 것인가? -> setting 쪽에서 넘겨받음


//인게임 음악 바인딩
for (let i = 0; i < ingameMusicPath.length; i++) {
  const igPath = ingameMusicPath[i];
  const audio2 = new Audio(igPath);

  ingameMusic.push(audio2);

  ingameMusic[i].loop = true;
  ingameMusic[i].volume = 0.25;
}


//게임오버 뮤직 바인딩

for (let i = 0; i < gameOverMusicPath.length; i++) {
  const goPath = gameOverMusicPath[i];
  const audio1 = new Audio(goPath);

  gameOverMusic.push(audio1);

  gameOverMusic[i].volume = 0.25;
}
ingameMusic[1].volume = ingameMusic[1].volume * 0.6;
menuMusic.volume = 0.2;
menuMusic.loop = true;
gameOverMusic[1].loop = true;


// 캔버스 크기
const canvasWidth = 900;  //우리 코드에서는 900px
const canvasHeight = 900;


let paddleHitEffect = 0; // 이펙트 강도 (0이면 없음)



//게임 관련 변수들


//이 아래는 벽돌배열입니다.
//벽돌에 대응되는 태그들
//벽돌위에 글씨를 넣고싶다면 label: "원하는 메세지"  이렇게 추가하세요
//{ selector: "#title", label: "타이틀 제거", effect: "remove" }, 
const desEleEasy = [
  {selector: "#header", effect: "remove"},
  {selector: "main-aside", effect: "remove"},
  {selector: "footer", effect: "remove"},
  {selector: "article-title", effect: ""},
  {selector: "article-date", effect: ""},
  {selector: "article-header", effect: ""},
  {selector: "article-body", effect: ""}
];

const desEleNormal = [
  { selector: "#title", effect: "remove" },
  { selector: ".lab", effect: "remove", name: "div"},
  { selector: "none"},
];

const desEleHard=[{ selector: ".lab.calculator", effect: "breakCalculator" }];

//이 아래는 이팩트 관련 설정들입니다. (매핑객체, 함수를 값으로 가지는 테이블)
const effectHandlers = {
  remove: (target) => {
    target.remove();
  },
  changeColor: (target, b) => {
    if (b.color) target.style.backgroundColor = b.color;
  },
  breakCalculator: (target, b, iframeDoc) => {
    const script = iframeDoc.createElement("script");
    script.innerHTML = `
      const addBtn = document.getElementById("addButton");
      if (addBtn) {
        addBtn.disabled = true;
        addBtn.value = "망가짐 😵";
      }
      const sum = document.getElementById("sum");
      if (sum) {
        sum.value = "ERROR!";
      }
    `;
    iframeDoc.body.appendChild(script);

    // ====== 연기 효과 표시 ======
    const rect = target.getBoundingClientRect();
    const iframeRect = document.getElementById("labFrame").getBoundingClientRect();

    const x = rect.left - iframeRect.left + rect.width / 2;
    const y = rect.top - iframeRect.top + rect.height / 2;

    showLabEffect(x, y);
  },
  // 앞으로 추가할 것들 계속 여기 정의
  // "breakWordList": (target, b, iframeDoc) => {...}
};



let totalTitleNum = 1;
let totalDivNum = 6; // 삭제할 div 개수

// 벽돌 관련 전역 변수들
let extraRow = 0;
let hiddenRowNum;
let brickRowCount = 2;
let brickColumnCount = 4;
const brickHeight = 36;
const brickPadding = 2;
const brickOffsetTop = 50;
const brickOffsetLeft = 5;
const brickWidth = (850 -(brickPadding*(brickColumnCount-1) + 2*brickOffsetLeft)) / brickColumnCount;

// 벽돌 전체 너비/높이 계산
const totalBrickWidth = brickColumnCount * (brickWidth + brickPadding) - brickPadding;
const totalBrickHeight = brickRowCount * (brickHeight + brickPadding) - brickPadding;

//벽돌 이미지
const brickImage = new Image();
brickImage.src = "images/block-asset/bricks.png"; // 일반 벽돌

const bombImage = new Image();
bombImage.src = "images/block-asset/bomb.png"; // 폭탄 벽돌




//브라우저 로딩시 실행.
$(window).ready(function() {
  /*캔버스 얻어오기*/
  canvas = $("#gameCanvas")[0];
  ctx = canvas.getContext("2d");
  /*--------------*/ 

  $("#game-wrapper").hide();


  /*main-menu 버튼 - 함수 바인딩*/
  $("#start-button").on("click", showLevelSelectionPage);
  $("#options-button").on("click", showOptions);
  $("#guitar-button").on("click", showGuitar);
  /*--------------------------*/

  /*게임 모드 선택 버튼*/
  $("#easy-button").on("click", startEasyPage);
  $("#normal-button").on("click", startNormalPage);
  $("#hard-button").on("click", startHardPage);

  $(".back-button").on("click", showMainMenu);

  //난이도별 모드 설정 및 리셋
  $("#easy-button").on("click", function () {
    difficulty = 0;
    init();
  });

  $("#normal-button").on("click", function () {
    difficulty = 1;
    init();
  });

  $("#hard-button").on("click", function () {
    difficulty = 2;
    init();
  });

  //변수 초기화
  ballImage.src = "images/temp-ball/GyosuYouCheatMeBall.png";

  //시작 게임 화면 구성
  $(".start-page").show();

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
      clearInterval(intervalId);
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

//이지 노말 하드 선택 부분
function showLevelSelectionPage() {
  $("#main-menu").hide();
  $("#level-selection").show();
  $("#game-wrapper").hide();
}

function showOptions() {
  $(".menu-page").hide();
  $("#options-menu").show();
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


//Easy 시작
function startEasyPage() {
  //$(#Game-start-stroy).show
  difficulty = 0;
  init();
  initEasyGame();
}

function startNormalPage() {
  difficulty = 1;
  init();
  initNormalGame();
}

function startHardPage() {
  difficulty = 2;
  init();
  initHardGame();
}

function initEasyGame(){
  //게임 초기화

}
function initNormalGame(){
  //노멀 게임 초기화

}
function initHardGame(){
  //하드 게임 초기화

}

function playGame(){
  //init에서 초기화한 변수 가지고 게임 돌리도록 여기서 조정
  //매번 checkGameClear, checkGameOver 확인해야 함
}
function checkGameClear(var Mode){
  //Mode별 게임 클리어 조건 확인




  //만약 클리어했을 경우
  if(Mode == 0)
// $(".EasyClear-story").show
    //initEasyGame
  else if(Mode == 1)
    // $(".NormalClear-story").show
    //initHareGame()
  else if(Mode == 2)
    //하드 난이도일 때
    //$(".GameClear-story").show
  else{
    //???? 넌 누구임
  }

}

function checkGameOver(var Mode){

  //Mode(난이도) 별 게임 클리어 조건 확인


}
function init() {
  if (!isGameOver) {
    console.log("게임오버상태가 아니므로 init()을 호출할 수 없음");
    return;
  }
  testFlag = true;
  divCount = 0;
  isGameOver = false;
  remainingTime = 60;
  isPaused = false;
  if (timerDisplay) {
    timerDisplay.remove();
    timerDisplay = null;
  }
  $("#pan").css({"background-color":"transparent"});

  initShowHide();
  stopMusic();
  ingameMusic[igIdx].play();

  bricks = [];
  createBricks(); // 난이도에 상관없이 일단 생성

  if (difficulty == 2) {
    startHardModeTimer(); // 하드 모드일 때만 타이머 시작
  }

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
  console.log("현재 난이도: " + difficultyStr[difficulty]);

  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  ballRadius = 10;
  dx = Math.floor(Math.random() * 16    - 8);
  dy = -Math.sqrt(v_s - dx * dx);
  console.log(dx, dy, dx * dx + dy * dy);

  paddleHeight = 40;
  paddleWidth = 240;
  paddleX = (canvas.width - paddleWidth) / 2;
  rightPressed = false;
  leftPressed = false;

  score = 0;

  //난이도에 따른 벽돌 분기처리
  bricks = [];
  switch (difficulty) {
    case 0: {
      extraRow = 1;
      brickRowCount = 1;
      break;
    };
    case 1: {
      extraRow = 3;
      brickRowCount = 3;
      break;
    };
    case 2: {
      extraRow = 4;
      brickRowCount = 4;
    };
  }
  createBricks();

  intervalId = setInterval(() => {
    if (!isPaused && !isGameOver) {
      moveBricksDown();
    }
    if (hiddenRowNum <= 0) {
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

   //실습 iframe 업데이트
  updateIframe(); 
}

//벽돌 생성 함수(태그 대응까지)
function createBricks() {
  const bombCount = 4;
  const bombPositions = [];
  hiddenRowNum = extraRow;

  // 폭탄 위치 랜덤 지정
  while (bombPositions.length < bombCount) {
    const c = Math.floor(Math.random() * brickColumnCount);
    const r = Math.floor(Math.random() * (brickRowCount+extraRow));
    const key = `${c}-${r}`;
    if (!bombPositions.includes(key)) {
      bombPositions.push(key);
    }
  }

  let elements = createElementsByDifficulty(difficulty);

  elements = shuffleEmt(elements);
  console.log(elements);

  let eCount = 0; // elements의 원소를 하나씩 가져올거임
  let index = 0;
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount + extraRow; r++) {
      let element = elements[eCount++];
      const isBomb = bombPositions.includes(`${c}-${r}`);

      let isSecure = false;
      let secureState = false;
      let hp = null;

      if (difficulty != 0) {
        isSecure = Math.random() < 0.2;
        secureState = isSecure;
        if (isSecure) hp = 3;
      }

      bricks[c][r] = {
        x: c * (brickWidth + brickPadding) + brickOffsetLeft,
        y: (r - extraRow) * (brickHeight + brickPadding) + brickOffsetTop,
        status: r < extraRow ? 0 : 1,
        isBomb: isBomb,
        isHidden: 0,
        targetSelector: element?.selector,
        effect: element?.effect,
        color: element?.color,
        isSecure: isSecure,
        secureState: secureState,
        hp: hp
      };

      if (r < extraRow) {
        bricks[c][r].isHidden = 1; // 이걸로 숨겨진거 감지
        bricks[c][r].status = 0;
      }

      index++;
    }
  }

  console.log(createBricksStr());
}

// 2초마다 isSecure 벽돌 색/이미지 토글 함수 예시
function toggleSecureBricks() {
  for (let c = 0; c < bricks.length; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      const brick = bricks[c][r];
      if (brick && brick.isSecure) {
        // secureState를 반전시켜 이미지/색 변경
        brick.secureState = !brick.secureState;
        if (brick.secureState) {
          brick.color = 'red';
        }
      }
    }
  }
  drawBricks();
}

function createElementsByDifficulty(level) {
  let elements = [];

  if (level === 0) {
    elements = createEasyElements();
  } else if (level === 1) {
    elements = createNormalElements(); // 기존처럼 노말
  } else if (level === 2) {
    elements = createHardElements();   // 하드 요소들만 따로 준비
  }

  return shuffleEmt(elements);
}

function createEasyElements() {
  let elements = [];
  let newEmt = desEleEasy.find(element => element.selector === "#header");
  elements.push(newEmt);

  return elements;
}

function createNormalElements() {
  let elements = [];
  let newEmt = desEleNormal.find(element => element.selector === "#title");
  elements.push(newEmt);
  for (let i = 0; i < totalDivNum; i++) {
    let newEmt = desEleNormal.find(element => element.selector === ".lab");
    elements.push(newEmt);
  }
  for (let i = elements.length; i < brickRowCount*brickColumnCount + extraRow*brickColumnCount; i++) {
    let newEmt = desEleNormal.find(element => element.selector === "none");
    elements.push(newEmt);
  }

  return elements;
}

function createHardElements() {
  let elements = [];

  // 하드모드에서는 전부 calculator 블록으로만 구성
  const calculator = desEleHard.find(el => el.selector === ".lab.calculator");

  const totalBrickCount = (brickRowCount + extraRow) * brickColumnCount;

  for (let i = 0; i < totalBrickCount; i++) {
    elements.push(calculator);
  }

  return elements;
}

function moveBricksDown() {
  if (isGameOver || (hiddenRowNum <= 0)) {
    return;
  }

  hiddenRowNum -=1;

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount + extraRow; r++) {
      bricks[c][r].y = (r - hiddenRowNum) * (brickHeight + brickPadding) + brickOffsetTop;
    }
  }

  for (let i = 0; i < brickColumnCount; i++) {
    bricks[i][hiddenRowNum].isHidden = 0;
    bricks[i][hiddenRowNum].status = 1;
  }
  console.log("벽돌 내려왔음, "+ extraRow +"번 중" + (extraRow - hiddenRowNum) + " 번");
  
}

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
    // clearInterval(intervalId);

    testFlag = false;
    updateIframe();

    stopMusic();
    toTheNext();
    return;
  } 

  requestAnimationFrame(draw);
}


function toTheNext() {
  difficulty += 1;

  if (difficulty > 2) {
    isGameOver = true;
    showMainMenu();
    return;
  }
  clearInterval(intervalId);

  setTimeout(function() {
    init();
  }, 3000);
}

//개선판
function bounceBall() {
  //  1. 좌우 벽에 부딪히면 반사
  if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
    dx = -dx;
  }

  //  2. 위쪽 벽에 부딪히면 반사
  if (ballY + dy < ballRadius) {
    dy = -dy;
  }

  //  3. 아래쪽 - 패들과 충돌 체크
  else if (ballY + dy > canvas.height - ballRadius) {
    const paddleTop = canvas.height - paddleHeight;
    const paddleBottom = canvas.height;
    const buffer = 10; // 약간 여유를 줌

    const hitTopSurface =
    ballY + ballRadius + dy >= paddleTop &&  // 공의 바닥이 패들 윗면에 닿음
    ballY + ballRadius <= paddleBottom &&   // 공이 패들 아래로 완전히 들어가지 않음
    ballX >= paddleX - buffer &&
    ballX <= paddleX + paddleWidth + buffer;

    if (hitTopSurface) {
      //  패들 눌림 이펙트
      paddleHitEffect = 1.0;

      //  랜덤 튕김 방향 설정
      let ran = (Math.random() - 0.5) * 4;
      let temp = dx;

      // 너무 낮은 각도 방지 + 너무 가파른 각도 방지
      let newDx = dx + ran;
      let count = 0;
      console.log("초기 수정 Dx: "+ newDx);
      console.log(v_s - newDx*newDx, newDx*newDx, v_s/8);

      // 공이 너무 기울어져 있을 경우 보정
      if (v_s - newDx*newDx <= v_s/8) {
        if (Math.floor(Math.random() * 2) == 0) {
          newDx /= 2;
          console.log("dx 1/2배");
        }
        else console.log("dx 1/2배 하려다 말음");
      }
      else if (newDx*newDx <= v_s/8) {
        if (Math.floor(Math.random() * 2) == 0) {
          newDx *= 2;
          console.log("dx 2배");
        }
        else console.log("dx 2배 하려다 말음");
      }

      while (
        (v_s - newDx * newDx <= 0)
        )
      {
        ran = (Math.random() - 0.5) * 4;
        newDx = dx + ran;
        count++;
        if (count > 5) {
          newDx = 0;
          break;
        }
      }

      dx = newDx;

      // 방향 반전 고려
      if (temp * dx < 0) {
        dx = -dx;
      }

      //  수직 속도 계산 
      dy = -Math.sqrt(Math.max(1, v_s - dx * dx)); // 항상 양수 sqrt 보장
      console.log("공 튕김, 이전: "+temp+" 이후: "+newDx+" 총 속도: "+(newDx*newDx+dy*dy));
    }

    //  바닥 충돌 = 게임 오버
    else {
      isGameOver = true;
      gameOver();
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
      for (let r = hiddenRowNum; r < bricks[c].length; r++) {
        const b = bricks[c][r];
        if (b && b.status === 1) {
          const img = b.isBomb ? bombImage : brickImage;

          if (img.complete) {
            ctx.drawImage(img, b.x, b.y, brickWidth, brickHeight);
          }

          if (b.isSecure) {
            ctx.save();
            ctx.fillStyle = b.secureState ? "rgba(255, 0, 0, 0.5)" : "rgba(0, 0, 255, 0.5)";
            ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
            ctx.font = "16px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`🔒${b.hp ?? '?'}`, b.x + brickWidth / 2, b.y + brickHeight / 2);
            ctx.restore();
          }

          if (b.tagLabel) {
            ctx.font = "12px Winky Sans, Arial";
            ctx.fillStyle = "#fff";
            ctx.fillText(b.tagLabel, b.x + 10, b.y + 20);
          }
        }
      }
    }
  }
}

function destroyBrick(c, r) {
  console.log("벽돌 파괴 함수 호출");
  const b = bricks[c][r];
  if (b.status === 0) {
    console.log("b.status == 0 이므로 리턴");
    return;
  }

  if (b.isSecure) {
    if (typeof b.hp === "number") {
      b.hp--;
      if (b.hp > 0) return;
    }
  }

  b.status = 0;
  score += 10;

  // 점수 애니메이션 이펙트 추가
  scoreEffects.push({
    x: b.x + brickWidth / 2 - 10, // 벽돌 가운데
    y: b.y + brickHeight / 2,
    value: "+10",
    opacity: 1.0
  });

  if (score >= 50 && !warningEffect) {
    warningEffect = {
      text: "Lab Destroyed! Waring!",
      opacity: 1.0,
      y: canvas.height / 2,
      scale: 1.0
    };
  }

  const iframe = document.getElementById("labFrame");
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  if (!iframeDoc) {
    console.log("ifameDoc == null 이므로 리턴");
    return;
  }

  console.log("블럭 파괴:", c, r, "폭탄임?", b.isBomb);
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
        bricks[nc] &&
        nr >= 0 && nr < (bricks[nc].length)
        ) {
        destroyBrick(nc, nr);
    }
  }
  console.log(createBricksStr());
}

  // 대상 요소 찾기
const target = iframeDoc.querySelector(b.targetSelector);
if (!target) {
  console.log("iframDoc의 타겟이 null이므로 리턴, " + b.targetSelector);
  return;
}

const handler = effectHandlers[b.effect];
if (handler) {
    handler(target, b, iframeDoc); // 필요한 인자 전달
  }

} //destroyBirkcs 끝

// 디버깅용
function createBricksStr() {
  bricksStr = "폭탄 위치(1이면 폭탄): \n";
  for (let j = 0; j < bricks[0].length; j++) {
    for (let i = 0; i < bricks.length; i++) {
      bricksStr += (bricks[i][j].isBomb) ? "1 " : "0 ";
    }
    bricksStr += "\n";
  }
  return bricksStr;
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
            ballY < b.y + brickHeight) {
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
  ctx.font = "16px 'Press Start 2P'";
  ctx.fillStyle = "#fff";
  ctx.fillText("SCORE: ", 15, 25);
  ctx.fillText(score, 140, 25);

  $("#scoreBoard").text("Score: "+score);

  // 떠오르는 점수 이펙트 그리기
  for (let i = 0; i < scoreEffects.length; i++) {
    const fx = scoreEffects[i];
    ctx.fillStyle = `rgba(255, 255, 0, ${fx.opacity})`;
    ctx.fillText(fx.value, fx.x, fx.y);

    fx.y -= 0.5;        // 위로 이동
    fx.opacity -= 0.02; // 천천히 사라짐
  }

  // 사라진 것들 제거
  scoreEffects = scoreEffects.filter(fx => fx.opacity > 0);

  if (warningEffect) {
    ctx.save();
    ctx.font = `bold ${30 * warningEffect.scale}px 'Press Start 2P', Arial`;
    ctx.fillStyle = `rgba(255, 50, 50, ${warningEffect.opacity})`;
    ctx.textAlign = "center";
    ctx.shadowColor = "red";
    ctx.shadowBlur = 10;
    ctx.fillText(warningEffect.text, canvas.width / 2, warningEffect.y);
    ctx.restore();

  // 애니메이션 처리
    warningEffect.opacity -= 0.01;
    warningEffect.scale += 0.01;
    warningEffect.y -= 0.3;

    if (warningEffect.opacity <= 0) {
    warningEffect = null; // 효과 끝나면 제거
  }
}
}

function checkClear() {
  for (let c = 0; c < brickColumnCount; c++) {
    if (bricks[c]) {
      for (let r = 0; r < bricks[c].length; r++) {
        if (bricks[c][r] && (bricks[c][r].status === 1 || bricks[c][r].isHidden === 1)) return false;
      }
    }
  }
  return true;
}

function drawBall() {
   ctx.save(); // 현재 상태 저장

   ctx.beginPath();
   ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.clip(); // 이후 그리는 건 원 내부로 제한됨

  // 이미지 그리기 (중앙에 오도록 위치 조정)
  ctx.drawImage(
    ballImage,
    ballX - ballRadius,
    ballY - ballRadius,
    ballRadius * 2,
    ballRadius * 2
    );
  ctx.restore(); 
  ctx.closePath();
}

function drawPaddle() {
  const y = canvas.height - paddleHeight;

  if (paddleImage.complete) {
    ctx.save();

    // 이펙트 있을 때 어둡게 표현
    if (paddleHitEffect > 0) {
      ctx.filter = `brightness(${1 - paddleHitEffect * 0.5})`; // 어두워짐
    }

    ctx.drawImage(paddleImage, paddleX, y, paddleWidth, paddleHeight);

    ctx.restore();

    // 점점 효과 줄이기
    if (paddleHitEffect > 0) {
      paddleHitEffect -= 0.02;
      if (paddleHitEffect < 0) paddleHitEffect = 0;
    }
  } 
  else {
    // 이미지 로딩 안됐을 경우 기본 막대
    ctx.beginPath();
    ctx.rect(paddleX, y, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0f0";
    ctx.fill();
    ctx.closePath();
  }
}

// 벽돌에 태그 랜덤으로 먹이기용 랜덤함수
function shuffleEmt(emts) {
  for (let i = emts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [emts[i], emts[j]] = [emts[j], emts[i]];
  }
  return emts;
}

//왼쪽 실습영역 이펙트 함수
function showLabEffect(x, y) {
  const labCanvas = document.getElementById("labCanvas");
  const labCtx = canvas.getContext("2d");

  labCtx.fillStyle = "rgba(255, 0, 0, 0.4)";
  labCtx.beginPath();
  labCtx.arc(x, y, 40, 0, Math.PI * 2);
  labCtx.fill();

  setTimeout(() => {
    labCtx.clearRect(0, 0, labCanvas.width, labCanvas.height);
  }, 800);
}

//아이프레임 영역을  업데이트
function updateIframe() {
  const htmlCodeE = `
  <div id = "wrapper">
    <header id = "header">
      <h1 class = "title">
        웹 프로그래밍 완전 정복
      </h1>
      <h2 class = "subtitle">
        건국대학교 컴퓨터공학부
      </h2>
    </header>
    <nav id = "navigation">
      <div class = "pull-left">
        <ul class = "outer-menu">
          <li class = "outer-menu-item">HTML5</li>
          <li class = "outer-menu-item">CSS3</li>
          <li class = "outer-menu-item">JavaScript</li>
        </ul>
      </div>
      <div class = "pull-right">
        <form>
        <input type = "text" class = "input-search">
        <input type = "submit" value = "검색" class = "input-search-submit">
        </form>
      </div>
    </nav>
    <div id = "content">
      <section id = "main-section">
        <article>
          <div class = "article-header">
            <h1 class = "article-title">HTML5 개요와 활용</h1>
            <p class = "article-date">2025년 03월 13일</p>
          </div>
          <div class = "article-body">
            <img src = "https://placehold.co/430x280">
            <p>sd fsdf sdfsdfsdfsd fsdsfsdfssdfsd dsfsdfdsfsdfsdfsdfdsfsd fdssdfsfsfsdfdsfdsfds fdsdsfdsf
            dsfssdsdfdsfdsf dsfdsfds fdsfdsf sd fds fds fds dsfsdfds fds fdsfdsf dsfdsfdsfsdfds fsdfsdfsdfds fdssd fdsf dsf ds fdsf dsf dsf df sf sd ds fsd fds f df sdf ds fsd sda sdasda das dsa sda asd ad das d das dsa das das as sdasdasddsasddas asdasddassdaasdasdas dsadasdsda dasdsaasdsaddsadasdsadsad sda ds asd  das das ads dsa dsa dsa ads dsa dsa das das d s</p>
          </div>
        </article>
        <article>
          <div class = "article-header">
            <h1 class = "article-title">HTML5 개요와 활용</h1>
            <p class = "article-date">2025년 03월 13일</p>
          </div>
          <div class = "article-body">
            <img src = "https://placehold.co/430x280">
            <p>sd fsdf sdfsdfsdfsd fsdsfsdfssdfsd dsfsdfdsfsdfsdfsdfdsfsd fdssdfsfsfsdfdsfdsfds fdsdsfdsf
            dsfssdsdfdsfdsf dsfdsfds fdsfdsf sd fds fds fds dsfsdfds fds fdsfdsf dsfdsfdsfsdfds fsdfsdfsdfds fdssd fdsf dsf ds fdsf dsf dsf df sf sd ds fsd fds f df sdf ds fsd sda sdasda das dsa sda asd ad das d das dsa das das as sdasdasddsasddas asdasddassdaasdasdas dsadasdsda dasdsaasdsaddsadasdsadsad sda ds asd  das das ads dsa dsa dsa ads dsa dsa das das d s</p>
          </div>
        </article>
      </section>
      <section id = "main-aside">
        <div class = "aside-list">
          <h3>카테고리</h3>
          <ul>
            <li><a href = "#">데이터</a></li>
            <li><a href = "#">데이터</a></li>
            <li><a href = "#">데이터</a></li>
            <li><a href = "#">데이터</a></li>
            <li><a href = "#">데이터</a></li>
          </ul>
        </div>
        <div class = "aside-list">
          <h3>최근 글</h3>
          <ul>
            <li><a href = "#">데이터</a></li>
            <li><a href = "#">데이터</a></li>
            <li><a href = "#">데이터</a></li>
            <li><a href = "#">데이터</a></li>
            <li><a href = "#">데이터</a></li>
          </ul>
        </div>
      </section>
    </div>
    <footer id = "footer">
      <a href = "#">Created By Soohyun Lee</a>
    </footer>
  </div>
`;

const cssCodeE = `
    * {
      font-family: "맑은 고딕", Gothic, sans-serif;
      margin: 0;
      padding: 0;
    }
    a {text-decoration: none;}
    li {list-style: none;}
    body {
      background-color: #FFE4E1;
      width: 960px;
      margin: 0 auto;
    }
    article {
      padding: 0 10px 20px 10px;
      border-bottom: 1px solid #C9C9C9;
    }

    #wrapper {
      background-color: white;
      padding: 10px 20px;
      margin-top: 40px;
    }
    #header {
      padding: 40px 50px;
    }
    #navigation {
      margin-bottom: 20px;
      border-top: 1px solid #C9C9C9;
      border-bottom: 1px solid #C9C9C9;
      height: 40px;
    }
    #main-section {
      width: 710px;
      float: left;
    }
    #main-aside {
      width: 200px;
      float: right;
    }
    #content {
      overflow: hidden;
    }
    #footer {
      background-color: #FF9D6E;
      height: 50px;
    }
    .title {
      font-size: 30px;
      color: #191919;
    }
    .subtitle {
      font-size: 15px;
      color: #383838;
    }
    .outer-menu-item {
      display: block;
      height: 30px;
      width: 80px;
      padding: 5px 20px;
      text-align: center;
      line-height: 30px;
      float: left;
    }
    .outer-menu-item:hover {
      background-color: #FF9D6E;
      color: #282828;
      font-weight: bold;
    }
    .pull-left {
      height: 40px;
      float: left;
    }
    .pull-right {
      height: 26px;
      padding: 7px 7px;
      float: right;
    }
    .input-search {
      display: block;
      height: 24px;
      width: 120px;
      padding-left: 10px;
      border: 1px solid #CCCCCC;
      border-radius: 15px 0 0 15px;
      float: left;
    }
    .input-search:focus {
      background-color: yellow;
      outline: 0;
    }
    .input-search-submit {
      display: block;
      height: 26px;
      width: 50px;
      border: 1px solid #CCCCCC;
      border-radius: 0 15px 15px 0;
      float:  left;
    }
    .article-header {
      padding: 20px 0;
    }
    .article-title {font-size: 25px;}
    .article-date {font-size: 13px;}
    .article-body {font-size: 14px;}

    .aside-list li a {
      font-size: 13px;
      color: orange;
    }
    .aside-list > h3 {
      font-size: 15px;
      color: blue;
    }
    #footer > a {
      display: block;
      font-size: 20px;
      color: #282828;
      font-weight: bold;
      line-height: 50px;
      text-align: center;
    }
`;

const jsCodeE = `
`;

  const htmlCodeN = `<header>
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
  <p>Created by 202412345 김아무개</p>
</footer>`;

//css 코드의 시작
const cssCodeN=`*{margin: 0; padding: 0;}

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
const jsCodeN=`console.log("JS 동작 중!")
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
let tempCss, tempJs, htmlCode, css, js;
switch (difficulty) {
case 0: {
  htmlCode = htmlCodeE;
  tempCss = cssCodeE;
  tempJs = jsCodeE;
  break;
}
case 1: {
  htmlCode = htmlCodeN;
  tempCss = cssCodeN;
  tempJs = jsCodeN;
}
case 2: {}
}
css = `<style>${tempCss}</style>`;
js = `<script>${tempJs}<\/script>`;

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

let secureToggleInterval = null;

function startHardModeTimer() {
  if (hardModeTimer) {
    clearInterval(hardModeTimer);
  }
  if (secureToggleInterval) {
    clearInterval(secureToggleInterval);
  }
  secureToggleInterval = setInterval(() => {
    if (!isPaused && !isGameOver && difficulty == 2) {
      toggleSecureBricks();
    }
  }, 2000);
  if (timerDisplay) {
        timerDisplay.remove();
        timerDisplay = null;
    }

  timerDisplay = document.createElement("div");
  timerDisplay.style.position = "absolute";
  timerDisplay.style.top = "10px";
  timerDisplay.style.right = "30px";
  timerDisplay.style.color = "red";
  timerDisplay.style.fontSize = "32px";
  timerDisplay.style.fontFamily = "monospace";
  timerDisplay.style.zIndex = "10";
  document.getElementById("game-area").appendChild(timerDisplay);

  updateTimerDisplay();

  hardModeTimer = setInterval(() => {
    if (isGameOver || isPaused) return;
    remainingTime--;
    updateTimerDisplay();
    if (remainingTime <= 0) {
      clearInterval(hardModeTimer);
      gameOverDueToTime();
      if (!isWordListBroken()) {
        gameOverDueToTime();
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const min = Math.floor(remainingTime / 60).toString().padStart(2, '0');
  const sec = (remainingTime % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `⏱ ${min}:${sec}`;
}

function isWordListBroken() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1 && b.targetSelector === "#footer") return false;
    }
  }
  return true;
}

function gameOverDueToTime() {
  isGameOver = true;
  $("#startBtn,#pauseBtn").hide();
  $("#restartBtn, #ingame-to-menu-button").show();
  $("#game-over-massage").text("시간 초과!").show();
  stopMusic();
  gameOverMusic[0].play();
  drawBall();
  $("#pan").css({"background-color":"red"});

  uDiedMsg = setTimeout(function() {
    $(".pop-up-massage").fadeIn(200);
  }, 1000);
}
