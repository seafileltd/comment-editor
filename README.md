# Comment-editor

项目是基于 react-slate 组件库的二次封装, 用于满足公司评论编辑器的使用需求

## 目录结构

```
comment-editor/
  dist                      // 打包后的文件
  node_modules/             // 依赖第三方组件库
  public/                   // 公共资源文件库
    index.html
    favicon.ico
  site(demo 模块, 基于组件库创建的测试模块)
    _i18n                   // 国际化模块
    commons                 // 公共组件
    components              // 应用组件
    pages                   // 页面组件
    app.js                  // 应用对象
    index.html              // 主页
    index.js                // 应用入口
    setting.js              // 应用配置文件
    setting.sdoc.local.js    // SDoc Demo 配置模板（可提交）
    setting.md.local.js      // MD Demo 配置模板（可提交）
    setting.local.js         // setting.js 默认加载的本地配置（Git 忽略）
    setting.local.*.js       // 可按场景单独保存的本地配置（Git 忽略）
  src/(组件库)
    basic-sdk               // 编辑器元素包
    pages                   // 封装的视图组件
    index.js                // 组件库导出内容入口文件
  tests                     // 测试
  webpack                   // site 打包文件
  config.js                 // site 打包配置文件
  dev-server.js             // site 后端服务器
  package.json
  readme.md                 // 组件库说明文档
```

## 本地测试步骤
1. 将 `site/setting.sdoc.local.js` 或 `site/setting.md.local.js` 复制为 `site/setting.local.js`（`site/setting.js` 默认加载）。也可以按场景将实际配置单独保存在 `site/setting.local.sdoc.js` 或 `site/setting.local.md.js`，测试前将对应配置复制到默认加载的文件。也可将两套字段合并到默认配置，不用覆盖已有配置。
2. 在 Seahub 创建测试文件，填写实际服务器地址、文件信息和认证信息。只提交模板，不要提交本地配置或真实凭据。
3. 执行 `npm run start` 启动测试服务，从首页选择入口：
   - **SDoc Comment**（`/sdoc-comment-editor`）：测试 SeaDoc 文档评论，在本地配置的顶层填写 `sdocServer`、`docPath` 和 `docUuid`，可选填 `docName`（显示名称）、文档 `accessToken` 和 `assetsUrl`（SDoc 相对图片路径需要额外前缀时填写）。
   - **MD Comment**（`/md-comment-editor`）：测试 Seafile 普通文件评论，在本地配置的顶层填写 `repoID`、`fileUuid`（或 `filePath`），可选填 `fileName`（显示名称）。不填 `apiToken` 时，页面会用同一文件顶层的 `username` 和 `password` 自动登录获取用户 token；如已配置 `apiToken`，则直接使用。账号密码仅用于本地 Demo，请勿提交或部署含有真实凭据的配置。

## 新版本发布
1. 更新 package.json 中的 version 属性
2. 执行 npm publish 完成新版本发布
