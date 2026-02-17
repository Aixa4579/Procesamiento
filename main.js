

const video = document.getElementById("camera");
const info = document.getElementById("info");
const fact = document.getElementById("fact");

let model;
let maxPredictions;

const MODEL_URL = "ml/";

let predictionHistory = [];
const HISTORY_SIZE = 15;
const CONFIRMATION_RATIO = 0.8;

let currentFlag = null;


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

let cameraStarted = false;

homeBtn.addEventListener('click', async () => {
  const isActive = scores.classList.toggle('active');
  curiosities.classList.toggle('active');
  rotation.classList.toggle('active');
  info.style.display = isActive ? 'none' : 'block';

  if (isActive && !cameraStarted) {
    try {
      await startCamera();
      video.style.display = "block";
      cameraStarted = true;
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se pudo acceder a la cámara.");
    }
  }

  if (!isActive && cameraStarted) {
    const stream = video.srcObject;
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    video.style.display = "none";
    cameraStarted = false;
  }

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
    const wrapper = document.createElement('div');
    wrapper.classList.add('video-item');

    const v = document.createElement('video');
    v.src = video.src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;

    v.addEventListener('click', () => {
      openPreview(video.src);
    });

    wrapper.appendChild(v);
    container.appendChild(wrapper);
  });
}

function openPreview(videoSrc) {
  const previewContainer = document.getElementById('video-preview-container');
  const mainVideo = document.getElementById('main-preview');
  const filtersContainer = document.getElementById('preview-filters');

  previewContainer.classList.remove('preview-hidden');

  mainVideo.src = videoSrc;
  mainVideo.style.filter = "";

  filtersContainer.innerHTML = "";

  Object.keys(filters).forEach(key => {
    const btn = document.createElement('button');
    btn.textContent = filters[key].name;
    btn.classList.add('btn', 'btn-outline-light', 'm-1');

    btn.onclick = () => applyPreviewFilter(key);

    filtersContainer.appendChild(btn);
  });
}

function applyPreviewFilter(key) {
  const mainVideo = document.getElementById('main-preview');
  const controls = document.getElementById('preview-controls');

  controls.innerHTML = filters[key].controls;

  const input = controls.querySelector('input');

  mainVideo.style.filter = filters[key].css(input.value);

  input.oninput = e => {
    const value = e.target.value;
    mainVideo.style.filter = filters[key].css(value);
  };
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
      <input class="Mod-Bar" type="range" min="0" max="10" value="3" data-filter="blur">
    `
  },
  pixel: {
    name: "Pixelado",
    css: () => "",
    extraClass: "pixelated",
    controls: `
      <label>Pixelado&nbsp&nbsp&nbsp</label>
      <input class="Mod-Bar" type="range" min="1" max="10" value="4">
    `
  },
  thermal: {
    name: "Cámara térmica",
    css: thermalFilter,
    controls: `
      <label>Temperatura&nbsp&nbsp&nbsp</label>
      <input class="Mod-Bar" type="range" min="-100" max="100" value="0" data-filter="thermal">
    `
  },
  color: {
    name: "Saturación",
    css: v => `saturate(${v}%)`,
    controls: `
      <label>Saturación&nbsp&nbsp&nbsp</label>
      <input class="Mod-Bar" type="range" min="50" max="200" value="120" data-filter="saturate">
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
    <input class="Mod-Bar" type="range" min="0" max="10" value="3" data-filter="custom">
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
    ? 210 + Math.abs(n) * 30 
    : 180 - n * 160;         

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



// Referente al machine learning

async function loadModel() {
  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  console.log("Modelo cargado correctamente");
}

async function predict() {
  const prediction = await model.predict(video);

  let highest = prediction[0];

  for (let i = 1; i < prediction.length; i++) {
    if (prediction[i].probability > highest.probability) {
      highest = prediction[i];
    }
  }

  if (highest.probability > 0.90) {
    addToHistory(highest.className);
  }

  requestAnimationFrame(predict);
}

function changeInfo(flag) {
  switch (flag) {
    case "Sudafrica":
      fact.textContent = "Sudafrica";
      break;

    case "CoreaSur":
      fact.textContent = "Corea del Sur";
      break;

    case "Japon":
      fact.textContent = "Japón";
      break;

    case "Otro":
      fact.textContent = "¡Prueba escanear una bandera!";
      break;

    case "Tunez":
      fact.textContent = "Tunez";
      break;
  }
}

function addToHistory(className) {
  predictionHistory.push(className);

  if (predictionHistory.length > HISTORY_SIZE) {
    predictionHistory.shift();
  }

  const counts = {};

  predictionHistory.forEach(c => {
    counts[c] = (counts[c] || 0) + 1;
  });

  let mostCommon = null;
  let maxCount = 0;

  for (let key in counts) {
    if (counts[key] > maxCount) {
      maxCount = counts[key];
      mostCommon = key;
    }
  }

  const ratio = maxCount / predictionHistory.length;

  if (ratio > CONFIRMATION_RATIO && mostCommon !== currentFlag) {
    currentFlag = mostCommon;
    changeInfo(currentFlag);
  }
}

async function init() {
  await loadModel();
  predict();
}

init();
