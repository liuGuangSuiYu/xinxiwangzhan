const axios = require('axios');

// 测试URL解析功能
async function testUrlParsing() {
  try {
    const url = 'https://www.dayi.org.cn/drug/1017782.html';
    console.log(`测试URL解析: ${url}`);
    
    const response = await axios.get('http://localhost:5000/api/parse-drug-url', {
      params: { url },
      timeout: 15000
    });
    
    console.log('URL解析成功! 结果:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('URL解析失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 测试文本解析功能
async function testTextParsing() {
  try {
    const testText = `【通用名称】小儿感冒颗粒
【商品名称】小儿氨酚黄那敏颗粒
【主要成分】对乙酰氨基酚、马来酸氯苯那敏、人工牛黄
【适应症】缓解儿童普通感冒及流行性感冒引起的发热、头痛、四肢酸痛、打喷嚏、流鼻涕、鼻塞、咽痛等症状
【用法用量】1-3岁：一次0.5-1袋，一日3次；4-6岁：一次1-1.5袋，一日3次；7-9岁：一次1.5-2袋，一日3次；10-12岁：一次2-2.5袋，一日3次；用温水冲服。`;
    
    console.log('\n测试文本解析:');
    
    const response = await axios.post('http://localhost:5000/api/parse-drug-text', {
      text: testText
    });
    
    console.log('文本解析成功! 结果:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('文本解析失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
async function runTests() {
  console.log('开始测试药品信息提取API...');
  await testUrlParsing();
  await testTextParsing();
  console.log('\n测试完成!');
}

runTests();
