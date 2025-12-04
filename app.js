const express = require("express");
const path = require("path");
const fs = require("fs").promises;

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const publicPath = path.join(__dirname, "public");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use(express.static(publicPath));

async function 读取HTML文件(文件路径) {
  try {
    const 完整路径 = path.join(publicPath, 文件路径);
    const 内容 = await fs.readFile(完整路径, "utf-8");
    return 内容;
  } catch (错误) {
    console.error(`读取文件失败: ${文件路径}`, 错误);
    return null;
  }
}

async function 处理HTML包含(html内容, 基础路径 = "") {
  const 包含脚本正则 = /<script\s+src=["']([^"']*html-include\.js)["']\s+target=["']([^"']+)["']\s+position=["']([^"']+)["']\s*><\/script>/g;
  let 处理后的内容 = html内容;
  const 所有匹配 = [];
  let 匹配;

  while ((匹配 = 包含脚本正则.exec(html内容)) !== null) {
    所有匹配.push(匹配);
  }

  for (const 匹配项 of 所有匹配) {
    const [完整匹配, 脚本路径, 目标文件, 位置] = 匹配项;
    let 目标文件路径 = 目标文件;
    
    if (目标文件.startsWith("./")) {
      目标文件路径 = path.join(基础路径, 目标文件.slice(2));
    } else if (目标文件.startsWith("/")) {
      目标文件路径 = 目标文件.slice(1);
    } else {
      目标文件路径 = path.join(基础路径, 目标文件);
    }

    目标文件路径 = 目标文件路径.replace(/\\/g, "/");
    const 包含内容 = await 读取HTML文件(目标文件路径);

    if (包含内容) {
      处理后的内容 = 处理后的内容.replace(完整匹配, 包含内容);
    } else {
      处理后的内容 = 处理后的内容.replace(完整匹配, "");
    }
  }

  return 处理后的内容;
}

app.use(async (req, res, next) => {
  if (req.path === "/" || req.path.endsWith(".html")) {
    try {
      const 文件路径 = req.path === "/" ? "index.html" : req.path;
      const 完整路径 = path.join(publicPath, 文件路径);

      try {
        await fs.access(完整路径);
      } catch {
        return next();
      }

      let html内容 = await 读取HTML文件(文件路径);
      if (!html内容) {
        return next();
      }

      const 基础路径 = path.dirname(文件路径).replace(/^\/+/, "") || "";
      html内容 = await 处理HTML包含(html内容, 基础路径);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html内容);
    } catch (错误) {
      console.error("处理 HTML 文件时出错:", 错误);
      next(错误);
    }
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - 页面未找到</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .error-container {
          text-align: center;
        }
        h1 { font-size: 72px; margin: 0; }
        p { font-size: 24px; margin: 20px 0; }
        a { color: white; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>404</h1>
        <p>页面未找到</p>
        <a href="/">返回首页</a>
      </div>
    </body>
    </html>
  `);
});

app.use((err, req, res, next) => {
  console.error("服务器错误:", err);
  res.status(500).send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>500 - 服务器错误</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }
        .error-container {
          text-align: center;
        }
        h1 { font-size: 72px; margin: 0; }
        p { font-size: 24px; margin: 20px 0; }
        a { color: white; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>500</h1>
        <p>服务器内部错误</p>
        <a href="/">返回首页</a>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📁 环境: ${NODE_ENV}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  if (NODE_ENV === "development") {
    console.log(`💡 开发模式: 文件更改将自动重载`);
  }
});
