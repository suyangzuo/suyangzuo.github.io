const fs = require('fs');
const path = require('path');

// 在英文中文间添加空格（与网页中的逻辑保持一致）
function 在英文中文间添加空格(文本) {
  return 文本.replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, "$1 $2").replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, "$1 $2");
}

// 计算文件的字符数量（应用与网页中相同的处理逻辑）
function 计算字符数(文件路径) {
  try {
    const 文件内容 = fs.readFileSync(文件路径, 'utf8');
    // 先去除前后空白字符，再将换行替换为空格
    const 处理后的内容 = 文件内容.trim().replace(/\n/g, " ");
    // 在英文中文间添加空格
    const 最终内容 = 在英文中文间添加空格(处理后的内容);
    return 最终内容.length;
  } catch (error) {
    console.error(`读取文件失败: ${文件路径}`, error);
    return null;
  }
}

// 扫描 Texts 目录下的所有子文件夹和 .txt 文件
function 扫描文本文件() {
  const textsDir = path.join(__dirname, 'Texts');
  const 文件夹结构 = {};
  
  // 读取 Texts 目录下的所有项目
  const items = fs.readdirSync(textsDir, { withFileTypes: true });
  
  for (const item of items) {
    // 跳过 file-list.json 文件
    if (item.isFile() && item.name === 'file-list.json') {
      continue;
    }
    
    // 如果是目录，扫描其中的 .txt 文件
    if (item.isDirectory()) {
      const 子文件夹路径 = path.join(textsDir, item.name);
      const 文件列表 = fs.readdirSync(子文件夹路径);
      
      // 过滤出 .txt 文件并按文件名排序
      const txtFiles = 文件列表
        .filter(file => file.endsWith('.txt'))
        .sort((a, b) => {
          // 提取文件名开头的数字进行排序
          const numA = parseInt(a.match(/^\d+/)?.[0] || '0');
          const numB = parseInt(b.match(/^\d+/)?.[0] || '0');
          return numA - numB;
        });
      
      // 为每个文件计算字符数
      const 文件信息列表 = txtFiles.map(文件名 => {
        const 文件路径 = path.join(子文件夹路径, 文件名);
        const 字符数 = 计算字符数(文件路径);
        return {
          文件名: 文件名,
          字符数: 字符数 !== null ? 字符数 : null
        };
      });
      
      文件夹结构[item.name] = 文件信息列表;
    }
  }
  
  // 生成 JSON 文件
  const jsonPath = path.join(textsDir, 'file-list.json');
  fs.writeFileSync(jsonPath, JSON.stringify(文件夹结构, null, 2) + '\n', 'utf8');
  let 总文件数 = 0;
  for (const [文件夹名, 文件列表] of Object.entries(文件夹结构)) {
    const 文件数量 = 文件列表.length;
    总文件数 += 文件数量;
  }
  console.log(`已生成 file-list.json，共 ${总文件数} 个文件`);
}

// 执行扫描
扫描文本文件();

