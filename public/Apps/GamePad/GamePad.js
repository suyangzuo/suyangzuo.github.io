class 提示动画 {
  constructor() {
    this.提示动画区 = document.querySelector(".提示动画区");
    this.提示动画内容 = this.提示动画区.querySelector(".提示动画内容");
    this.提示动画 = null;
    this.提示动画起始帧位置 = "-50% -50px";
    this.提示动画最终帧位置 = "-50% 75px";
    this.连接提示背景色 = "#284";
    this.断开提示背景色 = "#823";

    this.提示动画关键帧 = [
      {
        translate: this.提示动画起始帧位置,
        opacity: 0,
        offset: 0,
      },
      {
        opacity: 0.5,
        offset: 0.1,
      },
      {
        translate: this.提示动画最终帧位置,
        opacity: 1,
        offset: 0.15,
      },
      {
        translate: this.提示动画最终帧位置,
        opacity: 1,
        offset: 0.975,
      },
      {
        translate: this.提示动画最终帧位置,
        opacity: 0,
        offset: 1,
      },
    ];

    this.提示动画选项 = {
      duration: 3000,
      easing: "ease-out",
      delay: 0,
      iterations: 1,
      direction: "normal",
      fill: "forwards",
    };
  }

  显示连接提示() {
    this.取消当前动画();
    this.提示动画内容.style.backgroundColor = this.连接提示背景色;
    this.提示动画内容.textContent = "手柄已连接";
    this.提示动画 = this.提示动画区.animate(this.提示动画关键帧, this.提示动画选项);
  }

  显示断开提示() {
    this.取消当前动画();
    this.提示动画内容.style.backgroundColor = this.断开提示背景色;
    this.提示动画内容.textContent = "手柄已断开";
    this.提示动画 = this.提示动画区.animate(this.提示动画关键帧, this.提示动画选项);
  }

  取消当前动画() {
    if (this.提示动画) {
      this.提示动画.cancel();
    }
  }
}

class 手柄控制器 {
  constructor() {
    this.手柄 = null;
    this.手柄索引 = null;
    this.动画帧ID = null;
    this.手柄按键上次状态 = new Array(20).fill(false);
    this.提示动画 = new 提示动画();

    this.按键映射 = {
      0: {
        名称: "A",
        惯用指: "右拇指",
      },
      1: {
        名称: "B",
        惯用指: "右拇指",
      },
      2: {
        名称: "X",
        惯用指: "右拇指",
      },
      3: {
        名称: "X",
        惯用指: "右拇指",
      },
      4: {
        名称: "LB",
        惯用指: "左食指",
      },
      5: {
        名称: "RB",
        惯用指: "右食指",
      },
      6: {
        名称: "LT",
        惯用指: "左食指",
      },
      7: {
        名称: "RT",
        惯用指: "右食指",
      },
      8: {
        名称: "Back",
        惯用指: "左姆指",
      },
      9: {
        名称: "Start",
        惯用指: "右姆指",
      },
      12: {
        名称: "导航-上",
        惯用指: "左姆指",
      },
      13: {
        名称: "导航-下",
        惯用指: "左姆指",
      },
      14: {
        名称: "导航-左",
        惯用指: "左姆指",
      },
      15: {
        名称: "导航-右",
        惯用指: "左姆指",
      },
    };

    this.绑定事件();
  }

  绑定事件() {
    window.addEventListener("gamepadconnected", (e) => this.手柄已连接(e));
    window.addEventListener("gamepaddisconnected", (e) => this.手柄已断开(e));
  }

  手柄已连接(e) {
    this.手柄索引 = e.gamepad.index;
    this.手柄按键轮询();
    this.提示动画.显示连接提示();
  }

  手柄已断开(e) {
    this.手柄 = null;
    this.手柄索引 = null;
    cancelAnimationFrame(this.动画帧ID);
    this.提示动画.显示断开提示();
  }

  手柄按键轮询() {
    const 手柄列表 = navigator.getGamepads();
    this.手柄 = 手柄列表[this.手柄索引];
    if (!this.手柄) return;

    this.手柄.buttons.forEach((按键, 索引) => {
      const 按键已按下 = 按键.pressed;

      if (!this.手柄按键上次状态[索引] && 按键已按下) {
        console.log(`${this.按键映射[索引].名称}：按下`);
      }

      if (this.手柄按键上次状态[索引] && !按键已按下) {
        console.log(`${this.按键映射[索引].名称}：松开`);
      }

      this.手柄按键上次状态[索引] = 按键已按下;
    });

    this.动画帧ID = requestAnimationFrame(() => this.手柄按键轮询());
  }
}

const 手柄实例 = new 手柄控制器();

class 手柄测试 {
  constructor() {
    this.手柄 = 手柄实例;
    this.测试池 = [];
    this.测试方案 = {
      单按键: [],
      双按键: [],
      三按键: [],
    };
  }
}
