import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 简单的内存存储（无数据库版本）。生产可切换到KV/DB。
let sharedBaseConfig = null;
let sharedManagementConfigs = null;
let lastUpdatedAt = null;

app.get('/api/config', (req, res) => {
  res.json({
    baseConfig: sharedBaseConfig,
    managementConfigs: sharedManagementConfigs,
    updatedAt: lastUpdatedAt
  });
});

app.post('/api/config', (req, res) => {
  const { baseConfig, managementConfigs } = req.body || {};
  sharedBaseConfig = baseConfig ?? sharedBaseConfig;
  sharedManagementConfigs = managementConfigs ?? sharedManagementConfigs;
  lastUpdatedAt = new Date().toISOString();
  res.json({ ok: true, updatedAt: lastUpdatedAt });
});

// 静态资源与SPA路由
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});


