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

  currentQuestions = allQuestions.filter(
    q => q.chapter === chapterNumber
  );

  currentQuestions = currentQuestions.sort(
    () => Math.random() - 0.5
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

  showQuestion();
}

function showQuestion() {

  const q = currentQuestions[currentIndex];

  document
    .getElementById("confirmBox")
    .classList.add("hidden");

  document
    .getElementById("chapterTitle")
    .textContent = q.chapterTitle;

  document
    .getElementById("progress")
    .textContent =
    `Question ${currentIndex + 1} of ${currentQuestions.length}`;

  document
    .getElementById("questionText")
    .textContent = q.question;

  const answersDiv =
    document.getElementById("answers");

  answersDiv.innerHTML = "";

  q.answers.forEach((answer, index) => {

    const btn = document.createElement("button");

    btn.textContent = answer;

    btn.className = "answer-btn";

    btn.onclick = () =>
      selectAnswer(index, btn);

    answersDiv.appendChild(btn);

  });

}

function selectAnswer(index, button) {

  selectedAnswer = index;

  document
    .querySelectorAll(".answer-btn")
    .forEach(btn => {
      btn.classList.remove("selected");
    });

  button.classList.add("selected");

  document
    .getElementById("confirmBox")
    .classList.remove("hidden");

}

function confirmAnswer() {

  if (selectedAnswer === null) return;

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

  currentIndex++;
  selectedAnswer = null;

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

    div.innerHTML = `
      <h3>Question ${index + 1}</h3>

      <p>
        <strong>${item.question}</strong>
      </p>

      <p>
        Your Answer:
        ${item.answers[item.selectedAnswer]}
      </p>

      <p>
        Correct Answer:
        ${item.answers[item.correct]}
      </p>

      <p>
        ${item.isCorrect ? "Correct" : "Wrong"}
      </p>

      <p>
        <em>${item.explanation}</em>
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

}