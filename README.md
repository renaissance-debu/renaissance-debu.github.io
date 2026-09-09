# baigushu 个人主页

baigushu的个人展示网站：项目经历、技术栈与学习记录。

**在线访问**：<https://renaissance-debu.github.io>

## 技术实现

- 纯静态 HTML + CSS + 少量原生 JavaScript，无框架、无构建工具
- CSS 变量驱动的明暗双主题，`localStorage` 记忆用户选择
- 粘性毛玻璃导航、卡片式布局、入场动画、响应式适配（768px / 480px 断点）
- 托管于 GitHub Pages，`git push` 即部署

## 页面结构

```
├── index.html                          # 首页（自我介绍 / 技术栈 / 项目 / 最新文章）
├── about.html                          # 关于我
├── archive.html                        # 文章归档
├── style.css                           # 全站样式
└── posts/
    ├── hadoop-rental-analysis.html     # 基于 Hadoop+Hive+Spark 的阜阳租房数据分析
    └── build-personal-site.html        # 本站的搭建记录
```

## License

[MIT](LICENSE)
