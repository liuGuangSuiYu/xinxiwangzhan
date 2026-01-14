const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 导入数据库配置
const { initDatabase } = require('./db');
let db = null;

const app = express();
const PORT = process.env.PORT || 5000;

// 使用中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 创建日志目录
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 日志记录函数
const logMessage = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  console.log(logEntry.trim());
  
  // 写入日志文件 - 添加错误处理
  try {
    const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFileSync(logFile, logEntry, { encoding: 'utf8' });
  } catch (err) {
    // 如果写入日志文件失败，只打印到控制台，不影响主程序
    console.error(`日志文件写入失败: ${err.message}`);
  }
};

// 定期清理旧日志文件（保留7天）
const cleanupOldLogs = () => {
  try {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // 检查logsDir是否存在
    if (!fs.existsSync(logsDir)) {
      return;
    }
    
    const files = fs.readdirSync(logsDir);
    files.forEach(file => {
      try {
        const filePath = path.join(logsDir, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime.getTime() < sevenDaysAgo) {
          fs.unlinkSync(filePath);
          logMessage(`已清理旧日志文件: ${file}`, 'info');
        }
      } catch (err) {
        console.error(`清理日志文件 ${file} 失败: ${err.message}`);
      }
    });
  } catch (err) {
    console.error(`日志清理失败: ${err.message}`);
  }
};

// 每天清理一次旧日志
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);
cleanupOldLogs(); // 初始清理

// 模拟用户数据
let users = [
  {
    id: 1,
    username: 'admin',
    password: 'password123', // 实际项目中应该使用bcrypt等算法加密
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: 2,
    username: 'user',
    password: 'password456',
    email: 'user@example.com',
    role: 'user'
  }
];

// JWT模拟实现 - 实际项目中应该使用jsonwebtoken库
const generateToken = (user) => {
  // 简单的token生成，实际项目中应该使用JWT标准
  const token = Buffer.from(JSON.stringify({
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24小时过期
  })).toString('base64');
  return token;
};

// 验证token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供身份验证令牌' });
  }

  try {
    // 简单的token验证，实际项目中应该使用JWT标准
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // 检查token是否过期
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: '身份验证令牌已过期' });
    }

    // 查找用户
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: '无效的身份验证令牌' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    logMessage(`令牌验证失败: ${error.message}`, 'error');
    return res.status(401).json({ error: '无效的身份验证令牌' });
  }
};

// 中间件
app.use(cors());
app.use(express.json());

// 请求日志中间件
app.use((req, res, next) => {
  logMessage(`${req.method} ${req.url}`, 'info');
  next();
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  logMessage(`全局错误捕获: ${err.message}`, 'error');
  logMessage(`错误堆栈: ${err.stack}`, 'error');
  
  const statusCode = err.status || 500;
  const errorMessage = err.message || '服务器内部错误';
  
  res.status(statusCode).json({ error: errorMessage });
});

// API 路由

// 认证相关API

// 用户登录
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      logMessage('登录请求失败：缺少用户名或密码', 'error');
      return res.status(400).json({ error: '请输入用户名和密码' });
    }
    
    // 查找用户
    const user = users.find(u => u.username === username);
    
    if (!user) {
      logMessage(`登录失败：用户名不存在 - ${username}`, 'warn');
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码（实际项目中应该使用bcrypt等算法加密）
    if (user.password !== password) {
      logMessage(`登录失败：密码错误 - ${username}`, 'warn');
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 生成token
    const token = generateToken(user);
    
    // 不返回密码
    const { password: _, ...userWithoutPassword } = user;
    
    logMessage(`登录成功：${username}`, 'info');
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    logMessage(`登录请求处理失败：${error.message}`, 'error');
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    // 不返回密码
    const { password: _, ...userWithoutPassword } = req.user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    logMessage(`获取用户信息失败：${error.message}`, 'error');
    res.status(500).json({ error: '获取用户信息失败，请稍后重试' });
  }
});

// 用户登出
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  try {
    // 在实际项目中，应该将token加入黑名单
    logMessage(`用户登出：${req.user.username}`, 'info');
    res.json({ message: '登出成功' });
  } catch (error) {
    logMessage(`登出处理失败：${error.message}`, 'error');
    res.status(500).json({ error: '登出失败，请稍后重试' });
  }
});

// 获取所有药品
app.get('/api/medicines', async (req, res) => {
  try {
    await db.read();
    const medicines = db.data.medicines;
    res.json({
      medicines: medicines,
      page: 1,
      totalPages: 1
    });
    logMessage(`获取所有药品，共返回 ${medicines.length} 条记录`, 'info');
  } catch (error) {
    logMessage(`获取药品列表失败: ${error.message}`, 'error');
    res.status(500).json({ message: '获取药品列表失败' });
  }
});

// 获取药品分类
app.get('/api/medicines/categories', async (req, res) => {
  try {
    await db.read();
    const categories = [...new Set(db.data.medicines.map(m => m.category))];
    res.json(categories);
    logMessage(`获取药品分类，共返回 ${categories.length} 个分类`, 'info');
  } catch (error) {
    logMessage(`获取药品分类失败: ${error.message}`, 'error');
    res.status(500).json({ message: '获取药品分类失败' });
  }
});

// 新增：导出药品信息
app.get('/api/medicines/export', async (req, res) => {
  try {
    await db.read();
    const medicines = db.data.medicines;
    
    const headers = ['ID', '药品编码', '拼音码', '通用名', '商品名', '分类', '规格', '药房单位', '剂量', '剂型', '用药途径', '成分', '适应症', '用法用量', '不良反应', '禁忌', '注意事项', '药物相互作用', '有效期(月)', '批准文号', '生产厂家', '储存条件'];
    
    const csvRows = medicines.map(medicine => [
      medicine.id,
      medicine.drugCode || '',
      medicine.pinyinCode || '',
      medicine.name.generic,
      medicine.name.brand.join(','),
      medicine.category,
      medicine.specification || '',
      medicine.pharmacyUnit || '',
      medicine.dosageAmount || '',
      medicine.dosageForm || '',
      medicine.administrationRoute || '',
      medicine.ingredients.join(','),
      medicine.indications.join(','),
      medicine.dosage,
      medicine.adverseReactions.join(','),
      medicine.contraindications.join(','),
      medicine.precautions.join(','),
      medicine.drugInteractions.join(','),
      medicine.shelfLife,
      medicine.approvalNumber,
      medicine.manufacturer,
      medicine.storageConditions
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    const fileName = `药品信息_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    
    res.send(csvContent);
    logMessage('导出药品信息成功', 'info');
  } catch (error) {
    logMessage(`导出药品信息失败: ${error.message}`, 'error');
    res.status(500).json({ message: '导出药品信息失败，请稍后重试' });
  }
});

// 获取单个药品
app.get('/api/medicines/:id', async (req, res) => {
  try {
    await db.read();
    const id = parseInt(req.params.id);
    const medicine = db.data.medicines.find(m => m.id === id);
    if (medicine) {
      res.json(medicine);
      logMessage(`获取药品ID: ${id} 成功`, 'info');
    } else {
      logMessage(`药品ID: ${id} 未找到`, 'warn');
      res.status(404).json({ message: '药品未找到' });
    }
  } catch (error) {
    logMessage(`获取单个药品失败: ${error.message}`, 'error');
    res.status(500).json({ message: '获取药品失败' });
  }
});

// 添加药品
app.post('/api/medicines', async (req, res) => {
  try {
    await db.read();
    const medicines = db.data.medicines;
    
    // 生成新的ID
    const newId = medicines.length > 0 ? Math.max(...medicines.map(m => m.id)) + 1 : 1;
    
    const newMedicine = {
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...req.body
    };
    
    medicines.push(newMedicine);
    await db.write();
    res.status(201).json(newMedicine);
    logMessage(`添加药品成功: ${newMedicine.name.generic}`, 'info');
  } catch (error) {
    logMessage(`添加药品失败: ${error.message}`, 'error');
    res.status(500).json({ message: '添加药品失败' });
  }
});

// 更新药品
app.put('/api/medicines/:id', async (req, res) => {
  try {
    await db.read();
    const id = parseInt(req.params.id);
    const index = db.data.medicines.findIndex(m => m.id === id);
    if (index !== -1) {
      const updatedMedicine = {
        ...db.data.medicines[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      db.data.medicines[index] = updatedMedicine;
      await db.write();
      res.json(updatedMedicine);
      logMessage(`更新药品ID: ${id} 成功`, 'info');
    } else {
      logMessage(`药品ID: ${id} 未找到，更新失败`, 'warn');
      res.status(404).json({ message: '药品未找到' });
    }
  } catch (error) {
    logMessage(`更新药品失败: ${error.message}`, 'error');
    res.status(500).json({ message: '更新药品失败' });
  }
});

// 删除药品
app.delete('/api/medicines/:id', async (req, res) => {
  try {
    await db.read();
    const id = parseInt(req.params.id);
    const index = db.data.medicines.findIndex(m => m.id === id);
    if (index !== -1) {
      const deletedMedicine = db.data.medicines[index];
      db.data.medicines.splice(index, 1);
      await db.write();
      res.json({ message: '药品删除成功' });
      logMessage(`删除药品成功: ${deletedMedicine.name.generic} (ID: ${id})`, 'info');
    } else {
      logMessage(`药品ID: ${id} 未找到，删除失败`, 'warn');
      res.status(404).json({ message: '药品未找到' });
    }
  } catch (error) {
    logMessage(`删除药品失败: ${error.message}`, 'error');
    res.status(500).json({ message: '删除药品失败' });
  }
});

// 新增：解析药品说明书URL - 增强版，包含错误处理和容错机制
app.get('/api/parse-drug-url', async (req, res) => {
  const { url } = req.query;
  
  logMessage(`收到URL解析请求: ${url}`, 'info');
  
  if (!url) {
    logMessage('URL解析请求失败：缺少URL参数', 'error');
    return res.status(400).json({ error: '缺少URL参数' });
  }
  
  // 验证URL格式
  const regex = /^https:\/\/www\.dayi\.org\.cn\/drug\/(\d+)\.html$/;
  const match = url.match(regex);
  if (!match) {
    logMessage(`URL解析请求失败：无效的URL格式 ${url}`, 'error');
    return res.status(400).json({ error: '无效的药品说明书URL格式，请参照示例：https://www.dayi.org.cn/drug/1017782.html' });
  }
  
  try {
    // 1. 直接从URL路径提取药品ID
    const drugId = match[1];
    logMessage(`提取到药品ID: ${drugId}`, 'info');
    
    // 2. 检查是否已有该药品的信息
    await db.read();
    const drugFromDB = db.data.medicines.find(med => 
      med.id === parseInt(drugId) || 
      med.name.generic.includes(drugId) ||
      med.name.brand.some(brand => brand.includes(drugId))
    );
    
    // 如果找到现有药品，直接返回
    if (drugFromDB) {
      logMessage('从本地数据库找到药品信息，直接返回', 'info');
      res.json(drugFromDB);
      return;
    }
    
    // 3. 尝试从URL获取药品说明书内容
    logMessage(`尝试爬取网页内容: ${url}`, 'info');
    
    let drugName = `药品${drugId}`;
    let html = null;
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000 // 缩短超时时间，提高响应速度
      });
      
      html = response.data;
      logMessage('成功获取网页内容', 'info');
      
      // 从页面标题提取药品名称
      const titleMatch = html.match(/<title>(.*?)_/);
      if (titleMatch) {
        drugName = titleMatch[1].trim();
        logMessage(`从标题提取到药品名称: ${drugName}`, 'info');
      }
    } catch (networkError) {
      logMessage(`网络请求失败: ${networkError.message}`, 'warn');
      logMessage('使用药品ID作为名称，生成药品信息', 'warn');
      // 网络请求失败时，使用药品ID作为名称继续执行
    }
    
    // 4. 检查是否有匹配的药品名称
    let existingDrug = db.data.medicines.find(med => 
      med.name.generic.includes(drugName) || 
      med.name.brand.some(brand => brand.includes(drugName))
    );
    
    // 如果找到现有药品，使用现有信息
    if (existingDrug) {
      logMessage('找到现有药品信息，使用现有数据', 'info');
      res.json(existingDrug);
      return;
    }
    
    // 5. 生成干净的结构化数据
    const generatedDrugInfo = {
      name: {
        generic: drugName,
        brand: [drugName]
      },
      category: '中成药',
      ingredients: [],
      indications: [],
      dosage: '',
      adverseReactions: [],
      contraindications: [],
      precautions: [],
      drugInteractions: [],
      shelfLife: 24,
      approvalNumber: '',
      manufacturer: '',
      storageConditions: ''
    };
    
    logMessage(`成功生成药品基本信息: ${generatedDrugInfo.name.generic}`, 'info');
    res.json(generatedDrugInfo);
  } catch (error) {
    logMessage(`解析药品URL失败: ${error.message}`, 'error');
    logMessage(`错误堆栈: ${error.stack}`, 'error');
    
    // 提供更友好的错误信息
    let errorMessage = '解析药品信息失败，请检查URL是否有效或稍后重试';
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = '无法连接到药品说明书网站，请检查网络连接或稍后重试';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请检查网络连接或稍后重试';
    } else if (error.response) {
      errorMessage = `服务器返回错误：${error.response.status} ${error.response.statusText}`;
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// 新增：解析药品说明书文本
app.post('/api/parse-drug-text', async (req, res) => {
  const { text } = req.body;
  
  logMessage('收到药品文本解析请求', 'info');
  
  if (!text) {
    logMessage('文本解析请求失败：缺少文本参数', 'error');
    return res.status(400).json({ error: '缺少药品说明书文本内容' });
  }
  
  try {
    logMessage(`收到的文本内容: ${text.substring(0, 200)}...`, 'info');
    
    // 1. 提取药品名称
    let genericName = '未知药品';
    let brandName = [''];
    
    const namePatterns = [
      { pattern: /【通用名称】([^【\r\n]+)/, type: 'generic' },
      { pattern: /通用名称[：:]([^\r\n]+)/, type: 'generic' },
      { pattern: /【药品名称】([^【\r\n]+)/, type: 'generic' },
      { pattern: /药品名称[：:]([^\r\n]+)/, type: 'generic' },
      { pattern: /【商品名称】([^【\r\n]+)/, type: 'brand' },
      { pattern: /商品名称[：:]([^\r\n]+)/, type: 'brand' }
    ];
    
    for (const patternObj of namePatterns) {
      const match = text.match(patternObj.pattern);
      if (match) {
        const extractedName = match[1].trim();
        logMessage(`提取到${patternObj.type === 'generic' ? '通用' : '商品'}名称: ${extractedName}`, 'info');
        
        if (patternObj.type === 'generic') {
          genericName = extractedName;
        } else {
          brandName = [extractedName];
        }
      }
    }
    
    if (genericName === '未知药品') {
      logMessage('未提取到通用名称，尝试从文本开头提取', 'warn');
      const firstLineMatch = text.match(/^[^\r\n]+/);
      if (firstLineMatch) {
        genericName = firstLineMatch[0].trim();
        brandName = [genericName];
        logMessage(`从文本开头提取到药品名称: ${genericName}`, 'info');
      }
    }
    
    // 2. 检查是否已有该药品的信息
    logMessage(`检查是否已有该药品的信息: ${genericName}`, 'info');
    await db.read();
    
    let existingDrug = db.data.medicines.find(med => 
      med.name.generic.includes(genericName) || 
      med.name.brand.some(brand => brand.includes(genericName)) ||
      (brandName[0] && med.name.brand.some(brand => brand.includes(brandName[0])))
    );
    
    // 3. 如果找到现有药品，使用现有信息
    if (existingDrug) {
      logMessage('找到现有药品信息，使用现有数据', 'info');
      res.json(existingDrug);
      return;
    }
    
    // 4. 从文本中提取其他结构化信息
    const parsedDrugInfo = {
      name: {
        generic: genericName,
        brand: brandName[0] ? brandName : [genericName]
      },
      category: '中成药',
      ingredients: [],
      indications: [],
      dosage: '',
      adverseReactions: [],
      contraindications: [],
      precautions: [],
      drugInteractions: [],
      shelfLife: 24,
      approvalNumber: '',
      manufacturer: '',
      storageConditions: ''
    };
    
    const extractionRules = {
      ingredients: { patterns: [/【主要成分】([^【]+)/, /主要成分[：:]([^\r\n]+)/], type: 'list', splitChar: /[、，,\r\n]/ },
      indications: { patterns: [/【适应症】([^【]+)/, /适应症[：:]([^\r\n]+)/, /【功能主治】([^【]+)/, /功能主治[：:]([^\r\n]+)/], type: 'list', splitChar: /[。；;\r\n]/ },
      dosage: { patterns: [/【用法用量】([^【]+)/, /用法用量[：:]([^\r\n]+)/], type: 'text' },
      adverseReactions: { patterns: [/【不良反应】([^【]+)/, /不良反应[：:]([^\r\n]+)/], type: 'list', splitChar: /[。；;\r\n]/ },
      contraindications: { patterns: [/【禁忌】([^【]+)/, /禁忌[：:]([^\r\n]+)/], type: 'list', splitChar: /[。；;\r\n]/ },
      precautions: { patterns: [/【注意事项】([^【]+)/, /注意事项[：:]([^\r\n]+)/], type: 'list', splitChar: /[。；;\r\n]/ },
      drugInteractions: { patterns: [/【药物相互作用】([^【]+)/, /药物相互作用[：:]([^\r\n]+)/], type: 'list', splitChar: /[。；;\r\n]/ },
      shelfLife: { patterns: [/【有效期】([^【]+)/, /有效期[：:]([^\r\n]+)/], type: 'number', regex: /(\d+)月/ },
      approvalNumber: { patterns: [/【批准文号】([^【]+)/, /批准文号[：:]([^\r\n]+)/], type: 'text' },
      manufacturer: { patterns: [/【生产企业】([^【]+)/, /生产企业[：:]([^\r\n]+)/, /【生产厂家】([^【]+)/, /生产厂家[：:]([^\r\n]+)/], type: 'text' },
      storageConditions: { patterns: [/【贮藏】([^【]+)/, /贮藏[：:]([^\r\n]+)/, /【储存条件】([^【]+)/, /储存条件[：:]([^\r\n]+)/], type: 'text' }
    };
    
    for (const [field, rule] of Object.entries(extractionRules)) {
      for (const pattern of rule.patterns) {
        const match = text.match(pattern);
        if (match) {
          let value = match[1].trim();
          
          if (rule.type === 'list') {
            parsedDrugInfo[field] = value.split(rule.splitChar).filter(item => item.trim());
          } else if (rule.type === 'number') {
            const numMatch = value.match(rule.regex);
            if (numMatch) {
              parsedDrugInfo[field] = parseInt(numMatch[1]);
            }
          } else {
            parsedDrugInfo[field] = value;
          }
          
          logMessage(`提取到${field}: ${JSON.stringify(parsedDrugInfo[field])}`, 'info');
          break;
        }
      }
    }
    
    logMessage(`成功解析药品文本，生成完整药品信息: ${parsedDrugInfo.name.generic}`, 'info');
    res.json(parsedDrugInfo);
  } catch (error) {
    logMessage(`解析药品文本失败: ${error.message}`, 'error');
    logMessage(`错误堆栈: ${error.stack}`, 'error');
    res.status(500).json({ error: '解析药品信息失败，请检查文本格式或稍后重试' });
  }
});

// AI智能体相关API

// 腾讯元器API配置
const TENCENT_YUANQI_CONFIG = {
  apiKey: process.env.TENCENT_YUANQI_API_KEY,
  agentId: process.env.TENCENT_YUANQI_AGENT_ID,
  apiUrl: process.env.TENCENT_YUANQI_API_URL
};

// 调用腾讯元器API的函数
const callTencentYuanqiAPI = async (question) => {
  try {
    logMessage(`调用腾讯元器API: ${question}`, 'info');
    
    // 构建请求数据
    const requestData = {
      agent_id: TENCENT_YUANQI_CONFIG.agentId,
      messages: [
        {
          role: 'user',
          content: question
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };
    
    // 发送请求 - 添加必要的请求头
    const response = await axios.post(TENCENT_YUANQI_CONFIG.apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TENCENT_YUANQI_CONFIG.apiKey}`,
        'X-Source': 'children-medicine-agent', // 添加X-Source请求头
        'X-App-ID': TENCENT_YUANQI_CONFIG.agentId // 添加应用ID请求头
      },
      timeout: 10000 // 设置10秒超时
    });
    
    // 处理响应
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const answer = response.data.choices[0].message.content;
      logMessage(`腾讯元器API返回: ${answer}`, 'info');
      return answer;
    } else {
      throw new Error('腾讯元器API返回格式异常');
    }
  } catch (error) {
    let errorMessage = '调用腾讯元器API失败';
    if (error.response) {
      // API返回错误状态码
      errorMessage += `: ${error.response.status} ${error.response.data?.error?.message || '未知错误'}`;
      // 记录完整的错误响应
      logMessage(`腾讯元器API错误响应: ${JSON.stringify(error.response.data)}`, 'error');
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage += ': 未收到API响应，请检查网络连接';
    } else {
      // 请求配置错误
      errorMessage += `: ${error.message}`;
    }
    logMessage(errorMessage, 'error');
    throw new Error(errorMessage);
  }
};

// 生成用药指导单的函数
const generateMedicationGuidance = (medicine) => {
  return `# 儿童中成药口服制剂用药指导单\n\n## 药品基本信息\n\n### 通用名称\n${medicine.name.generic}\n\n### 商品名称\n${medicine.name.brand.join('、')}\n\n### 药品编码\n${medicine.drugCode}\n\n### 规格\n${medicine.specification}\n\n### 剂型\n${medicine.dosageForm}\n\n## 成分\n${medicine.ingredients.join('、')}\n\n## 适应症\n${medicine.indications.join('\n\n')}\n\n## 用法用量\n${medicine.dosage}\n\n## 不良反应\n${medicine.adverseReactions.join('\n\n')}\n\n## 禁忌症\n${medicine.contraindications.join('\n\n')}\n\n## 注意事项\n${medicine.precautions.join('\n\n')}\n\n## 药物相互作用\n${medicine.drugInteractions.join('\n\n')}\n\n## 储存条件\n${medicine.storageConditions}\n\n## 有效期\n${medicine.shelfLife}个月\n\n## 生产企业\n${medicine.manufacturer}\n\n---\n\n**温馨提示**：\n1. 请严格按照医嘱或药品说明书使用\n2. 如出现不良反应，请立即停止使用并就医\n3. 请将药品放在儿童无法接触的地方\n4. 用药前请仔细阅读药品说明书\n5. 如有疑问，请咨询医师或药师\n\n**生成时间**：${new Date().toLocaleString()}`;
};

// 智能体回答生成函数 - 优先使用腾讯元器API（如果配置正确）
const generateAgentResponse = async (userQuestion, medicines) => {
  // 检查腾讯元器API配置是否有效
  const isYuanqiConfigValid = TENCENT_YUANQI_CONFIG.apiKey && 
                             TENCENT_YUANQI_CONFIG.apiKey !== 'your_api_key_here' && 
                             TENCENT_YUANQI_CONFIG.agentId && 
                             TENCENT_YUANQI_CONFIG.apiUrl;
  
  if (isYuanqiConfigValid) {
    try {
      // 尝试调用腾讯元器API
      return await callTencentYuanqiAPI(userQuestion);
    } catch (error) {
      logMessage(`腾讯元器API调用失败，使用本地备用逻辑: ${error.message}`, 'warn');
    }
  } else {
    logMessage('腾讯元器API配置无效，使用本地备用逻辑', 'info');
  }
  
  // 本地备用逻辑 - 改进的关键词匹配
  const question = userQuestion.toLowerCase();
  
  // 提取问题中的药品名称
  let targetMedicine = null;
  
  // 检查是否是请求用药指导单
  const isGuidanceRequest = question.includes('用药指导单') || question.includes('用药指导');
  
  // 尝试根据药品名称精确匹配
  for (const medicine of medicines) {
    const genericName = medicine.name.generic.toLowerCase();
    const brandNames = medicine.name.brand.map(b => b.toLowerCase());
    
    // 检查问题是否包含药品的通用名或商品名
    if (question.includes(genericName) || brandNames.some(brand => question.includes(brand))) {
      targetMedicine = medicine;
      break;
    }
  }
  
  // 针对用药指导单请求的特殊处理
  if (isGuidanceRequest) {
    if (targetMedicine) {
      return generateMedicationGuidance(targetMedicine);
    } else {
      return `未找到您提到的药品信息，无法生成用药指导单。请提供准确的药品名称。`;
    }
  }
  
  // 如果没有精确匹配，查找相关药品
  const relatedMedicines = medicines.filter(medicine => {
    const medicineInfo = `${medicine.name.generic} ${medicine.name.brand.join(' ')} ${medicine.indications.join(' ')} ${medicine.ingredients.join(' ')}`.toLowerCase();
    return medicineInfo.includes(question) || medicine.category === '儿童中成药';
  });
  
  // 更智能的药品选择逻辑
  let selectedMedicine = targetMedicine;
  
  // 如果没有找到目标药品，尝试根据适应症匹配
  if (!selectedMedicine && relatedMedicines.length > 0) {
    // 计算每个药品与问题的相关性得分
    const scoredMedicines = relatedMedicines.map(medicine => {
      let score = 0;
      
      // 适应症匹配得分
      medicine.indications.forEach(indication => {
        if (indication.toLowerCase().includes(question)) {
          score += 5;
        }
      });
      
      // 成分匹配得分
      medicine.ingredients.forEach(ingredient => {
        if (ingredient.toLowerCase().includes(question)) {
          score += 3;
        }
      });
      
      // 名称匹配得分
      if (medicine.name.generic.toLowerCase().includes(question)) {
        score += 10;
      }
      
      return { medicine, score };
    });
    
    // 按得分降序排序
    scoredMedicines.sort((a, b) => b.score - a.score);
    
    // 选择得分最高且得分大于0的药品
    selectedMedicine = scoredMedicines[0].score > 0 ? scoredMedicines[0].medicine : null;
  }
  
  // 根据问题类型生成回答
  if (question.includes('成分') || question.includes('组成')) {
    if (selectedMedicine) {
      return `药品${selectedMedicine.name.generic}的主要成分包括：${selectedMedicine.ingredients.join('、')}。`;
    } else {
      return '未找到相关药品的成分信息，请提供更具体的药品名称。';
    }
  } else if (question.includes('适应症') || question.includes('功能') || question.includes('主治')) {
    if (selectedMedicine) {
      return `药品${selectedMedicine.name.generic}的适应症包括：${selectedMedicine.indications.join('。')}。`;
    } else {
      return '未找到相关药品的适应症信息，请提供更具体的药品名称。';
    }
  } else if (question.includes('用法') || question.includes('用量') || question.includes('服用')) {
    if (selectedMedicine) {
      return `药品${selectedMedicine.name.generic}的用法用量为：${selectedMedicine.dosage}。`;
    } else {
      return '未找到相关药品的用法用量信息，请提供更具体的药品名称。';
    }
  } else if (question.includes('禁忌') || question.includes('不能')) {
    if (selectedMedicine) {
      return `药品${selectedMedicine.name.generic}的禁忌症包括：${selectedMedicine.contraindications.join('。')}。`;
    } else {
      return '未找到相关药品的禁忌症信息，请提供更具体的药品名称。';
    }
  } else if (question.includes('注意') || question.includes('慎用')) {
    if (selectedMedicine) {
      return `药品${selectedMedicine.name.generic}的注意事项包括：${selectedMedicine.precautions.join('。')}。`;
    } else {
      return '未找到相关药品的注意事项信息，请提供更具体的药品名称。';
    }
  } else if (question.includes('不良反应') || question.includes('副作用')) {
    if (selectedMedicine) {
      return `药品${selectedMedicine.name.generic}的不良反应包括：${selectedMedicine.adverseReactions.join('。')}。`;
    } else {
      return '未找到相关药品的不良反应信息，请提供更具体的药品名称。';
    }
  } else {
    // 通用回答
    if (selectedMedicine) {
      return `关于${selectedMedicine.name.generic}的信息：\n- 成分：${selectedMedicine.ingredients.join('、')}\n- 适应症：${selectedMedicine.indications.join('。')}\n- 用法用量：${selectedMedicine.dosage}\n- 禁忌症：${selectedMedicine.contraindications.join('。')}\n- 注意事项：${selectedMedicine.precautions.join('。')}`;
    } else {
      return '未找到相关药品信息，请提供更具体的药品名称或问题。\n\n您可以尝试询问：\n- 小儿感冒颗粒的成分是什么？\n- 儿童感冒发烧应该吃什么药？\n- 小儿止咳糖浆的用法用量？';
    }
  }
};

// 智能体问答API
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: '请输入您的问题' });
    }
    
    logMessage(`收到智能体问答请求：${question}`, 'info');
    
    // 生成回答（异步调用）
    const response = await generateAgentResponse(question, db);
    
    logMessage(`智能体回答：${response}`, 'info');
    
    res.json({
      question: question,
      answer: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logMessage(`智能体问答失败：${error.message}`, 'error');
    res.status(500).json({ error: '智能体回答生成失败，请稍后重试' });
  }
});

// 智能体药品推荐API
app.get('/api/agent/recommend', async (req, res) => {
  try {
    const { indication } = req.query;
    
    if (!indication || indication.trim() === '') {
      return res.status(400).json({ error: '请提供适应症' });
    }
    
    logMessage(`收到智能体药品推荐请求：${indication}`, 'info');
    await db.read();
    
    // 根据适应症推荐药品
    const recommendedMedicines = db.data.medicines.filter(medicine => {
      return medicine.category === '儿童中成药' && 
             medicine.indications.some(ind => ind.toLowerCase().includes(indication.toLowerCase()));
    });
    
    logMessage(`推荐药品数量：${recommendedMedicines.length}`, 'info');
    
    res.json({
      indication: indication,
      recommendedMedicines: recommendedMedicines,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logMessage(`智能体药品推荐失败：${error.message}`, 'error');
    res.status(500).json({ error: '药品推荐失败，请稍后重试' });
  }
});

const distPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 启动服务器
let server = null;

const startServer = async () => {
  try {
    // 初始化数据库
    db = await initDatabase();
    logMessage('数据库初始化成功', 'info');
    
    server = app.listen(PORT, () => {
      const startMessage = `服务器运行在 http://localhost:${PORT}`;
      logMessage(startMessage, 'info');
      console.log(startMessage);
    });

    // 处理服务器错误
    server.on('error', (error) => {
      logMessage(`服务器错误: ${error.message}`, 'error');
      if (error.code === 'EADDRINUSE') {
        logMessage(`端口 ${PORT} 已被占用，将在5秒后尝试重启...`, 'warn');
        setTimeout(() => {
          startServer();
        }, 5000);
      } else {
        logMessage(`服务器意外错误，将在5秒后尝试重启...`, 'error');
        setTimeout(() => {
          startServer();
        }, 5000);
      }
    });

    // 处理连接超时
    server.on('timeout', (socket) => {
      logMessage('客户端连接超时，已断开', 'warn');
      socket.end();
    });

  } catch (error) {
    logMessage(`启动服务器失败: ${error.message}`, 'error');
    logMessage(`将在5秒后尝试重新启动...`, 'info');
    setTimeout(() => {
      startServer();
    }, 5000);
  }
};

// 启动服务器
startServer();

// 处理进程终止信号
process.on('SIGTERM', () => {
  logMessage('收到SIGTERM信号，正在关闭服务器...', 'info');
  if (server) {
    server.close(() => {
      logMessage('服务器已关闭', 'info');
      process.exit(0);
    });
  }
});

process.on('SIGINT', () => {
  logMessage('收到SIGINT信号，正在关闭服务器...', 'info');
  if (server) {
    server.close(() => {
      logMessage('服务器已关闭', 'info');
      process.exit(0);
    });
  }
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logMessage(`未捕获的异常: ${error.message}`, 'error');
  logMessage(`错误堆栈: ${error.stack}`, 'error');
  logMessage('服务器将在5秒后重启...', 'info');
  
  setTimeout(() => {
    // 重启服务器
    if (server) {
      server.close(() => {
        startServer();
      });
    } else {
      startServer();
    }
  }, 5000);
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logMessage(`未处理的Promise拒绝: ${reason}`, 'error');
  logMessage(`Promise: ${promise}`, 'error');
});
