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
    数字: "#BA8E23",
    小数点: "#9c9c9cff",
    绝对值线: "#b1e3ffff",
    运算符: "#f472b6",
    括号: "#9a93f9ff",
    冒号: "gray",
    等号: "lightslategray",
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
    显示法线: "curve-direction-tracking-show-normal",
    显示箭头: "curve-direction-tracking-show-arrow",
    显示小球: "curve-direction-tracking-show-ball",
    显示计算过程: "curve-direction-tracking-show-calculation",
    显示t坐标: "curve-direction-tracking-show-t-coord",
    显示控制点坐标: "curve-direction-tracking-show-control-point-coord",
  };

  const clamp01 = (v) => Math.min(1, Math.max(0, v));

  function 读取存储() {
    const 结果 = {
      点UV: 默认点UV.map((p) => ({ ...p })),
      参数t: 0,
      显示切线: false,
      显示法线: false,
      显示箭头: true,
      显示小球: false,
      显示计算过程: false,
      显示t坐标: false,
      显示控制点坐标: true,
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

    try {
      const rawToggle = localStorage.getItem(存储键.显示法线);
      if (rawToggle !== null) 结果.显示法线 = rawToggle === "1" || rawToggle === "true";
    } catch (err) {
      console.warn("读取显示法线失败", err);
    }

    try {
      const rawToggle = localStorage.getItem(存储键.显示箭头);
      if (rawToggle !== null) 结果.显示箭头 = rawToggle === "1" || rawToggle === "true";
    } catch (err) {
      console.warn("读取显示箭头失败", err);
    }

    try {
      const rawToggle = localStorage.getItem(存储键.显示小球);
      if (rawToggle !== null) 结果.显示小球 = rawToggle === "1" || rawToggle === "true";
    } catch (err) {
      console.warn("读取显示小球失败", err);
    }

    try {
      const rawToggle = localStorage.getItem(存储键.显示t坐标);
      if (rawToggle !== null) 结果.显示t坐标 = rawToggle === "1" || rawToggle === "true";
    } catch (err) {
      console.warn("读取显示t坐标失败", err);
    }

    try {
      const rawToggle = localStorage.getItem(存储键.显示控制点坐标);
      if (rawToggle !== null) 结果.显示控制点坐标 = rawToggle === "1" || rawToggle === "true";
    } catch (err) {
      console.warn("读取显示控制点坐标失败", err);
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
    显示法线: 初始存储.显示法线,
    显示箭头: 初始存储.显示箭头,
    显示小球: 初始存储.显示小球,
    显示计算过程: 初始存储.显示计算过程,
    显示t坐标: 初始存储.显示t坐标,
    显示控制点坐标: 初始存储.显示控制点坐标,
    切线过渡: { 值: 初始存储.显示切线 ? 1 : 0, 目标: 初始存储.显示切线 ? 1 : 0, 上次: performance.now() },
    法线过渡: { 值: 初始存储.显示法线 ? 1 : 0, 目标: 初始存储.显示法线 ? 1 : 0, 上次: performance.now() },
    箭头过渡: { 值: 初始存储.显示箭头 ? 1 : 0, 目标: 初始存储.显示箭头 ? 1 : 0, 上次: performance.now() },
    小球过渡: { 值: 初始存储.显示小球 ? 1 : 0, 目标: 初始存储.显示小球 ? 1 : 0, 上次: performance.now() },
    过程过渡: { 值: 初始存储.显示计算过程 ? 1 : 0, 目标: 初始存储.显示计算过程 ? 1 : 0, 上次: performance.now() },
    t坐标过渡: { 值: 初始存储.显示t坐标 ? 1 : 0, 目标: 初始存储.显示t坐标 ? 1 : 0, 上次: performance.now() },
    控制点坐标过渡: {
      值: 初始存储.显示控制点坐标 ? 1 : 0,
      目标: 初始存储.显示控制点坐标 ? 1 : 0,
      上次: performance.now(),
    },
    小球图像: null,
    小球旋转角度: 0,
    上次曲线点: null,
    上次t值: null,
    拖拽索引: -1,
    悬停索引: -1,
    控件拖拽: "",
    滑块悬停: false,
    拇指悬停: false,
    控件布局: {
      栏: { x: 0, y: 0, w: 0, h: 控件条配置.高度 },
      滑块: { x: 0, y: 0, w: 0 },
      开关: { x: 0, y: 0, w: 0, h: 0, 标签宽: 0 },
      法线: { x: 0, y: 0, w: 0, h: 0, 标签宽: 0 },
      箭头: { x: 0, y: 0, w: 0, h: 0, 标签宽: 0 },
      小球: { x: 0, y: 0, w: 0, h: 0, 标签宽: 0 },
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

  function 保存显示法线到本地(值) {
    try {
      localStorage.setItem(存储键.显示法线, 值 ? "1" : "0");
    } catch (err) {
      console.warn("保存显示法线失败", err);
    }
  }

  function 保存显示箭头到本地(值) {
    try {
      localStorage.setItem(存储键.显示箭头, 值 ? "1" : "0");
    } catch (err) {
      console.warn("保存显示箭头失败", err);
    }
  }

  function 保存显示小球到本地(值) {
    try {
      localStorage.setItem(存储键.显示小球, 值 ? "1" : "0");
    } catch (err) {
      console.warn("保存显示小球失败", err);
    }
  }

  function 保存显示t坐标到本地(值) {
    try {
      localStorage.setItem(存储键.显示t坐标, 值 ? "1" : "0");
    } catch (err) {
      console.warn("保存显示t坐标失败", err);
    }
  }

  function 保存显示控制点坐标到本地(值) {
    try {
      localStorage.setItem(存储键.显示控制点坐标, 值 ? "1" : "0");
    } catch (err) {
      console.warn("保存显示控制点坐标失败", err);
    }
  }

  function 加载小球图像() {
    状态.小球图像 = new Image();
    状态.小球图像.src = "/Images/Blogs/Canvas API/动画范例-01/ball.webp";
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
    if (ch === "=") return 过程颜色.等号; // "="使用灰色（和冒号一样的颜色）
    if (/[+\-×/|]/.test(ch) || ch === "-") return 过程颜色.运算符;
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
    let 上一个token最后一个字符 = null;
    tokens.forEach((token, tokenIndex) => {
      const scale = token.superscript ? 0.7 : 1;
      const yOffset = token.superscript ? -6 : 0;
      
      // 如果colorType是"点数字"，需要将点和数字分开处理
      if (token.colorType === "点数字") {
        for (let i = 0; i < token.text.length; i++) {
          const ch = token.text[i];
          
          // 在"dx"或"dy"中，"d"和"x"/"y"之间添加1的间距
          // 检查：1) 前一个字符是否是"d"，当前字符是否是"x"或"y"（同一token内）
          //      2) 上一个token的最后一个字符是否是"d"，当前字符是否是"x"或"y"（跨token）
          if ((i > 0 && token.text[i - 1] === "d" && (ch === "x" || ch === "y")) ||
              (i === 0 && 上一个token最后一个字符 === "d" && (ch === "x" || ch === "y"))) {
            光标x += 1;
          }
          
          // 点使用gray颜色，数字使用点数字颜色
          if (ch === ".") {
            ctx.fillStyle = "gray";
          } else {
            ctx.fillStyle = 过程颜色.点数字;
          }

          const ch宽 = ctx.measureText(ch).width * scale;
          const 间距 = token.noLeftMargin ? 0 : 运算符间距(ch); // 如果设置了noLeftMargin，则不添加左边距
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
      } else {
        for (let i = 0; i < token.text.length; i++) {
          const ch = token.text[i];
          
          // 在"dx"或"dy"中，"d"和"x"/"y"之间添加1的间距
          // 检查：1) 前一个字符是否是"d"，当前字符是否是"x"或"y"（同一token内）
          //      2) 上一个token的最后一个字符是否是"d"，当前字符是否是"x"或"y"（跨token）
          if ((i > 0 && token.text[i - 1] === "d" && (ch === "x" || ch === "y")) ||
              (i === 0 && 上一个token最后一个字符 === "d" && (ch === "x" || ch === "y"))) {
            光标x += 1;
          }
          
          ctx.fillStyle = 选择颜色(token, ch);

          const ch宽 = ctx.measureText(ch).width * scale;
          let 间距 = token.noLeftMargin ? 0 : 运算符间距(ch); // 如果设置了noLeftMargin，则不添加左边距
          
          // 在"|d|"中，"|"和"d"之间不应该有运算符间距（与算术标题保持一致）
          // 检查：1) 当前字符是"|"，下一个字符是"d"（同一token内）
          //      2) 当前字符是"|"，下一个token的第一个字符是"d"（跨token）
          let 前距 = 间距;
          let 后距 = 间距;
          if (ch === "|" && 
              ((i < token.text.length - 1 && token.text[i + 1] === "d") ||
               (i === token.text.length - 1 && tokenIndex < tokens.length - 1 && tokens[tokenIndex + 1].text && tokens[tokenIndex + 1].text[0] === "d"))) {
            后距 = 0; // "|"和"d"之间不添加右边距
          }
          // 检查：当前字符是"d"，前一个字符是"|"（同一token内或跨token）
          if (ch === "d" && 
              ((i > 0 && token.text[i - 1] === "|") ||
               (i === 0 && 上一个token最后一个字符 === "|"))) {
            前距 = 0; // "|"和"d"之间不添加左边距
          }
          // 检查：当前字符是"d"，下一个字符是"|"（同一token内）
          //      或当前字符是"d"，下一个token的第一个字符是"|"（跨token）
          if (ch === "d" && 
              ((i < token.text.length - 1 && token.text[i + 1] === "|") ||
               (i === token.text.length - 1 && tokenIndex < tokens.length - 1 && tokens[tokenIndex + 1].text && tokens[tokenIndex + 1].text[0] === "|"))) {
            后距 = 0; // "d"和"|"之间不添加右边距
          }
          // 检查：当前字符是"|"，前一个字符是"d"（同一token内或跨token）
          if (ch === "|" && 
              ((i > 0 && token.text[i - 1] === "d") ||
               (i === 0 && 上一个token最后一个字符 === "d"))) {
            前距 = 0; // "d"和"|"之间不添加左边距
          }
          
          光标x += 前距;
          
          ctx.save();
          ctx.translate(光标x, y + yOffset);
          if (scale !== 1) ctx.scale(scale, scale);
          ctx.fillText(ch, 0, 0);
          ctx.restore();
          光标x += ch宽 + 后距;
        }
      }
      
      // 记录当前token的最后一个字符，供下一个token使用
      if (token.text.length > 0) {
        上一个token最后一个字符 = token.text[token.text.length - 1];
      } else {
        上一个token最后一个字符 = null;
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
    const 法线单位x = -切线单位y;
    const 法线单位y = 切线单位x;

    if (状态.显示切线) {
      const 半长 = 350;
      上下文.save();
      上下文.strokeStyle = "gold";
      上下文.lineWidth = 1;
      上下文.beginPath();
      上下文.moveTo(曲线点.x - 切线单位x * 半长, 曲线点.y - 切线单位y * 半长);
      上下文.lineTo(曲线点.x + 切线单位x * 半长, 曲线点.y + 切线单位y * 半长);
      上下文.stroke();
      上下文.restore();
    }

    // 绘制顺序：先绘制小球、再绘制法线，最后绘制箭头
    if (状态.显示小球 && 状态.小球图像 && 状态.小球图像.complete) {
      绘制小球(曲线点, 法线单位x, 法线单位y, 状态.参数t);
    }

    if (状态.显示法线) {
      const 半长 = 350;
      上下文.save();
      上下文.strokeStyle = "#ff6b6b"; // 法线颜色（红色，与切线不同）
      上下文.lineWidth = 1; // 与切线宽度相同
      上下文.beginPath();
      上下文.moveTo(曲线点.x - 法线单位x * 半长, 曲线点.y - 法线单位y * 半长);
      上下文.lineTo(曲线点.x + 法线单位x * 半长, 曲线点.y + 法线单位y * 半长);
      上下文.stroke();
      上下文.restore();
    }

    if (状态.显示箭头) {
      绘制箭头(曲线点.x, 曲线点.y, Math.atan2(切线单位y, 切线单位x));
    }

    if (状态.显示t坐标) {
      绘制t坐标(曲线点.x, 曲线点.y, 法线单位x, 法线单位y);
    }

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

      // 绘制控制点坐标（在点的左下方）
      if (状态.显示控制点坐标) {
        // 计算左下方的位置（相对于点的位置）
        // 左下方意味着：x向左偏移，y向下偏移
        // 使用绘制t坐标函数，但直接指定位置，不依赖法线方向
        const 偏移x = -60; // 向左偏移
        const 偏移y = 15; // 向下偏移
        const 文本x = 点.x + 偏移x;
        const 文本y = 点.y + 偏移y;

        上下文.save();
        上下文.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
        上下文.textAlign = "left";
        上下文.textBaseline = "top";

        // 定义颜色（与t坐标一致）
        const 标签颜色 = "#60a5fa"; // x或y的颜色
        const 冒号颜色 = "#9ca3af"; // 冒号的颜色
        const 数字颜色 = "#e6b"; // 数字的颜色

        // 格式化坐标值（保留整数）
        const x值 = Math.round(点.x);
        const y值 = Math.round(点.y);
        const x值文本 = x值.toString();
        const y值文本 = y值.toString();

        // 测量文本宽度
        const x标签宽 = 上下文.measureText("x").width;
        const y标签宽 = 上下文.measureText("y").width;
        const 冒号宽 = 上下文.measureText(":").width;
        const x数字宽 = 上下文.measureText(x值文本).width;
        const y数字宽 = 上下文.measureText(y值文本).width;

        // 计算最大宽度（用于对齐）
        const 最大标签宽 = Math.max(x标签宽, y标签宽);
        const 最大数字宽 = Math.max(x数字宽, y数字宽);
        const 行高 = 18;

        // 绘制x行
        let 当前x = 文本x;
        上下文.fillStyle = 标签颜色;
        上下文.fillText("x", 当前x, 文本y);
        当前x += 最大标签宽 + 2; // 冒号左边2的边距
        上下文.fillStyle = 冒号颜色;
        上下文.fillText(":", 当前x, 文本y);
        当前x += 冒号宽 + 4; // 冒号右边4的边距
        上下文.fillStyle = 数字颜色;
        上下文.fillText(x值文本, 当前x, 文本y);

        // 绘制y行
        当前x = 文本x;
        上下文.fillStyle = 标签颜色;
        上下文.fillText("y", 当前x, 文本y + 行高);
        当前x += 最大标签宽 + 2; // 冒号左边2的边距
        上下文.fillStyle = 冒号颜色;
        上下文.fillText(":", 当前x, 文本y + 行高);
        当前x += 冒号宽 + 4; // 冒号右边4的边距
        上下文.fillStyle = 数字颜色;
        上下文.fillText(y值文本, 当前x, 文本y + 行高);

        上下文.restore();
      }
    });
  }

  function 绘制控件条() {
    const { 滑块, 开关, 法线, 箭头, 小球, 控制点坐标, t坐标, 过程 } = 状态.控件布局;
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

    // 绘制复选框区域的背景
    const 复选框区宽度 = Math.min(250, 状态.宽度 / 6);
    const 开关高 = 24;
    const 行间距 = 12;
    const 内边距 = 20;
    const 复选框行数 = 7;
    const 复选框内容高度 = 开关高 * 复选框行数 + 行间距 * (复选框行数 - 1);
    const 复选框区高度 = 复选框内容高度 + 内边距 * 2;
    const 复选框区右 = 状态.宽度 - 控件条配置.边距;
    const 复选框区下 = 状态.高度 - 控件条配置.边距;
    const 复选框区顶 = 复选框区下 - 复选框区高度;
    const 复选框区左 = 复选框区右 - 复选框区宽度;

    const now = performance.now();

    // 绘制切线复选框
    const 切线过渡 = 状态.切线过渡;
    const dt切线 = Math.min(1000, now - 切线过渡.上次);
    const step切线 = Math.min(1, dt切线 / 100);
    切线过渡.值 += (切线过渡.目标 - 切线过渡.值) * step切线;
    切线过渡.上次 = now;
    if (Math.abs(切线过渡.目标 - 切线过渡.值) > 0.001) 请求重绘();

    绘制单个复选框(开关, 切线过渡, "切线");

    // 绘制法线复选框
    const 法线过渡 = 状态.法线过渡;
    const dt法线 = Math.min(1000, now - 法线过渡.上次);
    const step法线 = Math.min(1, dt法线 / 100);
    法线过渡.值 += (法线过渡.目标 - 法线过渡.值) * step法线;
    法线过渡.上次 = now;
    if (Math.abs(法线过渡.目标 - 法线过渡.值) > 0.001) 请求重绘();

    绘制单个复选框(法线, 法线过渡, "法线");

    // 绘制箭头复选框
    const 箭头过渡 = 状态.箭头过渡;
    const dt箭头 = Math.min(1000, now - 箭头过渡.上次);
    const step箭头 = Math.min(1, dt箭头 / 100);
    箭头过渡.值 += (箭头过渡.目标 - 箭头过渡.值) * step箭头;
    箭头过渡.上次 = now;
    if (Math.abs(箭头过渡.目标 - 箭头过渡.值) > 0.001) 请求重绘();

    绘制单个复选框(箭头, 箭头过渡, "箭头");

    // 绘制小球复选框
    const 小球过渡 = 状态.小球过渡;
    const dt小球 = Math.min(1000, now - 小球过渡.上次);
    const step小球 = Math.min(1, dt小球 / 100);
    小球过渡.值 += (小球过渡.目标 - 小球过渡.值) * step小球;
    小球过渡.上次 = now;
    if (Math.abs(小球过渡.目标 - 小球过渡.值) > 0.001) 请求重绘();

    绘制单个复选框(小球, 小球过渡, "小球");

    // 绘制控制点坐标复选框
    const 控制点坐标过渡 = 状态.控制点坐标过渡;
    const dt控制点坐标 = Math.min(1000, now - 控制点坐标过渡.上次);
    const step控制点坐标 = Math.min(1, dt控制点坐标 / 100);
    控制点坐标过渡.值 += (控制点坐标过渡.目标 - 控制点坐标过渡.值) * step控制点坐标;
    控制点坐标过渡.上次 = now;
    if (Math.abs(控制点坐标过渡.目标 - 控制点坐标过渡.值) > 0.001) 请求重绘();

    绘制单个复选框(控制点坐标, 控制点坐标过渡, "控制点坐标");

    // 绘制t坐标复选框
    const t坐标过渡 = 状态.t坐标过渡;
    const dtt坐标 = Math.min(1000, now - t坐标过渡.上次);
    const stept坐标 = Math.min(1, dtt坐标 / 100);
    t坐标过渡.值 += (t坐标过渡.目标 - t坐标过渡.值) * stept坐标;
    t坐标过渡.上次 = now;
    if (Math.abs(t坐标过渡.目标 - t坐标过渡.值) > 0.001) 请求重绘();

    绘制t坐标复选框(t坐标, t坐标过渡);

    // 计算过程复选框
    const 过程过渡 = 状态.过程过渡;
    const dt过程 = Math.min(1000, now - 过程过渡.上次);
    const step过程 = Math.min(1, dt过程 / 100);
    过程过渡.值 += (过程过渡.目标 - 过程过渡.值) * step过程;
    过程过渡.上次 = now;
    const 过程动画中 = Math.abs(过程过渡.目标 - 过程过渡.值) > 0.001;
    if (过程动画中) 请求重绘();

    绘制单个复选框(过程, 过程过渡, "计算过程");

    上下文.restore();
  }

  function 绘制单个复选框(布局, 过渡, 标签文本) {
    const 关轨道 = "rgba(55,65,81,0.9)";
    const 开轨渐变 = 上下文.createLinearGradient(布局.x, 布局.y, 布局.x + 布局.w, 布局.y);
    开轨渐变.addColorStop(0, "#22acc1ff");
    开轨渐变.addColorStop(1, "#149268ff");
    const 轨阴影 = "rgba(15,23,42,0.45)";
    绘制圆角矩形(布局.x, 布局.y, 布局.w, 布局.h, 布局.h / 2, () => {
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
    const 旋钮半径 = (布局.h - 开关内边距 * 2) / 2;
    const 旋钮中心x = 布局.x + 开关内边距 + 旋钮半径 + (布局.w - 开关内边距 * 2 - 旋钮半径 * 2) * 过渡.值;
    const 旋钮中心y = 布局.y + 布局.h / 2;
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

    上下文.fillStyle = 混合色("#9ca3af", "#0f172a", 过渡.值);
    上下文.beginPath();
    上下文.arc(旋钮中心x, 旋钮中心y, 3, 0, Math.PI * 2);
    上下文.fill();

    上下文.fillStyle = "#e2e8f0";
    上下文.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    上下文.textAlign = "left";
    上下文.textBaseline = "middle";
    上下文.fillText(标签文本, 布局.x + 布局.w + 10, 布局.y + 布局.h / 2);
  }

  function 绘制t坐标复选框(布局, 过渡) {
    const 关轨道 = "rgba(55,65,81,0.9)";
    const 开轨渐变 = 上下文.createLinearGradient(布局.x, 布局.y, 布局.x + 布局.w, 布局.y);
    开轨渐变.addColorStop(0, "#22acc1ff");
    开轨渐变.addColorStop(1, "#149268ff");
    const 轨阴影 = "rgba(15,23,42,0.45)";
    绘制圆角矩形(布局.x, 布局.y, 布局.w, 布局.h, 布局.h / 2, () => {
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
    const 旋钮半径 = (布局.h - 开关内边距 * 2) / 2;
    const 旋钮中心x = 布局.x + 开关内边距 + 旋钮半径 + (布局.w - 开关内边距 * 2 - 旋钮半径 * 2) * 过渡.值;
    const 旋钮中心y = 布局.y + 布局.h / 2;
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

    上下文.fillStyle = 混合色("#9ca3af", "#0f172a", 过渡.值);
    上下文.beginPath();
    上下文.arc(旋钮中心x, 旋钮中心y, 3, 0, Math.PI * 2);
    上下文.fill();

    // 绘制"t坐标"标签，其中"t"和"坐标"用不同颜色，"t"有2的右边距
    上下文.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    上下文.textAlign = "left";
    上下文.textBaseline = "middle";
    const 标签x = 布局.x + 布局.w + 10;
    const 标签y = 布局.y + 布局.h / 2;

    // 绘制"t"（使用标签颜色）
    上下文.fillStyle = "#60a5fa";
    上下文.fillText("t", 标签x, 标签y);

    // 绘制"坐标"（使用默认颜色）
    const t宽 = 上下文.measureText("t").width;
    上下文.fillStyle = "#e2e8f0";
    上下文.fillText("坐标", 标签x + t宽 + 2, 标签y);
  }

  function 绘制带括号标题(标题文本, 括号内容, 右对齐x, y) {
    // 绘制"标题文本(括号内容)"，其中"标题文本"、"()"、"括号内容"分别用不同颜色
    // "("左边是4的边距，右边是1的边距，")"左边是1的边距，右边是0的边距
    // 右对齐x是标题右边缘的位置（冒号的位置）

    // 计算标题的总宽度
    const 标题宽 = 上下文.measureText(标题文本).width;
    const 左括号宽 = 上下文.measureText("(").width;
    const 括号内容宽 = 上下文.measureText(括号内容).width;
    const 右括号宽 = 上下文.measureText(")").width;
    const 总宽 = 标题宽 + 4 + 左括号宽 + 1 + 括号内容宽 + 1 + 右括号宽;

    // 从右对齐位置向左偏移，实现右对齐
    let 当前x = 右对齐x - 总宽;

    // 绘制标题文本
    上下文.fillStyle = 过程颜色.标题;
    上下文.fillText(标题文本, 当前x, y);
    当前x += 上下文.measureText(标题文本).width;

    // 绘制"("（左边4px边距，右边1px边距）
    当前x += 4;
    上下文.fillStyle = 过程颜色.括号;
    上下文.fillText("(", 当前x, y);
    当前x += 上下文.measureText("(").width + 1;

    // 绘制括号内容（使用点数字颜色）
    上下文.fillStyle = 过程颜色.点数字;
    上下文.fillText(括号内容, 当前x, y);
    当前x += 上下文.measureText(括号内容).width;

    // 绘制")"（左边1px边距，右边0px边距）
    当前x += 1;
    上下文.fillStyle = 过程颜色.括号;
    上下文.fillText(")", 当前x, y);

    return 右对齐x; // 返回右对齐位置（冒号位置）
  }

  function 格式化数值(值, 小数位数 = 2) {
    return 值.toFixed(小数位数).replace(/\.?0+$/, "");
  }

  function 绘制计算过程() {
    if (!状态.显示计算过程) return;
    const { 滑块 } = 状态.控件布局;
    const [p0, p1, p2, p3] = 状态.点集;
    const t = 状态.参数t;

    // 计算实际值
    const mt = 1 - t;
    const mt平方 = mt * mt;
    const t平方 = t * t;

    // 计算t坐标（曲线上的点坐标）
    const 曲线点 = 计算贝塞尔点(t, p0, p1, p2, p3);

    // 计算切向量
    const 切向量 = 计算贝塞尔切线(t, p0, p1, p2, p3);
    const 切线长 = Math.hypot(切向量.x, 切向量.y) || 1;
    const 切线单位x = 切向量.x / 切线长;
    const 切线单位y = 切向量.y / 切线长;

    // 计算归一化值
    const 归一化x = 切线单位x;
    const 归一化y = 切线单位y;

    // 计算法线单位向量
    const 法线单位x = -切线单位y;
    const 法线单位y = 切线单位x;

    // 计算切线弧度
    const 切线弧度 = Math.atan2(切线单位y, 切线单位x);

    // 计算法线弧度
    const 法线弧度 = Math.atan2(法线单位y, 法线单位x);

    上下文.save();
    上下文.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    上下文.textAlign = "left";
    上下文.textBaseline = "top";

    const 行间距 = 6;
    const 行高 = 18;

    // 构建行数据
    const 行数据 = [];

    // 切向量(dx) - 第一行
    const dx项1 = 3 * mt平方 * (p1.x - p0.x);
    const dx项2 = 6 * mt * t * (p2.x - p1.x);
    const dx项3 = 3 * t平方 * (p3.x - p2.x);
    const dx结果 = dx项1 + dx项2 + dx项3;

    行数据.push({
      标题类型: "普通",
      标题文本: "切向量",
      正文: [
        { text: ":", arithmeticTitle: "dx" },
        { text: " = " },
        { text: 格式化数值(3) },
        { text: "×(" },
        { text: 格式化数值(1) },
        { text: "-" },
        { text: 格式化数值(t) },
        { text: ")" },
        { text: "2", superscript: true, colorType: "上标数字" },
        { text: "×(" },
        { text: 格式化数值(p1.x) },
        { text: "-" },
        { text: 格式化数值(p0.x) },
        { text: ")+" },
        { text: 格式化数值(6) },
        { text: "×(" },
        { text: 格式化数值(1) },
        { text: "-" },
        { text: 格式化数值(t) },
        { text: ")×" },
        { text: 格式化数值(t) },
        { text: "×(" },
        { text: 格式化数值(p2.x) },
        { text: "-" },
        { text: 格式化数值(p1.x) },
        { text: ")+" },
        { text: 格式化数值(3) },
        { text: "×" },
        { text: 格式化数值(t) },
        { text: "2", superscript: true, colorType: "上标数字" },
        { text: "×(" },
        { text: 格式化数值(p3.x) },
        { text: "-" },
        { text: 格式化数值(p2.x) },
        { text: ") = " },
        { text: 格式化数值(dx结果) },
      ],
    });

    // 切向量(dy) - 第二行
    const dy项1 = 3 * mt平方 * (p1.y - p0.y);
    const dy项2 = 6 * mt * t * (p2.y - p1.y);
    const dy项3 = 3 * t平方 * (p3.y - p2.y);
    const dy结果 = dy项1 + dy项2 + dy项3;

    行数据.push({
      标题类型: "普通",
      标题文本: "切向量",
      正文: [
        { text: ":", arithmeticTitle: "dy" },
        { text: " = " },
        { text: 格式化数值(3) },
        { text: "×(" },
        { text: 格式化数值(1) },
        { text: "-" },
        { text: 格式化数值(t) },
        { text: ")" },
        { text: "2", superscript: true, colorType: "上标数字" },
        { text: "×(" },
        { text: 格式化数值(p1.y) },
        { text: "-" },
        { text: 格式化数值(p0.y) },
        { text: ")+" },
        { text: 格式化数值(6) },
        { text: "×(" },
        { text: 格式化数值(1) },
        { text: "-" },
        { text: 格式化数值(t) },
        { text: ")×" },
        { text: 格式化数值(t) },
        { text: "×(" },
        { text: 格式化数值(p2.y) },
        { text: "-" },
        { text: 格式化数值(p1.y) },
        { text: ")+" },
        { text: 格式化数值(3) },
        { text: "×" },
        { text: 格式化数值(t) },
        { text: "2", superscript: true, colorType: "上标数字" },
        { text: "×(" },
        { text: 格式化数值(p3.y) },
        { text: "-" },
        { text: 格式化数值(p2.y) },
        { text: ") = " },
        { text: 格式化数值(dy结果) },
      ],
    });

    // 切向量长度 - 第三行
    行数据.push({
      标题类型: "普通",
      标题文本: "切向量长度",
      正文: [
        { text: ":", arithmeticTitle: "|d|" },
        { text: " = " },
        { text: "√", colorType: "函数" },
        { text: "(" },
        { text: "d" },
        { text: "x", colorType: "点数字" },
        { text: "2", superscript: true, colorType: "上标数字" },
        { text: "+d" },
        { text: "y", colorType: "点数字" },
        { text: "2", superscript: true, colorType: "上标数字" },
        { text: ") = " },
        { text: "√", colorType: "函数" },
        { text: "(" },
        { text: 格式化数值(切向量.x) },
        { text: "2", superscript: true, colorType: "上标数字" },
        { text: "+" },
        { text: 格式化数值(切向量.y) },
        { text: "2", superscript: true, colorType: "上标数字" },
        { text: ") = " },
        { text: "√", colorType: "函数" },
        { text: "(" },
        { text: 格式化数值(切向量.x * 切向量.x + 切向量.y * 切向量.y) },
        { text: ") = " },
        { text: 格式化数值(切线长) },
      ],
    });

    // 归一化(u.x) - 第四行
    行数据.push({
      标题类型: "普通",
      标题文本: "归一化",
      正文: [
        { text: ":", arithmeticTitle: "u.x" },
        { text: " = d" },
        { text: "x", colorType: "点数字" },
        { text: "/|d| = " },
        { text: 格式化数值(切向量.x) },
        { text: "/" },
        { text: 格式化数值(切线长) },
        { text: " = " },
        { text: 格式化数值(归一化x) },
      ],
    });

    // 归一化(u.y) - 第五行
    行数据.push({
      标题类型: "普通",
      标题文本: "归一化",
      正文: [
        { text: ":", arithmeticTitle: "u.y" },
        { text: " = d" },
        { text: "y", colorType: "点数字" },
        { text: "/|d| = " },
        { text: 格式化数值(切向量.y) },
        { text: "/" },
        { text: 格式化数值(切线长) },
        { text: " = " },
        { text: 格式化数值(归一化y) },
      ],
    });

    // 切线弧度 - 第六行
    行数据.push({
      标题类型: "普通",
      标题文本: "切线弧度",
      正文: [
        { text: ":", arithmeticTitle: "θ" },
        { text: " = " },
        { text: "atan2", colorType: "函数" },
        { text: "(" },
        { text: 格式化数值(归一化y) },
        { text: ", " },
        { text: 格式化数值(归一化x) },
        { text: ") = " },
        { text: 格式化数值(切线弧度) },
      ],
    });

    // 法线弧度 - 第七行
    行数据.push({
      标题类型: "普通",
      标题文本: "法线弧度",
      正文: [
        { text: ":", arithmeticTitle: "θ" },
        { text: " = " },
        { text: "atan2", colorType: "函数" },
        { text: "(" },
        { text: 格式化数值(法线单位y) },
        { text: ", " },
        { text: 格式化数值(法线单位x) },
        { text: ") = " },
        { text: 格式化数值(法线弧度) },
      ],
    });

    // 固定宽度
    const 固定宽度 = 990;
    const 标题间距 = 4;
    const 内边距 = 14;
    
    // 计算"切向量长度"文本的宽度作为标题区域宽度
    const 标题区域宽度 = 上下文.measureText("切向量长度").width;
    
    const 框宽 = 固定宽度;
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
    // 标题区域右边界（所有标题都在此宽度内右对齐）
    const 标题右边界x = 文本x + 标题区域宽度;

    行数据.forEach((行, idx) => {
      const yPos = 文本y + idx * (行高 + 行间距) + 4;
      let 标题结束x;

      if (行.标题类型 === "带括号") {
        // 标题右对齐
        const 标题宽 = 上下文.measureText(行.标题文本).width;
        const 左括号宽 = 上下文.measureText("(").width;
        const 括号内容宽 = 上下文.measureText(行.括号内容).width;
        const 右括号宽 = 上下文.measureText(")").width;
        const 总宽 = 标题宽 + 4 + 左括号宽 + 1 + 括号内容宽 + 1 + 右括号宽;
        
        // 从右边界向左绘制
        let 当前x = 标题右边界x - 总宽;
        
        // 绘制标题文本
        上下文.fillStyle = 过程颜色.标题;
        上下文.fillText(行.标题文本, 当前x, yPos);
        当前x += 标题宽;
        
        // 绘制"("（左边4px边距，右边1px边距）
        当前x += 4;
        上下文.fillStyle = 过程颜色.括号;
        上下文.fillText("(", 当前x, yPos);
        当前x += 左括号宽 + 1;
        
        // 绘制括号内容（使用点数字颜色）
        上下文.fillStyle = 过程颜色.点数字;
        上下文.fillText(行.括号内容, 当前x, yPos);
        当前x += 括号内容宽;
        
        // 绘制")"（左边1px边距，右边0px边距）
        当前x += 1;
        上下文.fillStyle = 过程颜色.括号;
        上下文.fillText(")", 当前x, yPos);
        
        标题结束x = 标题右边界x;
      } else {
        // 标题右对齐
        const 标题宽 = 上下文.measureText(行.标题文本).width;
        const 标题起始x = 标题右边界x - 标题宽;
        上下文.fillStyle = 过程颜色.标题;
        上下文.fillText(行.标题文本, 标题起始x, yPos);
        标题结束x = 标题右边界x;
      }

      // 正文从标题区域结束后开始，左对齐
      // 检查第一个token是否有arithmeticTitle属性
      let 正文起始x = 标题结束x + 标题间距;
      if (行.正文.length > 0 && 行.正文[0].arithmeticTitle !== undefined) {
        // 第一个token是冒号，包含arithmeticTitle属性
        const 冒号token = 行.正文[0];
        
        // 测量"u.x"的宽度作为标准宽度
        const 标准宽度 = 上下文.measureText("u.x").width;
        
        // 绘制冒号
        上下文.fillStyle = 过程颜色.冒号;
        上下文.fillText(冒号token.text, 正文起始x, yPos);
        const 冒号后x = 正文起始x + 上下文.measureText(冒号token.text).width;
        const 算术标题区域起始x = 冒号后x + 6; // 冒号与算术标题之间6的间距
        
        // 绘制算术标题（右对齐在固定宽度内）
        const 算术标题文本 = 冒号token.arithmeticTitle;
        const 算术标题宽度 = 上下文.measureText(算术标题文本).width;
        const 算术标题起始x = 算术标题区域起始x + 标准宽度 - 算术标题宽度; // 右对齐
        
        // 绘制算术标题，逐个字符绘制以正确处理颜色和间距
        let 当前x = 算术标题起始x;
        for (let i = 0; i < 算术标题文本.length; i++) {
          const ch = 算术标题文本[i];
          
          // 在"dx"或"dy"中，"d"和"x"/"y"之间添加1的间距
          if ((算术标题文本 === "dx" || 算术标题文本 === "dy") && i > 0 && 算术标题文本[i - 1] === "d" && (ch === "x" || ch === "y")) {
            当前x += 1; // "d"和"x"/"y"之间1的间距
          }
          
          // 确定字符颜色
          if (ch === ".") {
            上下文.fillStyle = "gray";
          } else if (算术标题文本 === "dx" || 算术标题文本 === "dy") {
            // "dx"或"dy"中的"x"或"y"使用点数字颜色
            if (ch === "x" || ch === "y") {
              上下文.fillStyle = 过程颜色.点数字;
            } else {
              上下文.fillStyle = 过程颜色.文本;
            }
          } else if (算术标题文本 === "u.x" || 算术标题文本 === "u.y") {
            // "u.x"或"u.y"中的"x"或"y"使用点数字颜色
            if (ch === "x" || ch === "y") {
              上下文.fillStyle = 过程颜色.点数字;
            } else {
              上下文.fillStyle = 过程颜色.文本;
            }
          } else if (算术标题文本 === "|d|") {
            // "|d|"中的"|"使用绝对值线颜色，"d"使用文本颜色
            if (ch === "|") {
              上下文.fillStyle = 过程颜色.绝对值线;
            } else {
              上下文.fillStyle = 过程颜色.文本;
            }
          } else {
            // 默认使用文本颜色
            上下文.fillStyle = 过程颜色.文本;
          }
          
          上下文.fillText(ch, 当前x, yPos);
          当前x += 上下文.measureText(ch).width;
        }
        
        // 更新正文起始位置（跳过冒号、间距和算术标题区域）
        正文起始x = 算术标题区域起始x + 标准宽度;
        
        // 绘制剩余正文（从第二个token开始）
        if (行.正文.length > 1) {
          绘制彩色文本(上下文, 行.正文.slice(1), 正文起始x, yPos);
        }
      } else {
        // 没有算术标题，正常绘制
        绘制彩色文本(上下文, 行.正文, 正文起始x, yPos);
      }
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

  function 绘制t坐标(x, y, 法线单位x, 法线单位y) {
    // 偏移距离，避免覆盖曲线
    const 偏移距离 = 25;
    const 偏移x = 法线单位x * 偏移距离;
    const 偏移y = 法线单位y * 偏移距离;
    const 文本x = x + 偏移x;
    const 文本y = y + 偏移y;

    上下文.save();
    上下文.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    上下文.textAlign = "left";
    上下文.textBaseline = "top";

    // 定义颜色
    const 标签颜色 = "#60a5fa"; // x或y的颜色
    const 冒号颜色 = "#9ca3af"; // 冒号的颜色
    const 数字颜色 = "#ea8a24"; // 数字的颜色

    // 格式化坐标值（保留整数）
    const x值 = Math.round(x);
    const y值 = Math.round(y);
    const x值文本 = x值.toString();
    const y值文本 = y值.toString();

    // 测量文本宽度
    const x标签宽 = 上下文.measureText("x").width;
    const y标签宽 = 上下文.measureText("y").width;
    const 冒号宽 = 上下文.measureText(":").width;
    const x数字宽 = 上下文.measureText(x值文本).width;
    const y数字宽 = 上下文.measureText(y值文本).width;

    // 计算最大宽度（用于对齐）
    const 最大标签宽 = Math.max(x标签宽, y标签宽);
    const 最大数字宽 = Math.max(x数字宽, y数字宽);
    const 行高 = 18;

    // 绘制x行
    let 当前x = 文本x;
    上下文.fillStyle = 标签颜色;
    上下文.fillText("x", 当前x, 文本y);
    当前x += 最大标签宽 + 2; // 冒号左边2的边距
    上下文.fillStyle = 冒号颜色;
    上下文.fillText(":", 当前x, 文本y);
    当前x += 冒号宽 + 4; // 冒号右边4的边距
    上下文.fillStyle = 数字颜色;
    上下文.fillText(x值文本, 当前x, 文本y);

    // 绘制y行
    当前x = 文本x;
    上下文.fillStyle = 标签颜色;
    上下文.fillText("y", 当前x, 文本y + 行高);
    当前x += 最大标签宽 + 2; // 冒号左边2的边距
    上下文.fillStyle = 冒号颜色;
    上下文.fillText(":", 当前x, 文本y + 行高);
    当前x += 冒号宽 + 4; // 冒号右边4的边距
    上下文.fillStyle = 数字颜色;
    上下文.fillText(y值文本, 当前x, 文本y + 行高);

    上下文.restore();
  }

  function 绘制小球(曲线点, 法线单位x, 法线单位y, t) {
    if (!状态.小球图像 || !状态.小球图像.complete) return;

    const 绘制尺寸 = 48;

    // 计算小球位置：根据法线方向，反方向移动绘制尺寸的一半
    const 偏移x = -法线单位x * (绘制尺寸 / 2);
    const 偏移y = -法线单位y * (绘制尺寸 / 2);
    const 小球x = 曲线点.x + 偏移x;
    const 小球y = 曲线点.y + 偏移y;

    // 计算旋转角度：根据移动距离计算滚动角度
    if (状态.上次曲线点 !== null) {
      // 计算移动距离
      const dx = 曲线点.x - 状态.上次曲线点.x;
      const dy = 曲线点.y - 状态.上次曲线点.y;
      const 移动距离 = Math.sqrt(dx * dx + dy * dy);

      // 计算滚动角度：移动距离 / 小球周长 * 360度
      // 小球周长 = 绘制尺寸 * π
      const 小球周长 = 绘制尺寸 * Math.PI;
      let 滚动角度 = (移动距离 / 小球周长) * (Math.PI * 2); // 转换为弧度

      // 判断移动方向：通过计算当前t值与上一次t值的差值
      // 如果t值变小，说明是反向移动，滚动角度应该为负（逆时针）
      if (状态.上次t值 !== null && t < 状态.上次t值) {
        滚动角度 = -滚动角度; // 反向移动时逆时针滚动
      }

      // 累积旋转角度
      状态.小球旋转角度 += 滚动角度;
    }

    // 更新上一次曲线点位置和t值
    状态.上次曲线点 = { x: 曲线点.x, y: 曲线点.y };
    状态.上次t值 = t;

    上下文.save();
    上下文.translate(小球x, 小球y);
    上下文.rotate(状态.小球旋转角度);
    上下文.drawImage(状态.小球图像, -绘制尺寸 / 2, -绘制尺寸 / 2, 绘制尺寸, 绘制尺寸);
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
      y: 状态.高度 - 控件条配置.高度,
      w: Math.max(240, 栏宽),
      h: 控件条配置.高度,
    };

    // 右下角复选框区域
    const 开关宽 = 50;
    const 开关高 = 24;
    const 行间距 = 12;
    const 内边距 = 20;
    const 复选框区宽度 = Math.min(250, 状态.宽度 / 6);
    const 复选框行数 = 7;
    const 复选框内容高度 = 开关高 * 复选框行数 + 行间距 * (复选框行数 - 1);
    const 复选框区高度 = 复选框内容高度 + 内边距 * 2;
    const 复选框区右 = 状态.宽度 - 控件条配置.边距;
    const 复选框区下 = 状态.高度 - 控件条配置.边距;
    const 复选框区顶 = 复选框区下 - 复选框区高度;
    const 复选框区左 = 复选框区右 - 复选框区宽度;

    // 计算标签宽度（使用临时canvas测量）
    const 临时canvas = document.createElement("canvas");
    const 临时ctx = 临时canvas.getContext("2d");
    临时ctx.font = "14px 'Google Sans Code', Consolas, Noto Sans SC, 微软雅黑, sans-serif";
    const 切线标签宽 = 临时ctx.measureText("切线").width;
    const 法线标签宽 = 临时ctx.measureText("法线").width;
    const 箭头标签宽 = 临时ctx.measureText("箭头").width;
    const 小球标签宽 = 临时ctx.measureText("小球").width;
    const 控制点坐标标签宽 = 临时ctx.measureText("控制点坐标").width;
    const t坐标标签宽 = 临时ctx.measureText("t").width + 2 + 临时ctx.measureText("坐标").width; // t + 2边距 + 坐标
    const 过程标签宽 = 临时ctx.measureText("计算过程").width;
    const 最大标签宽 = Math.max(
      切线标签宽,
      法线标签宽,
      箭头标签宽,
      小球标签宽,
      控制点坐标标签宽,
      t坐标标签宽,
      过程标签宽
    );

    const 行起点x = 复选框区左 + 内边距;
    const 行1y = 复选框区顶 + 内边距;

    const 开关 = {
      x: 行起点x + 最大标签宽 + 10,
      y: 行1y,
      w: 开关宽,
      h: 开关高,
      标签宽: 切线标签宽,
    };

    const 法线 = {
      x: 行起点x + 最大标签宽 + 10,
      y: 行1y + 开关高 + 行间距,
      w: 开关宽,
      h: 开关高,
      标签宽: 法线标签宽,
    };

    const 箭头 = {
      x: 行起点x + 最大标签宽 + 10,
      y: 行1y + (开关高 + 行间距) * 2,
      w: 开关宽,
      h: 开关高,
      标签宽: 箭头标签宽,
    };

    const 小球 = {
      x: 行起点x + 最大标签宽 + 10,
      y: 行1y + (开关高 + 行间距) * 3,
      w: 开关宽,
      h: 开关高,
      标签宽: 小球标签宽,
    };

    const 控制点坐标 = {
      x: 行起点x + 最大标签宽 + 10,
      y: 行1y + (开关高 + 行间距) * 4,
      w: 开关宽,
      h: 开关高,
      标签宽: 控制点坐标标签宽,
    };

    const t坐标 = {
      x: 行起点x + 最大标签宽 + 10,
      y: 行1y + (开关高 + 行间距) * 5,
      w: 开关宽,
      h: 开关高,
      标签宽: t坐标标签宽,
    };

    const 过程 = {
      x: 行起点x + 最大标签宽 + 10,
      y: 行1y + (开关高 + 行间距) * 6,
      w: 开关宽,
      h: 开关高,
      标签宽: 过程标签宽,
    };

    const 滑块右界 = 复选框区左 - 16;
    const 目标滑块宽 = Math.min(Math.max(90, (栏.w - 48) * 0.3), Math.max(80, 滑块右界 - (栏.x + 24)));
    const 居中x = 栏.x + (栏.w - 目标滑块宽) / 2;
    const 最小x = 栏.x + 24;
    const 最大x = 滑块右界 - 目标滑块宽;
    const 滑块 = {
      x: Math.min(Math.max(居中x, 最小x), 最大x),
      y: 栏.y + 栏.h / 2 + 4,
      w: 目标滑块宽,
    };

    状态.控件布局 = { 栏, 滑块, 开关, 法线, 箭头, 小球, 控制点坐标, t坐标, 过程 };
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

  function 在法线区域(位置) {
    const { 法线 } = 状态.控件布局;
    const hitW = 法线.w + 10 + 法线.标签宽;
    return 位置.x >= 法线.x && 位置.x <= 法线.x + hitW && 位置.y >= 法线.y && 位置.y <= 法线.y + 法线.h;
  }

  function 在箭头区域(位置) {
    const { 箭头 } = 状态.控件布局;
    const hitW = 箭头.w + 10 + 箭头.标签宽;
    return 位置.x >= 箭头.x && 位置.x <= 箭头.x + hitW && 位置.y >= 箭头.y && 位置.y <= 箭头.y + 箭头.h;
  }

  function 在小球区域(位置) {
    const { 小球 } = 状态.控件布局;
    const hitW = 小球.w + 10 + 小球.标签宽;
    return 位置.x >= 小球.x && 位置.x <= 小球.x + hitW && 位置.y >= 小球.y && 位置.y <= 小球.y + 小球.h;
  }

  function 在控制点坐标区域(位置) {
    const { 控制点坐标 } = 状态.控件布局;
    const hitW = 控制点坐标.w + 10 + 控制点坐标.标签宽;
    return (
      位置.x >= 控制点坐标.x &&
      位置.x <= 控制点坐标.x + hitW &&
      位置.y >= 控制点坐标.y &&
      位置.y <= 控制点坐标.y + 控制点坐标.h
    );
  }

  function 在t坐标区域(位置) {
    const { t坐标 } = 状态.控件布局;
    const hitW = t坐标.w + 10 + t坐标.标签宽;
    return 位置.x >= t坐标.x && 位置.x <= t坐标.x + hitW && 位置.y >= t坐标.y && 位置.y <= t坐标.y + t坐标.h;
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
    const 法线命中 = 在法线区域(位置);
    const 箭头命中 = 在箭头区域(位置);
    const 小球命中 = 在小球区域(位置);
    const 控制点坐标命中 = 在控制点坐标区域(位置);
    const t坐标命中 = 在t坐标区域(位置);
    const 过程命中 = 在过程区域(位置);

    if (
      thumbHit ||
      trackHit ||
      开关命中 ||
      法线命中 ||
      箭头命中 ||
      小球命中 ||
      控制点坐标命中 ||
      t坐标命中 ||
      过程命中
    ) {
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
    if (在法线区域(位置)) {
      状态.显示法线 = !状态.显示法线;
      状态.法线过渡.目标 = 状态.显示法线 ? 1 : 0;
      状态.法线过渡.上次 = performance.now();
      保存显示法线到本地(状态.显示法线);
      e.preventDefault();
      请求重绘();
      return;
    }
    if (在箭头区域(位置)) {
      状态.显示箭头 = !状态.显示箭头;
      状态.箭头过渡.目标 = 状态.显示箭头 ? 1 : 0;
      状态.箭头过渡.上次 = performance.now();
      保存显示箭头到本地(状态.显示箭头);
      e.preventDefault();
      请求重绘();
      return;
    }
    if (在小球区域(位置)) {
      状态.显示小球 = !状态.显示小球;
      状态.小球过渡.目标 = 状态.显示小球 ? 1 : 0;
      状态.小球过渡.上次 = performance.now();
      保存显示小球到本地(状态.显示小球);
      e.preventDefault();
      请求重绘();
      return;
    }
    if (在控制点坐标区域(位置)) {
      状态.显示控制点坐标 = !状态.显示控制点坐标;
      状态.控制点坐标过渡.目标 = 状态.显示控制点坐标 ? 1 : 0;
      状态.控制点坐标过渡.上次 = performance.now();
      保存显示控制点坐标到本地(状态.显示控制点坐标);
      e.preventDefault();
      请求重绘();
      return;
    }
    if (在t坐标区域(位置)) {
      状态.显示t坐标 = !状态.显示t坐标;
      状态.t坐标过渡.目标 = 状态.显示t坐标 ? 1 : 0;
      状态.t坐标过渡.上次 = performance.now();
      保存显示t坐标到本地(状态.显示t坐标);
      e.preventDefault();
      请求重绘();
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
      状态.显示法线 = false;
      状态.法线过渡 = { 值: 0, 目标: 0, 上次: performance.now() };
      状态.显示箭头 = true;
      状态.箭头过渡 = { 值: 1, 目标: 1, 上次: performance.now() };
      状态.显示小球 = false;
      状态.小球过渡 = { 值: 0, 目标: 0, 上次: performance.now() };
      状态.显示控制点坐标 = true;
      状态.控制点坐标过渡 = { 值: 1, 目标: 1, 上次: performance.now() };
      状态.显示t坐标 = true;
      状态.t坐标过渡 = { 值: 1, 目标: 1, 上次: performance.now() };
      状态.显示计算过程 = false;
      状态.过程过渡 = { 值: 0, 目标: 0, 上次: performance.now() };
      状态.小球旋转角度 = 0;
      状态.上次曲线点 = null;
      状态.上次t值 = null;
      保存显示切线到本地(false);
      保存显示法线到本地(false);
      保存显示箭头到本地(true);
      保存显示小球到本地(false);
      保存显示控制点坐标到本地(true);
      保存显示t坐标到本地(true);
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
  加载小球图像();
  if (滑块t) 滑块t.value = 状态.参数t.toString();
  if (t数值) t数值.textContent = 格式化t值(状态.参数t);
  更新t值(状态.参数t, false);
  切换显示切线(状态.显示切线);
  请求重绘();
})();
