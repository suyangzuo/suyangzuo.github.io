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

const 捐赠按钮 = document.getElementById("捐赠按钮");
捐赠按钮.addEventListener("click", 打开捐赠界面);

function 打开捐赠界面() {
  const 捐赠对话框 = document.createElement("dialog");
  捐赠对话框.className = "捐赠对话框";
  document.body.appendChild(捐赠对话框);
  捐赠对话框.show();

  捐赠对话框.addEventListener("click", () => {
    捐赠对话框.close();
    捐赠对话框.remove();
  });

  const 乞讨图文区 = document.createElement("section");
  乞讨图文区.className = "乞讨图文区";

  const 乞讨图容器 = document.createElement("figure");
  乞讨图容器.className = "乞讨图容器";
  const 乞讨图 = document.createElement("img");
  乞讨图.className = "乞讨图";
  乞讨图.src = "/Images/捐赠/乞讨.png";
  乞讨图.alt = "乞讨";
  乞讨图容器.appendChild(乞讨图);

  const 乞讨文本区 = document.createElement("section");
  乞讨文本区.className = "乞讨文本区";
  const 乞讨标题 = document.createElement("h1");
  乞讨标题.className = "乞讨标题";
  乞讨标题.textContent = "请我喝杯咖啡吧！";
  const 乞讨文本 = document.createElement("p");
  乞讨文本.className = "乞讨文本";
  乞讨文本.textContent =
    "如果你喜欢本站的内容，可以向本站进行捐赠。捐赠行为是完全自愿的，金额也是完全自由的。适当的捐赠可以帮助本站可持续性发展。";
  乞讨文本区.append(乞讨标题, 乞讨文本);

  乞讨图文区.append(乞讨图容器, 乞讨文本区);

  const 收款码区 = document.createElement("section");
  收款码区.className = "收款码区";
  const 支付宝收款码容器 = document.createElement("figure");
  支付宝收款码容器.className = "收款码容器";
  const 支付宝收款码 = document.createElement("img");
  支付宝收款码.className = "收款码";
  支付宝收款码.src = "/Images/捐赠/支付宝收款码.jpg";
  支付宝收款码.alt = "支付宝收款码";
  支付宝收款码容器.appendChild(支付宝收款码);
  const 微信收款码容器 = document.createElement("figure");
  微信收款码容器.className = "收款码容器";
  const 微信收款码 = document.createElement("img");
  微信收款码.className = "收款码";
  微信收款码.src = "/Images/捐赠/微信收款码.png";
  微信收款码.alt = "微信收款码";
  微信收款码容器.appendChild(微信收款码);

  收款码区.append(支付宝收款码容器, 微信收款码容器);

  const 捐赠对话框关闭按钮 = document.createElement("button");
  捐赠对话框关闭按钮.className = "捐赠对话框关闭按钮";
  捐赠对话框关闭按钮.textContent = "✖";
  捐赠对话框关闭按钮.addEventListener("click", () => {
    捐赠对话框.close();
    捐赠对话框.remove();
  });

  捐赠对话框.append(乞讨图文区, 收款码区, 捐赠对话框关闭按钮);
}
