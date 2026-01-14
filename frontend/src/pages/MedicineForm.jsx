import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MedicineForm = () => {
  const navigate = useNavigate();

  // 状态管理
  const [instructionUrl, setInstructionUrl] = useState('');
  const [instructionText, setInstructionText] = useState('');
  const [parsedDrugInfo, setParsedDrugInfo] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [validation, setValidation] = useState({
    isValid: null,
    message: ''
  });
  const [textValidation, setTextValidation] = useState({
    isValid: null,
    message: ''
  });

  // URL验证函数
  const validateDrugUrl = (url) => {
    // 验证URL格式是否符合示例 https://www.dayi.org.cn/drug/1017782.html
    const regex = /^https:\/\/www\.dayi\.org\.cn\/drug\/\d+\.html$/;
    return regex.test(url);
  };

  // 格式化药品信息，确保字段格式正确
  const formatDrugInfo = (drugInfo) => {
    // 验证返回的药品信息是否有效
    if (!drugInfo || !drugInfo.name || !drugInfo.name.generic) {
      throw new Error('解析到的药品信息无效');
    }
    
    // 确保数组字段格式正确
    return {
      ...drugInfo,
      ingredients: typeof drugInfo.ingredients === 'string' 
        ? [drugInfo.ingredients] 
        : Array.isArray(drugInfo.ingredients) 
          ? drugInfo.ingredients 
          : [drugInfo.ingredients],
      indications: typeof drugInfo.indications === 'string' 
        ? [drugInfo.indications] 
        : Array.isArray(drugInfo.indications) 
          ? drugInfo.indications 
          : [drugInfo.indications],
      adverseReactions: typeof drugInfo.adverseReactions === 'string' 
        ? [drugInfo.adverseReactions] 
        : Array.isArray(drugInfo.adverseReactions) 
          ? drugInfo.adverseReactions 
          : [drugInfo.adverseReactions],
      contraindications: typeof drugInfo.contraindications === 'string' 
        ? [drugInfo.contraindications] 
        : Array.isArray(drugInfo.contraindications) 
          ? drugInfo.contraindications 
          : [drugInfo.contraindications],
      precautions: typeof drugInfo.precautions === 'string' 
        ? [drugInfo.precautions] 
        : Array.isArray(drugInfo.precautions) 
          ? drugInfo.precautions 
          : [drugInfo.precautions],
      drugInteractions: typeof drugInfo.drugInteractions === 'string' 
        ? [drugInfo.drugInteractions] 
        : Array.isArray(drugInfo.drugInteractions) 
          ? drugInfo.drugInteractions 
          : [drugInfo.drugInteractions],
      // 确保name.brand是数组格式
      name: {
        ...drugInfo.name,
        brand: Array.isArray(drugInfo.name.brand) 
          ? drugInfo.name.brand 
          : [drugInfo.name.brand]
      }
    };
  };

  // 解析药品URL，提取药品信息
  const parseDrugUrl = async (url) => {
    if (!validateDrugUrl(url)) {
      setValidation({
        isValid: false,
        message: '无效的药品说明书URL格式，请参照示例：https://www.dayi.org.cn/drug/1017782.html'
      });
      return;
    }

    setIsParsing(true);
    setValidation({
      isValid: null,
      message: '正在解析药品信息...'
    });

    try {
      // 调用后端API来解析URL，获取药品信息
      console.log('解析药品URL:', url);
      
      const response = await axios.get('/api/parse-drug-url', {
        params: { url }
      });
      
      const formattedDrugInfo = formatDrugInfo(response.data);
      
      // 保存解析结果
      setParsedDrugInfo(formattedDrugInfo);

      setValidation({
        isValid: true,
        message: '药品信息解析成功！请查看并确认解析结果。'
      });
    } catch (error) {
      console.error('解析药品URL失败:', error);
      // 显示友好的错误信息
      setValidation({
        isValid: false,
        message: error.response?.data?.error || '解析药品信息失败，请检查URL是否有效或稍后重试'
      });
      // 清空之前的解析结果
      setParsedDrugInfo(null);
    } finally {
      setIsParsing(false);
    }
  };

  // 处理URL输入变化
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setInstructionUrl(url);
    
    // 如果URL为空，重置状态
    if (!url.trim()) {
      setValidation({
        isValid: null,
        message: ''
      });
      setParsedDrugInfo(null);
    }
  };

  // 处理URL解析按钮点击
  const handleParseUrl = () => {
    const url = instructionUrl;
    if (url.trim()) {
      parseDrugUrl(url);
    } else {
      setValidation({
        isValid: false,
        message: '请输入药品说明书URL'
      });
    }
  };

  // 解析药品文本，提取药品信息
  const parseDrugText = async (text) => {
    setIsParsing(true);
    setTextValidation({
      isValid: null,
      message: '正在解析药品信息...'
    });

    try {
      // 调用后端API来解析文本，获取药品信息
      console.log('解析药品文本');
      
      const response = await axios.post('/api/parse-drug-text', {
        text
      });
      
      const formattedDrugInfo = formatDrugInfo(response.data);
      
      // 保存解析结果
      setParsedDrugInfo(formattedDrugInfo);

      setTextValidation({
        isValid: true,
        message: '药品信息解析成功！请查看并确认解析结果。'
      });
    } catch (error) {
      console.error('解析药品文本失败:', error);
      // 显示友好的错误信息
      setTextValidation({
        isValid: false,
        message: error.response?.data?.error || '解析药品信息失败，请检查文本格式或稍后重试'
      });
      // 清空之前的解析结果
      setParsedDrugInfo(null);
    } finally {
      setIsParsing(false);
    }
  };

  // 处理文本输入变化
  const handleTextChange = (e) => {
    const text = e.target.value;
    setInstructionText(text);
    
    // 如果文本为空，重置状态
    if (!text.trim()) {
      setTextValidation({
        isValid: null,
        message: ''
      });
    }
  };

  // 处理文本解析按钮点击
  const handleParseText = () => {
    const text = instructionText;
    if (text.trim()) {
      parseDrugText(text);
    } else {
      setTextValidation({
        isValid: false,
        message: '请输入药品说明书文本内容'
      });
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!parsedDrugInfo) {
      alert('请先解析药品说明书URL或文本获取药品信息');
      return;
    }
    
    try {
      await axios.post('/api/medicines', parsedDrugInfo);
      alert('药品信息添加成功');
      navigate('/');
    } catch (err) {
      alert('操作失败，请检查输入信息');
    }
  };

  return (
    <div>
      <h2>添加药品</h2>
      <form onSubmit={handleSubmit}>
        {/* 药品说明书URL输入 */}
        <div className="card">
          <h3>药品说明书URL</h3>
          <div className="form-group">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={instructionUrl}
                onChange={handleUrlChange}
                placeholder="示例：https://www.dayi.org.cn/drug/1017782.html"
                style={{ flex: 1, padding: '8px', fontSize: '16px' }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleParseUrl}
                disabled={isParsing}
              >
                {isParsing ? '解析中...' : '解析URL'}
              </button>
            </div>
            {/* 验证反馈 */}
            {validation.message && (
              <div className={`url-validation ${validation.isValid === true ? 'valid' : validation.isValid === false ? 'invalid' : 'info'}`}>
                {validation.message}
              </div>
            )}
            <div className="url-hint">
              请输入符合格式的药品说明书URL，系统将自动解析生成药品信息。
            </div>
          </div>
        </div>

        {/* 药品说明书文本输入 */}
        <div className="card" style={{ marginTop: '16px' }}>
          <h3>药品说明书文本</h3>
          <div className="form-group">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
              <textarea
                value={instructionText}
                onChange={handleTextChange}
                placeholder="请输入药品说明书文本内容"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  fontSize: '16px', 
                  minHeight: '200px',
                  resize: 'vertical'
                }}
              />
              <div style={{ alignSelf: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleParseText}
                  disabled={isParsing}
                >
                  {isParsing ? '解析中...' : '解析文本'}
                </button>
              </div>
            </div>
            {/* 验证反馈 */}
            {textValidation.message && (
              <div className={`url-validation ${textValidation.isValid === true ? 'valid' : textValidation.isValid === false ? 'invalid' : 'info'}`}>
                {textValidation.message}
              </div>
            )}
            <div className="url-hint">
              请输入药品说明书文本内容，系统将自动解析生成药品信息。
            </div>
          </div>
        </div>

        {/* 解析结果展示 */}
        {parsedDrugInfo && (
          <>
            <div className="card">
              <h3>解析结果确认</h3>
              <p>系统已从URL中提取药品信息，请确认以下内容是否正确：</p>
            </div>
            
            {/* 药品基本信息 */}
            <div className="card">
              <h4>基本信息</h4>
              <div className="form-group">
                <strong>通用名:</strong> {parsedDrugInfo.name.generic}
              </div>
              {parsedDrugInfo.name.brand.length > 0 && parsedDrugInfo.name.brand[0] && (
                <div className="form-group">
                  <strong>商品名:</strong> {parsedDrugInfo.name.brand.join(', ')}
                </div>
              )}
              <div className="form-group">
                <strong>分类:</strong> {parsedDrugInfo.category}
              </div>
              <div className="form-group">
                <strong>生产厂家:</strong> {parsedDrugInfo.manufacturer || '未提供'}
              </div>
              <div className="form-group">
                <strong>批准文号:</strong> {parsedDrugInfo.approvalNumber || '未提供'}
              </div>
              <div className="form-group">
                <strong>有效期:</strong> {parsedDrugInfo.shelfLife}个月
              </div>
              <div className="form-group">
                <strong>储存条件:</strong> {parsedDrugInfo.storageConditions || '未提供'}
              </div>
            </div>
            
            {/* 主要成分 */}
            <div className="card">
              <h4>主要成分</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
                {parsedDrugInfo.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
            
            {/* 适应症 */}
            <div className="card">
              <h4>适应症</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
                {parsedDrugInfo.indications.map((indication, index) => (
                  <li key={index}>{indication}</li>
                ))}
              </ul>
            </div>
            
            {/* 用法用量 */}
            <div className="card">
              <h4>用法用量</h4>
              <div className="form-group">
                {parsedDrugInfo.dosage}
              </div>
            </div>
            
            {/* 不良反应 */}
            <div className="card">
              <h4>不良反应</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
                {parsedDrugInfo.adverseReactions.map((reaction, index) => (
                  <li key={index}>{reaction}</li>
                ))}
              </ul>
            </div>
            
            {/* 禁忌事项 */}
            <div className="card">
              <h4>禁忌事项</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
                {parsedDrugInfo.contraindications.map((contraindication, index) => (
                  <li key={index}>{contraindication}</li>
                ))}
              </ul>
            </div>
            
            {/* 注意事项 */}
            <div className="card">
              <h4>注意事项</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
                {parsedDrugInfo.precautions.map((precaution, index) => (
                  <li key={index}>{precaution}</li>
                ))}
              </ul>
            </div>
            
            {/* 药物相互作用 */}
            <div className="card">
              <h4>药物相互作用</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '24px' }}>
                {parsedDrugInfo.drugInteractions.map((interaction, index) => (
                  <li key={index}>{interaction}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* 提交按钮 */}
        {parsedDrugInfo && (
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button type="submit" className="btn-primary">
              添加药品
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{ backgroundColor: '#f0f0f0', color: '#333' }}
            >
              取消
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MedicineForm;
