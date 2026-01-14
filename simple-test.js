const http = require('http');

// 简单测试API
const url = 'http://localhost:5000/api/parse-drug-url?url=https://www.dayi.org.cn/drug/1017782.html';

http.get(url, (res) => {
  let data = '';

  // 接收数据
  res.on('data', (chunk) => {
    data += chunk;
  });

  // 数据接收完成
  res.on('end', () => {
    console.log('HTTP状态码:', res.statusCode);
    console.log('响应头:', res.headers['content-type']);
    console.log('\n原始响应数据:');
    console.log(data);
    
    // 尝试解析JSON
    try {
      const parsedData = JSON.parse(data);
      console.log('\n解析后的JSON数据:');
      console.log(JSON.stringify(parsedData, null, 2));
      
      // 检查数据质量
      console.log('\n数据质量检查:');
      console.log('药品名称:', parsedData.name?.generic || '未找到');
      console.log('是否包含HTML标签:', /<[^>]+>/.test(JSON.stringify(parsedData)));
      console.log('剂量字段:', parsedData.dosage || '空');
    } catch (error) {
      console.error('JSON解析失败:', error.message);
    }
  });

}).on('error', (error) => {
  console.error('请求失败:', error.message);
});
