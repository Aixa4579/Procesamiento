const questions = [
  {
    question: "¿Qué selección asiática es una de las más constantes en clasificar a los Mundiales recientes?",
    image: "img/Balon.png",
    options: ["Corea del Sur", "Tailandia", "Japón", "Uzbekistán"],
    correct: "Japón"
  },
  {
    question: "¿Quién ganó el Mundial 2018?",
    image: "img/Balon.png",
    options: ["Brasil", "Alemania", "Francia", "Argentina"],
    correct: "Francia"
  },
  {
    question: "¿Cuántos jugadores hay en cancha por equipo?",
    image: "img/Balon.png",
    options: ["9", "10", "11", "12"],
    correct: "11"
  },
  {
    question: "¿Qué país ha ganado más Mundiales?",
    image: "img/Balon.png",
    options: ["Alemania", "Brasil", "Italia", "Argentina"],
    correct: "Brasil"
  },
  {
    question: "¿En qué año fue el primer Mundial?",
    image: "img/Balon.png",
    options: ["1920", "1930", "1940", "1950"],
    correct: "1930"
  },
  {
    question: "¿Qué selección ganó el Mundial 2022?",
    image: "img/Balon.png",
    options: ["Francia", "Brasil", "Argentina", "España"],
    correct: "Argentina"
  },
  {
    question: "¿Qué jugador es conocido como 'CR7'?",
    image: "img/Balon.png",
    options: ["Messi", "Cristiano Ronaldo", "Mbappé", "Neymar"],
    correct: "Cristiano Ronaldo"
  },
  {
    question: "¿Qué país organizó el Mundial 2014?",
    image: "img/Balon.png",
    options: ["Rusia", "Brasil", "Sudáfrica", "Alemania"],
    correct: "Brasil"
  },
  {
    question: "¿Cuánto dura un partido oficial?",
    image: "img/Balon.png",
    options: ["80 minutos", "90 minutos", "100 minutos", "120 minutos"],
    correct: "90 minutos"
  },
  {
    question: "¿Qué selección ganó el Mundial 2010?",
    image: "img/Balon.png",
    options: ["España", "Países Bajos", "Alemania", "Brasil"],
    correct: "España"
  }
];

let CIndex = 0;
let score = 0;

const TrivQuestion = document.querySelector(".Trivia-Question");
const TrivImg = document.querySelector(".Trivia-Image img");
const TrivOpt = document.querySelector(".Trivia-Options");
const TrivCount = document.querySelector(".Question-Count");

function LoadQuestion() {
  const CurrentQuestion = questions[CIndex];

  TrivCount.textContent = `Pregunta ${CIndex + 1} de ${questions.length}`;
  TrivQuestion.textContent = CurrentQuestion.question;

  const ImgContainer = document.querySelector(".Trivia-Image");

  if (CurrentQuestion.image && CurrentQuestion.image.trim() !== "") {
    ImgContainer.innerHTML = `
      <img src="${CurrentQuestion.image}" class="img-fluid" alt="image question">
    `;
  } else {
    ImgContainer.innerHTML = "";
  }

  TrivOpt.innerHTML = "";

  CurrentQuestion.options.forEach(option => {
    const button = document.createElement("button");
    button.classList.add("Option");
    button.textContent = option;
    button.addEventListener("click", () => checkAnswer(option, button));
    TrivOpt.appendChild(button);
  });
}

function checkAnswer(SelectedOption, ClickedButton) {
  const correct = questions[CIndex].correct;
  const buttons = document.querySelectorAll(".Option");

  buttons.forEach(button => {
    button.disabled = true;

    if (button.textContent === correct) {
      button.classList.add("btn", "btn-success");
    }
  });

  if (SelectedOption === correct) {
    score++;
    ClickedButton.classList.add("btn", "btn-success");
  } else {
    ClickedButton.classList.add("btn", "btn-danger");
  }

  setTimeout(() => {
    CIndex++;
    if (CIndex < questions.length) {
      LoadQuestion();
    } else {
      ShowScore();
    }
  }, 500);
}

function ShowScore() {
  document.querySelector(".Trivia-Card").innerHTML = `
    <div class="text-center">
      <h2>¡Has completado la trivia!</h2><br>
      <p>Respondiste correctamente ${score} de ${questions.length} preguntas.</p>
      <button class="btn btn-primary mt-3" onclick="location.reload()">Reintentar</button>
    </div>
  `;
}

function reiniciarTrivia() {
  CIndex = 0;
  score = 0;
  LoadQuestion();
}

LoadQuestion();