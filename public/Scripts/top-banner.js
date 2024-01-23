let 导航2级列表已显示 = false;

const 导航1级文本组 = document.querySelectorAll(".导航1级文本");
导航1级文本组.forEach((文本) => {
  const 导航2级列表 = 文本.nextElementSibling;
  const 导航2级菜单 = 导航2级列表.children[0];
  const 标记 = 文本.querySelector("i");

  文本.addEventListener("click", (event) => {
    if (!导航2级列表已显示) {
      标记.style.rotate = "z 0deg";
      导航2级列表.style.visibility = "visible";
      导航2级列表.style.opacity = "1";
      导航2级列表.style.pointerEvents = "all";
      导航2级菜单.style.translate = "0 10px";
      // 文本.style.color = "yellow";
      导航2级列表已显示 = true;
    } else {
      标记.style.rotate = "z 180deg";
      导航2级列表.style.visibility = "hidden";
      导航2级列表.style.opacity = "0";
      导航2级列表.style.pointerEvents = "none";
      导航2级菜单.style.translate = "0 110px";
      文本.style.color = "#ddd";
      导航2级列表已显示 = false;
    }
  });

  文本.parentElement.addEventListener("mouseleave", () => {
    标记.style.rotate = "z 180deg";
    导航2级列表.style.visibility = "hidden";
    导航2级列表.style.opacity = "0";
    导航2级列表.style.pointerEvents = "none";
    导航2级菜单.style.translate = "0 110px";
    文本.style.color = "#ddd";
    导航2级列表已显示 = false;
  });
});

window.addEventListener("load", () => {
  const 删除搜索内容按钮 =
    document.getElementsByClassName("删除搜索内容按钮")[0];
  const 搜索框 = document.getElementById("搜索框");
  搜索框.addEventListener("input", () => {
    if (搜索框.value === "") {
      删除搜索内容按钮.style.visibility = "hidden";
    } else {
      删除搜索内容按钮.style.visibility = "visible";
    }
  });

  删除搜索内容按钮.addEventListener("click", () => {
    搜索框.value = "";
    搜索框.focus();
    删除搜索内容按钮.style.visibility = "hidden";
  });
});
