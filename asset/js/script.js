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