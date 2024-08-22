const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const codeWordElement = document.getElementById("codeWord");
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hasScratchedCode = false;

// Ridimensiona il canvas in modo responsive
function resizeCanvas() {
  const scratchCard = document.getElementById("scratchCard");
  const rect = scratchCard.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  redraw(); // Ridisegna il contenuto
}

// Ridisegna il contenuto del canvas
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffe2a3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ridisegna l'immagine
  make_base();

  ctx.globalCompositeOperation = "destination-out";
}

function getCoords(e) {
  let x, y;
  if (e.touches && e.touches.length > 0) {
    const touch = e.touches[0];
    x = touch.clientX - canvas.getBoundingClientRect().left;
    y = touch.clientY - canvas.getBoundingClientRect().top;
  } else {
    x = e.offsetX;
    y = e.offsetY;
  }
  return [x, y];
}

function isScratchOnCode(x, y) {
  const codeRect = codeWordElement.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();

  const codeX = codeRect.left - canvasRect.left;
  const codeY = codeRect.top - canvasRect.top;
  const codeWidth = codeRect.width;
  const codeHeight = codeRect.height;

  return (
    x >= codeX &&
    x <= codeX + codeWidth &&
    y >= codeY &&
    y <= codeY + codeHeight
  );
}

function draw(e) {
  if (!isDrawing) return;

  const [x, y] = getCoords(e);

  ctx.lineWidth = 30;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(0,0,0,0.5)";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  if (isScratchOnCode(x, y)) {
    hasScratchedCode = true;
  }

  [lastX, lastY] = [x, y];
  e.preventDefault();
}

function startDrawing(e) {
  isDrawing = true;
  [lastX, lastY] = getCoords(e);
}

function stopDrawing() {
  isDrawing = false;
  if (hasScratchedCode) {
    alert("Hai rivelato il codice!");
    hasScratchedCode = false;
  }
}

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("touchstart", startDrawing);

canvas.addEventListener("mousemove", draw);
canvas.addEventListener("touchmove", draw);

canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("touchend", stopDrawing);

canvas.addEventListener("mouseout", stopDrawing);

function make_base() {
  const base_image = new Image();
  base_image.src = "./src/hbd-cake.png";
  base_image.onload = function () {
    ctx.drawImage(base_image, 0, canvas.height * 0.33, canvas.width, canvas.height * 0.33);
  };
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Inizializza con la dimensione corretta

// Aggiungi le parole mescolate alla pagina in posizioni casuali senza sovrapposizioni
const words = [
  "Suka1",
  "Suka2",
  "Suka3",
  "Suka4",
  "Suka5",
  "Suka11",
  "Suka22",
  "Suka33",
  "Suka44",
  "Suka55",
];

// Funzione per mescolare l'array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

shuffleArray(words);

// Funzione per verificare la collisione tra due elementi
function isOverlapping(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

// Funzione per trovare una posizione senza sovrapposizioni
function findPositionWithoutOverlap(
  element,
  container,
  existingElements
) {
  let overlaps = true;
  let attempts = 0;

  while (overlaps && attempts < 100) {
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    const availableWidth = containerRect.width - elementRect.width;
    const availableHeight = containerRect.height - elementRect.height;

    const x = Math.random() * availableWidth;
    const y = Math.random() * availableHeight;

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;

    overlaps = false;

    for (let i = 0; i < existingElements.length; i++) {
      if (isOverlapping(element, existingElements[i])) {
        overlaps = true;
        break;
      }
    }

    attempts++;
  }
}

const scratchCard = document.getElementById("scratchCard");
const existingElements = [];

words.forEach((word) => {
  const wordElement = document.createElement("div");
  wordElement.classList.add("messageWord");
  wordElement.textContent = word;

  scratchCard.appendChild(wordElement);
  findPositionWithoutOverlap(wordElement, scratchCard, existingElements);

  existingElements.push(wordElement);
});
