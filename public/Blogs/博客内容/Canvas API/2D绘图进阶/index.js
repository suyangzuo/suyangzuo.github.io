const canvas_global_alpha = document.getElementById("canvas-global-alpha");
const ctx_global_alpha = canvas_global_alpha.getContext("2d");
const dpr_global_alpha = window.devicePixelRatio || 1;
canvas_global_alpha.width = canvas_global_alpha.offsetWidth * dpr_global_alpha;
canvas_global_alpha.height = canvas_global_alpha.offsetHeight * dpr_global_alpha;
ctx_global_alpha.scale(dpr_global_alpha, dpr_global_alpha);
ctx_global_alpha.fillStyle = "darkgreen";
ctx_global_alpha.strokeStyle = "gold";
const rect_width_ga = 150;
const rect_height_ga = 100;
const gap_ga = 50;
const total_width_ga = rect_width_ga * 3 + gap_ga * 2;
ctx_global_alpha.rect(
  (canvas_global_alpha.offsetWidth - total_width_ga) / 2,
  (canvas_global_alpha.offsetHeight - rect_height_ga) / 2,
  rect_width_ga,
  rect_height_ga,
);
ctx_global_alpha.fill();
ctx_global_alpha.stroke();
ctx_global_alpha.save();
ctx_global_alpha.fillStyle = "white";
ctx_global_alpha.font = "bold 16px 'JetBrains Mono', 'Consolas', sans-serif";
ctx_global_alpha.textBaseline = "middle";
ctx_global_alpha.textAlign = "center";
ctx_global_alpha.fillText(
  "100% 不透明度",
  (canvas_global_alpha.offsetWidth - total_width_ga) / 2 + rect_width_ga / 2,
  (canvas_global_alpha.offsetHeight - rect_height_ga) / 2 + rect_height_ga / 2,
);
ctx_global_alpha.restore();
ctx_global_alpha.globalAlpha = 0.25;
ctx_global_alpha.rect(
  (canvas_global_alpha.offsetWidth - total_width_ga) / 2 + rect_width_ga + gap_ga,
  (canvas_global_alpha.offsetHeight - rect_height_ga) / 2,
  rect_width_ga,
  rect_height_ga,
);
ctx_global_alpha.fill();
ctx_global_alpha.stroke();
ctx_global_alpha.save();
ctx_global_alpha.globalAlpha = 1.0;
ctx_global_alpha.fillStyle = "#aaa";
ctx_global_alpha.font = "bold 16px 'JetBrains Mono', 'Consolas', sans-serif";
ctx_global_alpha.textBaseline = "middle";
ctx_global_alpha.textAlign = "center";
ctx_global_alpha.fillText(
  "25% 不透明度",
  (canvas_global_alpha.offsetWidth - total_width_ga) / 2 + rect_width_ga / 2 + rect_width_ga + gap_ga,
  (canvas_global_alpha.offsetHeight - rect_height_ga) / 2 + rect_height_ga / 2,
);
ctx_global_alpha.restore();
ctx_global_alpha.globalAlpha = 0.05;
ctx_global_alpha.rect(
  (canvas_global_alpha.offsetWidth - total_width_ga) / 2 + rect_width_ga * 2 + gap_ga * 2,
  (canvas_global_alpha.offsetHeight - rect_height_ga) / 2,
  rect_width_ga,
  rect_height_ga,
);
ctx_global_alpha.fill();
ctx_global_alpha.stroke();
ctx_global_alpha.save();
ctx_global_alpha.globalAlpha = 1.0;
ctx_global_alpha.fillStyle = "#aaa";
ctx_global_alpha.font = "bold 16px 'JetBrains Mono', 'Consolas', sans-serif";
ctx_global_alpha.textBaseline = "middle";
ctx_global_alpha.textAlign = "center";
ctx_global_alpha.fillText(
  "5% 不透明度",
  (canvas_global_alpha.offsetWidth - total_width_ga) / 2 + rect_width_ga / 2 + rect_width_ga * 2 + gap_ga * 2,
  (canvas_global_alpha.offsetHeight - rect_height_ga) / 2 + rect_height_ga / 2,
);
ctx_global_alpha.restore();

const canvas_shadow = document.getElementById("canvas-shadow");
const ctx_shadow = canvas_shadow.getContext("2d");
const dpr_shadow = window.devicePixelRatio || 1;
canvas_shadow.width = canvas_shadow.offsetWidth * dpr_shadow;
canvas_shadow.height = canvas_shadow.offsetHeight * dpr_shadow;
ctx_shadow.scale(dpr_shadow, dpr_shadow);
ctx_shadow.fillStyle = "darkgreen";
ctx_shadow.strokeStyle = "gold";
ctx_shadow.shadowColor = "black";
ctx_shadow.shadowOffsetX = 50;
ctx_shadow.shadowOffsetY = 50;
ctx_shadow.shadowBlur = 20;

// 计算矩形位置：水平1/3，垂直居中
const rectWidth = 200;
const rectHeight = 200;
const x = (canvas_shadow.offsetWidth - rectWidth) / 2;
const y = (canvas_shadow.offsetHeight - rectHeight) / 2;

ctx_shadow.rect(x, y, rectWidth, rectHeight);
ctx_shadow.fill();
ctx_shadow.stroke();

ctx_shadow.save();
ctx_shadow.fillStyle = "white";
ctx_shadow.font = "bold 24px 'JetBrains Mono', 'Consolas', sans-serif";
ctx_shadow.textBaseline = "middle";
ctx_shadow.textAlign = "center";
ctx_shadow.shadowColor = "black";
ctx_shadow.shadowOffsetX = 10;
ctx_shadow.shadowOffsetY = 10;
ctx_shadow.shadowBlur = 10;
ctx_shadow.fillText("阴影", x + rectWidth / 2, y + rectHeight / 2);
ctx_shadow.restore();

const canvas_shadow_stroke_before = document.getElementById("canvas-shadow-stroke-before");
const ctx_shadow_stroke_before = canvas_shadow_stroke_before.getContext("2d");
const dpr_shadow_stroke_before = window.devicePixelRatio || 1;
canvas_shadow_stroke_before.width = canvas_shadow_stroke_before.offsetWidth * dpr_shadow_stroke_before;
canvas_shadow_stroke_before.height = canvas_shadow_stroke_before.offsetHeight * dpr_shadow_stroke_before;
ctx_shadow_stroke_before.scale(dpr_shadow_stroke_before, dpr_shadow_stroke_before);
ctx_shadow_stroke_before.fillStyle = "darkgreen";
ctx_shadow_stroke_before.strokeStyle = "gold";
ctx_shadow_stroke_before.lineWidth = 5;
ctx_shadow_stroke_before.shadowColor = "black";
ctx_shadow_stroke_before.shadowOffsetX = 50;
ctx_shadow_stroke_before.shadowOffsetY = 50;
ctx_shadow_stroke_before.shadowBlur = 20;

// 计算矩形位置：水平1/3，垂直居中
const rectWidthBefore = 200;
const rectHeightBefore = 200;
const xBefore = (canvas_shadow_stroke_before.offsetWidth - rectWidthBefore) / 2;
const yBefore = (canvas_shadow_stroke_before.offsetHeight - rectHeightBefore) / 2;

ctx_shadow_stroke_before.rect(xBefore, yBefore, rectWidthBefore, rectHeightBefore);
ctx_shadow_stroke_before.stroke();
ctx_shadow_stroke_before.fill();

const canvas_shadow_stroke_after = document.getElementById("canvas-shadow-stroke-after");
const ctx_shadow_stroke_after = canvas_shadow_stroke_after.getContext("2d");
const dpr_shadow_stroke_after = window.devicePixelRatio || 1;
canvas_shadow_stroke_after.width = canvas_shadow_stroke_after.offsetWidth * dpr_shadow_stroke_after;
canvas_shadow_stroke_after.height = canvas_shadow_stroke_after.offsetHeight * dpr_shadow_stroke_after;
ctx_shadow_stroke_after.scale(dpr_shadow_stroke_after, dpr_shadow_stroke_after);
ctx_shadow_stroke_after.fillStyle = "darkgreen";
ctx_shadow_stroke_after.strokeStyle = "gold";
ctx_shadow_stroke_after.lineWidth = 3;

const rectWidthAfter = 200;
const rectHeightAfter = 200;
const xAfter = (canvas_shadow_stroke_after.offsetWidth - rectWidthAfter) / 2;
const yAfter = (canvas_shadow_stroke_after.offsetHeight - rectHeightAfter) / 2;

ctx_shadow_stroke_after.rect(xAfter, yAfter, rectWidthAfter, rectHeightAfter);
ctx_shadow_stroke_after.save();
ctx_shadow_stroke_after.shadowColor = "black";
ctx_shadow_stroke_after.shadowOffsetX = 50;
ctx_shadow_stroke_after.shadowOffsetY = 50;
ctx_shadow_stroke_after.shadowBlur = 20;
ctx_shadow_stroke_after.fill();
ctx_shadow_stroke_after.restore();
ctx_shadow_stroke_after.stroke();

const canvas_line_dash = document.getElementById("canvas-line-dash");
const ctx_line_dash = canvas_line_dash.getContext("2d");
const dpr_line_dash = window.devicePixelRatio || 1;
canvas_line_dash.width = canvas_line_dash.offsetWidth * dpr_line_dash;
canvas_line_dash.height = canvas_line_dash.offsetHeight * dpr_line_dash;
ctx_line_dash.scale(dpr_line_dash, dpr_line_dash);
ctx_line_dash.strokeStyle = "darkgoldenrod";
ctx_line_dash.lineWidth = 2;
ctx_line_dash.setLineDash([20, 10]);
ctx_line_dash.rect(300, 100, 200, 200);
ctx_line_dash.stroke();

const canvas_line_dash_double = document.getElementById("canvas-line-dash-double");
const ctx_line_dash_double = canvas_line_dash_double.getContext("2d");
const dpr_line_dash_double = window.devicePixelRatio || 1;
canvas_line_dash_double.width = canvas_line_dash_double.offsetWidth * dpr_line_dash_double;
canvas_line_dash_double.height = canvas_line_dash_double.offsetHeight * dpr_line_dash_double;
ctx_line_dash_double.scale(dpr_line_dash_double, dpr_line_dash_double);

// 动画参数
let startTime = null;
const totalDuration = 5.55; // 总动画时长：0.5 + 0.5 + 0.5 + 0.5 + 0.5 + 0.5 + 2.0 + 0.05 = 5.55秒

// 矩形参数
const dashRectWidth = 250;
const dashRectHeight = 250;
const centerY = canvas_line_dash_double.offsetHeight / 2 - dashRectHeight / 2;
const whiteRectX = canvas_line_dash_double.offsetWidth / 4 - dashRectWidth / 2;
const blackRectX = (canvas_line_dash_double.offsetWidth * 3) / 4 - dashRectWidth / 2;
const overlapX = (whiteRectX + blackRectX) / 2;

function animate(currentTime) {
  if (!startTime) startTime = currentTime;
  const elapsed = (currentTime - startTime) / 1000; // 转换为秒
  const cycleTime = elapsed % totalDuration; // 循环时间

  // 重置画布
  ctx_line_dash_double.fillStyle = "#678";
  ctx_line_dash_double.fillRect(0, 0, canvas_line_dash_double.offsetWidth, canvas_line_dash_double.offsetHeight);

  // 计算各阶段的进度
  let whiteAlpha = 0;
  let blackAlpha = 0;
  let lineDashOffset = 0;
  let whiteX = whiteRectX;
  let blackX = blackRectX;

  if (cycleTime < 0.5) {
    // 阶段1: 白色矩形淡入 (0-0.5s)
    whiteAlpha = cycleTime / 0.5;
  } else if (cycleTime < 1.0) {
    // 阶段2: 白色矩形保持显示 (0.5-1.0s)
    whiteAlpha = 1;
  } else if (cycleTime < 1.5) {
    // 阶段3: 黑色矩形淡入 (1.0-1.5s)
    whiteAlpha = 1;
    blackAlpha = (cycleTime - 1.0) / 0.5;
  } else if (cycleTime < 2.0) {
    // 阶段4: 黑色矩形保持显示 (1.5-2.0s)
    whiteAlpha = 1;
    blackAlpha = 1;
  } else if (cycleTime < 2.5) {
    // 阶段5: lineDashOffset动画 (2.0-2.5s)
    whiteAlpha = 1;
    blackAlpha = 1;
    lineDashOffset = ((cycleTime - 2.0) / 0.5) * 20;
  } else if (cycleTime < 3.0) {
    // 阶段6: 等待阶段 (2.5-3.0s) - lineDashOffset完成后等待0.5s
    whiteAlpha = 1;
    blackAlpha = 1;
    lineDashOffset = 20;
  } else if (cycleTime < 3.5) {
    // 阶段7: 矩形重合动画 (3.0-3.5s)
    whiteAlpha = 1;
    blackAlpha = 1;
    lineDashOffset = 20;
    const moveProgress = (cycleTime - 3.0) / 0.5;
    whiteX = whiteRectX + (overlapX - whiteRectX) * moveProgress;
    blackX = blackRectX + (overlapX - blackRectX) * moveProgress;
  } else if (cycleTime < 5.5) {
    // 阶段8: 重合后等待阶段 (3.5-5.5s) - 等待2秒
    whiteAlpha = 1;
    blackAlpha = 1;
    lineDashOffset = 20;
    whiteX = overlapX;
    blackX = overlapX;
  } else {
    // 阶段9: 最终等待阶段 (5.5-5.55s)
    whiteAlpha = 1;
    blackAlpha = 1;
    lineDashOffset = 20;
    whiteX = overlapX;
    blackX = overlapX;
  }

  // 绘制白色矩形
  if (whiteAlpha > 0) {
    ctx_line_dash_double.save();
    ctx_line_dash_double.globalAlpha = whiteAlpha;
    ctx_line_dash_double.strokeStyle = "white";
    ctx_line_dash_double.lineWidth = 2;
    ctx_line_dash_double.setLineDash([20, 20]);
    ctx_line_dash_double.beginPath();
    ctx_line_dash_double.rect(whiteX, centerY, dashRectWidth, dashRectHeight);
    ctx_line_dash_double.stroke();
    ctx_line_dash_double.restore();
  }

  // 绘制黑色矩形
  if (blackAlpha > 0) {
    ctx_line_dash_double.save();
    ctx_line_dash_double.globalAlpha = blackAlpha;
    ctx_line_dash_double.strokeStyle = "black";
    ctx_line_dash_double.lineWidth = 2;
    ctx_line_dash_double.setLineDash([20, 20]);
    ctx_line_dash_double.lineDashOffset = lineDashOffset;
    ctx_line_dash_double.beginPath();
    ctx_line_dash_double.rect(blackX, centerY, dashRectWidth, dashRectHeight);
    ctx_line_dash_double.stroke();
    ctx_line_dash_double.restore();
  }

  requestAnimationFrame(animate);
}

// 开始动画
requestAnimationFrame(animate);

const canvas_linear_gradient = document.getElementById("canvas-linear-gradient");
const ctx_linear_gradient = canvas_linear_gradient.getContext("2d");
const dpr_linear_gradient = window.devicePixelRatio || 1;
canvas_linear_gradient.width = canvas_linear_gradient.offsetWidth * dpr_linear_gradient;
canvas_linear_gradient.height = canvas_linear_gradient.offsetHeight * dpr_linear_gradient;
ctx_linear_gradient.scale(dpr_linear_gradient, dpr_linear_gradient);
const 线性渐变矩形宽度 = 400;
const 线性渐变矩形高度 = 200;
const 线性渐变矩形起始坐标 = { x: 200, y: 100 };
ctx_linear_gradient.rect(线性渐变矩形起始坐标.x, 线性渐变矩形起始坐标.y, 线性渐变矩形宽度, 线性渐变矩形高度);

const 线性渐变起始坐标 = { x: 0, y: 100 };
const 线性渐变结束坐标 = { x: canvas_linear_gradient.offsetWidth, y: 100 };
const 线性渐变对象 = ctx_linear_gradient.createLinearGradient(
  线性渐变起始坐标.x,
  线性渐变起始坐标.y,
  线性渐变结束坐标.x,
  线性渐变结束坐标.y,
);

const 线性渐变色标1位置 = 0;
const 线性渐变色标1颜色 = "blue";
const 线性渐变色标2位置 = 0.5;
const 线性渐变色标2颜色 = "green";
const 线性渐变色标3位置 = 1;
const 线性渐变色标3颜色 = "red";
线性渐变对象.addColorStop(线性渐变色标1位置, 线性渐变色标1颜色);
线性渐变对象.addColorStop(线性渐变色标2位置, 线性渐变色标2颜色);
线性渐变对象.addColorStop(线性渐变色标3位置, 线性渐变色标3颜色);

ctx_linear_gradient.fillStyle = 线性渐变对象;
ctx_linear_gradient.fill(); //填充

const canvas_radial_gradient = document.getElementById("canvas-radial-gradient");
const ctx_radial_gradient = canvas_radial_gradient.getContext("2d");
const dpr_radial_gradient = window.devicePixelRatio || 1;
canvas_radial_gradient.width = canvas_radial_gradient.offsetWidth * dpr_radial_gradient;
canvas_radial_gradient.height = canvas_radial_gradient.offsetHeight * dpr_radial_gradient;
ctx_radial_gradient.scale(dpr_radial_gradient, dpr_radial_gradient);
const 径向渐变矩形宽度 = 500;
const 径向渐变矩形高度 = 300;
const 径向渐变矩形起始坐标 = { x: 150, y: 50 };
ctx_radial_gradient.rect(径向渐变矩形起始坐标.x, 径向渐变矩形起始坐标.y, 径向渐变矩形宽度, 径向渐变矩形高度);

const 径向渐变起始圆心 = {
  x: 径向渐变矩形起始坐标.x + 径向渐变矩形宽度 / 2,
  y: 径向渐变矩形起始坐标.y + 径向渐变矩形高度 / 2,
};
const 径向渐变起始圆半径 = 50;
const 径向渐变结束圆心 = {
  x: 径向渐变矩形起始坐标.x + 径向渐变矩形宽度 / 2,
  y: 径向渐变矩形起始坐标.y + 径向渐变矩形高度 / 2,
};
const 径向渐变结束圆半径 = 径向渐变矩形宽度 < 径向渐变矩形高度 ? 径向渐变矩形宽度 / 2 : 径向渐变矩形高度 / 2;
const 径向渐变对象 = ctx_radial_gradient.createRadialGradient(
  径向渐变起始圆心.x,
  径向渐变起始圆心.y,
  径向渐变起始圆半径,
  径向渐变结束圆心.x,
  径向渐变结束圆心.y,
  径向渐变结束圆半径,
);

const 径向渐变色标1位置 = 0;
const 径向渐变色标1颜色 = "darkgoldenrod";
const 径向渐变色标2位置 = 0.5;
const 径向渐变色标2颜色 = "green";
const 径向渐变色标3位置 = 1;
const 径向渐变色标3颜色 = "silver";
径向渐变对象.addColorStop(径向渐变色标1位置, 径向渐变色标1颜色);
径向渐变对象.addColorStop(径向渐变色标2位置, 径向渐变色标2颜色);
径向渐变对象.addColorStop(径向渐变色标3位置, 径向渐变色标3颜色);

ctx_radial_gradient.fillStyle = 径向渐变对象;
ctx_radial_gradient.fill(); //填充

const canvas_conic_gradient = document.getElementById("canvas-conic-gradient");
const ctx_conic_gradient = canvas_conic_gradient.getContext("2d");
const dpr_conic_gradient = window.devicePixelRatio || 1;
canvas_conic_gradient.width = canvas_conic_gradient.offsetWidth * dpr_conic_gradient;
canvas_conic_gradient.height = canvas_conic_gradient.offsetHeight * dpr_conic_gradient;
ctx_conic_gradient.scale(dpr_conic_gradient, dpr_conic_gradient);
const 角度渐变矩形宽度 = canvas_conic_gradient.offsetWidth;
const 角度渐变矩形高度 = canvas_conic_gradient.offsetHeight;
const 角度渐变矩形起始坐标 = { x: 0, y: 0 };
ctx_conic_gradient.rect(角度渐变矩形起始坐标.x, 角度渐变矩形起始坐标.y, 角度渐变矩形宽度, 角度渐变矩形高度);

const 角度渐变起始弧度 = Math.PI;
const 角度渐变圆心 = { x: canvas_conic_gradient.offsetWidth / 2, y: canvas_conic_gradient.offsetHeight / 2 };
const 角度渐变对象 = ctx_conic_gradient.createConicGradient(角度渐变起始弧度, 角度渐变圆心.x, 角度渐变圆心.y);

const 角度渐变色标1位置 = 0;
const 角度渐变色标1颜色 = "blue";
const 角度渐变色标2位置 = 0.25;
const 角度渐变色标2颜色 = "orange";
const 角度渐变色标3位置 = 0.5;
const 角度渐变色标3颜色 = "green";
const 角度渐变色标4位置 = 0.75;
const 角度渐变色标4颜色 = "yellow";
const 角度渐变色标5位置 = 1;
const 角度渐变色标5颜色 = "purple";
角度渐变对象.addColorStop(角度渐变色标1位置, 角度渐变色标1颜色);
角度渐变对象.addColorStop(角度渐变色标2位置, 角度渐变色标2颜色);
角度渐变对象.addColorStop(角度渐变色标3位置, 角度渐变色标3颜色);
角度渐变对象.addColorStop(角度渐变色标4位置, 角度渐变色标4颜色);
角度渐变对象.addColorStop(角度渐变色标5位置, 角度渐变色标5颜色);

ctx_conic_gradient.fillStyle = 角度渐变对象;
ctx_conic_gradient.fill(); //填充

const canvas_draw_image = document.getElementById("canvas-draw-image");
const ctx_draw_image = canvas_draw_image.getContext("2d");
const dpr_draw_image = window.devicePixelRatio || 1;
canvas_draw_image.width = canvas_draw_image.offsetWidth * dpr_draw_image;
canvas_draw_image.height = canvas_draw_image.offsetHeight * dpr_draw_image;
ctx_draw_image.scale(dpr_draw_image, dpr_draw_image);

const 源图像 = new Image();
源图像.src = "/Images/Background-Images/轮播图-09.jpg";
const 画布坐标 = { x: 0, y: 0 };
源图像.onload = function () {
  ctx_draw_image.drawImage(源图像, 画布坐标.x, 画布坐标.y);
};
源图像.onerror = function () {
  console.warn("图像加载失败:", 源图像.src);
};

const canvas_draw_image_5_params = document.getElementById("canvas-draw-image-5-params");
const ctx_draw_image_5_params = canvas_draw_image_5_params.getContext("2d");
const dpr_draw_image_5_params = window.devicePixelRatio || 1;
canvas_draw_image_5_params.width = canvas_draw_image_5_params.offsetWidth * dpr_draw_image_5_params;
canvas_draw_image_5_params.height = canvas_draw_image_5_params.offsetHeight * dpr_draw_image_5_params;
ctx_draw_image_5_params.scale(dpr_draw_image_5_params, dpr_draw_image_5_params);

const 源图像_5_params = new Image();
源图像_5_params.src = "/Images/Background-Images/轮播图-09.jpg";
const 画布坐标_5_params = { x: 0, y: 0 };
const 画布图像宽度_5_params = canvas_draw_image_5_params.offsetWidth;
const 画布图像高度_5_params = canvas_draw_image_5_params.offsetHeight;
源图像_5_params.onload = function () {
  ctx_draw_image_5_params.drawImage(
    源图像_5_params,
    画布坐标_5_params.x,
    画布坐标_5_params.y,
    画布图像宽度_5_params,
    画布图像高度_5_params,
  );
};
源图像_5_params.onerror = function () {
  console.warn("图像加载失败:", 源图像_5_params.src);
};

const canvas_draw_image_5_params_vertical = document.getElementById("canvas-draw-image-5-params-vertical");
const ctx_draw_image_5_params_vertical = canvas_draw_image_5_params_vertical.getContext("2d");
const dpr_draw_image_5_params_vertical = window.devicePixelRatio || 1;
canvas_draw_image_5_params_vertical.width =
  canvas_draw_image_5_params_vertical.offsetWidth * dpr_draw_image_5_params_vertical;
canvas_draw_image_5_params_vertical.height =
  canvas_draw_image_5_params_vertical.offsetHeight * dpr_draw_image_5_params_vertical;
ctx_draw_image_5_params_vertical.scale(dpr_draw_image_5_params_vertical, dpr_draw_image_5_params_vertical);

const 源图像_5_params_vertical = new Image();
源图像_5_params_vertical.src = "/Interactive-Hub/Object-Fit/03.jpg";
const 画布坐标_5_params_vertical = { x: 0, y: 0 };
const 画布图像宽度_5_params_vertical = canvas_draw_image_5_params_vertical.offsetWidth;
const 画布图像高度_5_params_vertical = canvas_draw_image_5_params_vertical.offsetHeight;
源图像_5_params_vertical.onload = function () {
  ctx_draw_image_5_params_vertical.drawImage(
    源图像_5_params_vertical,
    画布坐标_5_params_vertical.x,
    画布坐标_5_params_vertical.y,
    画布图像宽度_5_params_vertical,
    画布图像高度_5_params_vertical,
  );
};
源图像_5_params_vertical.onerror = function () {
  console.warn("图像加载失败:", 源图像_5_params_vertical.src);
};

const canvas_ratio = document.getElementById("canvas-ratio");
const ctx_draw_image_5_ratio = canvas_ratio.getContext("2d");
const dpr_draw_image_5_ratio = window.devicePixelRatio || 1;
canvas_ratio.width = canvas_ratio.offsetWidth * dpr_draw_image_5_ratio;
canvas_ratio.height = canvas_ratio.offsetHeight * dpr_draw_image_5_ratio;
ctx_draw_image_5_ratio.scale(dpr_draw_image_5_ratio, dpr_draw_image_5_ratio);

const 源图像_5_ratio = new Image();
源图像_5_ratio.src = "/Interactive-Hub/Object-Fit/03.jpg";
源图像_5_ratio.onload = function () {
  const 源图像实际宽度 = 源图像_5_ratio.naturalWidth;
  const 源图像实际高度 = 源图像_5_ratio.naturalHeight;
  const 源图像宽高比 = 源图像实际宽度 / 源图像实际高度;
  const 画布宽高比 = canvas_ratio.offsetWidth / canvas_ratio.offsetHeight;
  const 画布坐标_5_ratio = {
    x: 0,
    y: 0,
  };
  let 绘制宽度 = 0;
  let 绘制高度 = 0;

  if (画布宽高比 > 源图像宽高比) {
    绘制高度 = canvas_ratio.offsetHeight;
    绘制宽度 = 绘制高度 * 源图像宽高比;
    画布坐标_5_ratio.x = (canvas_ratio.offsetWidth - 绘制宽度) / 2;
  } else {
    绘制宽度 = canvas_ratio.offsetWidth;
    绘制高度 = 绘制宽度 / 源图像宽高比;
    画布坐标_5_ratio.y = (canvas_ratio.offsetHeight - 绘制高度) / 2;
  }

  ctx_draw_image_5_ratio.drawImage(源图像_5_ratio, 画布坐标_5_ratio.x, 画布坐标_5_ratio.y, 绘制宽度, 绘制高度);
};
源图像_5_ratio.onerror = function () {
  console.warn("图像加载失败:", 源图像_5_ratio.src);
};

class 裁剪路径演示器 {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };
    this.裁剪半径 = 100;
    this.图像源 = "/Images/Background-Images/Busy-Code-Man.gif";
    this.图像 = new Image();
    this.图像.src = this.图像源;
    this.图像宽高比 = 1;

    this.绘制正圆();
    this.绘制图像();
  }

  绘制正圆() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.中心.x, this.中心.y, this.裁剪半径, 0, 2 * Math.PI);
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  绘制图像() {
    this.图像.onload = () => {
      this.ctx.save();
      this.ctx.clip();
      this.图像宽高比 = this.图像.naturalWidth / this.图像.naturalHeight;
      this.ctx.drawImage(
        this.图像,
        this.中心.x - this.裁剪半径 * 2 * this.图像宽高比,
        this.中心.y - this.裁剪半径 * 2,
        this.裁剪半径 * 4 * this.图像宽高比,
        this.裁剪半径 * 4,
      );
      this.ctx.restore();
    };
  }
}

new 裁剪路径演示器("canvas-clip-path");

class 裁剪Path2D路径演示器 {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.offsetWidth * this.dpr;
    this.canvas.height = this.canvas.offsetHeight * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.中心 = {
      x: this.canvas.offsetWidth / 2,
      y: this.canvas.offsetHeight / 2,
    };
    this.裁剪路径 = new Path2D();
    this.正圆路径 = new Path2D();
    this.矩形路径 = new Path2D();
    this.正圆半径 = 100;
    this.图像源 = "/Images/Background-Images/Busy-Code-Man.gif";
    this.图像 = new Image();
    this.图像.src = this.图像源;
    this.图像宽高比 = 1;

    this.绘制正圆();
    this.绘制矩形();
    this.更新裁剪路径();
    this.绘制图像();
  }

  绘制正圆() {
    this.ctx.save();
    this.ctx.beginPath();
    this.正圆路径.arc(this.中心.x - 150, this.中心.y, this.正圆半径, 0, 2 * Math.PI);
    this.ctx.restore();
  }

  绘制矩形() {
    this.ctx.save();
    this.ctx.beginPath();
    this.矩形路径.rect(
      this.中心.x - 100 + this.正圆半径,
      this.中心.y - this.正圆半径,
      this.正圆半径 * 2,
      this.正圆半径 * 2,
    );
    this.ctx.restore();
  }

  更新裁剪路径() {
    this.裁剪路径.addPath(this.正圆路径);
    this.裁剪路径.addPath(this.矩形路径);
    this.ctx.save();
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 2;
    this.ctx.stroke(this.裁剪路径);
    this.ctx.restore();
  }

  绘制图像() {
    this.图像.onload = () => {
      this.ctx.save();
      this.ctx.clip(this.裁剪路径);
      this.图像宽高比 = this.图像.naturalWidth / this.图像.naturalHeight;
      this.ctx.drawImage(
        this.图像,
        this.中心.x - this.正圆半径 * 2 * this.图像宽高比,
        this.中心.y - this.正圆半径 * 2,
        this.正圆半径 * 4 * this.图像宽高比,
        this.正圆半径 * 4,
      );
      this.ctx.restore();
    };
  }
}

new 裁剪Path2D路径演示器("canvas-clip-multi");
