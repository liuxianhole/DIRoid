# Android WebView APK

这是一个基于参考 APK 资源重建的标准 Android WebView 工程。

## 入口

- Android 入口页: `app/src/main/java/com/zz91/dibang/MainActivity.kt`
- Web 业务入口: `app/src/main/assets/widget/html/index.html`
- 资源目录: `app/src/main/assets/widget`

## 兼容方式

- 原 APK 的 `assets/widget` 已整体复制到 Android 工程中
- `app/src/main/assets/widget/script/api.js` 末尾追加了 APICloud 兼容层
- 兼容层当前覆盖:
  - `openWin`
  - `closeWin`
  - `openFrame`
  - `closeFrame`
  - `openFrameGroup`
  - `setFrameGroupIndex`
  - `execScript`
  - `ajax`
  - `showProgress` / `hideProgress`
  - `toast` / `alert` / `confirm`
  - `addEventListener`
  - `pageUp`

## 已知限制

- 这不是完整的 APICloud 原生运行时
- `socketManager`、`videoPlayer`、`photoBrowser`、`searchBar` 等模块目前是轻量兼容或空实现
- 终端环境未安装 `gradle`，当前未执行本地 `assemble` 校验；建议直接用 Android Studio 导入项目同步并运行
