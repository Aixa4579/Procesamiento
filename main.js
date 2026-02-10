// -------------------------------------------------- FUNCIONANDO 

const video = document.getElementById("camera");
const info = document.getElementById("info");

const homeBtn = document.querySelector('.home');
const scores = document.querySelector('.scores');
const curiosities = document.querySelector('.curiosities');
const rotation = document.querySelector('.rotation-bar');

const moreBtn = document.querySelector('.more');
const moreActions = document.querySelector('.more-actions');

const videos = [
  { id: 1, src: 'Mundial1.mp4', title: 'Video 1' },
  { id: 2, src: 'Mundial2.mp4', title: 'Video 2' },
  { id: 3, src: 'Mundial3.mp4', title: 'Video 3' }
];

const createBtn = document.querySelector('.create');
const panel = document.getElementById('create-panel');
const menu = document.querySelector('.menu');
const closeBtn = document.getElementById('close-panel');



const threshold = 0.85;

let model;
let currentFlag = null;
let history = [];

let labels = [];



homeBtn.addEventListener('click', () => {
  const isActive = scores.classList.toggle('active');
  curiosities.classList.toggle('active');
  rotation.classList.toggle('active');
  info.style.display = isActive ? 'none' : 'block';
});

moreBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  moreActions.classList.toggle('active');
});

document.addEventListener('click', () => {
  moreActions.classList.remove('active');
});


/* Esto es para poder arrastrar con mouse o el touch de un celular */
function enableDragScroll(container) {
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.classList.add('active');
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener('mouseleave', () => {
    isDown = false;
  });

  container.addEventListener('mouseup', () => {
    isDown = false;
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  container.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });
}

enableDragScroll(document.querySelector('.video-cont'));
enableDragScroll(document.getElementById('filter-preview'));

closeBtn.addEventListener('click', () => {
  panel.classList.remove('active');
  menu.classList.remove('hidden');
});

const track = document.querySelector('.video-cont');
document.querySelector('.arrow.right').onclick = () => {
  track.scrollLeft += 180;
};

document.querySelector('.arrow.left').onclick = () => {
  track.scrollLeft -= 180;
};

function renderVideoCarousel() {
  const container = document.getElementById('video-list');
  container.innerHTML = '';

  videos.forEach(video => {
    const v = document.createElement('video');
    v.src = video.src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;

    v.addEventListener('click', () => {
      loadFilters(video.src);
    });

    container.appendChild(v);
  });
}

createBtn.addEventListener('click', () => {
  panel.classList.add('active');
  menu.classList.add('hidden');
  renderVideoCarousel();
});


// Cámara
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => resolve();
  });
}


//Filtros

const filters = {
  blur: {
    name: "Desenfoque",
    css: v => `blur(${v}px)`,
    controls: `
      <label>Nivel de desenfoque&nbsp&nbsp&nbsp</label>
      <input type="range" min="0" max="10" value="3" data-filter="blur">
    `
  },
  pixel: {
    name: "Pixelado",
    css: () => "",
    extraClass: "pixelated",
    controls: `
      <label>Pixelado&nbsp&nbsp&nbsp</label>
      <input type="range" min="1" max="10" value="4">
    `
  },
  thermal: {
    name: "Cámara térmica",
    css: thermalFilter,
    controls: `
      <label>Temperatura&nbsp&nbsp&nbsp</label>
      <input type="range" min="-100" max="100" value="0" data-filter="thermal">
    `
  },
  color: {
    name: "Ajuste color",
    css: v => `saturate(${v}%)`,
    controls: `
      <label>Saturación&nbsp&nbsp&nbsp</label>
      <input type="range" min="50" max="200" value="120" data-filter="saturate">
    `
  },
  custom: {
  name: "Suavizado",
  css: v => {
    const blur = v * 0.15;
    const contrast = 100 + v * 1.2;
    const brightness = 100 + v * 0.8;
    const saturation = 100 + v * 0.6;

    return `
      blur(${blur}px)
      contrast(${contrast}%)
      brightness(${brightness}%)
      saturate(${saturation}%)
    `;
  },
  controls: `
    <label>Intensidad de suavizado&nbsp&nbsp</label>
    <input type="range" min="0" max="10" value="3" data-filter="custom">
  `
  }
};

function loadFilters(videoSrc) {
  const container = document.getElementById('filter-preview');
  container.innerHTML = '';

  Object.keys(filters).forEach(key => {
    const v = document.createElement('video');
    v.src = videoSrc;
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.dataset.filter = key;

    if (filters[key].extraClass) {
      v.classList.add(filters[key].extraClass);
    }

    v.style.filter = filters[key].css(3);

    v.onclick = () => selectFilter(v, key);

    container.appendChild(v);
  });
}

function selectFilter(video, key) {
  document.querySelectorAll('#filter-preview video')
    .forEach(v => v.classList.remove('active'));

  video.classList.add('active');

  const controls = document.getElementById('filter-controls');
  controls.innerHTML = filters[key].controls;

  controls.querySelectorAll('input').forEach(input => {
    input.oninput = e => {
      const value = e.target.value;
      video.style.filter = filters[key].css(value);
    };
  });
}

function thermalFilter(temp = 0) {
  const t = Math.max(-100, Math.min(100, temp));
  const n = t / 100;
  const isCold = n < 0;

  const hue = isCold
    ? 210 + Math.abs(n) * 30   // azul a violeta
    : 180 - n * 160;           // amarillo a rojo

  const saturation = isCold
    ? 160 + Math.abs(n) * 60
    : 180 + n * 120;

  const contrast = 140 + Math.abs(n) * 60;

  const brightness = isCold
    ? 95 - Math.abs(n) * 10
    : 105 + n * 15;

  return `
    saturate(${saturation}%)
    contrast(${contrast}%)
    brightness(${brightness}%)
    hue-rotate(${hue}deg)
  `;
}





// -------------------------------------------------- FUNCIONANDO 





async function loadModel() {
  model = await tf.loadGraphModel("ml/model.json");

  const metadata = await fetch("ml/metadata.json")
    .then(res => res.json());

  labels = metadata.labels;
}

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

  if (
    stableLabel &&
    stableLabel !== "Otro" &&
    maxConfidence >= threshold &&
    stableLabel !== currentFlag
  ) {
    currentFlag = stableLabel;
    showInfo(stableLabel);
    console.log("Detectado:", label, maxConfidence);
    return;
  }

  if (!stableLabel || stableLabel === "Otro") {
    clearInfo();
  }
}

function updateHistory(label) {
  history.push(label);
  if (history.length > 5) history.shift();
}

function getStableLabel() {
  const counts = {};
  history.forEach(l => counts[l] = (counts[l] || 0) + 1);

  return Object.keys(counts).find(k => counts[k] >= 3);
}

function showInfo(country) {
  const data = {
    Mexico: "México\nCapital: CDMX\nDato: Tiene 68 lenguas indígenas",
    CoreaSur: "Corea del Sur\nCapital: Seúl\nDato: Tiene uno de los internet más rápidos del mundo",
    Japon: "Japón\nCapital: Tokio\nDato: Más de 6,800 islas"
  };

  info.innerText = data[country] || "";
}

function clearInfo() {
  currentFlag = null;
  info.innerText = "Apunta la cámara a una bandera";
}

async function start() {
  await startCamera();
  await loadModel();
  setInterval(detectFlag, 800);
}

start();
