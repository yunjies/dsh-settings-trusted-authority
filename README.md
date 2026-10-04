# DSH trusted-authority Settings plugin

该独立 bundle 替换 Web profile 中的 Settings provider，使配置页仅在 loopback 页面或配置的可信 authority 上使用 Host 持久化。它不改 DSH 安装目录；通过 `dsh plugin` 安装后，插件包和 bundle layer 位于 profile 依赖中。

## 配置与安装

Host Web profile 必须已通过 `--trusted-host <host:port>` 接受目标 authority。标准 `web-app` 组合会把 Web runtime 的 `trustedHosts` 传给 Connection，插件直接读取该服务，不维护第二份信任列表。若 profile patch 单独覆盖 Connection 的 `trustedHosts`，必须保持两者一致；客户端列表只选择 Settings 持久化，不授权 `/api` 请求，Host/Origin fence 和浏览器会话认证仍是最终边界。

从插件目录打包并安装到 Web profile：

```sh
pnpm pack

dsh plugin --profile web add ./dsh-settings-trusted-authority-plugin-0.1.0.tgz
```

确认 bundle layer 生效：

```sh
dsh --profile web --dump-config
```

查看结果中内置 `ui-settings` provider 已禁用，且 `trusted-settings-authority-provider` 已启用。插件 Host 部分会在启动时检查此替换条件；若 DSH 更新改变了目标 entry，插件会报错而不静默加载两个 Settings provider。

重启 Web profile 以加载新的 bundle membership。用浏览器打开已认证的 Web profile，在 Models 设置中读取或修改一项设置，刷新页面后确认修改仍存在。卸载方式：

```sh
dsh plugin --profile web remove dsh-settings-trusted-authority-plugin
```

删除插件 bundle 后，内置 `ui-settings` provider 会恢复。

## 安全与兼容边界

插件只替换 Settings 的客户端 provider；它继续提供 `configForms`（含共享 `developerTools` preference）、Settings schema 与 describe mirror，并通过现有 `remote.settings` 读写 Host 设置。Connection 的 `isLoopback`、Host/Origin fence、浏览器会话认证和其他 loopback-only 功能保持原样。插件把标准 `web-app` 组合提供的 `trustedHosts` 列表经 authenticated index injection 送到客户端，不新增 Settings API 或认证旁路。

## 替换范围与功能差异

profile patch 只禁用 `ui-settings` provider entry 并装入替代 client bundle；它不禁用其余 Settings 页面或调用这些服务的模块。替代 bundle 基于 DSH `0.2.0-rc.2` 的 Settings provider 实现并使用独立 module id，Models 页的配置保存与刷新读回是部署验收项。

当前兼容基线没有已知的 Settings 功能被有意移除；尚未逐项验证所有 schema 与 provider 变体。第三方扩展若运行时依赖官方 provider 的原 module id 或内部导出，也不在兼容保证内。最实际的代价是该 bundle 不会自动吸收 DSH 后续对内置 provider 的新功能或修复，升级时必须检查并按需同步。

**【事实】** Settings 持久化选择属于浏览器端 Settings provider；本包经 profile dependency 替换该 provider，不修改 DSH 安装目录。

**【反题】** provider 是跨插件服务契约；DSH 更新可能改变 entry ID、模块格式、`webRuntime` 服务或 `configForms` 行为。外置源码可独立维护，但不自动保证更新后仍能加载或与新 DSH 兼容；维护者须按每个 DSH 版本核验客户端 provider 契约。

**【裁决】** 本包使用独立 client bundle 替换官方 provider，而不改写共享 loopback 状态或私有运行时字段。每次升级 DSH 后，先在隔离 Web profile 重跑上文的 Models 浏览器读写与刷新验证；若启动时报 built-in provider 替换检查错误，先更新 bundle patch 与 provider 契约，再安装到实际 profile。
