import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // 将useAuth移到组件顶层
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  // 处理表单字段变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除该字段的错误信息
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // 清除登录错误信息
    if (loginError) {
      setLoginError('');
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    }

    if (!formData.password.trim()) {
      newErrors.password = '请输入密码';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    try {
      console.log('提交的表单数据:', formData);
      
      const response = await axios.post('/api/auth/login', formData, {
        timeout: 10000 // 设置10秒超时
      });
      
      console.log('登录成功，响应数据:', response.data);
      
      // 使用AuthContext更新登录状态
      login(response.data.user, response.data.token);
      
      // 登录成功，跳转到首页
      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
      if (error.response) {
        // 服务器返回了错误响应
        console.error('错误响应状态:', error.response.status);
        console.error('错误响应数据:', error.response.data);
        setLoginError(error.response.data.error || '登录失败，请检查用户名和密码');
      } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error('网络请求失败，未收到响应');
        setLoginError('网络连接失败，请检查您的网络设置');
      } else {
        // 请求配置错误
        console.error('请求配置错误:', error.message);
        setLoginError('登录请求失败，请稍后重试');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="login-container" style={{
        maxWidth: '400px',
        margin: '80px auto',
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e3f2fd',
        // 添加过渡效果
        transition: 'all 0.3s ease',
        opacity: 1,
        transform: 'translateY(0)',
        display: 'block'
      }}>
        <h2 className="page-title" style={{
          textAlign: 'center',
          color: '#333',
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '32px',
          borderBottom: '3px solid #007bff',
          paddingBottom: '12px',
          display: 'inline-block',
          width: '100%'
        }}>用户登录</h2>
        
        {loginError && (
          <div style={{
            backgroundColor: '#fff3f3',
            color: '#dc3545',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            borderLeft: '4px solid #dc3545',
            fontSize: '14px'
          }}>
            {loginError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* 用户名输入框 */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333',
              fontSize: '16px'
            }}>用户名 *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="请输入用户名"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: `1px solid ${errors.username ? '#dc3545' : '#e0e0e0'}`,
                transition: 'border-color 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = errors.username ? '#dc3545' : '#e0e0e0'}
            />
            {errors.username && (
              <div style={{
                color: '#dc3545',
                fontSize: '14px',
                marginTop: '4px',
                fontWeight: '500'
              }}>{errors.username}</div>
            )}
          </div>
          
          {/* 密码输入框 */}
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#333',
              fontSize: '16px'
            }}>密码 *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: `1px solid ${errors.password ? '#dc3545' : '#e0e0e0'}`,
                transition: 'border-color 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = errors.password ? '#dc3545' : '#e0e0e0'}
            />
            {errors.password && (
              <div style={{
                color: '#dc3545',
                fontSize: '14px',
                marginTop: '4px',
                fontWeight: '500'
              }}>{errors.password}</div>
            )}
          </div>
          
          {/* 登录按钮 */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
            }}
            onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#0056b3')}
            onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#007bff')}
          >
            {isSubmitting ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;