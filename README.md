CSS 参考手册 for Dash
======

### 关于

这是基于`doyoe` 的 [CSS 参考手册](https://github.com/doyoe/css-handbook.git) 做的一个 Dash 版本，去除了不必要的内容，同时让 Demo 能支持修改并在页面内显示的一个简化版本。

### 构建

1. Clone 仓库：`git clone https://github.com/asins/css-handbook.docset`
2. 初始化子模块：`git submodule init`
3. 摘取所有子模块数据：`git submodule update`
4. 安装 Node 依赖包 `npm install`
4. 执行命令 `npm run build` 或者 `node parse.js` 构建手册

### 使用

将创建好的`CSS.docset`文件复制到你的文档目录，再依次在 Dash 中操作：`Command+,` > Docsets > 点击加号选择 CSS.docset 就好了。

### 问题

我有点选择障碍，所以这个手册的分类规则对我来说是很烧脑子费时的，只能做成这样子了，欢迎指正改进。
