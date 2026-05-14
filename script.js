let allQuestions = [];
let currentQuestions = [];
let currentIndex = 0;
let selectedAnswer = null;
let userAnswers = [];
let wrongAnswers = [];

async function startChapter(type, chapterNumber) {
  const file =
    type === "product"
      ? "./data/questions-product.json"
      : "./data/questions-strategy.json";

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error("Failed to load JSON.");
    }

    allQuestions = await response.json();
  } catch (error) {
    alert("Error loading quiz data.");
    console.error(error);
    return;
  }

  currentQuestions = allQuestions.filter(q => q.chapter === chapterNumber);
  currentQuestions = currentQuestions.sort(() => Math.random() - 0.5);

  currentIndex = 0;
  selectedAnswer = null;
  userAnswers = [];
  wrongAnswers = [];

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  showQuestion();
}

function showQuestion() {
  const q = currentQuestions[currentIndex];

  selectedAnswer = null;

  document.getElementById("chapterTitle").textContent = q.chapterTitle;
  document.getElementById("progress").textContent =
    `Question ${currentIndex + 1} of ${currentQuestions.length}`;
  document.getElementById("questionText").textContent = q.question;

  document.getElementById("feedbackBox").classList.add("hidden");
  document.getElementById("feedbackBox").innerHTML = "";
  document.getElementById("nextButton").classList.add("hidden");

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.className = "answer-btn";
    btn.onclick = () => selectAnswer(index);
    answersDiv.appendChild(btn);
  });
}

function selectAnswer(index) {
  if (selectedAnswer !== null) return;

  selectedAnswer = index;

  const q = currentQuestions[currentIndex];
  const isCorrect = selectedAnswer === q.correct;

  userAnswers.push({
    ...q,
    selectedAnswer,
    isCorrect
  });

  if (!isCorrect) {
    wrongAnswers.push(q);
  }

  const answerButtons = document.querySelectorAll(".answer-btn");

  answerButtons.forEach((btn, btnIndex) => {
    btn.disabled = true;

    if (btnIndex === q.correct) {
      btn.classList.add("correct-answer");
    }

    if (btnIndex === selectedAnswer && btnIndex !== q.correct) {
      btn.classList.add("wrong-answer");
    }
  });

  showFeedback(q, isCorrect);
}

function showFeedback(q, isCorrect) {
  const feedbackBox = document.getElementById("feedbackBox");

  let resultText = isCorrect ? "Correct" : "Wrong";

  let html = `
    <h3>${resultText}</h3>
    <p><strong>Correct Answer:</strong> ${q.answers[q.correct]}</p>
    <p><strong>Why it is correct:</strong> ${q.correctExplanation}</p>
    <h4>Why the others are not correct:</h4>
    <ul>
  `;

  q.wrongExplanations.forEach(item => {
    html += `<li><strong>${item.answer}:</strong> ${item.explanation}</li>`;
  });

  html += `
    </ul>
  `;

  feedbackBox.innerHTML = html;
  feedbackBox.classList.remove("hidden");

  document.getElementById("nextButton").classList.remove("hidden");
}

function nextQuestion() {
  currentIndex++;

  if (currentIndex < currentQuestions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("results").classList.remove("hidden");

  const correct = userAnswers.filter(a => a.isCorrect).length;

  document.getElementById("scoreText").textContent =
    `Score: ${correct} / ${userAnswers.length}`;
}

function retakeWrong() {
  if (wrongAnswers.length === 0) {
    alert("No wrong answers to retake.");
    return;
  }

  currentQuestions = [...wrongAnswers];
  currentIndex = 0;
  selectedAnswer = null;
  userAnswers = [];
  wrongAnswers = [];

  document.getElementById("results").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  showQuestion();
}

function reviewAnswers() {
  const reviewArea = document.getElementById("reviewArea");
  reviewArea.innerHTML = "";

  userAnswers.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "review-card";

    div.innerHTML = `
      <h3>Question ${index + 1}</h3>
      <p><strong>${item.question}</strong></p>
      <p>Your Answer: ${item.answers[item.selectedAnswer]}</p>
      <p>Correct Answer: ${item.answers[item.correct]}</p>
      <p>${item.isCorrect ? "Correct" : "Wrong"}</p>
      <p><strong>Why correct:</strong> ${item.correctExplanation}</p>
    `;

    reviewArea.appendChild(div);
  });
}

function backToMenu() {
  document.getElementById("results").classList.add("hidden");
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
}
