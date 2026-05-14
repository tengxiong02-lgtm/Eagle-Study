let allQuestions = [];
let currentQuestions = [];
let currentIndex = 0;
let selectedAnswer = null;
let userAnswers = [];
let wrongAnswers = [];
let answeredCurrentQuestion = false;

async function startChapter(type, chapterNumber) {
  const file =
    type === "product"
      ? "./data/questions-product.json"
      : "./data/questions-strategy.json";

  try {
    const response = await fetch(file);

    if (!response.ok) {
      throw new Error("Failed to load JSON file: " + file);
    }

    allQuestions = await response.json();
  } catch (error) {
    alert("Error loading quiz data. Check that your data folder and JSON files are uploaded correctly.");
    console.error(error);
    return;
  }

  currentQuestions = allQuestions.filter(function (q) {
    return Number(q.chapter) === Number(chapterNumber);
  });

  if (currentQuestions.length === 0) {
    alert("No questions found for this chapter yet.");
    return;
  }

  currentQuestions = currentQuestions.sort(function () {
    return Math.random() - 0.5;
  });

  currentIndex = 0;
  selectedAnswer = null;
  userAnswers = [];
  wrongAnswers = [];
  answeredCurrentQuestion = false;

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  document.getElementById("reviewArea").innerHTML = "";

  showQuestion();
}

function showQuestion() {
  const q = currentQuestions[currentIndex];

  selectedAnswer = null;
  answeredCurrentQuestion = false;

  document.getElementById("chapterTitle").textContent = q.chapterTitle || "Quiz";
  document.getElementById("progress").textContent =
    "Question " + (currentIndex + 1) + " of " + currentQuestions.length;
  document.getElementById("questionText").textContent = q.question;

  document.getElementById("feedbackBox").classList.add("hidden");
  document.getElementById("feedbackBox").innerHTML = "";
  document.getElementById("nextButton").classList.add("hidden");

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  q.answers.forEach(function (answer, index) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = answer;
    btn.className = "answer-btn";
    btn.onclick = function () {
      selectAnswer(index);
    };
    answersDiv.appendChild(btn);
  });
}

function selectAnswer(index) {
  if (answeredCurrentQuestion) return;

  answeredCurrentQuestion = true;
  selectedAnswer = index;

  const q = currentQuestions[currentIndex];
  const isCorrect = selectedAnswer === q.correct;

  userAnswers.push({
    question: q.question,
    answers: q.answers,
    correct: q.correct,
    selectedAnswer: selectedAnswer,
    isCorrect: isCorrect,
    correctExplanation: q.correctExplanation || q.explanation || "",
    wrongExplanations: q.wrongExplanations || []
  });

  if (!isCorrect) {
    wrongAnswers.push(q);
  }

  const answerButtons = document.querySelectorAll(".answer-btn");

  answerButtons.forEach(function (btn, btnIndex) {
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

  let html = "";

  html += "<h3>" + (isCorrect ? "Correct" : "Wrong") + "</h3>";
  html += "<p><strong>Correct Answer:</strong> " + q.answers[q.correct] + "</p>";

  if (q.correctExplanation || q.explanation) {
    html += "<p><strong>Why it is correct:</strong> " + (q.correctExplanation || q.explanation) + "</p>";
  }

  if (q.wrongExplanations && q.wrongExplanations.length > 0) {
    html += "<h4>Why the other answers are not correct:</h4>";
    html += "<ul>";

    q.wrongExplanations.forEach(function (item) {
      html += "<li><strong>" + item.answer + ":</strong> " + item.explanation + "</li>";
    });

    html += "</ul>";
  }

  feedbackBox.innerHTML = html;
  feedbackBox.classList.remove("hidden");

  document.getElementById("nextButton").classList.remove("hidden");

  if (currentIndex === currentQuestions.length - 1) {
    document.getElementById("nextButton").textContent = "Finish Quiz";
  } else {
    document.getElementById("nextButton").textContent = "Next Question";
  }
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

  const correct = userAnswers.filter(function (a) {
    return a.isCorrect;
  }).length;

  document.getElementById("scoreText").textContent =
    "Score: " + correct + " / " + userAnswers.length;
}

function retakeWrong() {
  if (wrongAnswers.length === 0) {
    alert("No wrong answers to retake.");
    return;
  }

  currentQuestions = wrongAnswers.slice();
  currentIndex = 0;
  selectedAnswer = null;
  userAnswers = [];
  wrongAnswers = [];
  answeredCurrentQuestion = false;

  document.getElementById("results").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");
  document.getElementById("reviewArea").innerHTML = "";

  showQuestion();
}

function reviewAnswers() {
  const reviewArea = document.getElementById("reviewArea");
  reviewArea.innerHTML = "";

  userAnswers.forEach(function (item, index) {
    const div = document.createElement("div");
    div.className = "review-card";

    let html = "";
    html += "<h3>Question " + (index + 1) + "</h3>";
    html += "<p><strong>" + item.question + "</strong></p>";
    html += "<p>Your Answer: " + item.answers[item.selectedAnswer] + "</p>";
    html += "<p>Correct Answer: " + item.answers[item.correct] + "</p>";
    html += "<p>" + (item.isCorrect ? "Correct" : "Wrong") + "</p>";

    if (item.correctExplanation) {
      html += "<p><strong>Why correct:</strong> " + item.correctExplanation + "</p>";
    }

    div.innerHTML = html;
    reviewArea.appendChild(div);
  });
}

function backToMenu() {
  document.getElementById("results").classList.add("hidden");
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("reviewArea").innerHTML = "";
}
