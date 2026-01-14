import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMessage, 
  faSearch, 
  faSpinner, 
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function MedicineAgent() {
  // 状态管理
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendedMedicines, setRecommendedMedicines] = useState([]);
  const [selectedIndication, setSelectedIndication] = useState('');
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  
  // 滚动到底部的ref
  const messagesEndRef = useRef(null);
  
  // 常用适应症列表
  const commonIndications = [
    '感冒', '咳嗽', '发热', '消化不良', '腹泻', '便秘', '过敏', '口腔溃疡',
    '鼻炎', '咽炎', '扁桃体炎', '支气管炎', '肺炎', '手足口病', '水痘'
  ];
  
  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // 清除错误
    setError(null);
    
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // 调用API获取智能体回答
      const response = await axios.post('/api/agent/chat', {
        question: userMessage.text
      });
      
      // 添加智能体回答
      const agentMessage = {
        id: Date.now() + 1,
        text: response.data.answer,
        sender: 'agent',
        timestamp: response.data.timestamp
      };
      
      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      console.error('智能体回答失败:', err);
      setError('智能体回答生成失败，请稍后重试');
      
      // 添加错误消息
      const errorMessage = {
        id: Date.now() + 1,
        text: '抱歉，我暂时无法回答您的问题，请稍后重试。',
        sender: 'agent',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理药品推荐
  const handleRecommend = async (indication) => {
    setSelectedIndication(indication);
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/agent/recommend?indication=${encodeURIComponent(indication)}`);
      setRecommendedMedicines(response.data.recommendedMedicines);
      setIsRecommendModalOpen(true);
    } catch (err) {
      console.error('药品推荐失败:', err);
      setError('药品推荐失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理按键事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // 渲染消息气泡
  const renderMessage = (message) => {
    return (
      <div key={message.id} className={`message ${message.sender} ${message.isError ? 'error' : ''}`}>
        <div className="message-content">
          <p>{message.text}</p>
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };
  
  // 滚动到底部的副作用
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  return (
    <div className="container">
      <div className="feature-container">
        <header>
          <div className="logo">
            <FontAwesomeIcon icon={faMessage} />
            <h1 className="page-title">儿童中成药口服制剂智能体</h1>
          </div>
          <p className="subtitle">为家长提供儿童中成药口服制剂的智能咨询服务</p>
        </header>
        
        <div className="warning-box">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <strong>温馨提示：</strong>本智能体仅供参考，实际用药请严格遵循医嘱或药品说明书。
        </div>
        
        {/* 常用问题快捷入口 */}
        <div className="quick-questions">
          <h3>常用问题</h3>
          <div className="question-tags">
            {commonIndications.map((indication, index) => (
              <button 
                key={index} 
                className="question-tag"
                onClick={() => handleRecommend(indication)}
              >
                <FontAwesomeIcon icon={faSearch} />
                {indication}用药推荐
              </button>
            ))}
          </div>
        </div>
        
        {/* 聊天界面 */}
        <div className="chat-container">
          <div className="chat-messages">
            {/* 欢迎消息 */}
            {messages.length === 0 && (
              <div className="welcome-message">
                <h3>您好！我是儿童中成药口服制剂智能体</h3>
                <p>您可以向我咨询关于儿童中成药口服制剂的信息，包括成分、适应症、用法用量、注意事项等，或根据孩子的症状获取用药推荐。</p>
                <p>例如：</p>
                <ul>
                  <li>小儿感冒颗粒的成分是什么？</li>
                  <li>小儿止咳糖浆的用法用量？</li>
                  <li>感冒发烧用什么药？</li>
                </ul>
              </div>
            )}
            
            {/* 消息列表 */}
            {messages.map(renderMessage)}
            
            {/* 加载状态 */}
            {isLoading && (
              <div className="message agent loading">
                <div className="message-content">
                  <div className="loading-indicator">
                    <FontAwesomeIcon icon={faSpinner} spin />
                    <span>正在思考中...</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 滚动到底部的ref */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* 输入区域 */}
          <div className="chat-input">
            {error && (
              <div className="error-message">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {error}
              </div>
            )}
            <div className="input-container">
              <textarea
                type="text"
                placeholder="请输入您的问题..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                rows={1}
              />
              <button 
                className="send-button"
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 药品推荐模态框 */}
      {isRecommendModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <FontAwesomeIcon icon={faSearch} />
                {selectedIndication}用药推荐
              </h3>
              <button 
                className="close-button"
                onClick={() => setIsRecommendModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {isLoading ? (
                <div className="loading-container">
                  <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                  <p>正在获取推荐药品...</p>
                </div>
              ) : recommendedMedicines.length > 0 ? (
                <div className="medicine-recommendations">
                  {recommendedMedicines.map((medicine) => (
                    <div key={medicine.id} className="medicine-card">
                      <h4>{medicine.name.generic}</h4>
                      {medicine.name.brand.length > 0 && (
                        <p className="brand-name">商品名：{medicine.name.brand.join('、')}</p>
                      )}
                      <p className="specification">规格：{medicine.specification}</p>
                      <p className="indications">适应症：{medicine.indications.join('。')}</p>
                      <p className="dosage">用法用量：{medicine.dosage}</p>
                      <div className="medicine-tags">
                        <span className="tag category">{medicine.category}</span>
                        <span className="tag form">{medicine.dosageForm}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <p>未找到相关推荐药品</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="primary-button"
                onClick={() => setIsRecommendModalOpen(false)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .feature-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .logo svg {
          font-size: 24px;
          margin-right: 10px;
          color: #4CAF50;
        }
        
        .page-title {
          font-size: 28px;
          color: #333;
          margin: 0;
        }
        
        .subtitle {
          color: #666;
          margin: 10px 0 20px 0;
        }
        
        .warning-box {
          background-color: #FFF3CD;
          border: 1px solid #FFEAA7;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }
        
        .warning-box svg {
          color: #856404;
          margin-right: 10px;
        }
        
        .warning-box strong {
          color: #856404;
        }
        
        .quick-questions {
          background-color: #F8F9FA;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .quick-questions h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
        }
        
        .question-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .question-tag {
          background-color: #E3F2FD;
          color: #1976D2;
          border: 1px solid #BBDEFB;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }
        
        .question-tag:hover {
          background-color: #BBDEFB;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .question-tag svg {
          margin-right: 5px;
          font-size: 12px;
        }
        
        .chat-container {
          background-color: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          height: 600px;
          display: flex;
          flex-direction: column;
        }
        
        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background-color: #F8F9FA;
          display: flex;
          flex-direction: column;
        }
        
        .welcome-message {
          background-color: #FFFFFF;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .welcome-message h3 {
          color: #333;
          margin-top: 0;
        }
        
        .welcome-message p {
          color: #666;
          margin: 10px 0;
        }
        
        .welcome-message ul {
          color: #666;
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .welcome-message li {
          margin: 5px 0;
        }
        
        .message {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }
        
        .message.user {
          align-items: flex-end;
        }
        
        .message.agent {
          align-items: flex-start;
        }
        
        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .user .message-content {
          background-color: #4CAF50;
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .agent .message-content {
          background-color: #FFFFFF;
          color: #333;
          border-bottom-left-radius: 4px;
          border: 1px solid #E0E0E0;
        }
        
        .message.error .message-content {
          background-color: #F44336;
          color: white;
        }
        
        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 5px;
          display: block;
          text-align: right;
        }
        
        .agent .message-time {
          text-align: left;
        }
        
        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
        }
        
        .chat-input {
          padding: 20px;
          background-color: #FFFFFF;
          border-top: 1px solid #E0E0E0;
        }
        
        .error-message {
          background-color: #FFF3F3;
          color: #D32F2F;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .input-container {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }
        
        .input-container textarea {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #E0E0E0;
          border-radius: 24px;
          resize: none;
          font-size: 16px;
          min-height: 40px;
          max-height: 120px;
          overflow-y: auto;
          font-family: inherit;
        }
        
        .input-container textarea:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
        }
        
        .send-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .send-button:hover:not(:disabled) {
          background-color: #45a049;
          transform: scale(1.05);
        }
        
        .send-button:disabled {
          background-color: #CCCCCC;
          cursor: not-allowed;
        }
        
        /* 模态框样式 */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          width: 90%;
          max-width: 800px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #E0E0E0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h3 {
          margin: 0;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background-color: #F0F0F0;
          color: #333;
        }
        
        .modal-body {
          padding: 20px;
          overflow-y: auto;
          flex: 1;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #666;
        }
        
        .medicine-recommendations {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .medicine-card {
          background-color: #F8F9FA;
          border: 1px solid #E0E0E0;
          border-radius: 8px;
          padding: 15px;
          transition: all 0.2s ease;
        }
        
        .medicine-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .medicine-card h4 {
          color: #333;
          margin-top: 0;
          margin-bottom: 10px;
        }
        
        .brand-name {
          color: #666;
          font-size: 14px;
          margin: 5px 0;
        }
        
        .specification, .indications, .dosage {
          color: #666;
          font-size: 14px;
          margin: 8px 0;
        }
        
        .medicine-tags {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
        
        .tag {
          background-color: #E3F2FD;
          color: #1976D2;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 12px;
        }
        
        .tag.form {
          background-color: #E8F5E8;
          color: #388E3C;
        }
        
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #666;
          gap: 10px;
        }
        
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #E0E0E0;
          display: flex;
          justify-content: flex-end;
        }
        
        .primary-button {
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .primary-button:hover {
          background-color: #45a049;
        }
      `}</style>
    </div>
  );
}

export default MedicineAgent;