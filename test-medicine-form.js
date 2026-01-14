const http = require('http');
const https = require('https');

// 模拟药品说明书文本
const testMedicineText = `【通用名称】小儿感冒颗粒
【商品名称】小儿氨酚黄那敏颗粒
【主要成分】对乙酰氨基酚、马来酸氯苯那敏、人工牛黄
【适应症】缓解儿童普通感冒及流行性感冒引起的发热、头痛、四肢酸痛、打喷嚏、流鼻涕、鼻塞、咽痛等症状
【用法用量】1-3岁：一次0.5-1袋，一日3次；4-6岁：一次1-1.5袋，一日3次；7-9岁：一次1.5-2袋，一日3次；10-12岁：一次2-2.5袋，一日3次；用温水冲服。
【不良反应】有时有轻度头晕、乏力、恶心、上腹不适、口干、食欲缺乏和皮疹等，可自行恢复。
【禁忌】严重肝肾功能不全者禁用。
【注意事项】用药3-7天，症状未缓解，请咨询医师或药师。
【药物相互作用】与其他解热镇痛药同用，可增加肾毒性的危险。
【有效期】24个月
【批准文号】国药准字H11022051
【生产企业】北京同仁堂股份有限公司同仁堂制药厂
【贮藏】密封，在阴凉干燥处保存（不超过20℃）`;

// 测试药品文本解析功能
const testTextParsing = () => {
  console.log('=== 测试药品文本解析功能 ===');
  console.log(`测试时间: ${new Date().toISOString()}`);
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/parse-drug-text',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify({ text: testMedicineText }))
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✅ 状态码: ${res.statusCode}`);
      console.log(`   响应头: ${res.headers['content-type']}`);
      
      try {
        const jsonData = JSON.parse(data);
        console.log(`   响应数据: 对象，包含 ${Object.keys(jsonData).length} 个属性`);
        console.log(`   解析结果: 药品名称 "${jsonData.name.generic}"`);
        console.log(`   提取的成分: ${jsonData.ingredients.join(', ')}`);
        console.log(`   提取的适应症: ${jsonData.indications[0]}`);
        
        console.log('\n✅ 文本解析功能测试通过!');
      } catch (error) {
        console.error('❌ 解析JSON响应失败:', error.message);
        console.error('   原始响应:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ 测试失败:', error.message);
  });
  
  req.write(JSON.stringify({ text: testMedicineText }));
  req.end();
};

// 测试前端路由功能
const testFrontendRoutes = async () => {
  console.log('\n=== 测试前端路由功能 ===');
  
  const routes = [
    { name: '首页', path: '/' },
    { name: '添加药品页面', path: '/add' },
    { name: '儿童中成药剂量计算器', path: '/chinese-medicine-calculator' },
    { name: 'RUCAM肝损伤评估', path: '/rucam-calculator' }
  ];
  
  for (const route of routes) {
    console.log(`\n--- ${route.name} ---`);
    console.log(`请求URL: http://localhost:3000${route.path}`);
    
    try {
      await testEndpoint(`http://localhost:3000${route.path}`);
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
        console.log(`   响应头: ${res.headers['content-type'] || 'N/A'}`);
        
        // 对于HTML响应，只显示长度和是否包含关键元素
        if (!res.headers['content-type'] || res.headers['content-type'].includes('text/html')) {
          console.log(`   响应数据: HTML，长度 ${data.length} 字符`);
          console.log(`   包含根元素: ${data.includes('<div id="root">') ? '是' : '否'}`);
        }
        resolve();
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
};

// 运行测试
testTextParsing();
testFrontendRoutes().then(() => {
  console.log('\n=== 所有测试完成 ===');
}).catch((error) => {
  console.error('\n❌ 测试过程中发生错误:', error.message);
  console.log('=== 测试完成 ===');
});
