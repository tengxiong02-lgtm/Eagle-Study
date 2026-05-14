let allQuestions = [];
let currentQuestions = [];
let currentIndex = 0;
let selectedAnswer = null;
let userAnswers = [];
let wrongAnswers = [];

/*
  GitHub Pages safe loader:
  This tries BOTH possible JSON locations:
  1. ./data/questions-product.json
  2. questions-product.json
*/

async function loadQuizData(type, chapterNumber) {

  const chapterFileName = `chapter-${chapterNumber}.json`;

  const legacyFiles =
    type === "product"
      ? [
          "./data/questions-product.json",
          "questions-product.json"
        ]
      : [
          "./data/questions-strategy.json",
          "questions-strategy.json"
        ];

  const possibleFiles = [
    `./data/${chapterFileName}`,
    chapterFileName,
    ...legacyFiles
  ];

  let lastError = null;

  for (const file of possibleFiles) {

    try {

      const response = await fetch(file, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Could not load ${file}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(`${file} is not a valid JSON array.`);
      }

      return data;

    } catch (error) {

      lastError = error;
      console.warn(error);

    }

  }

  throw lastError;
}

async function startChapter(type, chapterNumber) {

  try {

    allQuestions = await loadQuizData(type, chapterNumber);

  } catch (error) {

    alert(
      "Error loading quiz data.\n\nMake sure your JSON file is uploaded correctly."
    );

    console.error(error);

    return;
  }

  currentQuestions = allQuestions.filter(
    q => Number(q.chapter) === Number(chapterNumber)
  );

  currentIndex = 0;
  selectedAnswer = null;
  userAnswers = [];
  wrongAnswers = [];

  document
    .getElementById("menu")
    .classList.add("hidden");

  document
    .getElementById("results")
    .classList.add("hidden");

  document
    .getElementById("quiz")
    .classList.remove("hidden");

  if (currentQuestions.length === 0) {

    showNoQuestions(chapterNumber);

    return;
  }

  currentQuestions = currentQuestions.sort(
    () => Math.random() - 0.5
  );

  showQuestion();
}

function showNoQuestions(chapterNumber) {

  document
    .getElementById("chapterTitle")
    .textContent = `Chapter ${chapterNumber}`;

  document
    .getElementById("progress")
    .textContent = "";

  document
    .getElementById("questionText")
    .textContent =
    "No questions have been added for this chapter yet.";

  document
    .getElementById("answers")
    .innerHTML = `
      <button onclick="backToMenu()">
        Back to Main Menu
      </button>
    `;

  document
    .getElementById("feedbackBox")
    .classList.add("hidden");

  document
    .getElementById("feedbackBox")
    .innerHTML = "";

  document
    .getElementById("nextButton")
    .classList.add("hidden");
}

function showQuestion() {

  const q = currentQuestions[currentIndex];

  selectedAnswer = null;

  document
    .getElementById("chapterTitle")
    .textContent =
    q.chapterTitle || `Chapter ${q.chapter}`;

  document
    .getElementById("progress")
    .textContent =
    `Question ${currentIndex + 1} of ${currentQuestions.length}`;

  document
    .getElementById("questionText")
    .textContent = q.question;

  document
    .getElementById("feedbackBox")
    .classList.add("hidden");

  document
    .getElementById("feedbackBox")
    .innerHTML = "";

  document
    .getElementById("nextButton")
    .classList.add("hidden");

  const answersDiv =
    document.getElementById("answers");

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

  const isCorrect =
    selectedAnswer === q.correct;

  userAnswers.push({
    ...q,
    selectedAnswer,
    isCorrect
  });

  if (!isCorrect) {
    wrongAnswers.push(q);
  }

  const answerButtons =
    document.querySelectorAll(".answer-btn");

  answerButtons.forEach((btn, btnIndex) => {

    btn.disabled = true;

    if (btnIndex === q.correct) {
      btn.classList.add("correct-answer");
    }

    if (
      btnIndex === selectedAnswer &&
      btnIndex !== q.correct
    ) {
      btn.classList.add("wrong-answer");
    }

  });

  showFeedback(q, isCorrect);
}

function showFeedback(q, isCorrect) {

  const feedbackBox =
    document.getElementById("feedbackBox");

  const resultText =
    isCorrect ? "Correct" : "Wrong";

  const correctExplanation =
    q.correctExplanation ||
    q.explanation ||
    "This is the correct answer based on the study material.";

  let html = `
    <h3>${resultText}</h3>

    <p>
      <strong>Correct Answer:</strong>
      ${q.answers[q.correct]}
    </p>

    <p>
      <strong>Why it is correct:</strong>
      ${correctExplanation}
    </p>
  `;

  if (
    Array.isArray(q.wrongExplanations) &&
    q.wrongExplanations.length > 0
  ) {

    html += `
      <h4>
        Why the others are not correct:
      </h4>

      <ul>
    `;

    q.wrongExplanations.forEach(item => {

      html += `
        <li>
          <strong>${item.answer}:</strong>
          ${item.explanation}
        </li>
      `;

    });

    html += `</ul>`;
  }

  feedbackBox.innerHTML = html;

  feedbackBox.classList.remove("hidden");

  document
    .getElementById("nextButton")
    .classList.remove("hidden");
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

  document
    .getElementById("quiz")
    .classList.add("hidden");

  document
    .getElementById("results")
    .classList.remove("hidden");

  const correct =
    userAnswers.filter(
      a => a.isCorrect
    ).length;

  document
    .getElementById("scoreText")
    .textContent =
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

  document
    .getElementById("results")
    .classList.add("hidden");

  document
    .getElementById("quiz")
    .classList.remove("hidden");

  showQuestion();
}

function reviewAnswers() {

  const reviewArea =
    document.getElementById("reviewArea");

  reviewArea.innerHTML = "";

  userAnswers.forEach((item, index) => {

    const div = document.createElement("div");

    div.className = "review-card";

    const correctExplanation =
      item.correctExplanation ||
      item.explanation ||
      "This is the correct answer based on the study material.";

    div.innerHTML = `
      <h3>Question ${index + 1}</h3>

      <p>
        <strong>${item.question}</strong>
      </p>

      <p>
        <strong>Your Answer:</strong>
        ${item.answers[item.selectedAnswer]}
      </p>

      <p>
        <strong>Correct Answer:</strong>
        ${item.answers[item.correct]}
      </p>

      <p>
        <strong>Result:</strong>
        ${item.isCorrect ? "Correct" : "Wrong"}
      </p>

      <p>
        <strong>Why correct:</strong>
        ${correctExplanation}
      </p>
    `;

    reviewArea.appendChild(div);

  });

}

function backToMenu() {

  document
    .getElementById("results")
    .classList.add("hidden");

  document
    .getElementById("quiz")
    .classList.add("hidden");

  document
    .getElementById("menu")
    .classList.remove("hidden");

  const reviewArea =
    document.getElementById("reviewArea");

  if (reviewArea) {
    reviewArea.innerHTML = "";
  }

}
