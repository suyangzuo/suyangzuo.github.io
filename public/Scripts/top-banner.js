let 导航2级列表已显示 = false;

const 学校地图区 = document.getElementById("学校地图区");

学校地图区.addEventListener("click", 生成学校平面图区域);

function 生成学校平面图区域() {
  const 原对话框 = 学校地图区.querySelector(".平面图对话框");
  if (原对话框 !== null) return;
  const 对话框 = document.createElement("dialog");
  对话框.className = "平面图对话框";
  /*对话框.style.width = `${window.innerWidth}px`;
  对话框.style.height = `${window.innerHeight}px`;*/
  document.body.appendChild(对话框);
  const 平面图链接 = document.createElement("a");
  平面图链接.href = "/Images/Purpose/学校俯视图.jpg";
  平面图链接.target = "_blank";
  平面图链接.className = "平面图链接";
  const 平面图 = document.createElement("img");
  平面图.src = "/Images/Purpose/学校俯视图.jpg";
  平面图.className = "学校平面图";
  平面图.title = "在新标签页打开图片";
  平面图链接.appendChild(平面图);
  const 关闭按钮 = document.createElement("button");
  关闭按钮.className = "关闭平面图";
  关闭按钮.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  关闭按钮.addEventListener("click", () => {
    对话框.remove();
  });
  const 版权链接 = document.createElement("a");
  版权链接.className = "平面图版权超链接";
  版权链接.href = "/Introduction/contributors.html";
  版权链接.target = "_blank";
  const 版权前缀 = document.createElement("span");
  版权前缀.className = "平面图版权前缀";
  版权前缀.innerHTML = '<i class="fa-solid fa-copyright"></i>';
  const 作者 = document.createElement("span");
  作者.className = "俯视图作者";
  作者.textContent = "江苏省南通中等专业学校";
  版权链接.append(版权前缀, 作者);

  对话框.append(平面图链接, 关闭按钮, 版权链接);
  对话框.addEventListener("click", () => {
    对话框.remove();
  });
  对话框.showModal();
}

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

const 捐赠按钮 = document.getElementById("捐赠");
捐赠按钮.addEventListener("click", 打开捐赠界面);

function 打开捐赠界面() {
  const 捐赠对话框 = document.createElement("dialog");
  捐赠对话框.className = "捐赠对话框";
  document.body.appendChild(捐赠对话框);
  捐赠对话框.show();
  捐赠对话框.style.opacity = "1";

  捐赠对话框.addEventListener("click", () => {
    捐赠对话框.style.opacity = "0";
    setTimeout(() => {
      捐赠对话框.close();
      捐赠对话框.remove();
    }, 250);
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
