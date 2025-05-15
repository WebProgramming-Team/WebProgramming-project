
// === 전역 변수 ===
let canvas, ctx;
let ballX, ballY, ballRadius, dx, dy;
let paddleX, paddleHeight, paddleWidth;
let rightPressed = false;
let leftPressed = false;
let isGameOver = false;

let score = 0;   //점수

//이 아래는 벽돌배열입니다.

// 벽돌 관련 설정
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// 벽돌 배열 초기화
let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 }; // status = 1 이면 살아있음
  }
}

//벽돌 이미지
const brickImage = new Image();
brickImage.src = "bricks.jpg";

//벽돌 그리기 함수
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        // ctx.beginPath();
        // ctx.rect(brickX, brickY, brickWidth, brickHeight);
        // ctx.fillStyle = "#f00";
        // ctx.fill();
        // ctx.closePath();
        if (brickImage.complete) {
          ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
        } else {
          brickImage.onload = () => {
            ctx.drawImage(brickImage, brickX, brickY, brickWidth, brickHeight);
          };
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
      }
    }
  }
}
}

//점수 그리기 함수
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
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


$(function () {

  canvas = $("#gameCanvas")[0];
  ctx = canvas.getContext("2d");

  // 공
  ballX = canvas.width / 2;
  ballY = canvas.height - 30;
  ballRadius = 10;
  dx = 2;
  dy = -2;

  // 막대
  paddleHeight = 10;
  paddleWidth = 140;
  paddleX = (canvas.width - paddleWidth) / 2;
  rightPressed = false;
  leftPressed = false;

  // 이벤트 리스너
  $(document).on("keydown", function (e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
  });

  $(document).on("keyup", function (e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
  });

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
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

  function draw() {


    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);  //화면 초기화

    drawBricks();  // 벽돌부터 그림
    drawBall();  //공 그림
    drawPaddle();  //막대 그림
    drawScore();          // 점수 표시
    collisionDetection();

    // 벽 충돌 처리
    if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) dx = -dx;
    if (ballY + dy < ballRadius) dy = -dy;
    else if (ballY + dy > canvas.height - ballRadius) {
      // 막대 충돌 확인
      if (ballX > paddleX && ballX < paddleX + paddleWidth) {
        dy = -dy;
      } else {
        isGameOver = true; // 다시 그리지 않도록 플래그 설정
        alert("게임 오버! 최종점수: "+score+"\n다시 시작합니다.");
        document.location.reload();
        return; // draw() 탈출
      }
    }

    ballX += dx;
    ballY += dy;

    // 막대 이동
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += 5;
    else if (leftPressed && paddleX > 0) paddleX -= 5;

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

  brickImage.onload = () => {
  draw(); // 이미지가 준비된 후 게임 시작
};

  // draw();
});

