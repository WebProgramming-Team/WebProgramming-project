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
const v_s_slow = 10;//느림일때 공 속도
let v_s = v_s_slow;//기본 속도 = 느림
//난이도 관련
let difficulty; //이건 난이도를 정함 -> Select-Mode에서 결정 후 넘겨받음
let difficultyStr = ["easy", "normal", "hard"];

// 테스트용 updateIframe에 css 쪽 보면 씀
let testFlag = true;

//하드모드 시간제한 변수
let hardModeTimer = null;
let timerDisplay = null;
let remainingTime = 90;

//점수 용 전역변수
let score = 0;
let scoreEffects = [];  // 여러 개 동시에 떠오르게 하기 위해 배열로

//경고 효과
let warningEffect = null;

// 게임 오버
let uDiedMsg;

// 기타
let intervalId;
let lastMouseX = -1;

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
let canvasWidth = 900;  //우리 코드에서는 900px
let canvasHeight = 900;


let paddleHitEffect = 0; // 이펙트 강도 (0이면 없음)



//게임 관련 변수들


//이 아래는 벽돌배열입니다.
//벽돌에 대응되는 태그들
//벽돌위에 글씨를 넣고싶다면 label: "원하는 메세지"  이렇게 추가하세요
//{ selector: "#title", label: "타이틀 제거", effect: "remove" }, 
const desEleEasy = [
  {selector: "#header", effect: "remove"},
  {selector: ".pull-left", effect: "remove"},
  {selector: ".pull-right", effect: "remove"},
  {selector: ".article-header", effect: "remove"},
  {selector: "#main-aside", effect: "remove"},
  {selector: "#footer", effect: "remove"}
];

const desEleNormal = [
  { selector: "#title", effect: "remove" },
  { selector: ".lab", effect: "remove", name: "div"},
  { selector: "none"},
];

const desEleHard = [
  { selector: ".lab.calculator", effect: "breakCalculator" },
  { selector: ".lab.gugudan", effect: "breakGugudan" },
  { selector: ".lab.numGame", effect: "breakNumGame" },
  { selector: ".lab.wordBook", effect: "breakWordBook" },
  { selector: ".lab.clickHere", effect: "breakClickHere" },
  { selector: ".lab.image-toggle", effect: "breakImageToggle" },
  { selector: ".lab.colorList", effect: "breakColorList" },
  { selector: ".lab.flashBox", effect: "breakFlashBox" },
  { selector: ".lab.movingBox", effect: "breakMovingBox" },
  { selector: "#hangman", effect: "breakHangman" },
  { selector: "#title", effect: "breakHeaderTitle" },
  { selector: "footer", effect: "breakFooterWarning" }
];

//부숴진 태그들 저장
const destroyedSelectors = new Set();

let destructionEffects = []; // 캔버스 위 텍스트 이펙트들


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

    // 이펙트 한 줄로
    shakeIframe();
    //blackout();
    showHackingProgress();
    scrollToTarget(target);
    fadeOutElement(target, 10000);
    triggerLabEffectOnTarget(target);
  },

  breakGugudan: (target, b, iframeDoc) => {
    const tables = target.querySelectorAll("table");
    tables.forEach(table => {
      table.innerHTML = "<tr><td style='color:red;'>ERROR: 구구단이 파괴됨</td></tr>";
      table.style.backgroundColor = "black";
    });

    shakeIframe();
    //blackout();
    showHackingProgress();
    scrollToTarget(target);
    fadeOutElement(target, 10000);
    triggerLabEffectOnTarget(target);
  },

  breakNumGame: (target, b, iframeDoc) => {
    const guessBtn = iframeDoc.getElementById("numGuess");
    const input = iframeDoc.getElementById("user");
    if (guessBtn) {
      guessBtn.disabled = true;
      guessBtn.value = "망가짐 😵";
    }
    if (input) {
      input.value = "추측 불가!";
    }

    shakeIframe();
    //blackout();
    showHackingProgress();
    scrollToTarget(target);
    fadeOutElement(target, 10000);
    triggerLabEffectOnTarget(target);
  },

  breakWordBook: (target, b, iframeDoc) => {
    const buttons = target.querySelectorAll("button");
    buttons.forEach(btn => btn.disabled = true);

    const list = iframeDoc.getElementById("wordList");
    if (list) {
      list.innerText = "🔥 단어장 손상됨!";
      list.style.color = "red";
    }

    shakeIframe();
    //blackout();
    showHackingProgress();
    scrollToTarget(target);
    fadeOutElement(target, 10000);
    triggerLabEffectOnTarget(target);
  },

  breakClickHere: (target, b, iframeDoc) => {
    const script = iframeDoc.createElement("script");
    script.innerHTML = `
    const p = document.getElementById("innerTest");
    if (p) {
      p.innerText = "🚫 입력 불가: 시스템 오류 발생";
      p.style.color = "red";
    }
    `;
    iframeDoc.body.appendChild(script);

    shakeIframe();
    showHackingProgress();
    scrollToTarget(target);
    fadeOutElement(target, 10000);
    triggerLabEffectOnTarget(target);
  },

  breakImageToggle: (target, b, iframeDoc) => {
    const img = iframeDoc.getElementById("image");
    const btn = iframeDoc.getElementById("imageButton");
    if (img) {
    img.src = "projects/easy-mode/broken.png"; // 또는 실제 망가진 이미지
  }
  if (btn) {
    btn.disabled = true;
    btn.value = "⚠️ 고장남";
  }
  shakeIframe();
  showHackingProgress();
  scrollToTarget(target);
  fadeOutElement(target, 10000);
  triggerLabEffectOnTarget(target);
},

breakColorList: (target, b, iframeDoc) => {
  const container = iframeDoc.getElementById("colorTable");
  if (container) {
    container.innerHTML = "<p style='color: gray;'>⚫ 색상 데이터 손실</p>";
  }

  const createBtn = iframeDoc.getElementById("ctCreate");
  if (createBtn) createBtn.disabled = true;

  shakeIframe();
  showHackingProgress();
  scrollToTarget(target);
  fadeOutElement(target, 10000);
  triggerLabEffectOnTarget(target);
},

breakFlashBox: (target, b, iframeDoc) => {
  const div = iframeDoc.getElementById("target");
  if (div) {
    div.style.backgroundColor = "black";
    div.style.color = "red";
    div.innerText = "⚡ Flash Overload – 전원 차단됨";
  }

  const stopBtn = iframeDoc.getElementById("stopColor");
  if (stopBtn) stopBtn.disabled = true;

  shakeIframe();
  showHackingProgress();
  scrollToTarget(target);
  fadeOutElement(target, 10000);
  triggerLabEffectOnTarget(target);
},

breakMovingBox: (target, b, iframeDoc) => {
  const box = iframeDoc.querySelector("#animate");
  const button = iframeDoc.querySelector("#moveBox");

  if (box) {
    box.style.backgroundColor = "gray";
    box.style.transition = "none";
    box.style.top = "50px";
    box.style.left = "50px";
  }

  if (button) {
    button.disabled = true;
    button.value = "Error!";
  }

  shakeIframe();
  showHackingProgress();
  scrollToTarget(target);
  fadeOutElement(target, 10000);
  triggerLabEffectOnTarget(target);
},

breakHangman: (target, b, iframeDoc) => {
  const img = iframeDoc.querySelector("#hangmanpic");
  const clue = iframeDoc.querySelector("#clue");
  const guessBtn = iframeDoc.querySelector("#guessButton");
  const newGameBtn = iframeDoc.querySelector("#newGame");

  if (img) {
    img.src = "projects/easy-mode/hangman/hangman6.gif";
  }

  if (clue) {
    clue.innerHTML = "💀 이 페이지는 해킹되었습니다 💀";
    clue.style.color = "red";
    clue.style.fontWeight = "bold";
  }

  if (guessBtn) guessBtn.disabled = true;
  if (newGameBtn) newGameBtn.disabled = true;

  shakeIframe();
  showHackingProgress();
  scrollToTarget(target);
  fadeOutElement(target, 10000);
  triggerLabEffectOnTarget(target);
},

breakHeaderTitle: (target, b, iframeDoc) => {
  const title = iframeDoc.querySelector("#title");
  if (title) {
    title.innerText = "⚠️ 과제가 조작되었습니다 ⚠️";
    title.style.color = "red";
    title.style.fontWeight = "bold";
    title.style.fontSize = "26px";
  }

  shakeIframe();
  showHackingProgress();
  scrollToTarget(target);
  fadeOutElement(target, 10000);
  triggerLabEffectOnTarget(target);
},

breakFooterWarning: (target, b, iframeDoc) => {
  const footer = iframeDoc.querySelector("footer");
  if (footer) {
    footer.innerHTML = `
      <p style="color: red; font-weight: bold;">🚨 이 상태로 제출 시 0점 처리됩니다! 🚨</p>
      <p style="color: darkred;">※ 과제 파일이 손상되었습니다. 복구가 필요합니다.</p>
    `;
    footer.style.backgroundColor = "#330000";
  }

  shakeIframe();
  showHackingProgress();
  scrollToTarget(target);
  fadeOutElement(target, 10000);
  triggerLabEffectOnTarget(target);
}



  // 앞으로 추가할 것들 계속 여기 정의
  // "breakWordList": (target, b, iframeDoc) => {...}
};

//난이도 별로 핸들러 세트
const allEffectHandlers = {
  0: { // Easy
    remove: effectHandlers.remove
  },
  1: { // Normal
    remove: effectHandlers.remove,
    changeColor: effectHandlers.changeColor
  },
  2: { // Hard
    breakCalculator: effectHandlers.breakCalculator,
    breakGugudan: effectHandlers.breakGugudan,
    breakNumGame: effectHandlers.breakNumGame,
    breakWordBook: effectHandlers.breakWordBook,
    breakClickHere: effectHandlers.breakClickHere,
    breakImageToggle: effectHandlers.breakImageToggle,
    breakColorList: effectHandlers.breakColorList,
    breakFlashBox: effectHandlers.breakFlashBox,
    breakMovingBox: effectHandlers.breakMovingBox,
    breakHangman: effectHandlers.breakHangman,
    breakHeaderTitle: effectHandlers.breakHeaderTitle,
    breakFooterWarning: effectHandlers.breakFooterWarning,
    remove: effectHandlers.remove  // 하드에서도 remove 가능
  }
};

let layout; // 블럭에서 매번 사용하는 레이아웃

//이지모드 관련 변수들
let easy_articleCount = 0;
let easy_headerCount = 0;
let easy_footerCount = 0;

//이지모드용 전역변수들
/*easy모드용 계획 
article1 제거 -> article2 제거 -> footer 제거 -> wrapper 제거*/

//easy모드 블럭 배치

 /* 이지 모드 계획
   { type: "footer", count: 2 },
    { type: "header", count: 2 },
    { type: "article", count: 4 }
  */

let isDeletearticle1 = false;
let isDeletearticle2 = false; 
let isDeleteFooter = false;
let isDeleteAll = false;
function initEasyVar(){
  easy_articleCount = 0;
  easy_headerCount = 0;
  easy_footerCount = 0;
  isDeletearticle1 = false;
  isDeletearticle2 = false; 
  isDeleteFooter = false;
  isDeleteAll = false;
}
//

let totalTitleNum = 1;
let totalDivNum = 6; // 삭제할 div 개수

// 벽돌 관련 전역 변수들
let extraRow = 0;
let hiddenRowNum;
let brickRowCount = 2;
let brickColumnCount = 4;
const brickPadding = 2;
const brickOffsetTop = 50;
const brickOffsetLeft = 5;

let brickHeight = 10;
let brickWidth = (850 -(brickPadding*(brickColumnCount-1) + 2*brickOffsetLeft)) / brickColumnCount;



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

  const $gameArea = $('#game-area');
  canvasWidth = $gameArea.width();
  canvasHeight = $gameArea.height();

  console.log("Canvas Width:", canvasWidth);
  console.log("Canvas Height:", canvasHeight);

  /*--------------*/ 
  defineGameVarDefault(); // 게임 변수 define으로 세팅함.
  SetUserControl(); // 유저의 mousemove, 키 클릭 등을 세팅함.

  StartGameHome(); // 게임을 홈 화면으로 세팅함. 
  //변수 초기화 -> 나중에 defienGameVarDefault 쪽으로 넘겨줄거. 

  ballImage.src = "images/temp-ball/GyosuYouCheatMeBall.png";


//option 쪽으로 넘겨줄 것들
  // $(".bs-radio").on("change", function() {
  //   $(".bs-label").removeClass("selected");

  //   $(this).parent(".bs-label").addClass("selected");
  // });

  // $(".volume-bar").on("input", function() {
  //   let vol = $(this).val();

  //   $(".volume-bar").val(vol);
  //   $(".volume").html(vol);

  //   setVolume(vol);
  // });

  // $("#music-select").on("input", function() {
  //   igIdx = $(this).val();
  // });
});


///=========================================
// [키 바인딩 관련]
function SetUserControl(){

  //바 컨트롤 바인딩
  $(window).on("mousemove", function(e) {
    if (lastMouseX == -1) {
      lastMouseX = e.pageX;
      return;
    }
    let mouseDx = (e.pageX - lastMouseX);
    paddleX += mouseDx;

    if (paddleX >= canvas.width - paddleWidth) {
      paddleX = canvas.width - paddleWidth;
    }
    else if (paddleX <= 0) {
      paddleX = 0;
    }
    lastMouseX = e.pageX;
  });


  //기본 키 바인딩
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

}
///===========================================
//[게임 시작 전 메인 화면 관련]
function allHide(){
  //전부 다 hide하는 함수
    $(".menu-page").hide();//메뉴 페이지 hide
    $("#game-wrapper").hide();//game hide
    $("#clear-panel").hide();
  }

//홈 화면 시작
  function StartGameHome(){
  //게임을 홈으로 리셋함. 

  allHide();//전부 다 리셋


  /*main-menu 버튼 - 함수 바인딩*/
  $("#start-button").on("click", showLevelSelectionPage);
  //레벨 선택 쪽으로 이동하게 만듬.
  $("#options-button").on("click", showOptions);
  $("#guitar-button").on("click", showGuitar);
  /*--------------------------*/

  $(".back-button").on("click", showMainMenu);

  $(".start-page").show();//스타트 페이지 시작하기.
}

//홈 화면 관련 변수 초기화 부분
function defineGameVarDefault(){
  //음악 초기화(기본)
  //볼 초기화(기본)
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
  //게임 오버 뮤직 플레이

  $("#menu-music-button, #intro-to-main").on("click", function() {
    menuMusic.play();
  })


}
//주석
//레벨 선택 부분 시작
function showLevelSelectionPage() {
  allHide();
  //바인딩 과정
  $("#easy-button").on("click", startEasyPage);
  $("#normal-button").on("click", startNormalPage);
  $("#hard-button").on("click", startHardPage);
  $(".level-selction-page").show(); 
}

function showOptions() {
  allHide();
  $(".option-page").show();
  //옵션 관련 추가 
}

function showGuitar() {
  $("#main-menu").hide();
  $("#guitar").show();
}

function showMainMenu() {
  //???
  $("#ps").hide();
  $("html").css({"cursor":"default"});

  isGameOver = true; // 게임 오버 다시 true로 만들고
  isPaused = false;
  stopMusic();
  menuMusic.play();
  StartGameHome();
}

//옵션 관련 함수들 

function selectBackground(){
  //추가
}
function selectBall(){
  //추가
}

function selectMusic(){

  //추가
}

//Easy 시작
function startEasyPage() {
  //$(#Game-start-stroy).show
  difficulty = 0;
  init();
}

function startNormalPage() {
  difficulty = 1;
  init();
}

function startHardPage() {
  difficulty = 2;
  init();
}

//게임 초기화 함수
function init() {
  if (!isGameOver) return;

  clearInterval(intervalId);//interval 쪽 변경
  configureDifficultySettings(difficulty); // 게임 변수 리셋
  resetGameState();  //게임 리셋
  createBricks(); // 블럭 만들기

  if (difficulty === 2) {
    startHardModeTimer(); // 하드 모드면 타이머 시작하기
  }

  startBrickMoveTimer(difficulty); // brick move timer 시작
  requestAnimationFrame(draw); // draw 시작
}

//게임 초기화
function resetGameState() {
  destroyedSelectors.clear();  //파괴된 요소 초기화
  testFlag = true;
  isGameOver = false; // 게임 오버 false
  isPaused = false; // 퍼즈 false

  score = 0; // score = 0점

  hiddenRowNum = extraRow; 
  bricks = [];
  $("#pan").css({"background-color":"transparent"}); // ??

  $("body").css("width", "100vw"); 
  initShowHide(); // 게임 화면 가리고
  stopMusic(); // 음악 멈추기
  ingameMusic[igIdx].play();//선택된 뮤직 시작.

  // const ballSpeed = $(".bs-label.selected .bs-radio").val();
  v_s = v_s_slow; // slow한 버전으로 구현

  ballX = canvas.width / 2;
  ballY = canvas.height - 80;

  ballRadius = 5;

  dx = Math.floor(Math.random() * 16 - 8) || 1;
  dy = -Math.sqrt(v_s - dx * dx);

  paddleHeight = 10;
  paddleWidth = 60;
  paddleX = (canvas.width - paddleWidth) / 2;
}

//난이도 별 설정 분리
function configureDifficultySettings(mode) {
  //init 규칙
  //블럭 개수 관련 설정 -> 해당 사이트 변수 최고하
  switch (mode) {
  case 0:
      //블럭 설정
    extraRow = 1;
    brickRowCount = 1;
    initEasyVar();//Easy용 변수 초기화
    break;
  case 1:
    extraRow = 3;
    brickRowCount = 3;
    break;
  case 2:
    extraRow = 4;
    brickRowCount = 4;
    break;
  default:
    console.warn("정의되지 않은 난이도:", mode);
  }
}

function initShowHide() {
  allHide();
  $("#game-wrapper").show();
  $("#gameCanvas").show();
  $("#ps").show();
  $(".pop-up-massage").hide();
  $("#pause-panel").hide();

   //실습 iframe 업데이트
  updateIframe(); 
}

//벽돌 생성 및 태그 연결 함수
function createBricks() {
  hiddenRowNum = extraRow;

  const totalCount = (brickRowCount + extraRow) * brickColumnCount;
  const bombPositions = generateBombPositions(totalCount);

  const elements = shuffleEmt(createElementsByDifficulty(difficulty));


  let eCount = 0;
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount + extraRow; r++) {
      const index = c * (brickRowCount + extraRow) + r;
      const isBomb = bombPositions.has(`${c}-${r}`);
      const element = elements[eCount++];

      const brick = createBrickObject(c, r, element, isBomb);
      bricks[c][r] = brick;
    }
  }

  console.log(createBricksStr());
}

//보조 1. 폭탄 위치 생성
function generateBombPositions(totalCount) {
  const bombCount = 4;
  const positions = new Set();

  while (positions.size < bombCount) {
    const c = Math.floor(Math.random() * brickColumnCount);
    const r = Math.floor(Math.random() * (brickRowCount + extraRow));
    positions.add(`${c}-${r}`);
  }

  return positions;
}

//보조 2. 벽돌 생성 객체 함수
function createBrickObject(c, r, element, isBomb) {
  //easy 모드일 때 임시 루틴
  if(difficulty == 0){
   const bricks = [];
   let tag = layout[r][c];
   const isBomb = tag === "bomb";
   const isTopRow = r < extraRow;
   const isSecure = (difficulty !== 0 && Math.random() < 0.2);
   const hp = isSecure ? 3 : null;
   return {
    x: c * (brickWidth + brickPadding) + brickOffsetLeft,
    y: (r - extraRow) * (brickHeight + brickPadding) + brickOffsetTop,
    status: isTopRow ? 0 : 1,
    isBomb: isBomb,
    isHidden: isTopRow ? 1 : 0,
    targetSelector: element?.selector,
    effect: element?.effect,
    color: element?.color,
    isSecure: isSecure,
    secureState: isSecure,
    hp: hp,
    tag:tag
  };
}

const isTopRow = r < extraRow;
const isSecure = (difficulty !== 0 && Math.random() < 0.2);
const hp = isSecure ? 3 : null;

return {
  x: c * (brickWidth + brickPadding) + brickOffsetLeft,
  y: (r - extraRow) * (brickHeight + brickPadding) + brickOffsetTop,
  status: isTopRow ? 0 : 1,
  isBomb: isBomb,
  isHidden: isTopRow ? 1 : 0,
  targetSelector: element?.selector,
  effect: element?.effect,
  color: element?.color,
  isSecure: isSecure,
  secureState: isSecure,
  hp: hp,
  tag:null
};
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
    const blockPlan = [
    { type: "article", count: 4 },
    { type: "footer", count: 2 },
    { type: "header", count: 2 }
    
  ]; //블럭 어떻게 넣을건지 확인
    layout = generateBlockLayoutWithRules(4, 4, blockPlan, 4);


  } else if (level === 1) {
     const blockPlan = [
    { type: "&lt;header&gt;", count: 2 },
    { type: "&lt;body&gt;", count: 3 },
    { type: "&lt;lab&gt;", count: 2 },
    { type: "&lt;main-menu&gt;", count: 2 },
    { type: "&lt;container&gt;", count: 4 },
    {type:" &lt;footer&gt;", count:2}
  ]; //블럭 어떻게 넣을건지 확인


    layout = generateBlockLayoutWithRules(12, 4, blockPlan, 4);
  } else if (level === 2) {
    elements = createHardElementsFixed();   // 하드 요소들만 따로 준비
  }

  return shuffleEmt(elements);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateBlockLayoutWithRules(rows, cols, blockPlan, currentBomb) {
  const totalCells = rows * cols;
  const layoutFlat = [];

  // 1. 블럭 추가
  blockPlan.forEach(plan => {
    for (let i = 0; i < plan.count; i++) {
      layoutFlat.push(plan.type);
    }
  });

  // 2. bomb 추가
  for (let i = 0; i < currentBomb; i++) {
    layoutFlat.push("bomb");
  }

  // 3. 나머지는 dummy로 채움
  while (layoutFlat.length < totalCells) {
    layoutFlat.push("dummy");
  }

  // 4. 전부 셔플
  shuffleArray(layoutFlat);

  // 5. 2차원 배열로 변환
  const layout = [];
  for (let r = 0; r < rows; r++) {
    layout.push(layoutFlat.slice(r * cols, (r + 1) * cols));
  }

  // 6. 디버깅 출력
  layout.forEach((row, rowIndex) => {
    const rowStr = row.map(cell => {
      if (cell === "bomb") return "💣";
      else if (cell === "dummy") return "⬜";
      else return `[${cell}]`;
    }).join(" ");
    console.log(`Row ${rowIndex}: ${rowStr}`);
  });

  return layout;
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
//전역에 태그 선언
const hardTargets = [
  { selector: ".lab.calculator", effect: "breakCalculator", label: "계산기" },
  { selector: ".lab.gugudan", effect: "breakGugudan", label: "구구단" },
  { selector: ".lab.numGame", effect: "breakNumGame", label: "숫자게임" },
  { selector: ".lab.wordBook", effect: "breakWordBook", label: "단어장" },
  { selector: ".lab.clickHere", effect: "breakClickHere", label: "innerText" },
  { selector: ".lab.image-toggle", effect: "breakImageToggle", label: "이미지" },
  { selector: ".lab.colorList", effect: "breakColorList", label: "색상표" },
  { selector: ".lab.flashBox", effect: "breakFlashBox", label: "깜빡상자" },
  { selector: ".lab.movingBox", effect: "breakMovingBox", label: "상자이동" },
  { selector: "#hangman", effect: "breakHangman", label: "행맨" },
  { selector: "#title", effect: "breakTitle", label: "제목 영역" },
  { selector: "footer", effect: "breakFooter", label: "푸터" }
];


function createHardElementsRandom() {
  const totalBrickCount = (brickRowCount + extraRow) * brickColumnCount;
  // const hardTargets = [
  //   desEleHard.find(el => el.selector === ".lab.calculator"),
  //   desEleHard.find(el => el.selector === ".lab.gugudan"),
  //   desEleHard.find(el => el.selector === ".lab.numGame"),
  //   desEleHard.find(el => el.selector === ".lab.wordBook"),
  //   desEleHard.find(el => el.selector === ".lab.clickHere"),
  //   desEleHard.find(el => el.selector === ".lab.image-toggle"),
  //   desEleHard.find(el => el.selector === ".lab.colorList"),
  //   desEleHard.find(el => el.selector === ".lab.flashBox"),
  //   desEleHard.find(el => el.selector === ".lab.movingBox"),
  //   desEleHard.find(el => el.selector === "#hangman"),
  //   desEleHard.find(el => el.selector === "#title"),
  //   desEleHard.find(el => el.selector === "footer")
  // ].filter(Boolean); // null 제거
  hardTargets.filter(Boolean); 

  const elements = [];

  // 골고루 섞이도록 반복
  while (elements.length < totalBrickCount) {
    elements.push(...hardTargets);
  }

  // 개수 맞게 자르기
  return shuffleEmt(elements.slice(0, totalBrickCount));
}
  
  //전역에 고정 배치 블럭 지정
  const uniqueTargets = [
    { selector: ".lab.calculator", effect: "breakCalculator", label: "계산기 파괴!" },
    { selector: ".lab.gugudan", effect: "breakGugudan", label: "구구단 폭파!" },
    { selector: ".lab.numGame", effect: "breakNumGame", label: "숫자게임 고장!" },
    { selector: ".lab.wordBook", effect: "breakWordBook", label: "단어장 삭제!" },
    { selector: ".lab.clickHere", effect: "breakClickHere", label: "클릭 이벤트 삭제!" },
    { selector: ".lab.image-toggle", effect: "breakImageToggle", label: "사진 기능 파괴!" },
    { selector: ".lab.colorList", effect: "breakColorList", label: "색상표 제거!" },
    { selector: ".lab.flashBox", effect: "breakFlashBox", label: "깜빡이 종료!" },
    { selector: ".lab.movingBox", effect: "breakMovingBox", label: "상자 멈춤!" },
    { selector: "#hangman", effect: "breakHangman", label: "행맨 파괴!" },
    { selector: "#title", effect: "breakHeaderTitle", label: "제목 삭제!" },
    { selector: "footer", effect: "breakFooterWarning", label: "푸터 경고!" }
  ];

//이건 벽돌 위치가 고정된것.
function createHardElementsFixed() {
  const totalBrickCount = (brickRowCount + extraRow) * brickColumnCount;

  // 나머지 빈 블럭은 effect: "none" 으로 채우기
  const elements = [...uniqueTargets];
  while (elements.length < totalBrickCount) {
    elements.push({ selector: "none", effect: "none", label: "" });
  }

  return elements.slice(0, totalBrickCount);
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

//하드모드용 블록 내려오기
function moveBricksDownForHard() {
  if (isGameOver || hiddenRowNum <= 0) return;
  hiddenRowNum--;

  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount + extraRow; r++) {
      bricks[c][r].y = (r - hiddenRowNum) * (brickHeight + brickPadding) + brickOffsetTop;
    }

    // 👇 숨겨진 블럭이 파괴된 태그라면 아예 skip!
    const b = bricks[c][hiddenRowNum];
    if (b && destroyedSelectors.has(b.targetSelector)) {
      b.status = 0;
      b.isHidden = 1;
    } else {
      b.status = 1;
      b.isHidden = 0;
    }
  }

  console.log(`벽돌 내려왔음: ${extraRow - hiddenRowNum}/${extraRow}`);
}


//난이도 별 벽돌 내려오는 속도 관리
function startBrickMoveTimer(difficulty) {
  let intervalTime;

  switch (difficulty) {
    case 0: intervalTime = 8000; break; // Easy
    case 1: intervalTime = 5000; break; // Normal
    case 2: intervalTime = 4000; break; // Hard
    default: intervalTime = 5000;
    }

    intervalId = setInterval(() => {
      if (!isPaused && !isGameOver) {
        moveBricksDown();
      }

      if (hiddenRowNum <= 0) {
        clearInterval(intervalId);
      }
    }, intervalTime);
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

    drawDestructionEffects();
    ballX += dx;
    ballY += dy;

    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 12;
    else if (leftPressed && paddleX > 0) paddleX -= 12;

    if (checkClearByDifficulty()) {
      isGameOver = true;
      testFlag = false;
      updateIframe();
      stopMusic();
      showStory();
      return;
    }

    requestAnimationFrame(draw);
  }

 

//다음 스토리로
  function showStory(){
    allHide();
    $("clear-panel").show();

    if(difficulty == 0){
      //이지모드 
    }

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

  //메뉴 음악 끄고, 게임 오버 음악 끄기
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

//한 벽돌이 맞았을 때 처리 전체를 관리하는 중심 함수
function destroyBrick(c, r) {
  const b = bricks[c][r];
  if (!b || b.status === 0) return;

  if (b.tag != null) checkTagCount(b.tag);

  if (handleSecureBlock(b)) return;
  if (b.isBomb){
     b.status = 0; // 먼저 비활성화 처리 (중복 방지)
     triggerBombChain(c, r);
   } 
  handleScoreEffect(b);
  handleWarning(score);
  const effectSuccess = processIframeEffect(b, c, r);

  // 효과 적용 후 캔버스 위에 뜨는 파괴 메시지 이펙트
  if (effectSuccess && b.targetSelector) {
    const label = getEffectLabel(b.targetSelector);
    destructionEffects.push({
      x: b.x + brickWidth / 2,
      y: b.y,
      label: label,
      opacity: 1.0
    });
  }  

  b.status = 0;
}
//보조 5. 태그 지워지는거 실시간으로 확인 후 변경사항 
function checkTagCount(tag){

  if(difficulty == 0){
   /* 이지 모드 계획
   { type: "footer", count: 2 },
    { type: "header", count: 2 },
    { type: "article", count: 4 }
    easy 모드 태그 관련*/
    if(tag == "article"){ 
      console.log("아티클 태그 하나 사라짐"); 
      easy_articleCount++;
    }else if(tag == "header"){
      console.log("헤더 하나 사라짐 하나 사라짐"); 
      easy_headerCount++;

    }else if(tag == "footer"){
      console.log("푸터 태크 하나 사라짐");
      easy_footerCount++;
    }else{
     console.log("뭐시여 무슨 태그여 이거");
   }
   console.log("\nTotal counts:");
   console.log("Articles: " + easy_articleCount);
   console.log("Headers: " + easy_headerCount);
   console.log("Footers: " + easy_footerCount);
    EasyModeGameFun(); // 이지 모드 게임 fun
    return;
  }else if(difficulty==1){
    //노말 모드 계획
    //
  }
}


function EasyModeGameFun() {
  if(!isDeletearticle1 && easy_articleCount >= 2){
    removeHtmlTagFromIframe("article1");
    console.log("아티클1컷!");

    // 캔버스에 텍스트 표시용 효과 추가
    destructionEffects.push({
      x: canvas.width / 2, // 원하는 위치 조정 가능
      y: 50,
      label: "article1 파괴!",
      opacity: 1.0
    });
  }

  if(!isDeletearticle2 && easy_articleCount >= 4){
    removeHtmlTagFromIframe("article2");
    console.log("아티클2컷!");

    destructionEffects.push({
      x: canvas.width / 2,
      y: 80,
      label: "article2 파괴!",
      opacity: 1.0
    });
  }

  if(!isDeleteFooter && easy_footerCount >= 2){
    removeHtmlTagFromIframe("footer");
    console.log("푸터컷!");

    destructionEffects.push({
      x: canvas.width / 2,
      y: 110,
      label: "footer 파괴!",
      opacity: 1.0
    });
  }

  if(!isDeleteAll && isDeleteFooter && isDeletearticle2 && 
    isDeletearticle1 && easy_headerCount >= 2){
    removeHtmlTagFromIframe("wrapper");
    console.log("헤더컷!");

    destructionEffects.push({
      x: canvas.width / 2,
      y: 140,
      label: "wrapper 파괴!",
      opacity: 1.0
    });
  }
}
function drawDestructionEffects(ctx) {
  for (let i = destructionEffects.length - 1; i >= 0; i--) {
    const effect = destructionEffects[i];
    ctx.globalAlpha = effect.opacity;
    ctx.font = "24px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(effect.label, effect.x, effect.y);
    ctx.globalAlpha = 1.0;

    // 서서히 사라지게
    effect.opacity -= 0.02;
    if (effect.opacity <= 0) {
      destructionEffects.splice(i, 1);  // 완전히 사라지면 배열에서 제거
    }
  }
}


//보조용 함수들 두개
function removeHtmlTagFromIframe(id) {
  const iframe = document.getElementById("labFrame");
  if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

  const element = iframe.contentDocument.getElementById(id);
  if (element) {
    element.style.display = "none";
  } else {
    console.warn(`Element with id '${id}' not found in iframe.`);
  }
}



function changeCssTagFromIframe(id, cssProperty, value) {
  const iframe = document.getElementById("labFrame");
  if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

  const element = iframe.contentDocument.getElementById(id);
  if (element) {
    element.style[cssProperty] = value;
  } else {
    console.warn(`Element with id '${id}' not found in iframe.`);
  }
}

//보조 1. 보안 벽돌(isSecure)일 경우 HP를 차감하고, 아직 안 부서졌으면 true 반환하여 파괴 중단
function handleSecureBlock(b) {
  if (b.isSecure && typeof b.hp === "number") {
    console.log(b.hp);
    b.hp--;
    return b.hp > 0;
  }
  return false;
}
//보조 2. 점수 +10 반영 및 점수 애니메이션 효과(scoreEffects) 추가
function handleScoreEffect(b) {
  score += 10;
  scoreEffects.push({
    x: b.x + brickWidth / 2 - 10,
    y: b.y + brickHeight / 2,
    value: "+10",
    opacity: 1.0
  });
}
//보조 3. 점수가 50점 이상 되었을 때 경고 이펙트(warningEffect) 시작
function handleWarning(currentScore) {
  if (currentScore >= 50 && !warningEffect) {
    warningEffect = {
      text: "Lab Destroyed! Waring!",
      opacity: 1.0,
      y: canvas.height / 2,
      scale: 1.0
    };
  }
}
//보조 4. iframe 내부 문서에서 해당 b.targetSelector 요소를 찾아
//효과 종류에 맞는 핸들러(effectHandlers) 실행
//요소가 없으면 아무 작업도 하지 않음
function processIframeEffect(b, c, r) {
  const iframe = document.getElementById("labFrame");
  const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
  if (!iframeDoc) return false;

  const target = iframeDoc.querySelector(b.targetSelector);
  if (!target) return false;

  const currentHandlers = allEffectHandlers[difficulty];
  const handler = currentHandlers[b.effect];

  if (handler) {
    handler(target, b, iframeDoc);
  }

  //  selector 기억하기. 부숴진거 set 에 넣음
  if (b.targetSelector && b.targetSelector !== "none") {
    destroyedSelectors.add(b.targetSelector);
  }

  return true;
}
//보조 5. 벽돌이 폭탄(isBomb)일 경우, 상하좌우 주변 벽돌을 연쇄적으로 destroyBrick 호출
function triggerBombChain(c, r) {
  const directions = [
    [0, -1], [0, 1], [-1, 0], [1, 0],
  ];
  for (const [dc, dr] of directions) {
    const nc = c + dc;
    const nr = r + dr;
    if (
      nc >= 0 && nc < brickColumnCount &&
      nr >= 0 && nr < bricks[nc]?.length
      ) {
      destroyBrick(nc, nr);
  }
}
}



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
  // 캔버스 상단 점수 표시 (오른쪽 게임 화면용)
  ctx.font = "16px 'Press Start 2P'";
  ctx.fillStyle = "#fff";
  ctx.fillText("SCORE: ", 15, 25);
  ctx.fillText(score, 140, 25);

  // 왼쪽 하단 점수판 UI 영역 업데이트
  const $scoreBoard = $("#scoreBoard");

  // 점수 변동 시 애니메이션 효과 적용
  $scoreBoard
  .text("Score: " + score)
  .addClass("updated");

  setTimeout(() => {
    $scoreBoard.removeClass("updated");
  }, 300); // 애니메이션 지속 시간과 일치

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

//난이도에 따라 알맞은 클리어 함수
function checkClearByDifficulty() {
  switch (difficulty) {
  case 0:
    return checkEasyClear();
  case 1:
      return checkNormalClear(); // 기존 checkClear 내용 그대로
    case 2:
      return checkHardClear();   // 새로 만든 하드 클리어 기준
    default:
      return false;
    }
  }

function checkEasyClear(){
  return isDeleteAll;
}
//노말 클리어 체크
  function checkNormalClear() {
    for (let c = 0; c < brickColumnCount; c++) {
      if (bricks[c]) {
        for (let r = 0; r < bricks[c].length; r++) {
          if (bricks[c][r] && (bricks[c][r].status === 1 || bricks[c][r].isHidden === 1)) return false;
        }
      }
    }
    return true;
  }

//하드 클리어 체크
  function checkHardClear() {
    const targetSelectors = uniqueTargets.map(t => t.selector);
    return targetSelectors.every(sel => destroyedSelectors.has(sel));
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
        <article id = "article1">
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
        <article id = "article2">
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
        document.getElementById("guessstr").innerHTML="You Win";
      } else if (guessCount === 0) {
        document.getElementById("guessstr").innerHTML="You Lose";
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
case 2: {
  htmlCode = htmlCodeN;
  tempCss = cssCodeN;
  tempJs = jsCodeN;
}
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
  $("#game-over-massage").text("Time Out");
  stopMusic();
  gameOverMusic[0].play();
  drawBall();
  $("#pan").css({"background-color":"red"});

  uDiedMsg = setTimeout(function() {
    $(".pop-up-massage").fadeIn(200);
  }, 1000);
}

/*이 아래는 특수효과들*/
//흔들림 효과
function shakeIframe(duration = 500) {
  const iframe = document.getElementById("labFrame");
  iframe.style.transition = "transform 0.1s";
  let count = 0;

  const interval = setInterval(() => {
    const x = Math.random() * 10 - 5;
    const y = Math.random() * 10 - 5;
    iframe.style.transform = `translate(${x}px, ${y}px)`;

    count += 1;
    if (count > 5) {
      clearInterval(interval);
      iframe.style.transform = "none";
    }
  }, 50);
}

//암전 효과
function blackout(duration = 800) {
  const blackoutDiv = document.createElement("div");
  blackoutDiv.style.position = "absolute";
  blackoutDiv.style.top = 0;
  blackoutDiv.style.left = 0;
  blackoutDiv.style.width = "100%";
  blackoutDiv.style.height = "100%";
  blackoutDiv.style.backgroundColor = "black";
  blackoutDiv.style.opacity = 0;
  blackoutDiv.style.zIndex = 999;
  blackoutDiv.style.transition = "opacity 0.3s";
  document.body.appendChild(blackoutDiv);

  requestAnimationFrame(() => {
    blackoutDiv.style.opacity = 0.8;
  });

  setTimeout(() => {
    blackoutDiv.style.opacity = 0;
    setTimeout(() => blackoutDiv.remove(), 300);
  }, duration);
}

//"해킹 게이지" 같은 UI 요소
function showHackingProgress() {
  const bar = document.getElementById("hackingBar");
  const fill = document.getElementById("hackingFill");
  bar.style.display = "block";
  fill.style.width = "0%";

  let percent = 0;
  const interval = setInterval(() => {
    percent += 5;
    fill.style.width = `${percent}%`;
    if (percent >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        bar.style.display = "none";
      }, 500);
    }
  }, 100);
}
//타겟 태그 자동 스크롤로 이동
function scrollToTarget(target) {
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

//10초 후 태그 천천히 사라짐
function fadeOutElement(target, delay = 10000) {
  setTimeout(() => {
    target.style.transition = "opacity 1.5s";
    target.style.opacity = 0;
    setTimeout(() => target.remove(), 1500);
  }, delay);
}

//부숴지고 번쩍효과
function triggerLabEffectOnTarget(target) {
  const rect = target.getBoundingClientRect();
  const iframeRect = document.getElementById("labFrame").getBoundingClientRect();
  const x = rect.left - iframeRect.left + rect.width / 2;
  const y = rect.top - iframeRect.top + rect.height / 2;
  showLabEffect(x, y);
}

//중복 제거용 이펙트
function getEffectLabel(selector) {
  if (selector.includes("calculator")) return "덧셈 계산기 파괴!";
  if (selector.includes("gugudan")) return "구구단 파괴!";
  if (selector.includes("numGame")) return "숫자 게임 파괴!";
  if (selector.includes("wordBook")) return "단어장 파괴!";
  if (selector.includes("clickHere")) return "내부 텍스트 파괴!";
  if (selector.includes("image-toggle")) return "이미지 토글 파괴!";
  if (selector.includes("colorList")) return "색상 테이블 파괴!";
  if (selector.includes("flashBox")) return "깜빡 상자 파괴!";
  if (selector.includes("movingBox")) return "상자 이동기 파괴!";
  if (selector.includes("hangman")) return "행맨 파괴!";
  if (selector.includes("title")) return "헤더 파괴!";
  if (selector.includes("footer")) return "푸터 파괴!";
  return "요소 파괴!";
}

//이펙트 그리는 함수
function drawDestructionEffects() {
  for (let i = 0; i < destructionEffects.length; i++) {
    const effect = destructionEffects[i];
    ctx.font = "bold 18px Arial";
    ctx.fillStyle = `rgba(255, 50, 50, ${effect.opacity})`;
    ctx.fillText(effect.label, effect.x, effect.y);
    effect.y -= 0.7;         // 위로 떠오르게
    effect.opacity -= 0.02;  // 서서히 사라지게
  }

  // 다 사라진건 제거
  destructionEffects = destructionEffects.filter(e => e.opacity > 0);
}





