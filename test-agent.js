const http = require('http');

// 测试智能体问答API
function testAgentChat(question) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ question: question });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/agent/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      console.log(`状态码: ${res.statusCode}`);
      console.log(`响应头: ${JSON.stringify(res.headers)}`);
      
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      
      res.on('end', () => {
        console.log(`原始响应数据: ${rawData}`);
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          reject(new Error(`解析JSON失败: ${e.message}`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(new Error(`请求遇到问题: ${e.message}`));
    });
    
    // 发送请求体
    req.write(postData);
    req.end();
  });
}

// 测试智能体药品推荐API
function testAgentRecommend(indication) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/agent/recommend?indication=${encodeURIComponent(indication)}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, res => {
      let responseData = '';
      
      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(new Error(`解析响应失败: ${error.message}`));
        }
      });
    });

    req.on('error', error => {
      reject(new Error(`请求失败: ${error.message}`));
    });

    req.end();
  });
}

// 运行测试
async function runTests() {
  console.log('=== 开始测试儿童中成药口服制剂智能体 ===\n');
  
  try {
    // 测试1: 查询药品成分
    console.log('测试1: 查询小儿感冒颗粒的成分');
    const result1 = await testAgentChat('小儿感冒颗粒的成分是什么？');
    console.log(`问题: ${result1.question}`);
    console.log(`回答: ${result1.answer}\n`);
    
    // 测试2: 查询用法用量
    console.log('测试2: 查询小儿止咳糖浆的用法用量');
    const result2 = await testAgentChat('小儿止咳糖浆的用法用量是什么？');
    console.log(`问题: ${result2.question}`);
    console.log(`回答: ${result2.answer}\n`);
    
    // 测试3: 查询禁忌症
    console.log('测试3: 查询小儿七星茶颗粒的禁忌症');
    const result3 = await testAgentChat('小儿七星茶颗粒的禁忌症是什么？');
    console.log(`问题: ${result3.question}`);
    console.log(`回答: ${result3.answer}\n`);
    
    // 测试4: 查询注意事项
    console.log('测试4: 查询小儿健胃消食片的注意事项');
    const result4 = await testAgentChat('小儿健胃消食片的注意事项是什么？');
    console.log(`问题: ${result4.question}`);
    console.log(`回答: ${result4.answer}\n`);
    
    // 测试5: 药品推荐
    console.log('测试5: 推荐感冒用药');
    const result5 = await testAgentRecommend('感冒');
    console.log(`适应症: ${result5.indication}`);
    console.log(`推荐药品数量: ${result5.recommendedMedicines.length}`);
    result5.recommendedMedicines.forEach((medicine, index) => {
      console.log(`  ${index + 1}. ${medicine.name.generic} - ${medicine.indications.join('。')}`);
    });
    console.log('');
    
    // 测试6: 通用问题
    console.log('测试6: 通用问题查询');
    const result6 = await testAgentChat('小儿柴桂退热颗粒');
    console.log(`问题: ${result6.question}`);
    console.log(`回答: ${result6.answer}\n`);
    
    console.log('=== 所有测试完成 ===');
  } catch (error) {
    console.error(`测试失败: ${error.message}`);
  }
}

// 执行测试
runTests();
