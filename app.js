const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const publicPath = path.join(__dirname, "public");

app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));
app.use(express.static(publicPath));

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
