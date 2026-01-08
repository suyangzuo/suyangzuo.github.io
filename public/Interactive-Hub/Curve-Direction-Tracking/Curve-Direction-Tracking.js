(() => {
  const 画布 = document.getElementById("canvas");
  const 上下文 = 画布.getContext("2d");
  const 滑块t = document.getElementById("参数t");
  const t数值 = document.getElementById("t数值");
  const 显示切线勾选 = document.getElementById("显示切线");
  const 重置按钮 = document.querySelector(".重置按钮");

  const 控件条配置 = {
    高度: 110,
    边距: 22,
    圆角: 14,
  };

  const 标注颜色 = {
    字母: "#60a5fa",
    数字: "yellowgreen",
  };

  const 过程颜色 = {
    文本: "#e5e7eb",
    函数: "#399f8bff",
    数字: "#fbbf24",
    小数点: "#9c9c9cff",
    绝对值线: "#b1e3ffff",
    运算符: "#f472b6",
    括号: "#9a93f9ff",
    冒号: "gray",
    标题: "#7dd3fc",
    点数字: "#86b2ffff",
    上标数字: "#74cc97ff",
  };

  const 默认点UV = [
    { name: "p0", u: 0.15, v: 0.75 },
    { name: "p1", u: 0.25, v: 0.25 },
    { name: "p2", u: 0.75, v: 0.85 },
    { name: "p3", u: 0.85, v: 0.25 },
  ];

  const 存储键 = {
    点UV: "curve-direction-tracking-points",
    参数t: "curve-direction-tracking-t",
    显示切线: "curve-direction-tracking-show-tangent",
    显示计算过程: "curve-direction-tracking-show-calculation",
  };

  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  function 读取存储() {
    const 结果 = {
      点UV: 默认点UV.map((p) => ({ ...p })),
      参数t: 0,
      显示切线: false,
      显示计算过程: false,
    };

    try {
      const rawPoints = sessionStorage.getItem(存储键.点UV);
      if (rawPoints) {
        const parsed = JSON.parse(rawPoints);
        const 合法 =
          Array.isArray(parsed) &&
          parsed.length === 默认点UV.length &&
          parsed.every((p) => p && typeof p.u === "number" && typeof p.v === "number" && p.name);
        if (合法) {
          结果.点UV = parsed.map((p) => ({
            name: p.name,
            u: clamp01(Number(p.u)),
            v: clamp01(Number(p.v)),
          }));
        }
      }
    } catch (err) {
      console.warn("读取点UV失败", err);
    }

    try {
      const rawT = localStorage.getItem(存储键.参数t);
      if (rawT !== null) {
        const t值 = parseFloat(rawT);
        if (Number.isFinite(t值)) 结果.参数t = clamp01(t值);
      }
    } catch (err) {
      console.warn("读取参数t失败", err);
    }

    try {
      const rawToggle = localStorage.getItem(存储键.显示切线);
      if (rawToggle !== null) 结果.显示切线 = rawToggle === "1" || rawToggle === "true";
    } catch (err) {
      console.warn("读取显示切线失败", err);
    }

    try {
      const rawToggle = localStorage.getItem(存储键.显示计算过程);
      if (rawToggle !== null) 结果.显示计算过程 = rawToggle === "1" || rawToggle === "true";
    } catch (err) {
      console.warn("读取显示计算过程失败", err);
    }

    return 结果;
  }

  const 初始存储 = 读取存储();

  const 状态 = {
    像素比: Math.max(1, window.devicePixelRatio || 1),
    宽度: 0,
    高度: 0,
    点UV: 初始存储.点UV,
    点集: [],
    参数t: 初始存储.参数t,
    显示切线: 初始存储.显示切线,
    显示计算过程: 初始存储.显示计算过程,
    切线过渡: { 值: 初始存储.显示切线 ? 1 : 0, 目标: 初始存储.显示切线 ? 1 : 0, 上次: performance.now() },
    过程过渡: { 值: 初始存储.显示计算过程 ? 1 : 0, 目标: 初始存储.显示计算过程 ? 1 : 0, 上次: performance.now() },
    拖拽索引: -1,
    悬停索引: -1,
    控件拖拽: "",
    滑块悬停: false,
    拇指悬停: false,
    控件布局: {
      栏: { x: 0, y: 0, w: 0, h: 控件条配置.高度 },
      滑块: { x: 0, y: 0, w: 0 },
      开关: { x: 0, y: 0, w: 0, h: 0, 标签宽: 0 },
      过程: { x: 0, y: 0, w: 0, h: 0, 标签宽: 0 },
    },
  };

  function 保存点UV到会话() {
    try {
      sessionStorage.setItem(存储键.点UV, JSON.stringify(状态.点UV));
    } catch (err) {
      console.warn("保存点UV失败", err);
    }
  }

  function 保存t到本地() {
    try {
      localStorage.setItem(存储键.参数t, 状态.参数t.toString());
    } catch (err) {
      console.warn("保存参数t失败", err);
    }
  }

  function 保存显示切线到本地(值) {
    try {
      localStorage.setItem(存储键.显示切线, 值 ? "1" : "0");
    } catch (err) {
      console.warn("保存显示切线失败", err);
    }
  }

  function 保存显示计算过程到本地(值) {
    try {
      localStorage.setItem(存储键.显示计算过程, 值 ? "1" : "0");
    } catch (err) {
      console.warn("保存显示计算过程失败", err);
    }
  }

  function 混合色(c1, c2, t) {
    const parse = (c) => {
      const hex = c.replace("#", "");
      const full = hex.length === 6 ? hex + "ff" : hex;
      const n = parseInt(full, 16);
      return { r: (n >> 24) & 0xff, g: (n >> 16) & 0xff, b: (n >> 8) & 0xff, a: n & 0xff };
    };
    const a = parse(c1);
    const b = parse(c2);
    const k = clamp01(t);
    const lerp = (x, y) => Math.round(x + (y - x) * k);
    return `rgba(${lerp(a.r, b.r)},${lerp(a.g, b.g)},${lerp(a.b, b.b)},${(lerp(a.a, b.a) / 255).toFixed(3)})`;
  }

  function 运算符间距(ch) {
    if (ch === "+") return 6;
    if (ch === "/") return 2;
    if (ch === "×" || ch === "-" || ch === "=" || ch === "|") return 2;
    return 0;
  }

  function 彩色文本宽度(ctx, tokens) {
    if (typeof tokens === "string") {
      let 宽 = 0;
      for (const ch of tokens) {
        const 间距 = 运算符间距(ch);
        宽 += 间距;
        宽 += ctx.measureText(ch).width;
        宽 += 间距;
      }
      return 宽;
    }
    let 宽 = 0;
    tokens.forEach((token) => {
      const scale = token.superscript ? 0.7 : 1;
      for (const ch of token.text) {
        const 间距 = 运算符间距(ch);
        if (间距) 宽 += 间距;
        宽 += ctx.measureText(ch).width * scale;
        if (间距) 宽 += 间距;
      }
    });
    return 宽;
  }

  function 选择颜色(token, ch) {
    if (token && token.colorType === "点数字") return 过程颜色.点数字;
    if (token && token.colorType === "上标数字") return 过程颜色.上标数字;
    if (token && token.colorType === "函数") return 过程颜色.函数;
    if (ch === "|") return 过程颜色.绝对值线;
    if (/\d/.test(ch)) return 过程颜色.数字;
    if (ch === ".") return 过程颜色.小数点;
    if (/[+\-×/=|]/.test(ch) || ch === "-") return 过程颜色.运算符;
    if (/[()\[\]]/.test(ch)) return 过程颜色.括号;
    if (ch === ":") return 过程颜色.冒号;
    return 过程颜色.文本;
  }

  function 绘制彩色文本(ctx, tokens, x, y) {
    if (typeof tokens === "string") {
      let 光标x = x;
      for (const ch of tokens) {
        ctx.fillStyle = 选择颜色(null, ch);
        const 间距 = 运算符间距(ch);
        const 前距 = 间距;
        const 后距 = 间距;
        光标x += 前距;
        ctx.fillText(ch, 光标x, y);
        光标x += ctx.measureText(ch).width + 后距;
      }
      return 光标x - x;
    }

    let 光标x = x;
    tokens.forEach((token) => {
      const scale = token.superscript ? 0.7 : 1;
      const yOffset = token.superscript ? -6 : 0;
      for (const ch of token.text) {
        ctx.fillStyle = 选择颜色(token, ch);

        const ch宽 = ctx.measureText(ch).width * scale;
        const 间距 = 运算符间距(ch);
        const 前距 = 间距;
        const 后距 = 间距;
        光标x += 前距;
        ctx.save();
        ctx.translate(光标x, y + yOffset);
        if (scale !== 1) ctx.scale(scale, scale);
        ctx.fillText(ch, 0, 0);
        ctx.restore();
        光标x += ch宽 + 后距;
      }
    });
    return 光标x - x;
  }

  function 格式化t值(v) {
    const s = v.toFixed(3);
    const trimmed = s.replace(/\.0+$/, "").replace(/(\.\d*?[1-9])0+$/, "$1");
    return trimmed.length ? trimmed : "0";
  }

  function 获取绘图区() {
    const padding = 控件条配置.边距;
    const 有效高 = Math.max(240, 状态.高度 - padding * 2);
    const 有效宽 = Math.max(320, 状态.宽度 - padding * 2);
    return { x: padding, y: padding, w: 有效宽, h: 有效高 };
  }

  function 调整画布尺寸() {
    const 盒 = 画布.getBoundingClientRect();
    状态.宽度 = 盒.width;
    状态.高度 = 盒.height;
    const 像素比 = (状态.像素比 = Math.max(1, window.devicePixelRatio || 1));
    画布.width = Math.max(1, Math.floor(盒.width * 像素比));
    画布.height = Math.max(1, Math.floor(盒.height * 像素比));
    上下文.setTransform(1, 0, 0, 1, 0, 0);
    上下文.scale(像素比, 像素比);
    布局控件条();
    从UV布局点集();
    绘制();
  }

  function 从UV布局点集() {
    const 绘图区 = 获取绘图区();
    状态.点集 = 状态.点UV.map((点) => ({
      name: 点.name,
      x: 绘图区.x + 点.u * 绘图区.w,
      y: 绘图区.y + 点.v * 绘图区.h,
    }));
  }

  function UV自坐标(x, y) {
    const 绘图区 = 获取绘图区();
    return {
      u: clamp01((x - 绘图区.x) / 绘图区.w),
      v: clamp01((y - 绘图区.y) / 绘图区.h),
    };
  }

  function 计算贝塞尔点(t, p0, p1, p2, p3) {
    const mt = 1 - t;
    const mt平方 = mt * mt;
    const t平方 = t * t;
    const p0权重 = mt ** 3;
    const p1权重 = 3 * mt平方 * t;
    const p2权重 = 3 * mt * t平方;
    const p3权重 = t ** 3;
    return {
      x: p0权重 * p0.x + p1权重 * p1.x + p2权重 * p2.x + p3权重 * p3.x,
      y: p0权重 * p0.y + p1权重 * p1.y + p2权重 * p2.y + p3权重 * p3.y,
    };
  }

  function 计算贝塞尔切线(t, p0, p1, p2, p3) {
    const mt = 1 - t;
    const 项1x = 3 * mt * mt * (p1.x - p0.x);
    const 项1y = 3 * mt * mt * (p1.y - p0.y);
    const 项2x = 6 * mt * t * (p2.x - p1.x);
    const 项2y = 6 * mt * t * (p2.y - p1.y);
    const 项3x = 3 * t * t * (p3.x - p2.x);
    const 项3y = 3 * t * t * (p3.y - p2.y);
    return { x: 项1x + 项2x + 项3x, y: 项1y + 项2y + 项3y };
  }

  function 绘制() {
    const { 宽度: 画宽, 高度: 画高 } = 状态;
    上下文.clearRect(0, 0, 画宽, 画高);

    绘制背景网格();

    const [p0, p1, p2, p3] = 状态.点集;
    绘制控制线段(p0, p1, p2, p3);
    上下文.lineWidth = 2;
    上下文.strokeStyle = "#8b5cf6";
    上下文.beginPath();
    上下文.moveTo(p0.x, p0.y);
    上下文.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    上下文.stroke();

    const 曲线点 = 计算贝塞尔点(状态.参数t, p0, p1, p2, p3);
    const 切向量 = 计算贝塞尔切线(状态.参数t, p0, p1, p2, p3);
    const 切线长 = Math.hypot(切向量.x, 切向量.y) || 1;
    const 切线单位x = 切向量.x / 切线长;
    const 切线单位y = 切向量.y / 切线长;
    if (状态.显示切线) {
      const 半长 = 350;
      上下文.save();
      上下文.strokeStyle = "gold";
      上下文.lineWidth = 0.75;
      上下文.beginPath();
      上下文.moveTo(曲线点.x - 切线单位x * 半长, 曲线点.y - 切线单位y * 半长);
      上下文.lineTo(曲线点.x + 切线单位x * 半长, 曲线点.y + 切线单位y * 半长);
      上下文.stroke();
      上下文.restore();
    }

    绘制箭头(曲线点.x, 曲线点.y, Math.atan2(切线单位y, 切线单位x));
    绘制控制点();
    绘制控件条();
    绘制计算过程();
  }

  function 绘制背景网格() {
    const { 宽度: 画宽, 高度: 画高 } = 状态;
    const 步距 = 40;
    上下文.save();
    上下文.lineWidth = 1;
    上下文.strokeStyle = "rgba(255,255,255,0.06)";
    for (let x = 0; x <= 画宽; x += 步距) {
      上下文.beginPath();
      上下文.moveTo(x + 0.5, 0);
      上下文.lineTo(x + 0.5, 画高);
      上下文.stroke();
    }
    for (let y = 0; y <= 画高; y += 步距) {
      上下文.beginPath();
      上下文.moveTo(0, y + 0.5);
      上下文.lineTo(画宽, y + 0.5);
      上下文.stroke();
    }
    上下文.restore();
  }

  function 绘制控制线段(p0, p1, p2, p3) {
    上下文.save();
    上下文.lineWidth = 1;
    上下文.setLineDash([10, 5]);

    上下文.strokeStyle = "gray";
    上下文.beginPath();
    上下文.moveTo(p0.x, p0.y);
    上下文.lineTo(p1.x, p1.y);
    上下文.stroke();

    上下文.beginPath();
    上下文.moveTo(p2.x, p2.y);
    上下文.lineTo(p3.x, p3.y);
    上下文.stroke();

    上下文.restore();
  }

  function 绘制控制点() {
    const 半径 = 7;
    const 悬停半径 = 10;
    状态.点集.forEach((点, 索引) => {
      const r = 状态.拖拽索引 === 索引 || 状态.悬停索引 === 索引 ? 悬停半径 : 半径;
      上下文.save();
      上下文.beginPath();
      上下文.arc(点.x, 点.y, r, 0, Math.PI * 2);
      上下文.fillStyle = 状态.拖拽索引 === 索引 || 状态.悬停索引 === 索引 ? "#f59e0b" : "#353b45ff";
      上下文.globalAlpha = 0.95;
      上下文.fill();
      上下文.lineWidth = 2;
      上下文.strokeStyle = "rgba(255,255,255,0.65)";
      上下文.stroke();
      上下文.restore();

      上下文.save();
      const 字体 = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
      上下文.font = 字体;
      上下文.textBaseline = "bottom";
      上下文.textAlign = "left";
      const 锚点x = 点.x - 10;
      const 锚点y = 点.y - 10;
      const 全宽 = 上下文.measureText(点.name).width;
      const 起始x = 锚点x - 全宽;
      const 字母 = 点.name.slice(0, 1);
      const 数字部分 = 点.name.slice(1);
      上下文.fillStyle = 标注颜色.字母;
      上下文.fillText(字母, 起始x, 锚点y);
      const 字母宽度 = 上下文.measureText(字母).width;
      上下文.fillStyle = 标注颜色.数字;
      上下文.fillText(数字部分, 起始x + 字母宽度 + 1, 锚点y);
      上下文.restore();
    });
  }

  function 绘制控件条() {
    const { 滑块, 开关, 过程 } = 状态.控件布局;
    上下文.save();

    // t 滑块标题
    上下文.fillStyle = "#cbd5e1";
    上下文.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    上下文.textAlign = "right";
    上下文.textBaseline = "middle";
    上下文.fillText("t", 滑块.x - 18, 滑块.y);

    // 滑块轨道
    const 轨道激活 = 状态.控件拖拽 === "slider" || 状态.滑块悬停 || 状态.拇指悬停;
    const 轨道底色 = 轨道激活 ? "#444" : "#2a2a2a";
    const 轨道高亮 = 上下文.createLinearGradient(滑块.x, 滑块.y, 滑块.x + 滑块.w, 滑块.y);
    轨道高亮.addColorStop(0, "#2972a3ff");
    轨道高亮.addColorStop(1, "#428b73ff");
    const 轨道宽度 = 4;
    上下文.lineCap = "round";

    上下文.strokeStyle = 轨道底色;
    上下文.lineWidth = 轨道宽度;
    上下文.beginPath();
    上下文.moveTo(滑块.x, 滑块.y);
    上下文.lineTo(滑块.x + 滑块.w, 滑块.y);
    上下文.stroke();

    const 当前x = 滑块.x + 滑块.w * 状态.参数t;
    上下文.strokeStyle = 轨道高亮;
    上下文.beginPath();
    上下文.moveTo(滑块.x, 滑块.y);
    上下文.lineTo(当前x, 滑块.y);
    上下文.stroke();

    // 滑块拇指
    const 拇指半径 = 10;
    const 拇指填充 =
      状态.控件拖拽 === "slider" ? "#0f2236" : 状态.拇指悬停 ? "#3e6895ff" : 轨道激活 ? "#0f172a" : "#0b1220";
    上下文.fillStyle = 拇指填充;
    上下文.strokeStyle = 状态.拇指悬停 || 状态.控件拖拽 === "slider" ? "#c7d2fe" : "#dbeafe";
    上下文.lineWidth = 状态.拇指悬停 ? 2.4 : 2;
    上下文.beginPath();
    上下文.arc(当前x, 滑块.y, 拇指半径, 0, Math.PI * 2);
    上下文.fill();
    上下文.stroke();

    // t 数值
    上下文.fillStyle = "#e5e7eb";
    上下文.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    上下文.textAlign = "left";
    const t文本 = 格式化t值(状态.参数t);
    const 小数点索引 = t文本.indexOf(".");
    const 起始x = 滑块.x + 滑块.w + 18;
    if (小数点索引 === -1) {
      上下文.fillText(t文本, 起始x, 滑块.y);
    } else {
      const 整数部分 = t文本.slice(0, 小数点索引);
      const 小数部分 = t文本.slice(小数点索引 + 1);
      上下文.fillStyle = "#e5e7eb";
      上下文.fillText(整数部分, 起始x, 滑块.y);
      const 整数宽 = 上下文.measureText(整数部分).width;
      const 点宽 = 上下文.measureText(".").width;
      上下文.fillStyle = "lightslategray";
      上下文.fillText(".", 起始x + 整数宽, 滑块.y);
      上下文.fillStyle = "#e5e7eb";
      上下文.fillText(小数部分, 起始x + 整数宽 + 点宽, 滑块.y);
    }

    // 开关
    const now = performance.now();
    const 过渡 = 状态.切线过渡;
    const dt = Math.min(1000, now - 过渡.上次);
    const step = Math.min(1, dt / 100);
    过渡.值 += (过渡.目标 - 过渡.值) * step;
    过渡.上次 = now;
    const 需要继续动画 = Math.abs(过渡.目标 - 过渡.值) > 0.001;
    if (需要继续动画) 请求重绘();

    const 关轨道 = "rgba(55,65,81,0.9)";
    const 开轨渐变 = 上下文.createLinearGradient(开关.x, 开关.y, 开关.x + 开关.w, 开关.y);
    开轨渐变.addColorStop(0, "#22acc1ff");
    开轨渐变.addColorStop(1, "#149268ff");
    const 轨阴影 = "rgba(15,23,42,0.45)";
    绘制圆角矩形(开关.x, 开关.y, 开关.w, 开关.h, 开关.h / 2, () => {
      上下文.fillStyle = 关轨道;
      上下文.shadowColor = 轨阴影;
      上下文.shadowBlur = 18;
      上下文.shadowOffsetY = 2;
      上下文.fill();
      上下文.globalAlpha = 过渡.值;
      上下文.fillStyle = 开轨渐变;
      上下文.fill();
      上下文.globalAlpha = 1;
      上下文.shadowColor = "transparent";
      上下文.strokeStyle = "rgba(255,255,255,0.18)";
      上下文.lineWidth = 1;
      上下文.stroke();
    });

    const 开关内边距 = 5;
    const 旋钮半径 = (开关.h - 开关内边距 * 2) / 2;
    const 旋钮中心x = 开关.x + 开关内边距 + 旋钮半径 + (开关.w - 开关内边距 * 2 - 旋钮半径 * 2) * 过渡.值;
    const 旋钮中心y = 开关.y + 开关.h / 2;
    上下文.fillStyle = "#ffffff";
    上下文.strokeStyle = "rgba(0,0,0,0.1)";
    上下文.lineWidth = 1;
    上下文.shadowColor = "rgba(0,0,0,0.3)";
    上下文.shadowBlur = 6;
    上下文.shadowOffsetY = 2;
    上下文.beginPath();
    上下文.arc(旋钮中心x, 旋钮中心y, 旋钮半径, 0, Math.PI * 2);
    上下文.fill();
    上下文.stroke();
    上下文.shadowColor = "transparent";

    // 小内点模拟 iOS 风格指示
    上下文.fillStyle = 混合色("#9ca3af", "#0f172a", 过渡.值);
    上下文.beginPath();
    上下文.arc(旋钮中心x, 旋钮中心y, 3, 0, Math.PI * 2);
    上下文.fill();

    上下文.fillStyle = "#e2e8f0";
    上下文.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    上下文.textAlign = "left";
    上下文.textBaseline = "middle";
    上下文.fillText("切线", 开关.x + 开关.w + 10, 开关.y + 开关.h / 2);

    // 计算过程复选框
    const 过程过渡 = 状态.过程过渡;
    const dt过程 = Math.min(1000, now - 过程过渡.上次);
    const step过程 = Math.min(1, dt过程 / 100);
    过程过渡.值 += (过程过渡.目标 - 过程过渡.值) * step过程;
    过程过渡.上次 = now;
    const 过程动画中 = Math.abs(过程过渡.目标 - 过程过渡.值) > 0.001;
    if (过程动画中) 请求重绘();

    绘制圆角矩形(过程.x, 过程.y, 过程.w, 过程.h, 过程.h / 2, () => {
      const offTrack = "rgba(55,65,81,0.9)";
      const onGrad = 上下文.createLinearGradient(过程.x, 过程.y, 过程.x + 过程.w, 过程.y);
      onGrad.addColorStop(0, "#22acc1ff");
      onGrad.addColorStop(1, "#149268ff");
      上下文.fillStyle = offTrack;
      上下文.shadowColor = "rgba(15,23,42,0.45)";
      上下文.shadowBlur = 18;
      上下文.shadowOffsetY = 2;
      上下文.fill();
      上下文.globalAlpha = 过程过渡.值;
      上下文.fillStyle = onGrad;
      上下文.fill();
      上下文.globalAlpha = 1;
      上下文.shadowColor = "transparent";
      上下文.strokeStyle = "rgba(255,255,255,0.18)";
      上下文.lineWidth = 1;
      上下文.stroke();
    });
    const knobPad = 5;
    const knobR = (过程.h - knobPad * 2) / 2;
    const knobCx = 过程.x + knobPad + knobR + (过程.w - knobPad * 2 - knobR * 2) * 过程过渡.值;
    const knobCy = 过程.y + 过程.h / 2;
    上下文.fillStyle = "#ffffff";
    上下文.strokeStyle = "rgba(0,0,0,0.1)";
    上下文.lineWidth = 1;
    上下文.beginPath();
    上下文.arc(knobCx, knobCy, knobR, 0, Math.PI * 2);
    上下文.fill();
    上下文.stroke();
    上下文.fillStyle = 混合色("#9ca3af", "#0f172a", 过程过渡.值);
    上下文.beginPath();
    上下文.arc(knobCx, knobCy, 3, 0, Math.PI * 2);
    上下文.fill();

    上下文.fillStyle = "#e2e8f0";
    上下文.fillText("计算过程", 过程.x + 过程.w + 10, 过程.y + 过程.h / 2);

    上下文.restore();
  }

  function 绘制计算过程() {
    if (!状态.显示计算过程) return;
    const { 滑块 } = 状态.控件布局;
    上下文.save();
    上下文.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    上下文.textAlign = "left";
    上下文.textBaseline = "top";

    const 行间距 = 6;
    const 行高 = 18;
    const 行数据 = [
      {
        标题: "切向量",
        正文: [
          { text: ": d = 3×(" },
          { text: "1" },
          { text: "-" },
          { text: "t" },
          { text: ")" },
          { text: "2", superscript: true, colorType: "上标数字" },
          { text: "×(" },
          { text: "p" },
          { text: "1", colorType: "点数字" },
          { text: "-" },
          { text: "p" },
          { text: "0", colorType: "点数字" },
          { text: ")+6×(" },
          { text: "1" },
          { text: "-" },
          { text: "t" },
          { text: ")×t×(" },
          { text: "p" },
          { text: "2", colorType: "点数字" },
          { text: "-" },
          { text: "p" },
          { text: "1", colorType: "点数字" },
          { text: ")+3×t" },
          { text: "2", superscript: true, colorType: "上标数字" },
          { text: "×(" },
          { text: "p" },
          { text: "3", colorType: "点数字" },
          { text: "-" },
          { text: "p" },
          { text: "2", colorType: "点数字" },
          { text: ")" },
        ],
      },
      {
        标题: "归一化",
        正文: [{ text: ": u = d/|d|" }],
      },
      {
        标题: "弧度",
        正文: [
          { text: ": θ = " },
          { text: "atan2", colorType: "函数" },
          { text: "(u.y, u.x)" },
        ],
      },
    ];

    const 标题间距 = 4;
    const 标题最大宽 = Math.max(...行数据.map((行) => 上下文.measureText(行.标题).width));

    let 最大宽 = 0;
    行数据.forEach((行) => {
      const 正文宽 = 彩色文本宽度(上下文, 行.正文);
      最大宽 = Math.max(最大宽, 标题最大宽 + 标题间距 + 正文宽);
    });

    const 内边距 = 14;
    const 框宽 = 最大宽 + 内边距 * 2;
    const 框高 = 行数据.length * 行高 + (行数据.length - 1) * 行间距 + 内边距 * 2;
    let 框x = (状态.宽度 - 框宽) / 2;
    框x = Math.max(控件条配置.边距, 框x);
    const 预期y = 滑块.y - 28 - 框高;
    const 框y = Math.max(控件条配置.边距, 预期y) - 50;

    绘制圆角矩形(框x, 框y, 框宽, 框高, 12, () => {
      上下文.fillStyle = "rgba(15, 23, 42, 0.5)";
      上下文.strokeStyle = "rgba(148,163,184,0.3)";
      上下文.lineWidth = 1;
      上下文.shadowColor = "rgba(0, 0, 0, 0.35)";
      上下文.shadowBlur = 10;
      上下文.shadowOffsetY = 3;
      上下文.fill();
      上下文.stroke();
      上下文.shadowColor = "transparent";
    });

    let 文本x = 框x + 内边距;
    let 文本y = 框y + 内边距;
    行数据.forEach((行, idx) => {
      const yPos = 文本y + idx * (行高 + 行间距) + 4;
      const 标题宽 = 上下文.measureText(行.标题).width;
      const 标题起x = 文本x + (标题最大宽 - 标题宽);
      上下文.fillStyle = 过程颜色.标题;
      上下文.fillText(行.标题, 标题起x, yPos);
      绘制彩色文本(上下文, 行.正文, 文本x + 标题最大宽 + 标题间距, yPos);
    });

    上下文.restore();
  }

  function 绘制圆角矩形(x, y, w, h, r, 绘制回调) {
    const radius = Math.min(r, h / 2, w / 2);
    上下文.beginPath();
    上下文.roundRect(x, y, w, h, radius);
    绘制回调();
  }

  function 绘制箭头(x, y, 方向角) {
    const 长度 = 22;
    const 半宽 = 10;
    const 底x = x - Math.cos(方向角) * 长度;
    const 底y = y - Math.sin(方向角) * 长度;
    const 法向x = -Math.sin(方向角);
    const 法向y = Math.cos(方向角);
    const 左x = 底x + 法向x * 半宽;
    const 左y = 底y + 法向y * 半宽;
    const 右x = 底x - 法向x * 半宽;
    const 右y = 底y - 法向y * 半宽;

    上下文.save();
    上下文.beginPath();
    上下文.moveTo(x, y);
    上下文.lineTo(左x, 左y);
    上下文.lineTo(右x, 右y);
    上下文.closePath();
    const 渐变 = 上下文.createLinearGradient(底x, 底y, x, y);
    渐变.addColorStop(0, "rgba(139,92,246,0.7)");
    渐变.addColorStop(1, "rgba(34,211,238,0.95)");
    上下文.fillStyle = 渐变;
    上下文.strokeStyle = "rgba(255,255,255,0.8)";
    上下文.lineWidth = 1.5;
    上下文.fill();
    上下文.stroke();
    上下文.restore();
  }

  function 距离平方(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function 布局控件条() {
    const 栏宽 = 状态.宽度 - 控件条配置.边距 * 2;
    const 栏 = {
      x: 控件条配置.边距,
      y: 状态.高度 - 控件条配置.高度 - 控件条配置.边距,
      w: Math.max(240, 栏宽),
      h: 控件条配置.高度,
    };

    const 开关宽 = 50;
    const 开关高 = 24;
    const 切线标签宽 = 56;
    const 过程宽 = 开关宽;
    const 过程高 = 开关高;
    const 过程标签宽 = 78;
    const 开关组宽 = 开关宽 + 10 + 切线标签宽;
    const 过程组宽 = 过程宽 + 10 + 过程标签宽;
    const 右侧总宽 = 开关组宽 + 16 + 过程组宽;

    const 开关 = {
      x: 栏.x + 栏.w - 右侧总宽,
      y: 栏.y + 栏.h / 2 + 4 - 开关高 / 2,
      w: 开关宽,
      h: 开关高,
      标签宽: 切线标签宽,
    };

    const 过程 = {
      x: 开关.x + 开关组宽 + 16,
      y: 栏.y + 栏.h / 2 + 4 - 过程高 / 2,
      w: 过程宽,
      h: 过程高,
      标签宽: 过程标签宽,
    };

    const 滑块右界 = 开关.x - 16;
    const 目标滑块宽 = Math.min(Math.max(90, (栏.w - 右侧总宽 - 48) * 0.3), Math.max(80, 滑块右界 - (栏.x + 24)));
    const 居中x = 栏.x + (栏.w - 目标滑块宽) / 2;
    const 最小x = 栏.x + 24;
    const 最大x = 滑块右界 - 目标滑块宽;
    const 滑块 = {
      x: Math.min(Math.max(居中x, 最小x), 最大x),
      y: 栏.y + 栏.h / 2 + 4,
      w: 目标滑块宽,
    };

    状态.控件布局 = { 栏, 滑块, 开关, 过程 };
  }

  function 在滑块区域(位置) {
    const { trackHit } = 计算滑块命中(位置);
    return trackHit;
  }

  function 在开关区域(位置) {
    const { 开关 } = 状态.控件布局;
    const hitW = 开关.w + 10 + 开关.标签宽;
    return 位置.x >= 开关.x && 位置.x <= 开关.x + hitW && 位置.y >= 开关.y && 位置.y <= 开关.y + 开关.h;
  }

  function 在过程区域(位置) {
    const { 过程 } = 状态.控件布局;
    const hitW = 过程.w + 10 + 过程.标签宽;
    return 位置.x >= 过程.x && 位置.x <= 过程.x + hitW && 位置.y >= 过程.y && 位置.y <= 过程.y + 过程.h;
  }

  function 在控件栏区域(位置) {
    const { 栏 } = 状态.控件布局;
    return 位置.x >= 栏.x && 位置.x <= 栏.x + 栏.w && 位置.y >= 栏.y && 位置.y <= 栏.y + 栏.h;
  }

  function 获取拇指中心() {
    const { 滑块 } = 状态.控件布局;
    return { x: 滑块.x + 滑块.w * 状态.参数t, y: 滑块.y };
  }

  function 计算滑块命中(位置) {
    const { 滑块 } = 状态.控件布局;
    const 拇指 = 获取拇指中心();
    const 拇指半径 = 10;
    const thumbHit = Math.hypot(位置.x - 拇指.x, 位置.y - 拇指.y) <= 拇指半径 + 4;
    const trackHit = 位置.x >= 滑块.x - 10 && 位置.x <= 滑块.x + 滑块.w + 10 && Math.abs(位置.y - 滑块.y) <= 12;
    return { thumbHit, trackHit };
  }

  function 更新t值(新t, 需要重绘 = true) {
    const clamped = clamp01(新t);
    状态.参数t = clamped;
    if (滑块t) 滑块t.value = clamped.toString();
    if (t数值) t数值.textContent = 格式化t值(clamped);
    保存t到本地();
    if (需要重绘) 请求重绘();
  }

  function 切换显示切线(值) {
    状态.显示切线 = 值;
    状态.切线过渡.目标 = 值 ? 1 : 0;
    状态.切线过渡.上次 = performance.now();
    if (显示切线勾选) 显示切线勾选.checked = 值;
    保存显示切线到本地(值);
    请求重绘();
  }

  function 从位置更新滑块(位置) {
    const { 滑块 } = 状态.控件布局;
    const 比例 = clamp01((位置.x - 滑块.x) / 滑块.w);
    更新t值(比例);
  }

  function 处理指针移动(e) {
    const 位置 = 获取指针位置(e);
    const { thumbHit, trackHit } = 计算滑块命中(位置);
    const 上次滑块悬停 = 状态.滑块悬停;
    const 上次拇指悬停 = 状态.拇指悬停;
    状态.滑块悬停 = trackHit;
    状态.拇指悬停 = thumbHit;
    const 悬停变更 = 上次滑块悬停 !== trackHit || 上次拇指悬停 !== thumbHit;

    if (状态.控件拖拽 === "slider") {
      从位置更新滑块(位置);
      画布.style.cursor = "grabbing";
      if (悬停变更) 请求重绘();
      return;
    }

    const 开关命中 = 在开关区域(位置);
    const 过程命中 = 在过程区域(位置);

    if (thumbHit || trackHit || 开关命中 || 过程命中) {
      状态.悬停索引 = -1;
      画布.style.cursor = 'url("/Images/Common/鼠标-指向.cur"), pointer';
      if (悬停变更) 请求重绘();
      return;
    }

    if (状态.拖拽索引 >= 0) {
      const 索引 = 状态.拖拽索引;
      const 限制UV = UV自坐标(位置.x, 位置.y);
      状态.点UV[索引].u = 限制UV.u;
      状态.点UV[索引].v = 限制UV.v;
      保存点UV到会话();
      从UV布局点集();
      请求重绘();
      return;
    }
    const 命中半径 = 12;
    const 命中半径平方 = 命中半径 * 命中半径;
    const 上次悬停 = 状态.悬停索引;
    状态.悬停索引 = -1;
    for (let i = 0; i < 状态.点集.length; i++) {
      if (距离平方(位置, 状态.点集[i]) <= 命中半径平方) {
        状态.悬停索引 = i;
        break;
      }
    }
    画布.style.cursor = 状态.悬停索引 >= 0 ? 'url("/Images/Common/鼠标-指向.cur"), pointer' : "";
    if (上次悬停 !== 状态.悬停索引 || 悬停变更) 请求重绘();
  }

  function 处理指针按下(e) {
    const 位置 = 获取指针位置(e);
    const { thumbHit, trackHit } = 计算滑块命中(位置);
    if (在开关区域(位置)) {
      切换显示切线(!状态.显示切线);
      e.preventDefault();
      return;
    }
    if (在过程区域(位置)) {
      状态.显示计算过程 = !状态.显示计算过程;
      状态.过程过渡.目标 = 状态.显示计算过程 ? 1 : 0;
      状态.过程过渡.上次 = performance.now();
      保存显示计算过程到本地(状态.显示计算过程);
      e.preventDefault();
      请求重绘();
      return;
    }
    if (thumbHit) {
      状态.控件拖拽 = "slider";
      e.preventDefault();
      return;
    }
    if (trackHit) {
      状态.控件拖拽 = "slider";
      从位置更新滑块(位置);
      e.preventDefault();
      return;
    }
    const 命中半径 = 12;
    const 命中半径平方 = 命中半径 * 命中半径;
    for (let i = 0; i < 状态.点集.length; i++) {
      if (距离平方(位置, 状态.点集[i]) <= 命中半径平方) {
        状态.拖拽索引 = i;
        e.preventDefault();
        break;
      }
    }
  }

  function 处理指针松开(e) {
    if (状态.拖拽索引 >= 0) 状态.拖拽索引 = -1;
    if (状态.控件拖拽) 状态.控件拖拽 = "";
    if (e && (e.type === "mouseleave" || e.type === "touchend")) {
      状态.滑块悬停 = false;
      状态.拇指悬停 = false;
    }
    请求重绘();
  }

  function 获取指针位置(e) {
    const 盒 = 画布.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - 盒.left, y: clientY - 盒.top };
  }

  let 动画帧ID = 0;
  function 请求重绘() {
    if (动画帧ID) return;
    动画帧ID = requestAnimationFrame(() => {
      动画帧ID = 0;
      绘制();
    });
  }

  if (滑块t) {
    滑块t.style.display = "none";
    滑块t.addEventListener("input", () => {
      const t值 = parseFloat(滑块t.value);
      更新t值(Number.isFinite(t值) ? t值 : 0, true);
    });
  }

  if (t数值) {
    t数值.style.display = "none";
  }

  if (显示切线勾选) {
    显示切线勾选.style.display = "none";
    显示切线勾选.addEventListener("change", () => 切换显示切线(显示切线勾选.checked));
    显示切线勾选.checked = false;
  }

  if (重置按钮) {
    重置按钮.addEventListener("click", () => {
      状态.点UV = 默认点UV.map((p) => ({ ...p }));
      从UV布局点集();
      if (滑块t) 滑块t.value = "0";
      if (t数值) t数值.textContent = 格式化t值(0);
      状态.参数t = 0;
      保存t到本地();
      状态.显示切线 = false;
      状态.切线过渡 = { 值: 0, 目标: 0, 上次: performance.now() };
      if (显示切线勾选) 显示切线勾选.checked = false;
      状态.显示计算过程 = false;
      状态.过程过渡 = { 值: 0, 目标: 0, 上次: performance.now() };
      保存显示切线到本地(false);
      保存显示计算过程到本地(false);
      保存点UV到会话();
      布局控件条();
      请求重绘();
    });
  }

  画布.addEventListener("mousemove", 处理指针移动);
  画布.addEventListener("mousedown", 处理指针按下);
  window.addEventListener("mouseup", 处理指针松开);
  画布.addEventListener("mouseleave", 处理指针松开);

  画布.addEventListener(
    "touchstart",
    (e) => {
      处理指针按下(e);
    },
    { passive: false }
  );
  画布.addEventListener(
    "touchmove",
    (e) => {
      处理指针移动(e);
      e.preventDefault();
    },
    { passive: false }
  );
  画布.addEventListener("touchend", 处理指针松开);

  window.addEventListener("resize", 调整画布尺寸);
  调整画布尺寸();
  if (滑块t) 滑块t.value = 状态.参数t.toString();
  if (t数值) t数值.textContent = 格式化t值(状态.参数t);
  更新t值(状态.参数t, false);
  切换显示切线(状态.显示切线);
  请求重绘();
})();
