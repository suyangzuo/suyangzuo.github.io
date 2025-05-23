# Linux下载GCC

## 下载 `GCC`

* 和 Windows 相比，在 Linux 系统上装 `GCC` 要容易一些
* 在终端输入如下代码

  ```
  sudo apt install gcc
  ```

![img](./images/gcc下载.png)

## 检查 `GCC` 安装

* `GCC` 装完后可以通过以下命令检查是否安装成功
* 在终端输入如下代码

  ```
  gcc --version
  ```

![img](./images/检查gcc安装.png)

* 如果出现出现错误信息，说明 `GCC` 没有安装成功

## 使用 `GCC` 编译

* 可以在VScode中新建.c源文件，用 `GCC` 进行编译

  ```
  gcc main.c -o main
  ```

![img](./images/使用gcc.png)

* 或者在终端里用vim编写源文件，再用 `GCC` 进行编译

![img](./images/vim编写.png)

![img](./images/shell.png)

* 但是这边请确保源文件位于当前工作目录，以避免路径错误。
