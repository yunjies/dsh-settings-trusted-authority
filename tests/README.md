# 测试说明

本套件守护独立 Settings provider 的静态入口与包契约；它不证明浏览器中真实 bundle 已装配，也不证明其他 DSH 版本仍满足同一服务契约。

## 静态面

从仓库根执行 `npm test`，断言 Host provider 替换守卫、`webRuntime.trustedHosts` 到 authenticated index injection 的传递、非法服务值 fail-closed，以及 client module id 与包名一致；判据为全部用例通过且退出码为 0。

从仓库根执行 `pnpm pack --dry-run`，检查分发文件是否由 `package.json` 的 `files` 字段约束；判据为包清单能提供 Host 入口、client bundle、profile patch、安装说明与许可证。

## 活体面

浏览器与真实 Web profile 的验收步骤见[部署与使用说明](../../deploy.md)；必须实际打开 Models 页面、保存一项配置并刷新确认仍可读，单跑静态测试不能替代这项证据。

每次 DSH 版本升级后，都在隔离 Web profile 重做活体验收；不得直接用运行中的用户 profile 做兼容性探测。

## 未覆盖面

仓库没有可独立启动的自动化 Web E2E 脚本；活体验收依赖 DSH Web profile、浏览器与部署参数。

当前静态断言不遍历所有 Settings schema，也不覆盖每个模型 provider 的配置变体。

未来 DSH 版本对 `ui-settings` entry、`webRuntime` 或 `configForms` 服务契约的改变，必须重新验收；本包在 profile 中留存不代表自动兼容。