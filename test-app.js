const http = require('http');

// Test backend API endpoints
const testEndpoints = async () => {
  console.log('=== 测试应用功能 ===');
  console.log(`测试时间: ${new Date().toISOString()}`);
  
  // 定义要测试的API端点
  const endpoints = [
    { name: '获取药品分类', url: 'http://localhost:5000/api/medicines/categories' },
    { name: '获取药品列表', url: 'http://localhost:5000/api/medicines?page=1&search=&category=&indication=' },
    { name: '测试URL解析功能', url: 'http://localhost:5000/api/parse-drug-url?url=https://www.dayi.org.cn/drug/1017782.html' }
  ];
  
  // 测试前端应用是否可访问
  endpoints.push({ name: '前端应用访问', url: 'http://localhost:3000/' });
  
  // 测试每个端点
  for (const endpoint of endpoints) {
    console.log(`\n--- ${endpoint.name} ---`);
    console.log(`请求URL: ${endpoint.url}`);
    
    try {
      await testEndpoint(endpoint.url);
    } catch (error) {
      console.error('❌ 测试失败:', error.message);
    }
  }
};

// 测试单个API端点
const testEndpoint = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ 状态码: ${res.statusCode}`);
        console.log(`   响应头: ${res.headers['content-type']}`);
        
        // 尝试解析JSON数据
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          try {
            const jsonData = JSON.parse(data);
            if (Array.isArray(jsonData)) {
              console.log(`   响应数据: 数组，长度 ${jsonData.length}`);
            } else if (typeof jsonData === 'object') {
              console.log(`   响应数据: 对象，包含 ${Object.keys(jsonData).length} 个属性`);
            }
          } catch (error) {
            console.log('   响应数据: 无效JSON');
          }
        } else {
          // 对于HTML响应，只显示长度
          console.log(`   响应数据: HTML，长度 ${data.length} 字符`);
        }
        resolve();
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
};

// 运行测试
testEndpoints().then(() => {
  console.log('\n=== 测试完成 ===');
}).catch((error) => {
  console.error('\n❌ 测试过程中发生错误:', error.message);
  console.log('=== 测试完成 ===');
});
