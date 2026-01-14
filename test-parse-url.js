const http = require('http');

// 测试URL解析功能
const testUrl = 'https://www.dayi.org.cn/drug/1017782.html';
const apiUrl = `http://localhost:5000/api/parse-drug-url?url=${encodeURIComponent(testUrl)}`;

console.log(`测试URL解析功能，API请求URL: ${apiUrl}`);
console.log(`测试时间: ${new Date().toISOString()}`);

http.get(apiUrl, (res) => {
  let data = '';

  // 接收数据
  res.on('data', (chunk) => {
    data += chunk;
  });

  // 数据接收完成
  res.on('end', () => {
    console.log('HTTP状态码:', res.statusCode);
    console.log('响应头:', res.headers['content-type']);
    console.log('\n响应数据:');
    
    try {
      const parsedData = JSON.parse(data);
      console.log(JSON.stringify(parsedData, null, 2));
      
      // 检查响应结果
      if (parsedData.error) {
        console.log('\n❌ 解析失败，但返回了友好的错误信息:', parsedData.error);
      } else {
        console.log('\n✅ 解析成功! 返回了药品信息，药品名称:', parsedData.name?.generic);
      }
    } catch (error) {
      console.error('\n❌ JSON解析失败:', error.message);
      console.error('原始响应数据:', data);
    }
  });

}).on('error', (error) => {
  console.error('\n❌ 请求失败:', error.message);
});
