import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TestMedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/medicines');
        console.log('直接API请求成功，返回', response.data.medicines.length, '种药品');
        setMedicines(response.data.medicines);
        setLoading(false);
      } catch (err) {
        console.error('直接API请求失败:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <div>
      <h1>测试药品列表</h1>
      <div>共找到 {medicines.length} 种药品</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {medicines.map(med => (
          <div key={med.id} style={{ 
            background: 'white', 
            padding: '15px', 
            border: '1px solid #ccc', 
            borderRadius: '8px' 
          }}>
            <h3>{med.name.generic}</h3>
            <p>分类: {med.category}</p>
            <p>剂型: {med.dosageForm}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestMedicineList;