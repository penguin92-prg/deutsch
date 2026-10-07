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
  
  if(window.scrollY > 300){
    document.querySelector("header").classList.add("show");
  }
  else{
    document.querySelector("header").classList.remove("show");
  }
});

window.addEventListener('scroll', function(){
  if(window.scrollY > 300){
    document.querySelector("header").classList.add("show");
  }
  else{
    document.querySelector("header").classList.remove("show");
  }
});