let word;










window.addEventListener("load", function(){

  // ナビゲーションバーの挙動設定
  document.querySelectorAll("nav>ul>li").forEach(li => {
    li.addEventListener("click", function(){
      document.querySelectorAll("nav>ul>li").forEach(e => {
        e.dataset.state = "";
      });
      this.dataset.state = "current";

      // タブ移動
      document.getElementById("main-carousel").style.left = `${Array.from(this.parentElement.children).indexOf(this) * (-100)}dvw`
      
      // 単語帳タブを開いたときに問題を読み込み
      if(this.dataset.tab == "quiz" && !document.getElementById("quiz-japanese").textContent){
        newQuiz(word);
      }
    });

    // デバッグ用
    if(li.dataset.state == "current"){
      li.click();
    }
  });

  // 単語入力の挙動を設定（→ボタンが押されたら自動でキーボードを非表示化）
  document.getElementById("quiz-container").addEventListener("submit", e => {
    e.preventDefault();
    document.getElementById("quiz-answer").blur();
    checkAnswer(word);
  });

  document.getElementById("request-form").addEventListener("submit", function(){
    console.log("submitted");
    document.getElementById("request-form-thanks").classList.add("active");
    document.getElementById("request-form-thanks-bcg").classList.add("active");
    window.setTimeout(
      function(){
        document.getElementById("request-form-thanks").classList.remove("active");
        document.getElementById("request-form-thanks-bcg").classList.remove("active");
      },
      2000
    );
  });
});









const SUPABASE_URL = "https://lrytnwoeldjavdjoidui.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyeXRud29lbGRqYXZkam9pZHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTg3NjMsImV4cCI6MjA5NTk3NDc2M30.rydduNQJkYjG1hxUUA2exGPulDXNGndh_Y-YoQsAiGU";

let ALL_WORDS = [];
let shuffledWords;
let currentIndex = 0;

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

    shuffledWords = shuffle(ALL_WORDS);
  } catch (error) {
    console.error("単語データの取得に失敗:", error);
  }
}










window.addEventListener("load", async () => {
  await loadWords();
  
  console.log(ALL_WORDS);

  word = getNextWord();

  document.getElementById("quiz-next").addEventListener("click", function(){
    console.log("clicked");

    word = getNextWord();
    newQuiz(word);
  });
});











function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}


function getNextWord() {
  if (currentIndex >= shuffledWords.length) {
    shuffledWords = shuffle(ALL_WORDS);
    currentIndex = 0;
  }

  return shuffledWords[currentIndex++];
}









function newQuiz(w){
  document.getElementById("quiz-answer").value = "";
  document.getElementById("quiz-german").textContent = "";
  document.getElementById("quiz-gender").querySelectorAll("p")[0].dataset.gender = "";
  document.getElementById("quiz-gender").querySelectorAll("p").forEach(e => e.textContent = "");
  document.getElementById("quiz-note").textContent = "";

  document.getElementById("quiz-next").setAttribute("disabled", "");

  document.getElementById("quiz-japanese").textContent = w.japanese;

  document.getElementById("quiz-answer").focus({preventScroll: true});
}

function checkAnswer(w){
  const answer = document.getElementById("quiz-answer").value;
  const germanArray = w.german.slice(1, -1).split(", ").map(s => s.trim());
  const german = germanArray[0] == "" ? germanArray[1] : germanArray[0];
  const gender = w.gender;
  const note = w.note;

  const genderPs = document.getElementById("quiz-gender").querySelectorAll("p");

  document.getElementById("quiz-german").textContent = german;
  if(answer == german){
    document.getElementById("quiz-german").dataset.t_or_f = "true";
  }
  else{
    document.getElementById("quiz-german").dataset.t_or_f = "false";
  }

  genderPs[0].dataset.gender = gender;
  switch(gender){
    case "der":
      genderPs[0].textContent = "男";
      break;
    case "das":
      genderPs[0].textContent = "中";
      break;
    case "die":
      genderPs[0].textContent = "女";
      break;
    default:
      genderPs[0].textContent = "複";
      break;      
  }
  genderPs[1].textContent = gender + " " + german;
  
  document.getElementById("quiz-note").textContent = note;

  document.getElementById("quiz-next").removeAttribute("disabled");
  document.getElementById("quiz-next").focus();
}