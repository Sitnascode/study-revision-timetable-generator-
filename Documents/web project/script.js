// Array of quiz questions and answers
const questions = [
  {
    question: "What does HTML stand for?",
    answers: [
      { text: "Hyper Text Markup Language", correct: true },
      { text: "Home Tool Markup Language", correct: false },
      { text: "Hyperlinks and Text Markup Language", correct: false },
      { text: "None of the above", correct: false },
    ],
  },
  {
    question:
      "What is the correct syntax for referring to an external script called 'app.js'?",
    answers: [
      { text: "<script src='app.js'>", correct: true },
      { text: "<script href='app.js'>", correct: false },
      { text: "<link rel='script' href='app.js'>", correct: false },
      { text: "<js src='app.js'>", correct: false },
    ],
  },
  {
    question: "Which HTML tag is used to define an internal style sheet?",
    answers: [
      { text: "<style>", correct: true },
      { text: "<css>", correct: false },
      { text: "<script>", correct: false },
      { text: "<link>", correct: false },
    ],
  },
  {
    question: "What does CSS stand for?",
    answers: [
      { text: "Colorful Style Sheets", correct: false },
      { text: "Cascading Style Sheets", correct: true },
      { text: "Computer Style Sheets", correct: false },
      { text: "Creative Style Syntax", correct: false },
    ],
  },
  {
    question: "Inside which HTML element do we put the JavaScript?",
    answers: [
      { text: "<javascript>", correct: false },
      { text: "<script>", correct: true },
      { text: "<js>", correct: false },
      { text: "<code>", correct: false },
    ],
  },
  {
    question: "Which of the following is a JavaScript data type?",
    answers: [
      { text: "Number", correct: true },
      { text: "Font", correct: false },
      { text: "Style", correct: false },
      { text: "Syntax", correct: false },
    ],
  },
];

// DOM elements used in the quiz
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;
let selectedBtn = null;
let timer;
let timerElement;

function showQuestion() {
  resetState();
  startTimer();

  const current = questions[currentQuestionIndex];
  questionEl.textContent = current.question;

  // Generate answer buttons dynamically
  current.answers.forEach((answer) => {
    const btn = document.createElement("button");
    btn.textContent = answer.text;
    btn.classList.add("answer-btn");
    btn.addEventListener("click", () => selectAnswer(btn, answer.correct));
    answersEl.appendChild(btn);
  });
}

// Resets state for the next question
function resetState() {
  clearInterval(timer);
  answersEl.innerHTML = "";
  nextBtn.style.display = "none";
  selectedBtn = null;

  // Create timer element if not already present
  if (!timerElement) {
    timerElement = document.createElement("p");
    timerElement.id = "timer";
    questionEl.parentElement.insertBefore(timerElement, answersEl);
  }
  timerElement.textContent = "Time left: 10s";
}

function selectAnswer(button, correct) {
  const allButtons = document.querySelectorAll(".answer-btn");

  // Reset styles of previously selected buttons
  allButtons.forEach((btn) => {
    btn.classList.remove("selected");
    btn.style.backgroundColor = "";
    btn.style.color = "";
  });

  button.classList.add("selected");
  selectedBtn = { button, correct };

  // Show selected styling only if not in dark mode
  if (!document.body.classList.contains("dark")) {
    button.style.backgroundColor = "#4caf50";
    button.style.color = "#fff";
  }

  nextBtn.style.display = "inline-block";
}

function showScore() {
  resetState();
  questionEl.textContent = `You scored ${score} out of ${questions.length}! 🎉`;
  timerElement.remove(); // Remove timer after quiz ends
}

// Handle Next button logic
nextBtn.addEventListener("click", () => {
  if (selectedBtn?.correct) score++;

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
});

// Starts a countdown timer for each question
function startTimer() {
  let timeLeft = 20;
  timerElement.textContent = `Time left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Time left: ${timeLeft}s`;

    if (timeLeft === 0) {
      clearInterval(timer);

      // Show "Time's up!" message briefly
      timerElement.textContent = "⏳ Time’s up!";

      // Delay moving to next question so user sees the message
      setTimeout(() => {
        if (selectedBtn?.correct) score++; // if answered before timeout

        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
          showQuestion();
        } else {
          showScore();
        }
      }, 1000); // 1 second delay before continuing
    }
  }, 1000);
}

// Display the first question initially
showQuestion();

// Add dark mode toggle button
const darkToggle = document.createElement("button");
darkToggle.textContent = "🌙 Toggle Dark Mode";
darkToggle.classList.add("dark-toggle");
document.body.appendChild(darkToggle);

// Toggle dark mode class on the body
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
