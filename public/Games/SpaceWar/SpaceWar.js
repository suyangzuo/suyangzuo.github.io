class SpaceWar {
  constructor() {
    this.canvas = document.getElementById("画板");
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio || 1;
    this.css宽度 = this.canvas.offsetWidth;
    this.css高度 = this.canvas.offsetHeight;
    this.canvas.width = this.css宽度 * this.dpr;
    this.canvas.height = this.css高度 * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.中心点 = { x: this.canvas.offsetWidth / 2, y: this.canvas.offsetHeight / 2 };
    this.上次时间 = 0;
    this.时间差 = 0;
    this.玩家配置 = {
      机型: [
        {
          图像源: "./Images/玩家-1.png",
          移动速度: 550,
        },
        {
          图像源: "./Images/玩家-2.png",
          移动速度: 450,
        },
        {
          图像源: "./Images/玩家-3.png",
          移动速度: 650,
        },
        {
          图像源: "./Images/玩家-4.png",
          移动速度: 400,
        },
      ],
      坐标: {
        x: this.中心点.x,
        y: this.css高度 * 0.8,
      },
      尺寸: {
        宽度: this.css宽度 * 0.1,
        高度: null,
      },
      图像: new Image(),
      图像宽高比: null,
      子弹起始坐标: {
        x: 0,
        y: 0,
      },
    };
    this.子弹配置 = [
      {
        等级: 0,
        速度: [2000, 2200, 2400, 2600],
        宽度: [10, 12, 14, 16],
        高度: [20, 25, 30, 35],
      },
      {
        等级: 0,
        速度: [1200, 1400, 1600, 1800],
        宽度: [10, 15, 20, 25],
        高度: [20, 25, 30, 35],
      },
      {
        等级: 0,
        速度: [1200, 1400, 1600, 1800],
        宽度: [10, 15, 20, 25],
        高度: [20, 25, 30, 35],
      },
      {
        等级: 0,
        速度: [1200, 1400, 1600, 1800],
        宽度: [10, 15, 20, 25],
        高度: [20, 25, 30, 35],
      },
    ];
    this.当前机型索引 = 0;
    this.当前机型 = this.玩家配置.机型[0];
    this.玩家配置.子弹起始坐标.x = this.玩家配置.坐标.x;
    this.玩家配置.子弹起始坐标.y = this.玩家配置.坐标.y;
    this.玩家子弹组 = [];
    this.生成子弹等级道具延时Id = null;
    this.子弹等级道具 = {
      已生成: false,
      已进入画布: false,
      图像: new Image(),
      图像源: "./Images/子弹等级道具.png",
      尺寸: {
        宽度: 50,
        高度: 0,
      },
      坐标: {
        x: 0,
        y: 0,
      },
      速度: {
        x: 0,
        y: 0,
      },
    };
    this.阴影配置 = {
      水平偏移: 85,
      垂直偏移: 120,
      颜色: "#111",
      模糊: 25,
    };
    this.按键状态 = {
      w: false,
      s: false,
      a: false,
      d: false,
      m: false,
    };
    this.添加键盘事件();
    this.初始化ResizeObserver();
    this.玩家配置.图像.src = this.当前机型.图像源;
    this.玩家配置.图像.onload = () => {
      this.玩家配置.图像宽高比 = this.玩家配置.图像.naturalWidth / this.玩家配置.图像.naturalHeight;
      this.玩家配置.尺寸.高度 = this.玩家配置.尺寸.宽度 / this.玩家配置.图像宽高比;
      this.绘制全部();
    };
    this.子弹等级道具.图像.src = this.子弹等级道具.图像源;
    this.子弹等级道具.图像.onload = () => {
      const 子弹等级道具图像宽高比 = this.子弹等级道具.图像.naturalWidth / this.子弹等级道具.图像.naturalHeight;
      this.子弹等级道具.尺寸.高度 = this.子弹等级道具.尺寸.宽度 / 子弹等级道具图像宽高比;
    };
  }

  添加键盘事件() {
    document.addEventListener("keydown", (e) => {
      this.按键状态[e.key] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.按键状态[e.key] = false;
    });
  }

  绘制全部(当前时间) {
    this.时间差 = (当前时间 - this.上次时间) / 1000;
    this.上次时间 = 当前时间;
    this.清空画布();
    this.移动玩家();
    this.绘制玩家();
    this.刷新玩家子弹坐标(当前时间);
    this.绘制玩家子弹();
    if (!this.生成子弹等级道具延时Id) {
      const 延时时长 = Math.floor(Math.random() * 10000) + 0;
      this.生成子弹等级道具延时Id = setTimeout(() => {
        this.生成子弹等级道具();
      }, 延时时长);
    }
    this.绘制子弹等级道具();
    if (this.玩家与道具碰撞(this.子弹等级道具)) {
      if (this.子弹配置[this.当前机型索引].等级 < 3) {
        this.子弹配置[this.当前机型索引].等级++;
      }
      this.子弹等级道具.已生成 = false;
      this.子弹等级道具.已进入画布 = false;
      this.子弹等级道具.坐标.x = 0;
      this.子弹等级道具.坐标.y = -200;
      this.生成子弹等级道具延时Id = null;
    }
    requestAnimationFrame(this.绘制全部.bind(this));
  }

  移动玩家() {
    const 移动距离 = this.当前机型.移动速度 * this.时间差;
    if (this.按键状态.a && this.玩家配置.坐标.x >= this.玩家配置.尺寸.宽度 / 2) {
      this.玩家配置.坐标.x -= 移动距离;
    }
    if (this.按键状态.d && this.玩家配置.坐标.x <= this.canvas.offsetWidth - this.玩家配置.尺寸.宽度 / 2) {
      this.玩家配置.坐标.x += 移动距离;
    }
    if (this.按键状态.w && this.玩家配置.坐标.y >= 0) {
      this.玩家配置.坐标.y -= 移动距离;
    }
    if (this.按键状态.s && this.玩家配置.坐标.y <= this.canvas.offsetHeight - this.玩家配置.尺寸.高度) {
      this.玩家配置.坐标.y += 移动距离;
    }
    this.玩家配置.子弹起始坐标.x = this.玩家配置.坐标.x;
    this.玩家配置.子弹起始坐标.y = this.玩家配置.坐标.y;
  }

  绘制玩家() {
    this.玩家配置.图像宽高比 = this.玩家配置.图像.naturalWidth / this.玩家配置.图像.naturalHeight;
    this.玩家配置.尺寸.高度 = this.玩家配置.尺寸.宽度 / this.玩家配置.图像宽高比;
    this.ctx.save();
    this.ctx.shadowColor = this.阴影配置.颜色;
    this.ctx.shadowOffsetX = this.阴影配置.水平偏移;
    this.ctx.shadowOffsetY = this.阴影配置.垂直偏移;
    this.ctx.shadowBlur = this.阴影配置.模糊;
    this.ctx.drawImage(
      this.玩家配置.图像,
      this.玩家配置.坐标.x - this.玩家配置.尺寸.宽度 / 2,
      this.玩家配置.坐标.y,
      this.玩家配置.尺寸.宽度,
      this.玩家配置.尺寸.高度
    );
    this.ctx.restore();
  }

  刷新玩家子弹坐标(当前时间) {
    if (!this.按键状态.m && this.玩家子弹组.length <= 0) return;
    if (
      this.按键状态.m &&
      (this.玩家子弹组.length <= 0 || 当前时间 - this.玩家子弹组[this.玩家子弹组.length - 1].出现时间 > 100)
    ) {
      const 子弹等级 = this.子弹配置[this.当前机型索引].等级;
      const 子弹宽度 = this.子弹配置[this.当前机型索引].宽度[子弹等级];
      const 子弹高度 = this.子弹配置[this.当前机型索引].高度[子弹等级];
      let 子弹 = null;
      if (子弹等级 === 0) {
        子弹 = {
          等级: 子弹等级,
          出现时间: 当前时间,
          width: this.子弹配置[this.当前机型索引].宽度[子弹等级],
          height: this.子弹配置[this.当前机型索引].高度[子弹等级],
          组合: [
            {
              x: this.玩家配置.子弹起始坐标.x - 子弹宽度 / 2,
              y: this.玩家配置.子弹起始坐标.y,
            },
          ],
        };
      } else if (子弹等级 === 1) {
        子弹 = {
          等级: 子弹等级,
          出现时间: 当前时间,
          width: this.子弹配置[this.当前机型索引].宽度[子弹等级],
          height: this.子弹配置[this.当前机型索引].高度[子弹等级],
          组合: [
            {
              x: this.玩家配置.子弹起始坐标.x - 子弹宽度 - 5,
              y: this.玩家配置.子弹起始坐标.y,
            },
            {
              x: this.玩家配置.子弹起始坐标.x + 5,
              y: this.玩家配置.子弹起始坐标.y,
            },
          ],
        };
      } else if (子弹等级 === 2) {
        子弹 = {
          等级: 子弹等级,
          出现时间: 当前时间,
          width: this.子弹配置[this.当前机型索引].宽度[子弹等级],
          height: this.子弹配置[this.当前机型索引].高度[子弹等级],
          组合: [
            {
              x: this.玩家配置.子弹起始坐标.x - 子弹宽度 / 2 - 子弹宽度 - 20,
              y: this.玩家配置.子弹起始坐标.y,
            },
            {
              x: this.玩家配置.子弹起始坐标.x - 子弹宽度 / 2,
              y: this.玩家配置.子弹起始坐标.y,
            },
            {
              x: this.玩家配置.子弹起始坐标.x - 子弹宽度 / 2 + 子弹宽度 + 20,
              y: this.玩家配置.子弹起始坐标.y,
            },
          ],
        };
      } else if (子弹等级 === 3) {
        const 子弹间隔 = 20;
        子弹 = {
          等级: 子弹等级,
          出现时间: 当前时间,
          width: this.子弹配置[this.当前机型索引].宽度[子弹等级],
          height: this.子弹配置[this.当前机型索引].高度[子弹等级],
          组合: [
            {
              x: this.玩家配置.子弹起始坐标.x - 子弹宽度 * 2 - 子弹间隔 * 1.5,
              y: this.玩家配置.子弹起始坐标.y,
            },
            {
              x: this.玩家配置.子弹起始坐标.x - 子弹宽度 - 子弹间隔 * 0.5,
              y: this.玩家配置.子弹起始坐标.y,
            },
            {
              x: this.玩家配置.子弹起始坐标.x + 子弹间隔 * 0.5,
              y: this.玩家配置.子弹起始坐标.y,
            },
            {
              x: this.玩家配置.子弹起始坐标.x + 子弹宽度 + 子弹间隔 * 1.5,
              y: this.玩家配置.子弹起始坐标.y,
            },
          ],
        };
      }
      this.玩家子弹组.push(子弹);
    }
    let 子弹已离屏 = false;
    for (const 子弹 of this.玩家子弹组) {
      const 子弹配置 = this.子弹配置[this.当前机型索引];
      const 子弹速度 = 子弹配置.速度[子弹配置.等级];
      for (let i = 0; i < 子弹.组合.length; i++) {
        子弹.组合[i].y -= 子弹速度 * this.时间差;
        if (子弹.组合[i].y < 0) {
          子弹已离屏 = true;
          break;
        }
      }
    }
    if (子弹已离屏) {
      this.玩家子弹组.shift();
    }
  }

  绘制玩家子弹() {
    if (this.玩家子弹组.length <= 0) return;
    this.ctx.save();
    this.ctx.fillStyle = "lightcyan";
    this.ctx.shadowColor = "#0002";
    this.ctx.shadowOffsetX = this.阴影配置.水平偏移;
    this.ctx.shadowOffsetY = this.阴影配置.垂直偏移;
    this.ctx.shadowBlur = this.阴影配置.模糊;
    this.ctx.beginPath();
    for (const 子弹 of this.玩家子弹组) {
      for (const 单排子弹 of 子弹.组合) {
        this.ctx.roundRect(单排子弹.x, 单排子弹.y, 子弹.width, 子弹.height, [5]);
        this.ctx.fill();
      }
    }
    this.ctx.closePath();
    this.ctx.restore();
  }

  生成子弹等级道具() {
    this.子弹等级道具.已生成 = true;
    this.子弹等级道具.坐标.x = Math.floor(Math.random() * (this.canvas.offsetWidth - this.子弹等级道具.尺寸.宽度));
    this.子弹等级道具.坐标.y = -50;
    this.子弹等级道具.速度.x = (Math.floor(Math.random() * 100) + 30) * (Math.random() > 0.5 ? 1 : -1);
    this.子弹等级道具.速度.y = Math.floor(Math.random() * 100) + 30;
  }

  绘制子弹等级道具() {
    if (!this.子弹等级道具.已生成) return;
    this.ctx.save();
    this.ctx.shadowColor = "#0004";
    this.ctx.shadowOffsetX = this.阴影配置.水平偏移;
    this.ctx.shadowOffsetY = this.阴影配置.垂直偏移;
    this.ctx.shadowBlur = this.阴影配置.模糊;
    this.ctx.drawImage(
      this.子弹等级道具.图像,
      this.子弹等级道具.坐标.x,
      this.子弹等级道具.坐标.y,
      this.子弹等级道具.尺寸.宽度,
      this.子弹等级道具.尺寸.高度
    );
    this.ctx.restore();
    this.子弹等级道具.坐标.y += this.子弹等级道具.速度.y * this.时间差;
    this.子弹等级道具.坐标.x += this.子弹等级道具.速度.x * this.时间差;
    if (!this.子弹等级道具.已进入画布 && this.子弹等级道具.坐标.y > 0) {
      this.子弹等级道具.已进入画布 = true;
    }
    if (
      this.子弹等级道具.坐标.x < 0 ||
      this.子弹等级道具.坐标.x > this.canvas.offsetWidth - this.子弹等级道具.尺寸.宽度
    ) {
      this.子弹等级道具.速度.x *= -1;
    }
    if (
      this.子弹等级道具.已进入画布 &&
      (this.子弹等级道具.坐标.y < 0 ||
        this.子弹等级道具.坐标.y > this.canvas.offsetHeight - this.子弹等级道具.尺寸.高度)
    ) {
      this.子弹等级道具.速度.y *= -1;
    }
  }

  玩家与道具碰撞(道具) {
    if (!道具.已生成) return;
    const 玩家坐标 = this.玩家配置.坐标;
    return (
      玩家坐标.x >= 道具.坐标.x &&
      玩家坐标.x <= 道具.坐标.x + 道具.尺寸.宽度 &&
      玩家坐标.y >= 道具.坐标.y &&
      玩家坐标.y <= 道具.坐标.y + 道具.尺寸.高度
    );
  }

  清空画布() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  初始化ResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        this.resizeCanvas();
      }
    });
    this.resizeObserver.observe(this.canvas);
  }

  resizeCanvas() {
    // 保存尺寸变化前的相对位置比例
    const 玩家X比例 = this.玩家配置.坐标.x / this.css宽度;
    const 玩家Y比例 = this.玩家配置.坐标.y / this.css高度;
    
    // 保存子弹增强道具的相对位置比例
    let 道具X比例 = 0;
    let 道具Y比例 = 0;
    if (this.子弹等级道具.已生成) {
      道具X比例 = this.子弹等级道具.坐标.x / this.css宽度;
      道具Y比例 = this.子弹等级道具.坐标.y / this.css高度;
    }
    
    // 重新计算CSS尺寸
    this.css宽度 = this.canvas.offsetWidth;
    this.css高度 = this.canvas.offsetHeight;
    
    // 重新设置canvas的实际尺寸
    this.canvas.width = this.css宽度 * this.dpr;
    this.canvas.height = this.css高度 * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    
    // 重新计算中心点
    this.中心点 = { x: this.canvas.offsetWidth / 2, y: this.canvas.offsetHeight / 2 };
    
    // 重新计算玩家尺寸
    this.玩家配置.尺寸.宽度 = this.css宽度 * 0.1;
    if (this.玩家配置.图像宽高比) {
      this.玩家配置.尺寸.高度 = this.玩家配置.尺寸.宽度 / this.玩家配置.图像宽高比;
    }
    
    // 根据比例重新计算玩家坐标，并确保不超出边界
    this.玩家配置.坐标.x = 玩家X比例 * this.css宽度;
    this.玩家配置.坐标.x = Math.min(this.玩家配置.坐标.x, this.canvas.offsetWidth - this.玩家配置.尺寸.宽度 / 2);
    this.玩家配置.坐标.x = Math.max(this.玩家配置.坐标.x, this.玩家配置.尺寸.宽度 / 2);
    
    this.玩家配置.坐标.y = 玩家Y比例 * this.css高度;
    this.玩家配置.坐标.y = Math.min(this.玩家配置.坐标.y, this.canvas.offsetHeight - this.玩家配置.尺寸.高度);
    this.玩家配置.坐标.y = Math.max(this.玩家配置.坐标.y, 0);
    
    // 更新子弹起始坐标
    this.玩家配置.子弹起始坐标.x = this.玩家配置.坐标.x;
    this.玩家配置.子弹起始坐标.y = this.玩家配置.坐标.y;
    
    // 重新计算子弹增强道具尺寸
    this.子弹等级道具.尺寸.宽度 = Math.round(50 * 新子弹尺寸比例 / 子弹尺寸比例);
    if (this.子弹等级道具.图像.naturalWidth && this.子弹等级道具.图像.naturalHeight) {
      const 子弹等级道具图像宽高比 = this.子弹等级道具.图像.naturalWidth / this.子弹等级道具.图像.naturalHeight;
      this.子弹等级道具.尺寸.高度 = this.子弹等级道具.尺寸.宽度 / 子弹等级道具图像宽高比;
    }
    
    // 如果道具已生成，根据比例重新计算其位置
    if (this.子弹等级道具.已生成) {
      this.子弹等级道具.坐标.x = 道具X比例 * this.css宽度;
      this.子弹等级道具.坐标.y = 道具Y比例 * this.css高度;
      
      // 确保道具不超出边界
      this.子弹等级道具.坐标.x = Math.min(this.子弹等级道具.坐标.x, this.canvas.offsetWidth - this.子弹等级道具.尺寸.宽度);
      this.子弹等级道具.坐标.x = Math.max(this.子弹等级道具.坐标.x, 0);
      this.子弹等级道具.坐标.y = Math.min(this.子弹等级道具.坐标.y, this.canvas.offsetHeight - this.子弹等级道具.尺寸.高度);
      this.子弹等级道具.坐标.y = Math.max(this.子弹等级道具.坐标.y, 0);
    }
    
    // 更新已存在子弹的尺寸
    for (const 子弹 of this.玩家子弹组) {
      子弹.width = Math.round(子弹.width * 新子弹尺寸比例 / 子弹尺寸比例);
      子弹.height = Math.round(子弹.height * 新子弹尺寸比例 / 子弹尺寸比例);
    }
  }
}

const 游戏实例 = new SpaceWar();
