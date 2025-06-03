// === 전역 변수 ===
let canvas, ctx;
let ballX, ballY, ballRadius, dx, dy, ran = 0;
let paddleX, paddleHeight, paddleWidth;
let rightPressed = false;
let leftPressed = false;
let isGameOver = true;
let isPaused = false;
let igIdx = 0;
const v_s_fast = 200;
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
const ingameMusicPath = ["musics/ingame/iwbtb.mp3", "musics/ingame/train.mp3", "musics/ingame/metalslug.mp3", "musics/ingame/acidrain.mp3"];
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

$(window).ready(function() {
  $("#start-button").on("click", showLevelSelectionPage);
  $("#options-button").on("click", showOptions);
  $("#guitar-button").on("click", showGuitar);
  $(".game-start").on("click", init);
  $(".back-button").on("click", showMainMenu);


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
        requestAnimationFrame(draw);
      }
      else {
        isPaused = true;
        $("#pause-panel").show();
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

  $("#game-area").hide();
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

  $("#game-area").hide();
  $("#ps").hide();

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
  $("#pause-panel").hide();

  initShowHide();
  stopMusic();
  ingameMusic[igIdx].play();

  canvas = $("#gameCanvas")[0];
  ctx = canvas.getContext("2d");

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
  $("#game-area").show();
  $("#gameCanvas").show();
  $("#ps").show();
  $(".pop-up-massage").hide();
}

function createBricks(addRow = false) {
  const bombCount = 2;
  const bombPositions = [];

  while (bombPositions.length < bombCount) {
    const c = Math.floor(Math.random() * brickColumnCount);
    const r = addRow ? 0 : Math.floor(Math.random() * brickRowCount);
    const key = `${c}-${r}`;
    if (!bombPositions.includes(key)) bombPositions.push(key);
  }

  if (addRow) {
    for (let c = 0; c < brickColumnCount; c++) {
      if (!bricks[c]) {
        bricks[c] = [];
      }

      for (let r = bricks[c].length - 1; r >= 0; r--) {
        bricks[c][r + 1] = { ...bricks[c][r] };
        bricks[c][r + 1].y += (brickHeight + brickPadding);
      }
      const isBomb = bombPositions.includes(`${c}-0`);
      const elementIndex = Math.floor(Math.random() * destructibleElements.length);
      bricks[c][0] = {
        x: c * (brickWidth + brickPadding) + brickOffsetLeft,
        y: brickOffsetTop,
        status: 1,
        isBomb: isBomb,
        targetSelector: destructibleElements[elementIndex]?.selector,
        tagLabel: destructibleElements[elementIndex]?.label
      };
    }
  } else {
    let index = 0;
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        const isBomb = bombPositions.includes(`${c}-${r}`);
        const elementIndex = index % destructibleElements.length;
        bricks[c][r] = {
          x: c * (brickWidth + brickPadding) + brickOffsetLeft,
          y: r * (brickHeight + brickPadding) + brickOffsetTop,
          status: 1,
          isBomb: isBomb,
          targetSelector: destructibleElements[elementIndex]?.selector,
          tagLabel: destructibleElements[elementIndex]?.label
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

  // iframe 내부 document 접근
  const iframe = document.getElementById("labFrame");
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

  if (!iframeDoc) return;

  // iframe 내부에서 selector로 대상 찾기
  const target = iframeDoc.querySelector(b.targetSelector);
  if (target) target.remove();

  // 폭탄 처리 (연쇄 파괴)
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