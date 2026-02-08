const video = document.getElementById("camera");
const info = document.getElementById("info");

let model;
let currentFlag = null;
let history = [];

let labels = [];
const threshold = 0.85;

// --------------------
// Cámara
// --------------------
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => resolve();
  });
}

// --------------------
// Modelo
// --------------------
async function loadModel() {
  model = await tf.loadGraphModel("ml/model.json");

  const metadata = await fetch("ml/metadata.json")
    .then(res => res.json());

  labels = metadata.labels;
}

// --------------------
// Detección
// --------------------
async function detectFlag() {
  if (!model || video.readyState !== 4) return;

  const predictions = await tf.tidy(() => {
    const tensor = tf.browser.fromPixels(video)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .div(255)
      .expandDims();

    return model.predict(tensor);
  }).data();

  console.log(labels, predictions);

  const maxConfidence = Math.max(...predictions);
  const maxIndex = predictions.indexOf(maxConfidence);
  const label = labels[maxIndex];

  updateHistory(label);
  const stableLabel = getStableLabel();

  // --- Mostrar info SOLO si hay detección estable ---
  if (
    stableLabel &&
    stableLabel !== "Otro" &&
    maxConfidence >= threshold &&
    stableLabel !== currentFlag
  ) {
    currentFlag = stableLabel;
    showInfo(stableLabel);
    console.log("Detectado:", label, maxConfidence);
    return; // 👈 evita limpiar en el mismo frame
  }

  // --- Limpiar SOLO si ya no hay detección estable ---
  if (!stableLabel || stableLabel === "Otro") {
    clearInfo();
  }
}

// --------------------
// Suavizado temporal
// --------------------
function updateHistory(label) {
  history.push(label);
  if (history.length > 5) history.shift();
}

function getStableLabel() {
  const counts = {};
  history.forEach(l => counts[l] = (counts[l] || 0) + 1);

  return Object.keys(counts).find(k => counts[k] >= 3);
}

// --------------------
// UI
// --------------------
function showInfo(country) {
  const data = {
    Mexico: "🇲🇽 México\nCapital: CDMX\nDato: Tiene 68 lenguas indígenas",
    CoreaSur: "🇰🇷 Corea del Sur\nCapital: Seúl\nDato: Tiene uno de los internet más rápidos del mundo",
    Japon: "🇯🇵 Japón\nCapital: Tokio\nDato: Más de 6,800 islas"
  };

  info.innerText = data[country] || "";
}

function clearInfo() {
  currentFlag = null;
  info.innerText = "Apunta la cámara a una bandera 🇲🇽 🇰🇷 🇯🇵";
}

// --------------------
// Loop principal
// --------------------
async function start() {
  await startCamera();
  await loadModel();
  setInterval(detectFlag, 800);
}

start();
