const http = require('http');

// 测试腾讯元器智能体集成
const testQuestions = [
  '小儿感冒颗粒的成分是什么？',
  '小儿止咳糖浆的用法用量是什么？',
  '儿童感冒发烧应该吃什么药？',
  '小儿七星茶颗粒有什么注意事项？'
];

// 发送测试请求的函数
const sendTestRequest = (question) => {
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
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve({
            question: question,
            answer: parsedData.answer,
            status: 'success'
          });
        } catch (e) {
          reject(new Error(`解析响应失败: ${e.message}`));
        }
      });
    });
    
    req.on('error', (e) => {
      reject(new Error(`请求失败: ${e.message}`));
    });
    
    req.write(postData);
    req.end();
  });
};

// 运行所有测试
const runTests = async () => {
  console.log('=== 测试腾讯元器智能体集成 ===\n');
  
  for (const question of testQuestions) {
    console.log(`测试问题: ${question}`);
    try {
      const result = await sendTestRequest(question);
      console.log(`回答: ${result.answer}`);
      console.log('状态: ✅ 成功');
    } catch (error) {
      console.log(`错误: ${error.message}`);
      console.log('状态: ❌ 失败');
    }
    console.log('---\n');
  }
  
  console.log('=== 测试完成 ===');
};

// 执行测试
runTests();
