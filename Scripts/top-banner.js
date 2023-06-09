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

console.log("hahha");