const fs = require('fs');
const path = require('path');

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
      
      文件夹结构[item.name] = txtFiles;
    }
  }
  
  // 生成 JSON 文件
  const jsonPath = path.join(textsDir, 'file-list.json');
  fs.writeFileSync(jsonPath, JSON.stringify(文件夹结构, null, 2) + '\n', 'utf8');
  
  console.log('✅ 扫描完成！文件列表：\n');
  let 总文件数 = 0;
  for (const [文件夹名, 文件列表] of Object.entries(文件夹结构)) {
    const 文件数量 = 文件列表.length;
    总文件数 += 文件数量;
    if (文件数量 > 0) {
      console.log(`📁 ${文件夹名} (${文件数量} 个文件):`);
      文件列表.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });
    } else {
      console.log(`📁 ${文件夹名} (空文件夹，已跳过)`);
    }
    console.log('');
  }
  console.log(`📝 总计: ${总文件数} 个文本文件`);
  console.log(`\n💾 文件列表已保存到: ${jsonPath}`);
}

// 执行扫描
扫描文本文件();

