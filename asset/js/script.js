let word;










window.addEventListener("load", function(){

  // ナビゲーションバーの挙動設定
  document.querySelectorAll("nav>ul>li").forEach(li => {
    li.addEventListener("click", function(){
      document.querySelectorAll("nav>ul>li").forEach(e => {
        e.dataset.state = "";
      });
      this.dataset.state = "current";
      document.getElementById("main-carousel").dataset.tab = this.dataset.tab;
    });
    if(li.dataset.state == "current"){
      li.click();
    }
  });

  document.getElementById("quiz-container").addEventListener("submit", e => {
    e.preventDefault();
    checkAnswer(word);
  });
});









const SUPABASE_URL = "https://lrytnwoeldjavdjoidui.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyeXRud29lbGRqYXZkam9pZHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTg3NjMsImV4cCI6MjA5NTk3NDc2M30.rydduNQJkYjG1hxUUA2exGPulDXNGndh_Y-YoQsAiGU";

let ALL_WORDS = [];

async function loadWords() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/word?select=*`,
      {
        method: "GET",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${await response.text()}`
      );
    }

    ALL_WORDS = await response.json();

    console.log(`取得件数: ${ALL_WORDS.length}`);

  } catch (error) {
    console.error("単語データの取得に失敗:", error);
  }
}










window.addEventListener("load", async () => {
  await loadWords();
  
  console.log(ALL_WORDS);

  word = getNextWord();

  newQuiz(word);
});











function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let shuffledWords = shuffle(ALL_WORDS);
let currentIndex = 0;

function getNextWord() {
  if (currentIndex >= shuffledWords.length) {
    shuffledWords = shuffle(ALL_WORDS);
    currentIndex = 0;
  }

  return shuffledWords[currentIndex++];
}









function newQuiz(w){
  document.getElementById("quiz-japanese").textContent = w.japanese;
}

function checkAnswer(w){
  const answer = document.getElementById("quiz-answer").value;
  const german = w.german;

  document.getElementById("quiz-german").textContent = german;
  if(answer == german){
    document.getElementById("quiz-german").dataset.t_or_f = "true";
  }
  else{
    document.getElementById("quiz-german").dataset.t_or_f = "false";
  }
}
