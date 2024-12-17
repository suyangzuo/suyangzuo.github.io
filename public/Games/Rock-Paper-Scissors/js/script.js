const gameContainer = document.querySelector(".container"), //获取Contrainer元素
  userResult = document.querySelector(".user_result img"), //获取用户结果下的img元素
  cpuResult = document.querySelector(".cpu_result img"), //获取cpu结果下的img元素
  result = document.querySelector(".result"), //获取结果元素
  optionImages = document.querySelectorAll(".option_image"); //获取提示图片

// console.log(gameContainer, userResult, cpuResult, result, optionImages)    查看这几个元素是否能被控制台输出

optionImages.forEach((image, index) => {
  // 遍历 optionImages 中的每个图像，image 是当前图像，index 是当前图像的索引。
  image.addEventListener("click", (e) => {
    //为每个图像添加一个点击事件监听器，当图像被点击时，会执行后面的回调函数。
    image.classList.add("active"); // 在被点击的图像上添加 active 类，这通常用于改变图像的样式或状态。

    userResult.src = cpuResult.src = "./images/rock.png"; //将用户和计算机的结果图像都更改为“石头”图像。
    result.textContent = "请稍后，正在计算"; //将 result 元素的文本内容更新为“请稍后，正在计算”，提示用户正在进行计算。
    optionImages.forEach((image2, index2) => {
      //遍历 optionImages中的每个图像。
      index !== index2 && image2.classList.remove("active"); //如果当前图像的索引 index 不等于遍历到的图像的索引 index2，
      // 则移除该图像的 `active` 类。只有被点击的图像会保持激活状态，其他图像会被取消激活。
    });

    // 目的是在用户选择选项后，更新结果图像和状态，并确保只有当前选中的图像保持激活。

    gameContainer.classList.add("start"); //给 gameContainer 添加 start 类，用于启动状态
    let time = setTimeout(() => {
      //设置一个定时器，延迟执行内部的回调函数，用于模拟等待。
      let imageSrc = e.target.querySelector("img").src; //获取被点击图像的 src 属性。e.target 是触发事件的元素，querySelector("img") 用于获取该元素下的img标签。
      userResult.src = imageSrc; //将用户结果的图像源更新为被点击图像的源。
      gameContainer.classList.remove("start"); //移除 gameContainer 的 start 类，表示状态的结束。

      let randomNumber = Math.floor(Math.random() * 3); //生成一个0-2的整数

      let cpuImages = [
        "./images/rock.png",
        "./images/paper.png",
        "./images/scissor.png",
      ]; //表示可能的三种结果图像

      cpuResult.src = cpuImages[randomNumber]; //将 cpuResult 的 src 属性设置为 cpuImages 数组中根据随机数获取的图像路径

      let cpuValue = ["R", "P", "S"][randomNumber]; //根据随机数获取 `["R", "P", "S"]` 数组中对应索引的值,将其赋给cpu的选择。

      let useValue = ["R", "P", "S"][index]; //根据用户选择的索引 index 获取 ["R", "P", "S"] 数组中对应索引的值，将其赋给用户的选择。

      let outcomes = {
        RR: "平局",
        RP: "Cpu",
        RS: "User",
        PP: "平局",
        PR: "User",
        PS: "Cpu",
        SS: "平局",
        SR: "Cpu",
        SP: "User",
      };

      // RR: "平局"：表示用户选择石头，计算机选择石头，结果为平局。
      // RP: "Cpu"：表示用户选择石头，计算机选择剪刀，结果为计算机获胜。
      // RS: "用户"：表示用户选择石头，计算机选择布，结果为用户获胜。
      // PP: "平局"：表示用户选择布，计算机选择布，结果为平局。
      // PR: "用户"：表示用户选择布，计算机选择石头，结果为用户获胜。
      // PS: "Cpu"：表示用户选择布，计算机选择剪刀，结果为计算机获胜。
      // SS: "平局"：表示用户选择剪刀，计算机选择剪刀，结果为平局。
      // SR: "Cpu"：表示用户选择剪刀，计算机选择石头，结果为计算机获胜。
      // SP: "用户"：表示用户选择剪刀，计算机选择布，结果为用户获胜。

      let outComeValue = outcomes[useValue + cpuValue];
      // useValue + cpuValue：将用户选择的值和计算机选择的值拼接在一起，形成一个字符串
      // outcomes[useValue + cpuValue]：使用拼接后的字符串作为键，从 outcomes 对象中获取对应的值，即表示游戏的结果。

      result.textContent = //更新result元素的文本内容。
        useValue === cpuValue ? "平局" : `${outComeValue} 胜利!!`; //如果用户的选择和计算机的选择相同，则结果为“平局”。如果用户的选择和计算机的选择不同，则显示 `${outComeValue} 胜利!!,outComeValue 是之前根据用户和计算机选择得到的结果,表示谁获胜。
    }, 1000); //在 1000 毫秒后更新结果文本
  });
});
