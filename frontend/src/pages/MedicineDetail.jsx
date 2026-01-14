import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const MedicineDetail = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取药品详情
  useEffect(() => {
    const fetchMedicine = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/medicines/${id}`);
        setMedicine(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch medicine details');
        setLoading(false);
      }
    };
    fetchMedicine();
  }, [id]);

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!medicine) return <div className="error">药品不存在</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>药品详情</h2>
        <div className="action-buttons">
          <Link to={`/edit/${medicine._id}`} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', color: 'white' }}>
            编辑
          </Link>
          <Link to="/" className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', color: 'white' }}>
            返回列表
          </Link>
        </div>
      </div>

      {/* 基本信息卡片 */}
      <div className="card">
        <h3>基本信息</h3>
        
        <div className="medicine-info"><strong>通用名:</strong> {medicine.name.generic}</div>
        
        {medicine.name.brand.length > 0 && (
          <div className="medicine-info"><strong>商品名:</strong> {medicine.name.brand.join(', ')}</div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '12px 0' }}>
          <div className="medicine-info"><strong>药品编码:</strong> {medicine.drugCode || '未提供'}</div>
          <div className="medicine-info"><strong>拼音码:</strong> {medicine.pinyinCode || '未提供'}</div>
          <div className="medicine-info"><strong>分类:</strong> {medicine.category}</div>
          <div className="medicine-info"><strong>剂型:</strong> {medicine.dosageForm || '未提供'}</div>
          <div className="medicine-info"><strong>规格:</strong> {medicine.specification || '未提供'}</div>
          <div className="medicine-info"><strong>药房单位:</strong> {medicine.pharmacyUnit || '未提供'}</div>
          <div className="medicine-info"><strong>剂量:</strong> {medicine.dosageAmount || '未提供'}</div>
          <div className="medicine-info"><strong>用药途径:</strong> {medicine.administrationRoute || '未提供'}</div>
        </div>
        
        <div className="medicine-info"><strong>生产厂家:</strong> {medicine.manufacturer || '未提供'}</div>
        <div className="medicine-info"><strong>批准文号:</strong> {medicine.approvalNumber || '未提供'}</div>
        <div className="medicine-info"><strong>有效期:</strong> {medicine.shelfLife}个月</div>
        <div className="medicine-info"><strong>储存条件:</strong> {medicine.storageConditions || '未提供'}</div>
      </div>

      {/* 主要成分 */}
      <div className="card">
        <h3>主要成分</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
          {medicine.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>

      {/* 适应症 */}
      <div className="card">
        <h3>适应症</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
          {medicine.indications.map((indication, index) => (
            <li key={index}>{indication}</li>
          ))}
        </ul>
      </div>

      {/* 用法用量 */}
      <div className="card">
        <h3>用法用量</h3>
        <p>{medicine.dosage}</p>
      </div>

      {/* 不良反应 */}
      <div className="card">
        <h3>不良反应</h3>
        {medicine.adverseReactions.length > 0 ? (
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
            {medicine.adverseReactions.map((reaction, index) => (
              <li key={index}>{reaction}</li>
            ))}
          </ul>
        ) : (
          <p>未提供</p>
        )}
      </div>

      {/* 禁忌事项 */}
      <div className="card">
        <h3>禁忌事项</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
          {medicine.contraindications.map((contraindication, index) => (
            <li key={index}>{contraindication}</li>
          ))}
        </ul>
      </div>

      {/* 注意事项 */}
      <div className="card">
        <h3>注意事项</h3>
        {medicine.precautions.length > 0 ? (
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
            {medicine.precautions.map((precaution, index) => (
              <li key={index}>{precaution}</li>
            ))}
          </ul>
        ) : (
          <p>未提供</p>
        )}
      </div>

      {/* 药物相互作用 */}
      <div className="card">
        <h3>药物相互作用</h3>
        {medicine.drugInteractions.length > 0 ? (
          <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
            {medicine.drugInteractions.map((interaction, index) => (
              <li key={index}>{interaction}</li>
            ))}
          </ul>
        ) : (
          <p>未提供</p>
        )}
      </div>
    </div>
  );
};

export default MedicineDetail;
