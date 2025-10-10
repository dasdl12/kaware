# ✅ Railway 部署前检查清单

## 📋 部署前准备

### 1. 代码准备
- [x] 所有功能已测试完成
- [x] 已创建 `.gitignore` 文件
- [x] 已添加部署配置文件
  - [x] `railway.json`
  - [x] `nixpacks.toml`
  - [x] `Procfile`
  - [x] `.railwayignore`
- [x] `package.json` 包含 `start` 脚本
- [x] 已添加 `serve` 依赖

### 2. 构建测试
在部署前，建议先在本地测试构建：

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 测试生产环境
npm start
```

访问 http://localhost:3000 检查是否正常运行。

### 3. Git 仓库准备
```bash
# 检查 Git 状态
git status

# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 添加Railway部署配置"

# 推送到 GitHub
git push origin main
```

### 4. Railway 账号准备
- [ ] 已注册 Railway 账号
- [ ] 已连接 GitHub 账号
- [ ] 了解免费额度限制（$5/月）

## 🚀 部署步骤

### 方法 A: GitHub 自动部署（推荐）

1. [ ] 代码已推送到 GitHub
2. [ ] 访问 https://railway.app
3. [ ] 点击 "New Project"
4. [ ] 选择 "Deploy from GitHub repo"
5. [ ] 选择仓库 `dasdl12/-`
6. [ ] 等待自动构建和部署
7. [ ] 获取部署 URL
8. [ ] 测试应用功能

### 方法 B: Railway CLI

1. [ ] 安装 Railway CLI
   ```bash
   npm install -g @railway/cli
   ```

2. [ ] 登录 Railway
   ```bash
   railway login
   ```

3. [ ] 初始化项目
   ```bash
   railway init
   ```

4. [ ] 部署应用
   ```bash
   railway up
   ```

5. [ ] 获取域名
   ```bash
   railway domain
   ```

## 🔍 部署后验证

访问部署的 URL 并测试以下功能：

- [ ] 页面正常加载
- [ ] Logo 正确显示
- [ ] 可以上传 Excel 文件
- [ ] 数据解析正确
- [ ] 报告预览显示正常
- [ ] 双环图渲染正确
- [ ] 条形图渲染正确
- [ ] 单个导出功能正常（HTML/PNG/JPG）
- [ ] 批量导出功能正常
- [ ] 配置管理功能正常

## 🐛 常见问题排查

### 问题 1: 构建失败

**检查项：**
- [ ] 查看 Railway 构建日志
- [ ] 确认 Node.js 版本兼容（需要 >= 18.0.0）
- [ ] 检查是否有依赖安装失败
- [ ] 确认 `package.json` 中的 `build` 脚本正确

**解决方案：**
```bash
# 本地清理并重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题 2: 启动失败

**检查项：**
- [ ] 查看 Railway 应用日志
- [ ] 确认 `dist` 文件夹已生成
- [ ] 检查 `serve` 依赖是否已安装

**解决方案：**
在 Railway 项目设置中检查启动命令是否为：
```
npm start
```

### 问题 3: 静态资源 404

**检查项：**
- [ ] 确认 `public` 文件夹中的文件
- [ ] 检查图片路径是否正确
- [ ] 确认 `vite.config.ts` 配置正确

**解决方案：**
确保所有静态资源路径使用相对路径或 `/` 开头的绝对路径。

### 问题 4: 内存不足

**检查项：**
- [ ] 查看 Railway 资源使用情况
- [ ] 检查是否有内存泄漏

**解决方案：**
Railway 免费计划提供 512MB 内存，对于这个应用应该足够。
如果不够，可以升级到付费计划。

## 📊 监控和维护

### 日志查看
在 Railway 项目中：
1. 点击部署
2. 查看 "Logs" 标签
3. 监控错误和警告

### 性能监控
- [ ] 检查应用响应时间
- [ ] 监控内存使用
- [ ] 查看 CPU 使用率

### 更新部署
```bash
# 修改代码后
git add .
git commit -m "fix: 修复某个问题"
git push origin main

# Railway 会自动检测并重新部署
```

## 🔒 安全检查

- [ ] 不要在代码中硬编码敏感信息
- [ ] 使用 Railway 环境变量存储密钥
- [ ] 启用 HTTPS（Railway 默认启用）
- [ ] 定期更新依赖包
- [ ] 检查已知的安全漏洞

## 💰 成本优化

- [ ] 了解 Railway 的定价模型
- [ ] 监控每月使用量
- [ ] 使用免费额度（$5/月）
- [ ] 必要时升级到付费计划

## 📝 文档维护

- [ ] 更新 README.md 添加部署 URL
- [ ] 记录部署日期和版本
- [ ] 维护 DEPLOY.md 文档
- [ ] 记录已知问题和解决方案

## 🎉 部署完成

恭喜！您的应用已成功部署到 Railway！

**下一步：**
1. 分享部署 URL 给团队成员
2. 收集用户反馈
3. 持续改进和优化
4. 定期更新和维护

---

**部署 URL**: _____________（填写您的实际 URL）

**部署日期**: _____________

**版本**: v1.1.0

