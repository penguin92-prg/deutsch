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
    });

    // デバッグ用
    if(li.dataset.state == "current"){
      li.click();
    }
  });

  document.querySelectorAll("#quiz-select-category-container>div>button").forEach(btn => {
    btn.addEventListener("click", function(){
      if(confirm(`カテゴリを ${this.innerText} に設定しますか?`)){
        document.getElementById("quiz-select-category-container").classList.remove("active");
        document.getElementById("quiz-container").classList.add("active");
        document.getElementById("quiz-next").classList.add("active");

        setQuizType(this.dataset.value);

        if(!document.getElementById("quiz-japanese").textContent){
          word = getNextWord();
          newQuiz(word);
        }
      }
    });
  })

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

window.addEventListener("load", async () => {
  await loadWords();
  
  console.log(ALL_WORDS);

  word = getNextWord();

  document.getElementById("quiz-next").addEventListener("click", function(){
    word = getNextWord();
    newQuiz(word);
  });
});









const SUPABASE_URL = "https://lrytnwoeldjavdjoidui.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyeXRud29lbGRqYXZkam9pZHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTg3NjMsImV4cCI6MjA5NTk3NDc2M30.rydduNQJkYjG1hxUUA2exGPulDXNGndh_Y-YoQsAiGU";

let WORDS_BY_TYPE = {
  noun: [],
  verb: [],
  other: [],
  mixed: []
};

let currentType = "mixed";

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

    WORDS_BY_TYPE.noun = ALL_WORDS.filter(w => w.type === "noun");
    WORDS_BY_TYPE.verb = ALL_WORDS.filter(w => w.type === "verb");
    WORDS_BY_TYPE.other = ALL_WORDS.filter(w => w.type !== "noun" && w.type !== "verb");
    WORDS_BY_TYPE.mixed = [...ALL_WORDS];

    setQuizType("mixed")

    console.log(`取得件数: ${ALL_WORDS.length}`);

    shuffledWords = shuffle(ALL_WORDS);
  } catch (error) {
    console.error("単語データの取得に失敗:", error);
  }
}

function setQuizType(type){
  currentType = type;
  shuffledWords = shuffle(WORDS_BY_TYPE[type]);
  currentIndex = 0;

  document.getElementById("quiz-container").dataset.type = type;
}

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
    shuffledWords = shuffle(WORDS_BY_TYPE[currentType]);
    currentIndex = 0;
  }

  return shuffledWords[currentIndex++];
}

function newQuiz(w){
  document.getElementById("quiz-answer").value = "";
  document.getElementById("quiz-german").textContent = "";
  document.getElementById("quiz-gender").querySelectorAll("p")[0].dataset.gender = "";
  document.getElementById("quiz-gender").querySelectorAll("p").forEach(e => e.textContent = "");
  document.getElementById("quiz-conjugation").querySelectorAll("p")[1].textContent = "";
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
  
  let conjugation = "";
  for(let i=1; i<germanArray.length; i++){
    conjugation += (germanArray[i] + "-");
  }
  conjugation = conjugation.slice(0, -1);
  const note = w.note;

  const genderPs = document.getElementById("quiz-gender").querySelectorAll("p");

  document.getElementById("quiz-german").textContent = gender + " " + german;
  if(answer == (gender + " " + german)){
    document.getElementById("quiz-german").dataset.t_or_f = "true";
  }
  else{
    document.getElementById("quiz-german").dataset.t_or_f = "false";
  }

  switch(gender){
    case "der":
      genderPs[0].dataset.gender = "m";
      genderPs[0].textContent = "男性";
      break;
    case "das":
      genderPs[0].dataset.gender = "n";
      genderPs[0].textContent = "中性";
      break;
    case "die":
      genderPs[0].dataset.gender = "f";
      genderPs[0].textContent = "女性";
      break;
    default:
      genderPs[0].dataset.gender = "pl";
      genderPs[0].textContent = "複数";
      break;      
  }
  // genderPs[1].textContent = gender + " " + german;
  // genderPs[1].textContent = "男性弱変化"
  
  document.getElementById("quiz-conjugation").querySelectorAll("p")[1].textContent = conjugation;

  document.getElementById("quiz-note").textContent = note;

  document.getElementById("quiz-next").removeAttribute("disabled");
  document.getElementById("quiz-next").focus();
}