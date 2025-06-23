## 🎯 功能模块

### 📝 经验之谈 (`/public/Blogs/`)

**路径**: `/public/Blogs/`  
**类型**: 重博客系统  
**特色**: 原创技术文章，高度定制的转载内容

- **内容丰富**: 涵盖编程开发、数据库、Linux、Git等多个技术领域
- **图文并茂**: 配有大量图片和动图，提供直观的效果展示
- **代码实例**: 每个知识点都配有完整的代码示例
- **分类清晰**: 按技术栈分类，便于查找和学习
- **交互友好**: 支持收藏、搜索、目录导航等功能

### 📚 知识库 (`/public/Markdown-Notes/`)

**路径**: `/public/Markdown-Notes/`  
**类型**: 轻博客系统  
**特色**: Markdown格式，专为学生合作打造

- **简洁易读**: 采用Markdown格式，界面简洁清爽
- **快速访问**: 支持URL参数直接定位到特定技术栈和笔记
- **实时预览**: 支持Markdown实时渲染
- **代码高亮**: 集成语法高亮功能
- **分享友好**: 支持URL分享，自动高亮对应目录

### 🎮 交互式学习中心 (`/public/Interactive-Hub/`)

**路径**: `/public/Interactive-Hub/`  
**类型**: 可视化学习平台  
**特色**: 将抽象概念转化为可交互的视觉体验

- **实时交互**: 通过鼠标点击即可实时观察代码效果
- **多领域覆盖**: 涵盖CSS、JavaScript、数据结构、算法等
- **统一界面**: 所有模块采用统一的交互界面设计
- **学习路径**: 从基础到进阶的完整学习路径
- **实践导向**: 强调动手实践，加深理解

**包含模块**:
- CSS属性可视化（Box-Model、Flex、Grid、Transform等）
- JavaScript数据结构（Array、Stack、Queue、LinkedList等）
- 算法可视化（Bubble-Sort、Selection-Sort、Insert-Sort等）
- 前端技术（CSS-Selector、Animation、Filter等）

### 🎯 休闲游戏 (`/public/Games/`)

**路径**: `/public/Games/`  
**类型**: 轻量级游戏集合  
**特色**: 自娱自乐，自产自销

- **经典游戏**: 俄罗斯方块、贪吃蛇、打砖块等经典游戏
- **益智游戏**: 汉诺塔、找炸弹、猜人物等益智类游戏
- **休闲娱乐**: 石头剪刀布、投掷石头等简单休闲游戏
- **学习结合**: 部分游戏融入编程概念，寓教于乐
- **响应式设计**: 适配不同设备，提供良好的游戏体验

### 🔬 Web应用实验室 (`/public/Apps/`)

**路径**: `/public/Apps/`  
**类型**: 创意应用展示平台  
**特色**: 将各种稀奇古怪的想法付诸实践

- **密码生成器**: 安全可靠的密码生成工具
- **随机选择器**: 帮助做出随机决策的工具
- **快捷键测试器**: 测试键盘快捷键熟练度
- **十指练习**: 提高打字速度和准确率
- **快乐大转盘**: 有趣的随机选择工具
- **班级通知**: 实用的班级管理工具

### 💾 软件下载 (`/public/Software/`)

**路径**: `/public/Software/`  
**类型**: 软件资源聚合平台  
**特色**: 精选优质软件，分类整理

- **开发工具**: IDE、文本编辑器、开发工具等
- **数据库软件**: MySQL、PostgreSQL、MongoDB等
- **设计软件**: 平面设计、3D建模、视频后期等
- **操作系统**: 各种Linux发行版、虚拟机等
- **实用工具**: 包管理器、版本控制工具等

## 📄 信息页面

### 👥 贡献者 (`/public/Introduction/contributors.html`)

**路径**: `/public/Introduction/contributors.html`  
**内容**: 项目贡献者介绍

- **团队成员**: 展示所有参与项目开发的贡献者
- **个人介绍**: 每位贡献者的详细信息和贡献内容
- **技能展示**: 团队成员的技术栈和专长领域
- **联系方式**: 提供与贡献者交流的渠道

### 🎯 网站宗旨 (`/public/Introduction/purpose.html`)

**路径**: `/public/Introduction/purpose.html`  
**内容**: 项目理念和目标说明

- **项目定位**: 探索/试验性质的自学服务中心
- **开发初衷**: 降低优质资源搜索难度，节省宝贵时间
- **目标用户**: 学生、初学者、寻找优质教程资源的入门开发者
- **维护团队**: 职业学校教师主导，多位朋友/同事参与贡献
- **反馈渠道**: GitHub Discussions、邮件等多种反馈方式



## 🚀 快速开始

### 环境要求

- Node.js >= 18.16.1
- npm >= 9.0.0

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/suyangzuo/suyangzuo.github.io.git
   cd suyangzuo.github.io
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run live
   ```

4. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 生产部署

项目支持多种部署方式：

- **Vercel**: 自动部署，支持GitHub集成
- **Render**: 云平台部署，支持自动构建
- **腾讯云**: 传统服务器部署

## 👨‍💻 开发指南

### 开发环境配置

1. **代码格式化**
   
   项目使用Prettier进行代码格式化，配置在`package.json`中：
   ```json
   {
     "prettier": {
       "printWidth": 120
     }
   }
   ```

2. **热重载开发**
   
   使用nodemon实现开发环境热重载：
   ```bash
   npm run live
   ```

### 代码规范

- 使用中文变量名和函数名，提高代码可读性
- 遵循HTML5语义化标签规范
- CSS采用BEM命名规范
- JavaScript使用ES6+语法特性

### 文件组织

- **静态资源**: 所有静态文件放在`public`目录下
- **模块化**: 每个功能模块独立目录
- **资源分类**: 图片、脚本、样式分别存放

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式

1. **提交Issue**: 报告bug或提出新功能建议
2. **提交PR**: 修复bug或添加新功能
3. **完善文档**: 改进项目文档
4. **分享经验**: 在博客中分享技术经验

### 贡献流程

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 🎉 致谢

### 设计资源

- **永恒Logo**: 由同事"氯化银"原创设计
- **图片资源**: 大部分图片资源来自互联网，版权归原作者所有

### 技术资源

- **Font Awesome**: 提供丰富的图标资源
- **Google Fonts**: 提供优质字体服务
- **Express**: 提供强大的Web框架
- **开源社区**: 提供各种开源工具和库

## 📞 联系我们

- **GitHub**: [https://github.com/suyangzuo](https://github.com/suyangzuo)
- **网站**: [https://suyangzuo.com](https://suyangzuo.com)
- **邮箱**: 通过GitHub Issues联系

---

⭐ 如果这个项目对你有帮助，请给我们一个Star！
