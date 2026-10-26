# baigushu 个人主页

百谷黍（baigushu）的个人展示网站：项目经历、技术栈与学习记录。

**在线访问**：<https://renaissance-debu.github.io>

## 技术实现

- 纯静态 HTML + CSS + 少量原生 JavaScript，无框架、无构建工具
- 星野花园视觉：原生 SVG 花海、CSS 月亮与轨道、Canvas 星光与偶发流星；资源全部随仓库提供
- 默认星夜主题，可切换晨光主题，`localStorage` 记忆用户选择；禁用存储时仍可正常浏览和切换
- 首页、关于、归档与文章页共用主题；在 320px 手机到桌面宽度间响应式排版
- 动画可手动暂停；尊重 `prefers-reduced-motion`，离开首屏或切到后台时停止动画循环
- 无第三方字体、图片 CDN、统计脚本和新增构建依赖
- 托管于 GitHub Pages，`git push` 即部署

## 页面结构

```
├── index.html                          # 首页（自我介绍 / 技术栈 / 项目 / 最新文章）
├── about.html                          # 关于我
├── archive.html                        # 文章归档
├── style.css                           # 全站样式
├── theme-init.js                       # 首次绘制前应用主题
├── app.js                              # 共用主题切换 / 首屏动画
├── favicon.svg                         # 花朵图标
├── assets/night-garden.svg             # 本地矢量花海
└── posts/
    ├── hadoop-rental-analysis.html     # 基于 Hadoop+Hive+Spark 的阜阳租房数据分析
    └── build-personal-site.html        # 本站的搭建记录
```

## 本地预览

在仓库目录运行 `python -m http.server 4186 --bind 127.0.0.1`，然后访问 <http://127.0.0.1:4186/>。

修改静态文件后刷新页面即可，无需安装 Node.js 依赖。合并到 Pages 配置的发布分支后由 GitHub Pages 发布。
