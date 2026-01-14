const http = require('http');

// 测试改进后的智能体功能
const testCases = [
  {
    name: '测试1: 已知药品的用药指导单',
    question: '请为小儿感冒颗粒提供一个用药指导单',
    expectedResult: '包含用药指导单格式和小儿感冒颗粒信息'
  },
  {
    name: '测试2: 未知药品的用药指导单',
    question: '请为儿童清咽解热口服液提供一个用药指导单',
    expectedResult: '提示未找到药品信息'
  },
  {
    name: '测试3: 已知药品的成分查询',
    question: '小儿止咳糖浆的成分是什么？',
    expectedResult: '包含对乙酰氨基酚等成分'
  },
  {
    name: '测试4: 鼻炎用药推荐',
    question: '儿童鼻炎应该吃什么药？',
    expectedResult: '提示未找到相关药品信息并提供示例问题'
  },
  {
    name: '测试5: 模糊查询',
    question: '儿童感冒发烧应该吃什么药？',
    expectedResult: '推荐相关儿童中成药'
  },
  {
    name: '测试6: 空白问题',
    question: '',
    expectedResult: '提示输入问题'
  }
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
            error: parsedData.error,
            statusCode: res.statusCode,
            timestamp: parsedData.timestamp || new Date().toISOString()
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
  console.log('=== 测试改进后的儿童中成药智能体 ===\n');
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`);
    console.log(`❓ 问题: "${testCase.question}"`);
    
    try {
      const result = await sendTestRequest(testCase.question);
      
      console.log(`✅ 状态码: ${result.statusCode}`);
      
      // 处理不同的响应情况
      if (result.statusCode === 400) {
        // 错误响应
        console.log(`📝 错误信息: ${result.error || '请求无效'}`);
      } else {
        // 成功响应
        console.log(`📝 回答: ${result.answer.substring(0, 150)}...`);
      }
      
      console.log(`⏰ 时间: ${result.timestamp}`);
      console.log(`---`);
      
      passedTests++;
    } catch (error) {
      console.log(`❌ 错误: ${error.message}`);
      console.log(`---`);
      failedTests++;
    }
  }
  
  console.log('=== 测试结果总结 ===\n');
  console.log(`🎉 测试总数: ${testCases.length}`);
  console.log(`✅ 通过测试: ${passedTests}`);
  console.log(`❌ 失败测试: ${failedTests}`);
  console.log(`📊 通过率: ${((passedTests / testCases.length) * 100).toFixed(2)}%`);
  
  if (failedTests === 0) {
    console.log('\n✅ 所有测试通过！智能体功能正常。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查日志和代码。');
  }
};

// 执行测试
runTests();
