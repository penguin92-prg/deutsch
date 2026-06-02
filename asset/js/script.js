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

  document.getElementById("quiz-card").addEventListener("click", function(){
    this.classList.toggle("flipped")
  })
});