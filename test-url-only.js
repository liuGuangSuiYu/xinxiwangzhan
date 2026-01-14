const axios = require('axios');

// 简单测试URL解析功能
async function testUrlParsing() {
  try {
    const url = 'https://www.dayi.org.cn/drug/1017782.html';
    console.log(`\n=== 测试URL解析: ${url} ===`);
    
    // 直接测试，不使用cheerio解析
    const response = await axios.get('http://localhost:5000/api/parse-drug-url', {
      params: { url },
      timeout: 15000
    });
    
    console.log('✅ URL解析请求成功!');
    console.log('状态码:', response.status);
    console.log('\n返回的数据:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // 检查数据质量
    console.log('\n=== 数据质量检查 ===');
    console.log('药品名称:', response.data.name?.generic || '未找到');
    console.log('是否包含HTML标签:', /<[^>]+>/.test(JSON.stringify(response.data)));
    console.log('成分列表:', response.data.ingredients || '[]');
    console.log('适应症列表:', response.data.indications || '[]');
    
  } catch (error) {
    console.error('❌ URL解析失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求发送成功，但未收到响应');
    } else {
      console.error('请求配置错误:', error.message);
    }
  }
}

// 运行测试
testUrlParsing();
