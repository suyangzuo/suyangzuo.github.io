const 候选人物 = [
  { 姓名: "刘备", 图片: "./随机选人图片/刘备.jpeg" },
  { 姓名: "钟会", 图片: "./随机选人图片/钟会.jpeg" },
  { 姓名: "曹操", 图片: "./随机选人图片/曹操.jpeg" },
  { 姓名: "于禁", 图片: "./随机选人图片/于禁.jpeg" },
  { 姓名: "杜预", 图片: "./随机选人图片/杜预.jpeg" },
  { 姓名: "司马师", 图片: "./随机选人图片/司马师.jpeg" },
  { 姓名: "朱然", 图片: "./随机选人图片/朱然.jpeg" },
  { 姓名: "李傕", 图片: "./随机选人图片/李傕.jpeg" },
  { 姓名: "黄忠", 图片: "./随机选人图片/黄忠.jpeg" },
  { 姓名: "荀彧", 图片: "./随机选人图片/荀彧.jpeg" },
  { 姓名: "诸葛瞻", 图片: "./随机选人图片/诸葛瞻.jpeg" },
  { 姓名: "陈登", 图片: "./随机选人图片/陈登.jpeg" },
  { 姓名: "毛玠", 图片: "./随机选人图片/毛玠.jpeg" },
];

       let intervalId;

        function 选人() {
            const randomIndex = Math.floor(Math.random() * 候选人物.length);
            const 选到的人 = 候选人物[randomIndex];
            document.getElementById("person-image").src = 选到的人.图片;
            document.getElementById("person-name").textContent = 选到的人.姓名;
        }

        function startRandomizing() {
            if (!intervalId) { 
                intervalId = setInterval(选人, 100);
                document.getElementById("stop-button").textContent = "停止抽人"; 
            }
        }

        function stopRandomizing() {
            clearInterval(intervalId);
            intervalId = null; 
            document.getElementById("stop-button").textContent = "开始抽人";
        }

        document.getElementById("stop-button").addEventListener("click", function() {
            if (intervalId) {
                stopRandomizing(); 
            } else {
                startRandomizing(); 
            }
        });
        
        startRandomizing();