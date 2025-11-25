import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 判断字符串是否包含中文字符或中文标点
function 包含中文(文本) {
  // 中文字符范围：\u4e00-\u9fa5
  // 中文标点符号：\u3000-\u303f（包括顿号、逗号、句号等）
  // 全角字符：\uff00-\uffef
  return /[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(文本);
}

// 判断引号内容主要是中文还是英文
function 判断引号内容类型(内容) {
  // 如果包含中文字符，认为是中文内容
  if (包含中文(内容)) {
    return "中文";
  }
  // 否则认为是英文内容
  return "英文";
}

// 处理单个文件中的引号
function 处理文件引号(文件路径) {
  let 内容 = fs.readFileSync(文件路径, "utf-8");
  let 修改标记 = false;

  // 处理英文双引号 "..." -> 根据内容决定是否改为中文引号
  // 匹配成对的英文双引号
  内容 = 内容.replace(/"([^"]*)"/g, (匹配, 引号内容) => {
    const 内容类型 = 判断引号内容类型(引号内容);
    if (内容类型 === "中文") {
      修改标记 = true;
      return `\u201C${引号内容}\u201D`; // 改为中文引号
    }
    return 匹配; // 保持英文引号
  });

  // 处理中文引号 "..." -> 根据内容决定是否改为英文引号
  // 匹配成对的中文引号（左引号 U+201C，右引号 U+201D）
  内容 = 内容.replace(/\u201C([^\u201D]*)\u201D/g, (匹配, 引号内容) => {
    const 内容类型 = 判断引号内容类型(引号内容);
    if (内容类型 === "英文") {
      修改标记 = true;
      return `"${引号内容}"`; // 改为英文引号
    }
    return 匹配; // 保持中文引号
  });

  // 处理英文单引号 '...' -> 根据内容决定是否改为中文单引号
  // 匹配成对的英文单引号
  内容 = 内容.replace(/'([^']*)'/g, (匹配, 引号内容) => {
    const 内容类型 = 判断引号内容类型(引号内容);
    if (内容类型 === "中文") {
      修改标记 = true;
      return `\u2018${引号内容}\u2019`; // 改为中文单引号（左引号 U+2018，右引号 U+2019）
    }
    return 匹配; // 保持英文单引号
  });

  // 处理中文单引号 '...' -> 根据内容决定是否改为英文单引号
  // 匹配成对的中文单引号（左引号 U+2018，右引号 U+2019）
  内容 = 内容.replace(/\u2018([^\u2019]*)\u2019/g, (匹配, 引号内容) => {
    const 内容类型 = 判断引号内容类型(引号内容);
    if (内容类型 === "英文") {
      修改标记 = true;
      return `'${引号内容}'`; // 改为英文单引号
    }
    return 匹配; // 保持中文单引号
  });

  // 处理破折号：如果纯英文文章包含"—"，则替换为" - "
  if (!包含中文(内容) && 内容.includes("\u2014")) {
    内容 = 内容.replace(/\u2014/g, " - ");
    修改标记 = true;
  }

  // 处理破折号：如果包含中文的文章包含"—"，则替换为"——"
  // 单个"—"或3个及以上的"—"全部替换为"——"，2个"—"保持不变
  if (包含中文(内容) && 内容.includes("\u2014")) {
    const 原始内容 = 内容;
    // 先替换3个及以上的连续"—"为"——"
    内容 = 内容.replace(/\u2014{3,}/g, "\u2014\u2014");
    // 再替换单个"—"为"——"（使用负向前后查找确保是单个）
    内容 = 内容.replace(/(?<!\u2014)\u2014(?!\u2014)/g, "\u2014\u2014");
    // 检查是否有修改
    if (内容 !== 原始内容) {
      修改标记 = true;
    }
  }

  if (修改标记) {
    fs.writeFileSync(文件路径, 内容, "utf-8");
    return true;
  }
  return false;
}

// 递归扫描文件夹中的所有 .txt 文件
function 扫描文本文件(文件夹路径) {
  const 文件列表 = [];

  function 递归扫描(当前路径) {
    const 条目列表 = fs.readdirSync(当前路径);

    for (const 条目 of 条目列表) {
      const 完整路径 = path.join(当前路径, 条目);
      const 状态 = fs.statSync(完整路径);

      if (状态.isDirectory()) {
        递归扫描(完整路径);
      } else if (状态.isFile() && 条目.endsWith(".txt")) {
        文件列表.push(完整路径);
      }
    }
  }

  递归扫描(文件夹路径);
  return 文件列表;
}

// 主函数
function 主函数() {
  const 文本文件夹 = path.join(__dirname, "Texts");
  const 文件列表 = 扫描文本文件(文本文件夹);

  console.log(`找到 ${文件列表.length} 个 .txt 文件`);

  let 修改计数 = 0;

  for (const 文件路径 of 文件列表) {
    try {
      const 已修改 = 处理文件引号(文件路径);
      if (已修改) {
        修改计数++;
        const 相对路径 = path.relative(文本文件夹, 文件路径);
        console.log(`✓ 已修改: ${相对路径}`);
      }
    } catch (错误) {
      const 相对路径 = path.relative(文本文件夹, 文件路径);
      console.error(`✗ 处理失败: ${相对路径}`, 错误.message);
    }
  }

  console.log(`\n处理完成！共修改了 ${修改计数} 个文件。`);
}

主函数();
