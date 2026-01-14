import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 简单获取药品列表，无筛选条件
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/medicines');
      console.log('获取药品成功，共', res.data.medicines.length, '种药品');
      setMedicines(res.data.medicines);
      setError(null);
    } catch (err) {
      console.error('获取药品失败:', err);
      setError('获取药品列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <div className="container">
      <div className="feature-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="page-title">药品列表</h2>
          <div style={{ color: '#333', fontWeight: 'bold' }}>共找到 {medicines.length} 种药品</div>
          <Link to="/add" className="btn btn-primary">添加药品</Link>
        </div>

        {/* 简单药品列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>加载中...</div>
        ) : error ? (
          <div style={{ color: 'red', textAlign: 'center', padding: '20px', background: '#fff3f3', borderRadius: '8px', marginBottom: '20px' }}>
            {error}
            <button onClick={fetchMedicines} style={{ marginLeft: '10px', padding: '5px 15px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              重试
            </button>
          </div>
        ) : medicines.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>暂无药品数据</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {medicines.map((medicine) => (
              <div key={medicine.id} style={{
                background: 'white',
                padding: '20px',
                border: '1px solid #e8e8e8',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#1890ff' }}>{medicine.name.generic}</h3>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  <strong>商品名:</strong> {medicine.name.brand?.join(', ') || '无'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  <strong>分类:</strong> {medicine.category || '无'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  <strong>剂型:</strong> {medicine.dosageForm || '无'}
                </p>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  <strong>规格:</strong> {medicine.specification || '无'}
                </p>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link to={`/medicine/${medicine.id}`} style={{ 
                    padding: '6px 12px', 
                    background: '#1890ff', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '4px', 
                    fontSize: '14px'
                  }}>
                    查看详情
                  </Link>
                  <Link to={`/edit/${medicine.id}`} style={{ 
                    padding: '6px 12px', 
                    background: '#52c41a', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '4px', 
                    fontSize: '14px'
                  }}>
                    编辑
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineList;