# 🚀 Railway 部署指南

## 部署到 Railway 的步骤

### 方法一：通过 Railway CLI（推荐）

#### 1. 安装 Railway CLI

```bash
# Windows (使用 npm)
npm install -g @railway/cli

# 或使用 Scoop
scoop install railway
```

#### 2. 登录 Railway

```bash
railway login
```

这会打开浏览器让您登录Railway账号。

#### 3. 初始化项目

```bash
railway init
```

选择 "Create a new project" 并输入项目名称。

#### 4. 部署

```bash
railway up
```

#### 5. 添加域名（可选）

```bash
railway domain
```

### 方法二：通过 GitHub（推荐用于持续部署）

#### 1. 将代码推送到 GitHub

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加远程仓库
git remote add origin https://github.com/dasdl12/-.git

# 添加所有文件
git add .

# 提交
git commit -m "feat: 准备Railway部署"

# 推送
git push -u origin main
```

#### 2. 在 Railway 创建项目

1. 访问 [railway.app](https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择您的仓库 `dasdl12/-`
5. Railway 会自动检测配置并开始部署

#### 3. 配置环境变量（如果需要）

在 Railway 项目设置中添加环境变量：
- 点击项目 → Variables
- 目前这个项目不需要额外的环境变量

#### 4. 设置自定义域名

1. 在项目中点击 "Settings"
2. 找到 "Domains" 部分
3. 点击 "Generate Domain" 获取免费的 railway.app 子域名
4. 或者添加自定义域名

### 方法三：通过 Railway 网页界面

#### 1. 访问 Railway

打开 [railway.app](https://railway.app) 并登录

#### 2. 新建项目

- 点击 "New Project"
- 选择 "Empty Project"

#### 3. 添加服务

- 点击 "+ New"
- 选择 "GitHub Repo"
- 连接您的 GitHub 账号
- 选择 `dasdl12/-` 仓库

#### 4. 等待部署完成

Railway 会自动：
- 检测到这是一个 Node.js 项目
- 读取 `railway.json` 配置
- 执行构建命令：`npm ci && npm run build`
- 启动应用：`npm start`

## 📝 部署配置说明

### 已准备的文件

1. **railway.json** - Railway 主配置文件
   - 定义构建和启动命令
   - 设置重启策略

2. **nixpacks.toml** - Nixpacks 构建配置
   - 指定 Node.js 和 npm 版本
   - 定义构建步骤

3. **Procfile** - 进程配置（备用）
   - 定义 web 进程启动命令

4. **.railwayignore** - 忽略文件
   - 排除不需要部署的文件

5. **package.json** - 更新的依赖配置
   - 添加了 `serve` 依赖（静态文件服务器）
   - 添加了 `start` 脚本
   - 设置了 Node.js 版本要求

### 构建流程

```
1. 安装依赖      → npm ci
2. 编译TypeScript → tsc
3. 构建Vite项目  → vite build
4. 启动服务器    → serve -s dist -l 3000
```

## 🔧 常见问题

### Q1: 部署失败怎么办？

检查 Railway 的构建日志：
1. 进入项目
2. 点击最新的部署
3. 查看 "Deploy Logs"

### Q2: 如何查看应用日志？

在 Railway 项目中：
1. 点击 "Deployments"
2. 选择当前部署
3. 查看 "Logs" 标签

### Q3: 如何更新部署？

**方法A（自动）**：
- 推送代码到 GitHub
- Railway 会自动检测并重新部署

**方法B（手动）**：
```bash
railway up
```

### Q4: 端口配置

Railway 会自动注入 `PORT` 环境变量。
本应用配置为监听端口 3000，Railway 会自动处理端口映射。

### Q5: 如何回滚到之前的版本？

在 Railway 项目中：
1. 点击 "Deployments"
2. 找到要回滚的版本
3. 点击 "Redeploy"

## 🌐 访问应用

部署成功后，您会得到一个 URL，格式如：
```
https://your-project-name.up.railway.app
```

您可以：
1. 使用这个默认域名
2. 配置自定义域名
3. 分享给团队成员使用

## 📊 性能优化建议

### 1. 启用 GZIP 压缩

`serve` 默认启用了 GZIP 压缩，无需额外配置。

### 2. 缓存配置

`serve` 会自动为静态资源设置缓存头。

### 3. CDN（可选）

如果需要更快的访问速度，可以考虑：
- Cloudflare（免费）
- 将静态资源托管到 CDN

## 🔒 安全建议

### 1. 环境变量

如果将来需要添加敏感配置，在 Railway 中设置环境变量，不要硬编码在代码中。

### 2. HTTPS

Railway 自动为所有部署启用 HTTPS。

### 3. 访问控制

如果需要限制访问，可以：
- 使用 Railway 的 Private Networking
- 添加身份验证中间件
- 使用 IP 白名单

## 💰 成本说明

Railway 提供：
- **免费额度**：每月 $5 的使用额度
- 对于这个应用，免费额度足够使用
- 如果超出，可以升级到付费计划

## 📞 支持

如果遇到问题：
1. 查看 [Railway 文档](https://docs.railway.app)
2. 访问 [Railway Discord](https://discord.gg/railway)
3. 查看项目的构建和部署日志

---

**祝您部署顺利！** 🎉

