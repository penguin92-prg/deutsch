let word;










window.addEventListener("load", function () {

  // 設定画面開閉設定
  document.getElementById("setting-window-open-btn").addEventListener("click", function () {
    document.getElementById("setting-window").classList.toggle("active");
  });

  document.getElementById("setting-window-close-with-save-btn").addEventListener("click", function () {
    // 設定保存
    document.querySelector("#quiz-window>h3").classList.remove("active");
    document.getElementById("quiz-container").classList.add("active");
    document.getElementById("quiz-next").classList.add("active");

    setQuizType(document.getElementById("setting-type").value);

    if (!document.getElementById("quiz-japanese").textContent) {
      word = getNextWord();
      newQuiz(word);
    }

    document.getElementById("setting-window").classList.remove("active");
  });

  document.getElementById("setting-window-close-without-save-btn").addEventListener("click", function () {
    document.getElementById("setting-window").classList.remove("active");
  });

  document.querySelectorAll("#quiz-select-category-container>div>button").forEach(btn => {
    btn.addEventListener("click", function () {
      if (confirm(`カテゴリを ${this.innerText} に設定しますか?`)) {
        document.getElementById("quiz-select-category-container").classList.remove("active");
        document.getElementById("quiz-container").classList.add("active");
        document.getElementById("quiz-next").classList.add("active");

        setQuizType(this.dataset.value);

        if (!document.getElementById("quiz-japanese").textContent) {
          word = getNextWord();
          newQuiz(word);
        }
      }
    });
  });

  // 単語入力の挙動を設定（→ボタンが押されたら自動でキーボードを非表示化）
  document.getElementById("quiz-container").addEventListener("submit", e => {
    e.preventDefault();
    document.getElementById("quiz-answer").blur();
    checkAnswer(word);
  });
});

window.addEventListener("load", async () => {
  await loadWords();
  // console.log(ALL_WORDS);

  word = getNextWord();

  document.getElementById("quiz-next").addEventListener("click", function () {
    word = getNextWord();
    newQuiz(word);
  });
});






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
// ==================================================
// ==================================================
// ==================================================

// SupaBaseから全データを取得
const SUPABASE_URL = "https://lrytnwoeldjavdjoidui.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyeXRud29lbGRqYXZkam9pZHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTg3NjMsImV4cCI6MjA5NTk3NDc2M30.rydduNQJkYjG1hxUUA2exGPulDXNGndh_Y-YoQsAiGU";
const SUPABASE_TABLE_NAME = "1S2";

const ALL_TYPES = ["all", "noun", "verb", "ad", "preposition", "conjunction", "others", "ediom", "text", "übungen"];

let WORDS_BY_TYPE = {
};
for (type of ALL_TYPES) {
  WORDS_BY_TYPE[type] = [];
}
console.log(WORDS_BY_TYPE);

let currentType = "all";

let ALL_WORDS = [];
let shuffledWords;
let currentIndex = 0;

async function loadWords() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE_NAME}?select=*`,
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

    for (const word of ALL_WORDS) {
      if (WORDS_BY_TYPE[word.type]) {
        WORDS_BY_TYPE[word.type].push(word);
      }
    }
    WORDS_BY_TYPE.all = [...ALL_WORDS];

    setQuizType("all")

    console.log(`取得件数: ${ALL_WORDS.length}`);

    shuffledWords = shuffle(ALL_WORDS);
  } catch (error) {
    console.error("単語データの取得に失敗:", error);
  }
}

function setQuizType(type) {
  document.getElementById("quiz-answer").value = "";
  document.getElementById("quiz-german").textContent = "";
  document.getElementById("quiz-gender").querySelectorAll("p")[0].dataset.gender = "";
  document.getElementById("quiz-gender").querySelectorAll("p").forEach(e => e.textContent = "");
  // document.getElementById("quiz-conjugation").querySelectorAll("p")[1].textContent = "";
  document.getElementById("quiz-note").textContent = "";

  currentType = type;
  shuffledWords = shuffle(WORDS_BY_TYPE[type]);
  currentIndex = 0;

  document.getElementById("quiz-container").dataset.type = type;

  word = getNextWord();
  newQuiz(word);
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

function newQuiz(w) {
  // 初期化
  document.getElementById("quiz-answer").value = "";
  document.getElementById("quiz-german").textContent = "";
  document.getElementById("quiz-gender").querySelectorAll("p")[0].dataset.gender = "";
  document.getElementById("quiz-gender").querySelectorAll("p").forEach(e => e.textContent = "");
  // document.getElementById("quiz-conjugation").querySelectorAll("p")[1].textContent = "";
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

  // let conjugation = "";
  // for(let i=1; i<germanArray.length; i++){
  //   conjugation += (germanArray[i] + "-");
  // }
  // conjugation = conjugation.slice(0, -1);
  const note = w.note;

  const genderPs = document.getElementById("quiz-gender").querySelectorAll("p");

  document.getElementById("quiz-german").textContent = (gender == null || gender == "pl" ? german : gender + " " + german);
  if (answer == (gender == null || gender == "pl" ? german : gender + " " + german)) {
    document.getElementById("quiz-german").dataset.t_or_f = "true";
  }
  else {
    document.getElementById("quiz-german").dataset.t_or_f = "false";
  }

  switch (gender) {
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

  // document.getElementById("quiz-conjugation").querySelectorAll("p")[1].textContent = conjugation;

  document.getElementById("quiz-note").textContent = note;

  document.getElementById("quiz-next").removeAttribute("disabled");
  document.getElementById("quiz-next").focus();
}