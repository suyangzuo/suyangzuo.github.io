class ArrayMethodsVisualizer {
  constructor() {
    // 哺乳动物emoji数组
    this.mammalEmojis = [
      "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔", "🐧", "🐦", "🐤", "🐣", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦗", "🕷️", "🕸️", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🐘", "🦛", "🦏", "🐪", "🐫", "🦙", "🦒", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏", "🐑", "🐐", "🦌", "🐕", "🐩", "🐈", "🐓", "🦃", "🦚", "🦜", "🦢", "🦩", "🕊️", "🐇", "🦝", "🦨", "🦡", "🦫", "🦦", "🦥", "🐁", "🐀", "🐿️", "🦔"
    ];
    
    // 随机选择8个哺乳动物emoji
    this.originalArray = this.getRandomMammals(8);
    this.selectedMethods = ["filter", "find", "indexOf", "reverse", "some", "includes", "map", "join"];
    this.methodDefinitions = this.initializeMethodDefinitions();
    this.init();
  }

  // 从哺乳动物数组中随机选择指定数量的emoji
  getRandomMammals(count) {
    const shuffled = [...this.mammalEmojis].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  init() {
    this.createMainContent();
    this.createControlPanel();
    this.createMethodDialog();
    this.bindEvents();
    this.render();
  }

  createMainContent() {
    const 展示区 = document.querySelector(".展示区");
    展示区.innerHTML = `
      <div class="main-content">
        <div class="methods-container" id="methodsContainer"></div>
      </div>
    `;
  }

  createControlPanel() {
    const 控制区 = document.querySelector(".控制区");
    控制区.innerHTML = `
      <button class="method-selector-btn" id="methodSelectorBtn">
        <i class="fa-solid fa-list" style="margin-right: 1ch"></i>
        数组方法
      </button>
    `;
  }

  createMethodDialog() {
    const dialogHTML = `
      <div class="method-dialog-overlay" id="methodDialogOverlay">
        <div class="method-dialog">
          <div class="dialog-header">
            <h3 class="dialog-title">选择数组方法</h3>
            <button class="dialog-close" id="dialogClose">&times;</button>
          </div>
          <div class="method-grid" id="methodGrid"></div>
          <div class="dialog-actions">
            <button class="dialog-btn secondary" id="dialogCancel">取消</button>
            <button class="dialog-btn primary" id="dialogApply">应用</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", dialogHTML);
  }

  initializeMethodDefinitions() {
    return {
      at: {
        name: "at()",
        params: [{ type: "input", name: "index", placeholder: "索引" }],
        description: "返回指定索引位置的元素",
      },
      concat: {
        name: "concat()",
        params: [{ type: "input", name: "values", placeholder: "值" }],
        description: "合并数组",
      },
      copyWithin: {
        name: "copyWithin()",
        params: [
          { type: "input", name: "target", placeholder: "目标位置" },
          { type: "input", name: "start", placeholder: "开始位置" },
          { type: "input", name: "end", placeholder: "结束位置" },
        ],
        description: "复制数组元素",
      },
      entries: {
        name: "entries()",
        params: [],
        description: "返回数组迭代器",
      },
      every: {
        name: "every()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "测试所有元素是否通过测试",
      },
      fill: {
        name: "fill()",
        params: [
          { type: "input", name: "value", placeholder: "填充值" },
          { type: "input", name: "start", placeholder: "开始位置" },
          { type: "input", name: "end", placeholder: "结束位置" },
        ],
        description: "填充数组",
      },
      filter: {
        name: "filter()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "过滤数组元素",
      },
      find: {
        name: "find()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "查找第一个满足条件的元素",
      },
      findIndex: {
        name: "findIndex()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "查找第一个满足条件的元素索引",
      },
      findLast: {
        name: "findLast()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "查找最后一个满足条件的元素",
      },
      findLastIndex: {
        name: "findLastIndex()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "查找最后一个满足条件的元素索引",
      },
      flat: {
        name: "flat()",
        params: [{ type: "input", name: "depth", placeholder: "深度" }],
        description: "扁平化数组",
      },
      flatMap: {
        name: "flatMap()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "映射并扁平化数组",
      },
      forEach: {
        name: "forEach()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "遍历数组",
      },
      includes: {
        name: "includes()",
        params: [
          { type: "input", name: "searchElement", placeholder: "搜索元素" },
          { type: "input", name: "fromIndex", placeholder: "开始位置" },
        ],
        description: "检查数组是否包含指定元素",
      },
      indexOf: {
        name: "indexOf()",
        params: [
          { type: "input", name: "searchElement", placeholder: "搜索元素" },
          { type: "input", name: "fromIndex", placeholder: "开始位置" },
        ],
        description: "查找元素首次出现的位置",
      },
      join: {
        name: "join()",
        params: [{ type: "input", name: "separator", placeholder: "分隔符" }],
        description: "将数组元素连接为字符串",
      },
      keys: {
        name: "keys()",
        params: [],
        description: "返回数组键的迭代器",
      },
      lastIndexOf: {
        name: "lastIndexOf()",
        params: [
          { type: "input", name: "searchElement", placeholder: "搜索元素" },
          { type: "input", name: "fromIndex", placeholder: "开始位置" },
        ],
        description: "查找元素最后出现的位置",
      },
      map: {
        name: "map()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "映射数组元素",
      },
      pop: {
        name: "pop()",
        params: [],
        description: "移除并返回最后一个元素",
      },
      push: {
        name: "push()",
        params: [{ type: "input", name: "elements", placeholder: "元素" }],
        description: "向数组末尾添加元素",
      },
      reduce: {
        name: "reduce()",
        params: [
          { type: "callback", name: "callback", params: ["accumulator", "currentValue", "index", "array"] },
          { type: "input", name: "initialValue", placeholder: "初始值" },
        ],
        description: "归约数组",
      },
      reduceRight: {
        name: "reduceRight()",
        params: [
          { type: "callback", name: "callback", params: ["accumulator", "currentValue", "index", "array"] },
          { type: "input", name: "initialValue", placeholder: "初始值" },
        ],
        description: "从右向左归约数组",
      },
      reverse: {
        name: "reverse()",
        params: [],
        description: "反转数组",
      },
      shift: {
        name: "shift()",
        params: [],
        description: "移除并返回第一个元素",
      },
      slice: {
        name: "slice()",
        params: [
          { type: "input", name: "start", placeholder: "开始位置" },
          { type: "input", name: "end", placeholder: "结束位置" },
        ],
        description: "提取数组片段",
      },
      some: {
        name: "some()",
        params: [{ type: "callback", name: "callback", params: ["element", "index", "array"] }],
        description: "检查是否有元素通过测试",
      },
      sort: {
        name: "sort()",
        params: [{ type: "callback", name: "compareFunction", params: ["a", "b"] }],
        description: "排序数组",
      },
      splice: {
        name: "splice()",
        params: [
          { type: "input", name: "start", placeholder: "开始位置" },
          { type: "input", name: "deleteCount", placeholder: "删除数量" },
          { type: "input", name: "items", placeholder: "插入元素" },
        ],
        description: "修改数组",
      },
      toReversed: {
        name: "toReversed()",
        params: [],
        description: "返回反转后的新数组",
      },
      toSorted: {
        name: "toSorted()",
        params: [{ type: "callback", name: "compareFunction", params: ["a", "b"] }],
        description: "返回排序后的新数组",
      },
      toSpliced: {
        name: "toSpliced()",
        params: [
          { type: "input", name: "start", placeholder: "开始位置" },
          { type: "input", name: "deleteCount", placeholder: "删除数量" },
          { type: "input", name: "items", placeholder: "插入元素" },
        ],
        description: "返回修改后的新数组",
      },
      toString: {
        name: "toString()",
        params: [],
        description: "转换为字符串",
      },
      unshift: {
        name: "unshift()",
        params: [{ type: "input", name: "elements", placeholder: "元素" }],
        description: "向数组开头添加元素",
      },
      values: {
        name: "values()",
        params: [],
        description: "返回数组值的迭代器",
      },
      with: {
        name: "with()",
        params: [
          { type: "input", name: "index", placeholder: "索引" },
          { type: "input", name: "value", placeholder: "新值" },
        ],
        description: "返回修改指定位置后的新数组",
      },
    };
  }

  bindEvents() {
    // 方法选择按钮
    document.getElementById("methodSelectorBtn").addEventListener("click", () => {
      this.showMethodDialog();
    });

    // 对话框关闭
    document.getElementById("dialogClose").addEventListener("click", () => {
      this.hideMethodDialog();
    });

    document.getElementById("dialogCancel").addEventListener("click", () => {
      this.hideMethodDialog();
    });

    // 对话框应用
    document.getElementById("dialogApply").addEventListener("click", () => {
      this.applySelectedMethods();
      this.hideMethodDialog();
    });

    // 点击遮罩关闭对话框
    document.getElementById("methodDialogOverlay").addEventListener("click", (e) => {
      if (e.target.id === "methodDialogOverlay") {
        this.hideMethodDialog();
      }
    });
  }

  showMethodDialog() {
    const methodGrid = document.getElementById("methodGrid");
    methodGrid.innerHTML = "";

    Object.keys(this.methodDefinitions).forEach((methodName) => {
      const method = this.methodDefinitions[methodName];
      const isSelected = this.selectedMethods.includes(methodName);

      // 为method-dialog中的方法名称添加圆括号颜色，并去掉数组名称后面的圆括号
      let methodDisplayName = method.name;
      if (method.name.includes("(")) {
        const methodNamePart = method.name.split("(")[0];
        methodDisplayName = `${methodNamePart}<span class="method-params-bracket">()</span>`;
      }

      const methodItem = document.createElement("div");
      methodItem.className = "method-item";
      methodItem.innerHTML = `
        <input type="checkbox" id="method_${methodName}" ${isSelected ? "checked" : ""}>
        <label for="method_${methodName}">${methodDisplayName}</label>
      `;

      methodGrid.appendChild(methodItem);
    });

    document.getElementById("methodDialogOverlay").classList.add("show");
  }

  hideMethodDialog() {
    document.getElementById("methodDialogOverlay").classList.remove("show");
  }

  applySelectedMethods() {
    this.selectedMethods = [];
    const checkboxes = document.querySelectorAll('#methodGrid input[type="checkbox"]:checked');
    checkboxes.forEach((checkbox) => {
      const methodName = checkbox.id.replace("method_", "");
      this.selectedMethods.push(methodName);
    });
    this.render();
  }

  render() {
    this.renderMethodsContainer();
  }

  renderMethodsContainer() {
    const methodsContainer = document.getElementById("methodsContainer");
    methodsContainer.innerHTML = "";

    this.selectedMethods.forEach((methodName, index) => {
      const methodRow = document.createElement("div");
      methodRow.className = "method-row";
      methodRow.innerHTML = `
        <div class="method-column original-column">
          <div class="original-array" id="originalArray_${index}"></div>
        </div>
        <div class="method-column expression-column">
          <div class="method-display" id="methodDisplay_${index}"></div>
        </div>
        <div class="method-column result-column">
          <div class="result-display" id="resultDisplay_${index}"></div>
        </div>
      `;
      methodsContainer.appendChild(methodRow);
    });

    // 渲染每一行
    this.selectedMethods.forEach((methodName, index) => {
      this.renderOriginalArray(index);
      this.renderMethodDisplay(index);
      this.renderResult(index);
    });

    // 绑定输入事件
    this.bindInputEvents();
  }

  renderOriginalArray(rowIndex) {
    const originalArrayDiv = document.getElementById(`originalArray_${rowIndex}`);
    const arrayHTML = this.originalArray
      .map((element, index) => {
        return `
        <div class="array-item" data-index="${index}">
          <span class="array-element emoji">${element}</span>
        </div>
      `;
      })
      .join('<span class="array-comma">,</span>');
    originalArrayDiv.innerHTML = `<span class="array-bracket">[</span>${arrayHTML}<span class="array-bracket">]</span>`;
  }

  renderMethodDisplay(rowIndex) {
    const methodDisplay = document.getElementById(`methodDisplay_${rowIndex}`);
    const methodName = this.selectedMethods[rowIndex];
    const methodDef = this.methodDefinitions[methodName];

    if (methodDef.params.length === 0) {
      methodDisplay.innerHTML = `<span class="method-name">${methodDef.name.split("(")[0]}<span class="method-name-bracket">()</span></span>`;
    } else {
      let paramsHTML = "";
      let hasCallback = false;
      let callbackHTML = "";

      methodDef.params.forEach((param, paramIndex) => {
        if (param.type === "input") {
          if (paramsHTML) paramsHTML += '<span class="method-params">, </span>';
          paramsHTML += `<input type="text" class="param-input" placeholder="${param.placeholder}" data-param="${param.name}" data-row="${rowIndex}">`;
        } else if (param.type === "callback") {
          hasCallback = true;
          callbackHTML += `<div class="callback-params">`;
          param.params.forEach((callbackParam, callbackIndex) => {
            const isRequired = callbackIndex === 0;
            const checkboxClass = isRequired ? "param-checkbox checked disabled" : "param-checkbox checked";
            callbackHTML += `
              <div class="${checkboxClass}" data-param="${callbackParam}" data-row="${rowIndex}">
                <input type="checkbox" ${
                  isRequired ? "checked disabled" : "checked"
                } data-param="${callbackParam}" data-row="${rowIndex}">
                ${callbackParam}
              </div>
            `;
          });
          callbackHTML += `</div>`;
          callbackHTML += `<span class="method-params"> => </span><input type="text" class="param-input" placeholder="回调条件" data-param="callback" data-row="${rowIndex}">`;
        }
      });

      let methodHTML = `<span class="method-name">${methodDef.name.split("(")[0]}<span class="method-name-bracket">(</span></span>`;

      if (paramsHTML && hasCallback) {
        // 既有参数又有回调函数
        methodHTML += `${paramsHTML}`;
        methodHTML += `<span class="method-params"> => </span>`;
        methodHTML += callbackHTML;
      } else if (paramsHTML) {
        // 只有参数
        methodHTML += `${paramsHTML}`;
      } else if (hasCallback) {
        // 只有回调函数
        methodHTML += callbackHTML;
      }

      methodHTML += `<span class="method-name"><span class="method-name-bracket">)</span></span>`;

      methodDisplay.innerHTML = methodHTML;
    }
  }

  bindInputEvents() {
    const inputs = document.querySelectorAll(".param-input");
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        const rowIndex = parseInt(input.dataset.row);
        this.renderResult(rowIndex);
      });
    });

    // 绑定一体化checkbox事件
    const checkboxes = document.querySelectorAll(".param-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("click", (e) => {
        const input = checkbox.querySelector('input[type="checkbox"]');
        if (input && !input.disabled) {
          input.checked = !input.checked;
          checkbox.classList.toggle("checked", input.checked);

          const rowIndex = parseInt(checkbox.dataset.row);

          // 检查是否至少有一个参数被选中
          const callbackParams = document.querySelectorAll(
            `.callback-params input[type="checkbox"][data-row="${rowIndex}"]`
          );
          const checkedParams = Array.from(callbackParams).filter((cb) => cb.checked);

          if (checkedParams.length === 0) {
            // 如果没有参数被选中，重新选中第一个参数
            const firstCheckbox = callbackParams[0];
            if (firstCheckbox) {
              firstCheckbox.checked = true;
              const firstCheckboxDiv = firstCheckbox.closest(".param-checkbox");
              if (firstCheckboxDiv) {
                firstCheckboxDiv.classList.add("checked");
              }
            }
          }

          this.renderResult(rowIndex);
        }
      });
    });
  }

  renderResult(rowIndex) {
    const resultDisplay = document.getElementById(`resultDisplay_${rowIndex}`);
    const methodName = this.selectedMethods[rowIndex];
    const methodDef = this.methodDefinitions[methodName];

    try {
      const result = this.executeMethod(methodName, methodDef, rowIndex);
      resultDisplay.innerHTML = this.formatResult(result, methodName);
    } catch (error) {
      resultDisplay.innerHTML = `<span style="color: #ff6b6b;">错误: ${error.message}</span>`;
    }
  }

  executeMethod(methodName, methodDef, rowIndex) {
    const params = this.getMethodParams(methodDef, rowIndex);
    const array = [...this.originalArray]; // 创建副本

    switch (methodName) {
      case "at":
        const index = parseInt(params.index) || 0;
        return array.at(index);

      case "concat":
        const values = params.values ? params.values.split(",").map((v) => v.trim()) : [];
        return array.concat(values);

      case "copyWithin":
        const target = parseInt(params.target) || 0;
        const start = parseInt(params.start) || 0;
        const end = parseInt(params.end) || array.length;
        return array.copyWithin(target, start, end);

      case "entries":
        return Array.from(array.entries());

      case "every":
        const callback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        return array.every(callback);

      case "fill":
        const value = params.value || "";
        const fillStart = parseInt(params.start) || 0;
        const fillEnd = parseInt(params.end) || array.length;
        return array.fill(value, fillStart, fillEnd);

      case "filter":
        const filterCallback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        return array.filter(filterCallback);

      case "find":
        const findCallback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        return array.find(findCallback);

      case "findIndex":
        const findIndexCallback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        return array.findIndex(findIndexCallback);

      case "findLast":
        const findLastCallback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        return array.findLast(findLastCallback);

      case "findLastIndex":
        const findLastIndexCallback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        return array.findLastIndex(findLastIndexCallback);

      case "flat":
        const depth = parseInt(params.depth) || 1;
        return array.flat(depth);

      case "flatMap":
        const flatMapCallback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        return array.flatMap(flatMapCallback);

      case "forEach":
        const forEachCallback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        array.forEach(forEachCallback);
        return "undefined (已执行遍历)";

      case "includes":
        const searchElement = params.searchElement || "";
        const fromIndex = parseInt(params.fromIndex) || 0;
        return array.includes(searchElement, fromIndex);

      case "indexOf":
        const indexOfElement = params.searchElement || "";
        const indexOfFromIndex = parseInt(params.fromIndex) || 0;
        return array.indexOf(indexOfElement, indexOfFromIndex);

      case "join":
        const separator = params.separator || ",";
        return array.join(separator);

      case "keys":
        return Array.from(array.keys());

      case "lastIndexOf":
        const lastIndexOfElement = params.searchElement || "";
        const lastIndexOfFromIndex = parseInt(params.fromIndex) || array.length - 1;
        return array.lastIndexOf(lastIndexOfElement, lastIndexOfFromIndex);

      case "map":
        const mapCallback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        return array.map(mapCallback);

      case "pop":
        const popped = array.pop();
        this.originalArray = array;
        return popped;

      case "push":
        const pushElements = params.elements ? params.elements.split(",").map((v) => v.trim()) : [];
        const newLength = array.push(...pushElements);
        this.originalArray = array;
        return newLength;

      case "reduce":
        const reduceCallback = this.createCallback(
          params.callback,
          ["accumulator", "currentValue", "index", "array"],
          params.selectedCallbackParams
        );
        const initialValue = params.initialValue !== undefined ? params.initialValue : undefined;
        return array.reduce(reduceCallback, initialValue);

      case "reduceRight":
        const reduceRightCallback = this.createCallback(
          params.callback,
          ["accumulator", "currentValue", "index", "array"],
          params.selectedCallbackParams
        );
        const reduceRightInitialValue = params.initialValue !== undefined ? params.initialValue : undefined;
        return array.reduceRight(reduceRightCallback, reduceRightInitialValue);

      case "reverse":
        return array.reverse();

      case "shift":
        const shifted = array.shift();
        this.originalArray = array;
        return shifted;

      case "slice":
        const sliceStart = parseInt(params.start) || 0;
        const sliceEnd = parseInt(params.end) || array.length;
        return array.slice(sliceStart, sliceEnd);

      case "some":
        const someCallback = this.createCallback(
          params.callback,
          ["element", "index", "array"],
          params.selectedCallbackParams
        );
        return array.some(someCallback);

      case "sort":
        const sortCallback = this.createCallback(params.callback, ["a", "b"], params.selectedCallbackParams);
        return array.sort(sortCallback);

      case "splice":
        const spliceStart = parseInt(params.start) || 0;
        const deleteCount = parseInt(params.deleteCount) || 0;
        const items = params.items ? params.items.split(",").map((v) => v.trim()) : [];
        return array.splice(spliceStart, deleteCount, ...items);

      case "toReversed":
        return array.toReversed();

      case "toSorted":
        const toSortedCallback = this.createCallback(params.callback, ["a", "b"], params.selectedCallbackParams);
        return array.toSorted(toSortedCallback);

      case "toSpliced":
        const toSplicedStart = parseInt(params.start) || 0;
        const toSplicedDeleteCount = parseInt(params.deleteCount) || 0;
        const toSplicedItems = params.items ? params.items.split(",").map((v) => v.trim()) : [];
        return array.toSpliced(toSplicedStart, toSplicedDeleteCount, ...toSplicedItems);

      case "toString":
        return array.toString();

      case "unshift":
        const unshiftElements = params.elements ? params.elements.split(",").map((v) => v.trim()) : [];
        const unshiftLength = array.unshift(...unshiftElements);
        this.originalArray = array;
        return unshiftLength;

      case "values":
        return Array.from(array.values());

      case "with":
        const withIndex = parseInt(params.index) || 0;
        const withValue = params.value || "";
        return array.with(withIndex, withValue);

      default:
        throw new Error(`未知方法: ${methodName}`);
    }
  }

  getMethodParams(methodDef, rowIndex) {
    const params = {};

    methodDef.params.forEach((param) => {
      if (param.type === "input") {
        const input = document.querySelector(`[data-param="${param.name}"][data-row="${rowIndex}"]`);
        if (input) {
          params[param.name] = input.value;
        }
      } else if (param.type === "callback") {
        const callbackInput = document.querySelector(`[data-param="callback"][data-row="${rowIndex}"]`);
        if (callbackInput) {
          params.callback = callbackInput.value;
        }

        // 获取选中的回调参数
        const selectedParams = [];
        param.params.forEach((callbackParam) => {
          const checkbox = document.querySelector(`#method_${callbackParam}_${rowIndex}`);
          if (checkbox && checkbox.checked) {
            selectedParams.push(callbackParam);
          }
        });
        params.selectedCallbackParams = selectedParams;
      }
    });

    return params;
  }

  createCallback(callbackText, availableParams, selectedParams = null) {
    if (!callbackText) {
      return () => true;
    }

    try {
      // 如果有选中的参数，只使用选中的参数
      const paramsToUse = selectedParams && selectedParams.length > 0 ? selectedParams : availableParams;
      return new Function(...paramsToUse, `return ${callbackText}`);
    } catch (error) {
      return () => true;
    }
  }

  formatResult(result, methodName) {
    if (result === undefined) {
      return '<span class="result-value">undefined</span>';
    }

    if (result === null) {
      return '<span class="result-value">null</span>';
    }

    if (typeof result === "boolean") {
      return `<span class="result-value">${result}</span>`;
    }

    if (typeof result === "number") {
      return `<span class="result-value">${result}</span>`;
    }

    if (typeof result === "string") {
      // 检查字符串是否包含双引号，如果包含说明是数组字符串
      const isArrayString = result.includes('"');
      // 检查字符串是否包含emoji
      const isEmojiString =
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F3FB}-\u{1F3FF}]/u.test(
          result
        );

      let additionalClass = "";
      if (isArrayString) {
        additionalClass += " result-array-string";
      }
      if (isEmojiString) {
        additionalClass += " result-emoji-string";
      }

      // 检查字符串是否包含逗号
      if (result.includes(",")) {
        // 将字符串按逗号分割，并为每个逗号创建单独的元素
        const parts = result.split(",");
        const formattedParts = parts.map((part, index) => {
          if (index === parts.length - 1) {
            // 最后一部分不需要逗号
            return `<span class="result-value${additionalClass}">${part}</span>`;
          } else {
            // 其他部分后面跟逗号
            return `<span class="result-value${additionalClass}">${part}</span><span class="result-comma">,</span>`;
          }
        });
        return `<span class="result-value${additionalClass}">"</span>${formattedParts.join(
          ""
        )}<span class="result-value${additionalClass}">"</span>`;
      } else {
        return `<span class="result-value${additionalClass}">"${result}"</span>`;
      }
    }

    if (Array.isArray(result)) {
      const arrayHTML = result
        .map((element, index) => {
          const elementStr = typeof element === "string" ? element : JSON.stringify(element);
          // 判断是否为Emoji（更完整的Unicode范围判断）
          const isEmoji =
            /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F3FB}-\u{1F3FF}]/u.test(
              elementStr
            );
          const emojiClass = isEmoji ? " emoji" : "";
          return `<div class="result-array-item" data-index="${index}"><span class="result-array${emojiClass}">${elementStr}</span></div>`;
        })
        .join('<span class="result-comma">,</span>');

      // 检查是否修改了原数组，使用颜色区分而不是文字
      const modifiesOriginal = this.modifiesOriginalArray(methodName);
      const bracketColor = modifiesOriginal ? "#ff8a65" : "#81c784";

      return `<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center;"><span class="result-array" style="color: ${bracketColor};">[</span>${arrayHTML}<span class="result-array" style="color: ${bracketColor};">]</span></div>`;
    }

    if (result && typeof result === "object" && result.next) {
      return `<span class="result-iterator">Iterator { ... }</span>`;
    }

    return `<span class="result-value">${result}</span>`;
  }

  modifiesOriginalArray(methodName) {
    const modifyingMethods = ["reverse", "sort", "splice", "push", "pop", "shift", "unshift", "fill", "copyWithin"];
    return modifyingMethods.includes(methodName);
  }
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  new ArrayMethodsVisualizer();
});
