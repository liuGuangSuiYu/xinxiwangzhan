import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import MedicineList from './pages/MedicineList';
import NewMedicineForm from './pages/NewMedicineForm';
import MedicineDetail from './pages/MedicineDetail';
import DosageCalculator from './pages/DosageCalculator';
import RUCAMCalculator from './pages/RUCAMCalculator';
import ChineseMedicineDosageCalculator from './pages/ChineseMedicineDosageCalculator';
import MedicineAgent from './pages/MedicineAgent';
import TestMedicineList from './pages/TestMedicineList';
import './index.css';

// 功能模块配置
const MODULE_CONFIG = {
  // 药品管理模块
  medicineManagement: {
    enabled: true,
    routes: [
      { path: '/', element: <MedicineList />, name: '药品列表' },
      { path: '/add', element: <NewMedicineForm />, name: '添加药品' },
      { path: '/edit/:id', element: <NewMedicineForm />, name: '编辑药品' },
      { path: '/medicine/:id', element: <MedicineDetail />, name: '药品详情' }
    ]
  },
  
  // 计算器模块
  calculators: {
    enabled: true,
    routes: [
      { path: '/dosage-calculator', element: <DosageCalculator />, name: '用药剂量计算器', enabled: false },
      { path: '/chinese-medicine-calculator', element: <ChineseMedicineDosageCalculator />, name: '儿童中成药剂量计算器', enabled: true },
      { path: '/rucam-calculator', element: <RUCAMCalculator />, name: 'RUCAM肝损伤评估', enabled: true }
    ]
  },
  
  // AI智能体模块
  aiAgent: {
    enabled: true,
    routes: [
      { path: '/agent', element: <MedicineAgent />, name: '儿童中成药智能体', enabled: true }
    ]
  }
};

// 导航组件
const Navigation = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <h1 className="nav-logo">童智药嘱</h1>
        
        <div className="nav-links">
          {/* 药品管理模块导航 */}
          {MODULE_CONFIG.medicineManagement.enabled && (
            <div className="nav-group">
              <Link to="/" className="nav-link">药品列表</Link>
              <Link to="/add" className="nav-link">添加药品</Link>
            </div>
          )}
          
          {/* 计算器模块导航 */}
          {MODULE_CONFIG.calculators.enabled && (
            <div className="nav-group">
              {MODULE_CONFIG.calculators.routes
                .filter(route => route.enabled)
                .map((route, index) => (
                  <Link key={index} to={route.path} className="nav-link">
                    {route.name}
                  </Link>
                ))}
            </div>
          )}
          
          {/* AI智能体模块导航 */}
          {MODULE_CONFIG.aiAgent.enabled && MODULE_CONFIG.aiAgent.routes[0].enabled && (
            <div className="nav-group">
              <Link to="/agent" className="nav-link">
                儿童中成药智能体
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// 路由配置组件
const AppRoutes = () => {
  return (
    <main className="container">
      <Routes>
        {/* 药品管理模块路由 */}
        {MODULE_CONFIG.medicineManagement.enabled && MODULE_CONFIG.medicineManagement.routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
        
        {/* 计算器模块路由 */}
        {MODULE_CONFIG.calculators.enabled && MODULE_CONFIG.calculators.routes.map((route, index) => (
          <Route 
            key={index} 
            path={route.path} 
            element={route.enabled ? route.element : <Navigate to="/" replace />} 
          />
        ))}
        
        {/* AI智能体模块路由 */}
        {MODULE_CONFIG.aiAgent.enabled && MODULE_CONFIG.aiAgent.routes.map((route, index) => (
          <Route 
            key={index} 
            path={route.path} 
            element={route.enabled ? route.element : <Navigate to="/" replace />} 
          />
        ))}
        
        {/* 重定向规则 */}
        <Route path="/medicine-form" element={<Navigate to="/add" replace />} />
        <Route path="/old-medicine-form" element={<Navigate to="/add" replace />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        {/* 导航栏 */}
        <Navigation />
        
        {/* 主要内容区域 */}
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;