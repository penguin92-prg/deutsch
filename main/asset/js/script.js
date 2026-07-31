let word;





window.addEventListener("load", function () {
  if(!window.localStorage){
    console.log("LocalStorage非対応...");
  }
  else{
    console.log("LocalStorage対応");
  }

  // 設定画面開閉設定
  document.getElementById("setting-window-open-btn").addEventListener("click", function () {
    document.getElementById("setting-window").classList.toggle("active");
  });
  document.getElementById("setting-window-close-with-save-btn").addEventListener("click", function () {
    saveSetting();
    document.getElementById("setting-window").classList.remove("active");
  });

  document.getElementById("setting-window-close-without-save-btn").addEventListener("click", function () {
    document.getElementById("setting-window").classList.remove("active");
  });

  // 単語入力の挙動を設定（→ボタンが押されたら自動でキーボードを非表示化）
  document.getElementById("quiz-container").addEventListener("submit", e => {
    e.preventDefault();
    document.getElementById("quiz-answer").blur();
    checkAnswer(word);
  });
});

window.addEventListener("load", async () => {
  await loadWords("1S2");

  document.getElementById("quiz-next").addEventListener("click", function () {
    word = getNextWord();
    newQuiz(word);
  });

  document.getElementById("quiz-previous").addEventListener("click", function () {
    word = getPreviousWord();
    newQuiz(word);
  });
});

// ==================================================
// ==================================================
// ==================================================
// ==================================================
// ==================================================
// ==================================================
// ==================================================
// ==================================================
// ==================================================
// ==================================================

// 単語帳の設定を保存
async function saveSetting(){
  let lektionChecked = [];
  for(let checkbox of document.querySelectorAll(`input[name="setting-lektion"]`)){
    if(checkbox.checked){
      lektionChecked.push(checkbox.value);
    }
  }
  console.log(lektionChecked);

  ALL_WORDS = [];
  for(lektion of lektionChecked){
    await loadWords(lektion);
  }

  document.querySelector("#quiz-window>h3").classList.remove("active");
  document.getElementById("quiz-container").classList.add("active");
  document.getElementById("quiz-next").classList.add("active");
  document.getElementById("quiz-previous").classList.add("active");

  shuffleFlag = (document.querySelector('input[name="random"]:checked').value === "true");

  setQuizType(document.getElementById("setting-type").value);

  document.getElementById("progress-bar-container").classList.add("active");
}






// ==================================================
// ==================================================
// ==================================================

/*
【後学のためのメモ】
SupaBaseからデータを取得するには
- URL
- ANON_KEY
- TABLE_NAME
をAPI実行時に渡す必要がある
このうち、TABLE_NAMEはURLに組み込まれるため実質URLとANON_KEY（APIキー）があれば問題ない
また、SupaBase側の設定も必要で、
RLSと呼ばれるテーブル内の各行に対するアクセス権限の設定を変更しなければならない

create policy "Anyone can read"
on "1S2"
for select
using (true);

というSQLを取得したいテーブルで実行して、すべてのユーザーに対して
すべての行に対するselectの実行権限を与える
これにより、APIを実行することですべてのレコードを取得できるようになる
*/

// SupaBaseから全データを取得
const SUPABASE_URL = "https://lrytnwoeldjavdjoidui.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyeXRud29lbGRqYXZkam9pZHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTg3NjMsImV4cCI6MjA5NTk3NDc2M30.rydduNQJkYjG1hxUUA2exGPulDXNGndh_Y-YoQsAiGU";

const ALL_TYPES = ["all", "noun", "verb", "ad", "preposition", "conjunction", "others", "ediom", "text", "übungen"];

let WORDS_BY_TYPE = {};
for (type of ALL_TYPES) {
  WORDS_BY_TYPE[type] = [];
}

let currentType = "all";

let ALL_WORDS = [];
let shuffleFlag = true;
let shuffledWords;
let currentIndex = 0;

async function loadWords(tableName) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${tableName}?select=*`,
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

    ALL_WORDS = ALL_WORDS.concat(await response.json());
    console.log(ALL_WORDS);
    
    // window.localStorage.setItem("ALL_WORDS", JSON.stringify(ALL_WORDS));
    // console.log(JSON.parse(window.localStorage.getItem("ALL_WORDS")));

    initializeWords(ALL_WORDS);
  } catch (error) {
    console.error("単語データの取得に失敗:", error);
    initializeWords(JSON.parse(window.localStorage.getItem("ALL_WORDS")));
  }
}

function initializeWords(all_words){
  for (const word of all_words) {
    if (WORDS_BY_TYPE[word.type]) {
      WORDS_BY_TYPE[word.type].push(word);
    }
  }
  WORDS_BY_TYPE.all = [...all_words];

  setQuizType("all")

  console.log(`取得件数: ${all_words.length}`);

  shuffledWords = shuffle(all_words);
}

function setQuizType(type) {

  document.getElementById("quiz-answer").value = "";
  document.getElementById("quiz-german").textContent = "";
  document.getElementById("quiz-attribute-container").innerHTML = null;
  document.getElementById("quiz-note").textContent = "";

  currentType = type;
  if (shuffleFlag) {
    shuffledWords = shuffle(WORDS_BY_TYPE[type]);
  }
  else {
    shuffledWords = WORDS_BY_TYPE[type];
  }
  currentIndex = 0;

  word = shuffledWords[currentIndex];
  newQuiz(word);

  updateProgressBar();

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
  if (currentIndex >= shuffledWords.length - 1) {
    if (shuffleFlag) {
      shuffledWords = shuffle(WORDS_BY_TYPE[currentType]);
    }
    else {
      shuffledWords = WORDS_BY_TYPE[currentType];
    }
    currentIndex = 0;
  }
  else{
    currentIndex++;
  }

  updateProgressBar();

  if(currentIndex <= 0){
    document.getElementById("quiz-previous").setAttribute("disabled", "");
  }
  else{
    document.getElementById("quiz-previous").removeAttribute("disabled");
  }
  
  return shuffledWords[currentIndex];
}

function getPreviousWord() {
  currentIndex--;

  updateProgressBar();

  if(currentIndex <= 0){
    document.getElementById("quiz-previous").setAttribute("disabled", "");
  }
  else{
    document.getElementById("quiz-previous").removeAttribute("disabled");
  }

  return shuffledWords[currentIndex];
}

function newQuiz(w) {
  // 初期化
  document.getElementById("quiz-answer").value = "";
  document.getElementById("quiz-german-container").classList.remove("active");
  document.getElementById("quiz-german").textContent = "";
  document.getElementById("quiz-attribute-container").innerHTML = null;
  document.getElementById("quiz-note-container").classList.remove("active");
  document.getElementById("quiz-note").textContent = "";

  document.getElementById("quiz-next").setAttribute("disabled", "");

  document.getElementById("quiz-japanese").textContent = w.japanese;

  document.getElementById("quiz-answer").focus({ preventScroll: true });
}

function checkAnswer(w) {
  console.log("単語", `"${w.german}"`, "id", w.id);

  const answer = document.getElementById("quiz-answer").value;
  const german = w.german
  const gender = w.gender;
  const separatable = w.separatable;
  const note = w.note;
  const lesson = w.lesson;

  document.getElementById("quiz-german-container").classList.add("active");
  document.getElementById("quiz-german").textContent = (gender == null || gender == "pl" ? german : gender + " " + german);
  if (answer == (gender == null || gender == "pl" ? german : gender + " " + german)) {
    document.getElementById("quiz-german-container").dataset.t_or_f = "true";
    document.getElementById("quiz-german-judgement").textContent = "正解！";
  }
  else {
    document.getElementById("quiz-german-container").dataset.t_or_f = "false";
    document.getElementById("quiz-german-judgement").textContent = "不正解...";
  }

  // 属性指定
  document.getElementById("quiz-attribute-container").innerHTML = null;
  if (gender != "" && gender != null) {
    let genderElement = document.createElement("span");
    switch (gender) {
      case "der":
        genderElement.style.backgroundColor = "var(--gender-m-background)";
        genderElement.style.color = "var(--gender-m-text)";
        genderElement.innerText = "男性";
        break;
      case "das":
        genderElement.style.backgroundColor = "var(--gender-n-background)";
        genderElement.style.color = "var(--gender-n-text)";
        genderElement.innerText = "中性";
        break;
      case "die":
        genderElement.style.backgroundColor = "var(--gender-f-background)";
        genderElement.style.color = "var(--gender-f-text)";
        genderElement.innerText = "女性";
        break;
      default:
        genderElement.style.backgroundColor = "var(--gender-pl-background)";
        genderElement.style.color = "var(--gender-pl-text)";
        genderElement.innerText = "複数";
        break;
    }
    document.getElementById("quiz-attribute-container").appendChild(genderElement);
  }
  if(separatable != "" && separatable != null){
    let separatableElement = document.createElement("span");
    console.log(separatable);
    switch (separatable) {
      case "TRUE":
        separatableElement.style.backgroundColor = "var(--separatable-true-background)";
        separatableElement.style.color = "var(--separatable-true-text)";
        separatableElement.innerText = "分離動詞";
        break;
      case "FALSE":
        separatableElement.style.backgroundColor = "var(--separatable-false-background)";
        separatableElement.style.color = "var(--separatable-false-text)";
        separatableElement.innerText = "非分離動詞";
        break;
    }
    document.getElementById("quiz-attribute-container").appendChild(separatableElement);
  }
  if(lesson != "" && lesson != null){
    let lessonElement = document.createElement("span");
    console.log(lesson);
    lessonElement.style.backgroundColor = "var(--lesson-background)";
    lessonElement.style.color = "var(--lesson-text)";
    lessonElement.innerText = "Lektion" + lesson;
    document.getElementById("quiz-attribute-container").appendChild(lessonElement);
  }

  if (note == "" || note == null) {
    document.getElementById("quiz-note-container").classList.remove("active");
  }
  else {
    document.getElementById("quiz-note-container").classList.add("active");
    document.getElementById("quiz-note").innerHTML = note;
  }

  document.getElementById("quiz-next").removeAttribute("disabled");
  document.getElementById("quiz-next").focus();
}

function updateProgressBar(){
  document.getElementById("progress-bar-label1").textContent = `${currentIndex + 1} / ${shuffledWords.length}`;
  document.getElementById("progress-bar-label2").textContent = `進捗 ${((currentIndex / shuffledWords.length) * 100).toFixed(2)}%`;
  document.getElementById("progress-bar").style.width = `${(currentIndex / shuffledWords.length) * 100}%`
}