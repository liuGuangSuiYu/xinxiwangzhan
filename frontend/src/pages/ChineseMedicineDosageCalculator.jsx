import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalculator,
  faExclamationTriangle,
  faWeight,
  faCalendarAlt,
  faChartArea,
  faCode,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faSave,
  faCheck,
  faEdit,
  faMessage
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

function ChineseMedicineDosageCalculator() {
  // 状态管理
  const [activeMethod, setActiveMethod] = useState('weight');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});
  const [customFormula, setCustomFormula] = useState('');
  const [formulaVariables, setFormulaVariables] = useState({});
  const [selectedVariables, setSelectedVariables] = useState([]);
  
  // 公式保存相关状态
  const [savedFormulas, setSavedFormulas] = useState([]);
  const [drugName, setDrugName] = useState('');
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [editingFormulaId, setEditingFormulaId] = useState(null);
  const [formulaSearch, setFormulaSearch] = useState('');
  
  // 药品数据相关状态
  const [medicines, setMedicines] = useState([]);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);
  const [drugSearchKeyword, setDrugSearchKeyword] = useState('');
  const [showDrugDropdown, setShowDrugDropdown] = useState(false);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  
  // 保存状态反馈
  const [saveStatus, setSaveStatus] = useState(null); // 'success' or 'error'
  const [saveMessage, setSaveMessage] = useState('');
  
  // 公式编辑辅助
  const [formulaSuggestions, setFormulaSuggestions] = useState([]);
  const [showFormulaSuggestions, setShowFormulaSuggestions] = useState(false);
  
  // 配置变量：控制是否启用智能体功能
  // 设置为 false 以隐藏智能体，设置为 true 以恢复显示
  const ENABLE_AGENT = true;
  
  // 智能体交互状态
  const [isAgentChatOpen, setIsAgentChatOpen] = useState(false);
  const [agentQuestion, setAgentQuestion] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  
  // 体重计算相关状态
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [dailyDosage, setDailyDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('g/kg');
  const [frequency, setFrequency] = useState('3');
  
  // 年龄计算相关状态
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState('years');
  const [adultDosage, setAdultDosage] = useState('');
  
  // 体表面积计算相关状态
  const [height, setHeight] = useState('');
  const [bsaDosage, setBsaDosage] = useState('');
  const [bsaUnit, setBsaUnit] = useState('g/m2');
  const [selectedBSAFormula, setSelectedBSAFormula] = useState('mosteller');
  const [bsaResult, setBsaResult] = useState('');
  const [bsaErrors, setBsaErrors] = useState({});
  
  // RUCAM肝损伤评估相关状态
  const [rucamScore, setRucamScore] = useState(0);
  const [injuryPercentage, setInjuryPercentage] = useState(0);
  const [isRucamModalOpen, setIsRucamModalOpen] = useState(false);

  // 可用变量列表
  const availableVariables = [
    { id: 'weight', name: '体重', unit: 'kg' },
    { id: 'age', name: '年龄', unit: '岁' },
    { id: 'height', name: '身高', unit: 'cm' },
    { id: 'adultDose', name: '成人剂量', unit: 'g' },
    { id: 'bsa', name: '体表面积', unit: 'm²' }
  ];
  
  // RUCAM评分计算和百分比转换
  const calculateRucamPercentage = (score) => {
    // RUCAM score range: typically -5 to 12
    const minScore = -5;
    const maxScore = 12;
    
    // Map score to 0-100% range
    let percentage = Math.round(((score - minScore) / (maxScore - minScore)) * 100);
    
    // Ensure percentage is within 0-100 range
    percentage = Math.max(0, Math.min(100, percentage));
    
    return percentage;
  };
  
  // 设置RUCAM评分和计算百分比
  const setRucamAssessment = (score) => {
    setRucamScore(score);
    const percentage = calculateRucamPercentage(score);
    setInjuryPercentage(percentage);
    setIsRucamModalOpen(false);
  };
  
  // 打开RUCAM评估模态框
  const openRucamModal = () => {
    setIsRucamModalOpen(true);
  };
  
  // 关闭RUCAM评估模态框
  const closeRucamModal = () => {
    setIsRucamModalOpen(false);
  };
  
  // 从本地存储加载保存的公式
  useEffect(() => {
    const loadFormulas = () => {
      const storedFormulas = localStorage.getItem('savedFormulas');
      if (storedFormulas) {
        setSavedFormulas(JSON.parse(storedFormulas));
      }
    };
    loadFormulas();
  }, []);
  
  // 从API获取药品列表
  useEffect(() => {
    const fetchMedicines = async () => {
      setIsLoadingMedicines(true);
      try {
        const response = await axios.get('/api/medicines');
        console.log('药品列表API响应:', response.data);
        setMedicines(response.data.medicines || []);
      } catch (error) {
        console.error('获取药品列表失败:', error);
        console.error('错误详情:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          config: error.config
        });
        // 显示用户友好的错误信息
        setSaveStatus('error');
        setSaveMessage(`获取药品列表失败: ${error.message}`);
        setTimeout(() => {
          setSaveStatus(null);
          setSaveMessage('');
        }, 3000);
      } finally {
        setIsLoadingMedicines(false);
      }
    };
    fetchMedicines();
  }, []);
  
  // 筛选药品列表
  useEffect(() => {
    if (drugSearchKeyword.trim()) {
      const filtered = medicines.filter(medicine => 
        medicine.name.generic.toLowerCase().includes(drugSearchKeyword.toLowerCase()) ||
        medicine.name.brand.some(name => name.toLowerCase().includes(drugSearchKeyword.toLowerCase()))
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines(medicines);
    }
  }, [drugSearchKeyword, medicines]);
  
  // 处理药品选择
  const handleDrugSelect = (medicine) => {
    setDrugName(medicine.name.generic);
    setDrugSearchKeyword(medicine.name.generic);
    setShowDrugDropdown(false);
  };
  
  // 处理药品搜索输入
  const handleDrugSearchChange = (e) => {
    const keyword = e.target.value;
    setDrugName(keyword);
    setDrugSearchKeyword(keyword);
    setShowDrugDropdown(true);
  };
  
  // 处理公式输入变化，提供语法提示
  const handleFormulaChange = (e) => {
    const formula = e.target.value;
    setCustomFormula(formula);
    
    // 简单的公式提示逻辑
    if (formula.trim()) {
      const lastChar = formula.slice(-1);
      if (lastChar === '(' || lastChar === ' ') {
        // 提供函数建议
        const functions = ['sin', 'cos', 'tan', 'sqrt', 'pow', 'log', 'exp', 'abs', 'round', 'floor', 'ceil'];
        setFormulaSuggestions(functions);
        setShowFormulaSuggestions(true);
      } else if (/[a-zA-Z]$/.test(formula)) {
        // 提供变量建议
        const variables = ['weight', 'age', 'height', 'adultDose', 'bsa'];
        const currentWord = formula.split(/[^a-zA-Z]+/).pop();
        const filteredVars = variables.filter(varName => varName.startsWith(currentWord));
        setFormulaSuggestions(filteredVars);
        setShowFormulaSuggestions(filteredVars.length > 0);
      } else {
        setShowFormulaSuggestions(false);
      }
    } else {
      setShowFormulaSuggestions(false);
    }
  };
  
  // 处理公式建议选择
  const handleFormulaSuggestionSelect = (suggestion) => {
    const formulaParts = customFormula.split(/[^a-zA-Z]+/);
    formulaParts.pop();
    const newFormula = formulaParts.join('') + suggestion + (['sin', 'cos', 'tan', 'sqrt', 'pow', 'log', 'exp', 'abs', 'round', 'floor', 'ceil'].includes(suggestion) ? '(' : '');
    setCustomFormula(newFormula);
    setShowFormulaSuggestions(false);
  };
  
  // 保存公式到本地存储
  const saveFormulasToLocalStorage = (formulas) => {
    try {
      localStorage.setItem('savedFormulas', JSON.stringify(formulas));
      console.log('公式成功保存到本地存储:', formulas);
    } catch (error) {
      console.error('保存公式到本地存储失败:', error);
      throw error;
    }
  };
  
  // 保存公式
  const handleSaveFormula = () => {
    console.log('开始保存公式:', { drugName, customFormula, editingFormulaId });
    
    if (!drugName.trim()) {
      console.error('保存失败: 药品名称为空');
      setErrors(prev => ({ ...prev, drugName: '请输入药品名称' }));
      return;
    }
    
    if (!customFormula.trim()) {
      console.error('保存失败: 公式为空');
      setErrors(prev => ({ ...prev, customFormula: '请输入计算公式' }));
      return;
    }
    
    // 验证公式
    if (!validateFormulaSyntax(customFormula)) {
      console.error('保存失败: 公式语法错误');
      return;
    }
    
    try {
      const formulaData = {
        id: editingFormulaId || Date.now().toString(),
        drugName: drugName.trim(),
        formula: customFormula.trim(),
        createdAt: editingFormulaId ? savedFormulas.find(f => f.id === editingFormulaId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('创建公式数据:', formulaData);
      
      let updatedFormulas;
      if (editingFormulaId) {
        updatedFormulas = savedFormulas.map(f => f.id === editingFormulaId ? formulaData : f);
        console.log('更新现有公式，更新后的公式列表:', updatedFormulas);
      } else {
        updatedFormulas = [...savedFormulas, formulaData];
        console.log('添加新公式，更新后的公式列表:', updatedFormulas);
      }
      
      setSavedFormulas(updatedFormulas);
      saveFormulasToLocalStorage(updatedFormulas);
      
      // 保存成功反馈
      setSaveStatus('success');
      setSaveMessage(editingFormulaId ? '公式更新成功！' : '公式保存成功！');
      
      // 3秒后清除保存状态
      setTimeout(() => {
        setSaveStatus(null);
        setSaveMessage('');
      }, 3000);
      
      // 重置表单
      setDrugName('');
      setCustomFormula('');
      setEditingFormulaId(null);
      setErrors({});
      setIsFormulaModalOpen(false);
      console.log('公式保存流程完成');
    } catch (error) {
      console.error('保存公式失败:', error);
      // 保存失败反馈
      setSaveStatus('error');
      setSaveMessage('公式保存失败，请重试！');
      
      // 3秒后清除保存状态
      setTimeout(() => {
        setSaveStatus(null);
        setSaveMessage('');
      }, 3000);
    }
  };
  
  // 编辑公式
  const handleEditFormula = (formula) => {
    setDrugName(formula.drugName);
    setCustomFormula(formula.formula);
    setEditingFormulaId(formula.id);
    setIsFormulaModalOpen(true);
  };
  
  // 删除公式
  const handleDeleteFormula = (formulaId) => {
    const updatedFormulas = savedFormulas.filter(f => f.id !== formulaId);
    setSavedFormulas(updatedFormulas);
    saveFormulasToLocalStorage(updatedFormulas);
  };
  
  // 使用保存的公式
  const handleUseFormula = (formula) => {
    setCustomFormula(formula.formula);
    setIsFormulaModalOpen(false);
  };
  
  // 验证公式语法
  const validateFormulaSyntax = (formula) => {
    try {
      // 准备验证环境
      const context = {
        weight: 1,
        age: 1,
        height: 1,
        adultDose: 1,
        bsa: 1,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        sqrt: Math.sqrt,
        pow: Math.pow,
        log: Math.log,
        exp: Math.exp,
        abs: Math.abs,
        round: Math.round,
        floor: Math.floor,
        ceil: Math.ceil
      };
      
      // 尝试编译函数
      new Function(...Object.keys(context), `return ${formula}`);
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, customFormula: `公式语法错误: ${error.message}` }));
      return false;
    }
  };

  // 验证输入
  const validateInputs = () => {
    const newErrors = {};
    
    switch (activeMethod) {
      case 'weight':
        if (!weight) newErrors.weight = '请输入体重';
        if (!dailyDosage) newErrors.dailyDosage = '请输入每日剂量';
        break;
      case 'age':
        if (!age) newErrors.age = '请输入年龄';
        if (!adultDosage) newErrors.adultDosage = '请输入成人剂量';
        break;
      case 'bsa':
        if (!weight) newErrors.weight = '请输入体重';
        if (!height) newErrors.height = '请输入身高';
        if (!bsaDosage) newErrors.bsaDosage = '请输入每平方米剂量';
        break;
      case 'custom':
        if (!customFormula) newErrors.customFormula = '请输入计算公式';
        // 验证自定义公式中的变量是否都已提供
        const formulaVars = customFormula.match(/\b(weight|age|height|adultDose|bsa)\b/g);
        if (formulaVars) {
          const uniqueVars = [...new Set(formulaVars)];
          uniqueVars.forEach(varName => {
            if (!formulaVariables[varName] || formulaVariables[varName] === '') {
              newErrors[varName] = `请输入${availableVariables.find(v => v.id === varName).name}`;
            }
          });
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 计算体表面积（支持多种公式）
  const calculateBSA = (weightValue, heightValue, formula = 'mosteller') => {
    let bsa = 0;
    
    switch (formula) {
      case 'dubois':
        // DuBois公式：BSA(m²) = 0.007184 × 体重(kg)^0.425 × 身高(cm)^0.725
        bsa = 0.007184 * Math.pow(weightValue, 0.425) * Math.pow(heightValue, 0.725);
        break;
      case 'haycock':
        // Haycock公式：BSA(m²) = 0.024265 × 体重(kg)^0.5378 × 身高(cm)^0.3964
        bsa = 0.024265 * Math.pow(weightValue, 0.5378) * Math.pow(heightValue, 0.3964);
        break;
      case 'gehan-george':
        // Gehan-George公式：BSA(m²) = 0.0235 × 体重(kg)^0.51456 × 身高(cm)^0.42246
        bsa = 0.0235 * Math.pow(weightValue, 0.51456) * Math.pow(heightValue, 0.42246);
        break;
      case 'mosteller':
      default:
        // Mosteller公式：BSA(m²) = √(身高(cm) × 体重(kg) / 3600)
        bsa = Math.sqrt((heightValue * weightValue) / 3600);
        break;
    }
    
    return bsa;
  };

  // 根据RUCAM肝损伤百分比计算剂量调整系数
  const calculateDosageAdjustment = () => {
    // 肝损伤风险越高，调整系数越小，剂量越少
    // 0%风险：1.0倍剂量
    // 100%风险：0.5倍剂量
    return 1.0 - (injuryPercentage / 200);
  };

  // 专门的BSA计算函数，用于体表面积计算板块
  const handleBSACalculation = () => {
    // 验证输入
    const errors = {};
    
    const weightValue = parseFloat(weight);
    const heightValue = parseFloat(height);
    
    if (!weight) {
      errors.weight = '请输入体重';
    } else if (isNaN(weightValue) || weightValue <= 0 || weightValue > 300) {
      errors.weight = '体重必须是0-300kg之间的有效数字';
    }
    
    if (!height) {
      errors.height = '请输入身高';
    } else if (isNaN(heightValue) || heightValue <= 0 || heightValue > 250) {
      errors.height = '身高必须是0-250cm之间的有效数字';
    }
    
    if (Object.keys(errors).length > 0) {
      setBsaErrors(errors);
      return;
    }
    
    // 清除错误
    setBsaErrors({});
    
    // 计算BSA
    const bsa = calculateBSA(weightValue, heightValue, selectedBSAFormula);
    setBsaResult(bsa.toFixed(3));
  };

  // 根据体重计算剂量
  const calculateByWeight = () => {
    const weightValue = parseFloat(weight);
    const dosageValue = parseFloat(dailyDosage);
    
    // 转换为统一单位（kg）
    const weightInKg = weightUnit === 'g' ? weightValue / 1000 : weightValue;
    
    // 计算每日总剂量
    let totalDaily = weightInKg * dosageValue;
    // 应用肝损伤调整系数
    const adjustmentFactor = calculateDosageAdjustment();
    totalDaily = totalDaily * adjustmentFactor;
    
    // 计算单次剂量
    const singleDose = totalDaily / parseInt(frequency);
    
    return {
      type: 'weight',
      totalDaily: totalDaily.toFixed(3),
      singleDose: singleDose.toFixed(3),
      frequency: frequency,
      adjustmentFactor: adjustmentFactor.toFixed(2)
    };
  };

  // 根据年龄计算剂量
  const calculateByAge = () => {
    const ageValue = parseFloat(age);
    const adultDose = parseFloat(adultDosage);
    
    // 转换为统一单位（岁）
    const ageInYears = ageUnit === 'months' ? ageValue / 12 : ageValue;
    let childDose = 0;
    
    // 根据年龄计算儿童剂量（简化公式）
    if (ageInYears <= 1) {
      childDose = adultDose * (ageInYears / 24);
    } else if (ageInYears <= 3) {
      childDose = adultDose * (ageInYears / 18);
    } else if (ageInYears <= 6) {
      childDose = adultDose * (ageInYears / 15);
    } else if (ageInYears <= 12) {
      childDose = adultDose * (ageInYears / 12);
    } else {
      childDose = adultDose;
    }
    
    // 应用肝损伤调整系数
    const adjustmentFactor = calculateDosageAdjustment();
    childDose = childDose * adjustmentFactor;
    
    return {
      type: 'age',
      childDose: childDose.toFixed(3),
      adjustmentFactor: adjustmentFactor.toFixed(2)
    };
  };

  // 根据体表面积计算剂量
  const calculateByBSA = () => {
    const weightValue = parseFloat(weight);
    const heightValue = parseFloat(height);
    const dosageValue = parseFloat(bsaDosage);
    
    // 计算体表面积，使用选定的公式
    const bsa = calculateBSA(weightValue, heightValue, selectedBSAFormula);
    // 计算剂量
    let dose = bsa * dosageValue;
    
    // 应用肝损伤调整系数
    const adjustmentFactor = calculateDosageAdjustment();
    dose = dose * adjustmentFactor;
    
    return {
      type: 'bsa',
      bsa: bsa.toFixed(3),
      dose: dose.toFixed(3),
      adjustmentFactor: adjustmentFactor.toFixed(2)
    };
  };

  // 根据自定义公式计算剂量
  const calculateByCustomFormula = () => {
    try {
      // 准备计算环境
      const context = {
        weight: parseFloat(formulaVariables.weight) || 0,
        age: parseFloat(formulaVariables.age) || 0,
        height: parseFloat(formulaVariables.height) || 0,
        adultDose: parseFloat(formulaVariables.adultDose) || 0,
        bsa: formulaVariables.weight && formulaVariables.height 
          ? calculateBSA(parseFloat(formulaVariables.weight), parseFloat(formulaVariables.height)) 
          : 0,
        // 添加常用数学函数
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        sqrt: Math.sqrt,
        pow: Math.pow,
        log: Math.log,
        exp: Math.exp,
        abs: Math.abs,
        round: Math.round,
        floor: Math.floor,
        ceil: Math.ceil
      };
      
      // 安全计算公式结果
      let result = new Function(...Object.keys(context), `return ${customFormula}`)(...Object.values(context));
      
      if (isNaN(result)) {
        throw new Error('公式计算结果不是有效数字');
      }
      
      // 应用肝损伤调整系数
      const adjustmentFactor = calculateDosageAdjustment();
      result = result * adjustmentFactor;
      
      return {
        type: 'custom',
        result: result.toFixed(3),
        formula: customFormula,
        adjustmentFactor: adjustmentFactor.toFixed(2)
      };
    } catch (error) {
      setErrors({ customFormula: `公式错误: ${error.message}` });
      return null;
    }
  };

  // 处理计算按钮点击
  const handleCalculate = () => {
    if (!validateInputs()) {
      return;
    }
    
    let calculationResult = null;
    
    switch (activeMethod) {
      case 'weight':
        calculationResult = calculateByWeight();
        break;
      case 'age':
        calculationResult = calculateByAge();
        break;
      case 'bsa':
        calculationResult = calculateByBSA();
        break;
      case 'custom':
        calculationResult = calculateByCustomFormula();
        break;
      default:
        break;
    }
    
    if (calculationResult) {
      setResults(calculationResult);
    }
  };

  // 处理变量选择变化
  const handleVariableToggle = (variableId) => {
    setSelectedVariables(prev => {
      if (prev.includes(variableId)) {
        return prev.filter(id => id !== variableId);
      } else {
        return [...prev, variableId];
      }
    });
  };

  // 处理公式变量输入变化
  const handleFormulaVariableChange = (varName, value) => {
    setFormulaVariables(prev => ({
      ...prev,
      [varName]: value
    }));
  };
  
  // 调用智能体API
  const callMedicineAgent = async () => {
    if (!agentQuestion.trim() || isAgentLoading) return;
    
    setIsAgentLoading(true);
    setAgentResponse('');
    
    try {
      const response = await axios.post('/api/agent/chat', {
        question: agentQuestion.trim()
      });
      
      setAgentResponse(response.data.answer);
    } catch (error) {
      console.error('调用智能体失败:', error);
      setAgentResponse('抱歉，智能体暂时无法回答您的问题，请稍后重试。');
    } finally {
      setIsAgentLoading(false);
    }
  };
  
  // 处理智能体问题提交
  const handleAgentSubmit = (e) => {
    e.preventDefault();
    callMedicineAgent();
  };

  return (
    <div className="container">
      <div className="feature-container">
        <header>
          <div className="logo">
            <FontAwesomeIcon icon={faCalculator} />
            <h1 className="page-title">儿童中成药口服制剂剂量计算器</h1>
          </div>
          <p className="subtitle">为儿童提供安全、准确的中成药口服制剂剂量参考</p>
          {ENABLE_AGENT && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                onClick={() => setIsAgentChatOpen(!isAgentChatOpen)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <FontAwesomeIcon icon={faMessage} />
                {isAgentChatOpen ? '关闭智能体咨询' : '打开智能体咨询'}
              </button>
            </div>
          )}
        </header>
        
        <div className="warning-box">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <strong>温馨提示：</strong>本计算器仅供参考，实际用药请严格遵循医嘱或药品说明书。
          </div>
        
        <div className="calculator-types">
          <div 
            className={`calc-type ${activeMethod === 'weight' ? 'active' : ''}`}
            onClick={() => setActiveMethod('weight')}
          >
            <div className="calc-icon">
              <FontAwesomeIcon icon={faWeight} />
            </div>
            <h3>按体重计算</h3>
            <p>根据儿童体重和每日剂量计算</p>
          </div>
          
          <div 
            className={`calc-type ${activeMethod === 'age' ? 'active' : ''}`}
            onClick={() => setActiveMethod('age')}
          >
            <div className="calc-icon">
              <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <h3>按年龄计算</h3>
            <p>根据儿童年龄和成人剂量计算</p>
          </div>
          
          <div 
            className={`calc-type ${activeMethod === 'bsa' ? 'active' : ''}`}
            onClick={() => setActiveMethod('bsa')}
          >
            <div className="calc-icon">
              <FontAwesomeIcon icon={faChartArea} />
            </div>
            <h3>按体表面积计算</h3>
            <p>根据儿童身高、体重计算</p>
          </div>
          
          <div 
            className={`calc-type ${activeMethod === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveMethod('custom')}
          >
            <div className="calc-icon">
              <FontAwesomeIcon icon={faCode} />
            </div>
            <h3>自定义公式计算</h3>
            <p>使用自定义公式计算剂量</p>
          </div>
        </div>
      
      {/* RUCAM肝损伤评估显示 */}
      <div className="rucam-section" style={{ margin: '20px 0', padding: '16px', backgroundColor: '#e0f2fe', borderRadius: '8px', border: '1px solid #bae6fd' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0369a1' }}>
            <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />
            RUCAM肝损伤评估
          </h3>
          <button 
            onClick={openRucamModal}
            style={{ padding: '8px 16px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
          >
            设置评分
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ width: '60%', marginRight: '16px' }}>
            <div style={{ width: '100%', height: '24px', backgroundColor: '#e0e0e0', borderRadius: '12px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${injuryPercentage}%`,
                  height: '100%',
                  backgroundColor: injuryPercentage < 20 ? '#4ade80' : 
                                   injuryPercentage < 40 ? '#a3e635' :
                                   injuryPercentage < 60 ? '#facc15' :
                                   injuryPercentage < 80 ? '#f97316' : '#ef4444',
                  transition: 'width 0.5s ease-in-out',
                  borderRadius: '12px'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginTop: '4px' }}>
              <span>0% 排除</span>
              <span>20% 不太可能</span>
              <span>40% 可能</span>
              <span>60% 很可能</span>
              <span>100% 极可能</span>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>
            {injuryPercentage}%
          </div>
        </div>
        
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
          <p>当前RUCAM评分：{rucamScore}分</p>
          <p>基于肝损伤评估，剂量调整系数：<strong>{calculateDosageAdjustment().toFixed(2)}</strong></p>
          <p style={{ fontSize: '12px', color: '#888' }}>
            <strong>说明：</strong>肝损伤风险越高，建议剂量越低。该调整基于RUCAM评分系统，旨在降低高风险患者的用药风险。
          </p>
        </div>
      </div>
      
      {/* RUCAM评分设置模态框 */}
      {isRucamModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '24px', width: '90%', maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>设置RUCAM评分</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>请输入RUCAM评分（-5至12分）</label>
              <input 
                type="number" 
                min="-5" 
                max="12" 
                step="1"
                style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' }}
                defaultValue={rucamScore}
                ref={(input) => { if (input) input.focus(); }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const score = parseInt(e.target.value);
                    if (!isNaN(score) && score >= -5 && score <= 12) {
                      setRucamAssessment(score);
                    }
                  }
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 'bold', color: '#92400e' }}>RUCAM评分说明</h4>
              <ul style={{ fontSize: '14px', color: '#92400e', lineHeight: '1.5', paddingLeft: '20px' }}>
                <li>≤0分：排除药物性肝损伤</li>
                <li>1-2分：不太可能是药物性肝损伤</li>
                <li>3-5分：可能是药物性肝损伤</li>
                <li>6-8分：很可能是药物性肝损伤</li>
                <li>≥9分：极可能是药物性肝损伤</li>
              </ul>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={closeRucamModal}
                style={{ padding: '10px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
              >
                取消
              </button>
              <button 
                onClick={(e) => {
                  const input = e.target.previousElementSibling.previousElementSibling.querySelector('input');
                  const score = parseInt(input.value);
                  if (!isNaN(score) && score >= -5 && score <= 12) {
                    setRucamAssessment(score);
                  } else {
                    alert('请输入有效的RUCAM评分（-5至12分）');
                  }
                }}
                style={{ padding: '10px 20px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="calculator-container">
        <div className="calc-header">
          <FontAwesomeIcon icon={faCalculator} />
          <h2>
            {activeMethod === 'weight' ? '按体重计算' : 
             activeMethod === 'age' ? '按年龄计算' : 
             activeMethod === 'bsa' ? '按体表面积计算' : '自定义公式计算'}
          </h2>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }}>
          <div className="form-content">
            {/* 体重计算表单 */}
            {activeMethod === 'weight' && (
              <>
                {/* 药品选择 */}
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="drugName-weight">药品名称</label>
                  <div className="drug-search-container">
                    <div className="search-input-wrapper">
                      <FontAwesomeIcon icon={faSearch} className="search-icon" />
                      <input 
                        type="text" 
                        id="drugName-weight"
                        placeholder="请输入或搜索药品名称" 
                        value={drugName}
                        onChange={handleDrugSearchChange}
                        onFocus={() => setShowDrugDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDrugDropdown(false), 200)}
                        className={errors.drugName ? 'error' : ''}
                      />
                    </div>
                    {showDrugDropdown && (
                        <div className="drug-dropdown">
                          {isLoadingMedicines ? (
                            <div className="dropdown-loading">加载中...</div>
                          ) : filteredMedicines.length > 0 ? (
                            filteredMedicines.map(medicine => (
                              <div 
                                key={medicine.id} 
                                className="dropdown-item"
                                onClick={() => handleDrugSelect(medicine)}
                              >
                                <span className="medicine-name">{medicine.name.generic}</span>
                                {medicine.name.brand.length > 0 && (
                                  <span className="medicine-common-names">
                                    ({medicine.name.brand.join(', ')})
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="dropdown-no-results">
                              未找到匹配的药品
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  {errors.drugName && (
                    <div className="error-message">
                      <FontAwesomeIcon icon={faTimesCircle} /> {errors.drugName}
                    </div>
                  )}
                </div>
                
                {/* 年龄和体重输入 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="age-weight">儿童年龄</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="age-weight"
                        step="0.1"
                        placeholder="请输入年龄" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className={errors.age ? 'error' : ''}
                      />
                      <select 
                        className="unit" 
                        value={ageUnit}
                        onChange={(e) => setAgeUnit(e.target.value)}
                      >
                        <option value="years">岁</option>
                        <option value="months">月</option>
                      </select>
                    </div>
                    {errors.age && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.age}
                      </div>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="weight">儿童体重</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="weight"
                        placeholder="请输入体重" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className={errors.weight ? 'error' : ''}
                      />
                      <select 
                        className="unit" 
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value)}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                    {errors.weight && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.weight}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 剂量和频率输入 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="dailyDosage">每日剂量</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="dailyDosage"
                        step="0.001"
                        placeholder="请输入每日剂量" 
                        value={dailyDosage}
                        onChange={(e) => setDailyDosage(e.target.value)}
                        className={errors.dailyDosage ? 'error' : ''}
                      />
                      <select 
                        className="unit" 
                        value={dosageUnit}
                        onChange={(e) => setDosageUnit(e.target.value)}
                      >
                        <option value="g/kg">g/kg</option>
                        <option value="mg/kg">mg/kg</option>
                        <option value="ml/kg">ml/kg</option>
                      </select>
                    </div>
                    {errors.dailyDosage && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.dailyDosage}
                      </div>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="frequency">每日给药次数</label>
                    <div className="input-with-unit">
                      <select 
                        id="frequency"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                      >
                        <option value="1">1次</option>
                        <option value="2">2次</option>
                        <option value="3">3次</option>
                        <option value="4">4次</option>
                        <option value="6">6次（每4小时）</option>
                      </select>
                      <span className="unit">/日</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* 年龄计算表单 */}
            {activeMethod === 'age' && (
              <>
                {/* 药品选择 */}
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="drugName-age">药品名称</label>
                  <div className="drug-search-container">
                    <div className="search-input-wrapper">
                      <FontAwesomeIcon icon={faSearch} className="search-icon" />
                      <input 
                        type="text" 
                        id="drugName-age"
                        placeholder="请输入或搜索药品名称" 
                        value={drugName}
                        onChange={handleDrugSearchChange}
                        onFocus={() => setShowDrugDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDrugDropdown(false), 200)}
                        className={errors.drugName ? 'error' : ''}
                      />
                    </div>
                    {showDrugDropdown && (
                        <div className="drug-dropdown">
                          {isLoadingMedicines ? (
                            <div className="dropdown-loading">加载中...</div>
                          ) : filteredMedicines.length > 0 ? (
                            filteredMedicines.map(medicine => (
                              <div 
                                key={medicine.id} 
                                className="dropdown-item"
                                onClick={() => handleDrugSelect(medicine)}
                              >
                                <span className="medicine-name">{medicine.name.generic}</span>
                                {medicine.name.brand.length > 0 && (
                                  <span className="medicine-common-names">
                                    ({medicine.name.brand.join(', ')})
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="dropdown-no-results">
                              未找到匹配的药品
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  {errors.drugName && (
                    <div className="error-message">
                      <FontAwesomeIcon icon={faTimesCircle} /> {errors.drugName}
                    </div>
                  )}
                </div>
                
                {/* 年龄和体重输入 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="age">儿童年龄</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="age"
                        step="0.1"
                        placeholder="请输入年龄" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className={errors.age ? 'error' : ''}
                      />
                      <select 
                        className="unit" 
                        value={ageUnit}
                        onChange={(e) => setAgeUnit(e.target.value)}
                      >
                        <option value="years">岁</option>
                        <option value="months">月</option>
                      </select>
                    </div>
                    {errors.age && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.age}
                      </div>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="weight-age">儿童体重</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="weight-age"
                        step="0.1"
                        placeholder="请输入体重" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className={errors.weight ? 'error' : ''}
                      />
                      <select 
                        className="unit" 
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value)}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                    {errors.weight && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.weight}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 成人剂量输入 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="adultDosage">成人剂量</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="adultDosage"
                        step="0.1"
                        placeholder="请输入成人剂量" 
                        value={adultDosage}
                        onChange={(e) => setAdultDosage(e.target.value)}
                        className={errors.adultDosage ? 'error' : ''}
                      />
                      <span className="unit">g</span>
                    </div>
                    {errors.adultDosage && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.adultDosage}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* 体表面积计算表单 */}
            {activeMethod === 'bsa' && (
              <>
                {/* 药品选择 */}
                <div className="input-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="drugName-bsa">药品名称</label>
                  <div className="drug-search-container">
                    <div className="search-input-wrapper">
                      <FontAwesomeIcon icon={faSearch} className="search-icon" />
                      <input 
                        type="text" 
                        id="drugName-bsa"
                        placeholder="请输入或搜索药品名称" 
                        value={drugName}
                        onChange={handleDrugSearchChange}
                        onFocus={() => setShowDrugDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDrugDropdown(false), 200)}
                        className={errors.drugName ? 'error' : ''}
                      />
                    </div>
                    {showDrugDropdown && (
                        <div className="drug-dropdown">
                          {isLoadingMedicines ? (
                            <div className="dropdown-loading">加载中...</div>
                          ) : filteredMedicines.length > 0 ? (
                            filteredMedicines.map(medicine => (
                              <div 
                                key={medicine.id} 
                                className="dropdown-item"
                                onClick={() => handleDrugSelect(medicine)}
                              >
                                <span className="medicine-name">{medicine.name.generic}</span>
                                {medicine.name.brand.length > 0 && (
                                  <span className="medicine-common-names">
                                    ({medicine.name.brand.join(', ')})
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="dropdown-no-results">
                              未找到匹配的药品
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  {errors.drugName && (
                    <div className="error-message">
                      <FontAwesomeIcon icon={faTimesCircle} /> {errors.drugName}
                    </div>
                  )}
                </div>
                
                {/* 年龄、体重和身高输入 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="age-bsa">儿童年龄</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="age-bsa"
                        step="0.1"
                        placeholder="请输入年龄" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className={errors.age ? 'error' : ''}
                      />
                      <select 
                        className="unit" 
                        value={ageUnit}
                        onChange={(e) => setAgeUnit(e.target.value)}
                      >
                        <option value="years">岁</option>
                        <option value="months">月</option>
                      </select>
                    </div>
                    {errors.age && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.age}
                      </div>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="bsa-weight">儿童体重</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="bsa-weight"
                        step="0.1"
                        placeholder="请输入体重" 
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className={errors.weight ? 'error' : ''}
                      />
                      <span className="unit">kg</span>
                    </div>
                    {errors.weight && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.weight}
                      </div>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="height">儿童身高</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="height"
                        step="0.1"
                        placeholder="请输入身高" 
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className={errors.height ? 'error' : ''}
                      />
                      <span className="unit">cm</span>
                    </div>
                    {errors.height && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.height}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 专用体表面积计算板块 */}
                <div className="bsa-calculator-section" style={{ 
                  margin: '24px 0', 
                  padding: '20px', 
                  backgroundColor: '#f8fafc', 
                  borderRadius: '8px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
                }}>
                  <h4 style={{ 
                    marginBottom: '16px', 
                    fontSize: '18px', 
                    fontWeight: 'bold', 
                    color: '#1e293b' 
                  }}>
                    <FontAwesomeIcon icon={faChartArea} style={{ marginRight: '8px', color: '#3b82f6' }} />
                    体表面积计算
                  </h4>
                  
                  {/* 计算公式选择 */}
                  <div className="form-row" style={{ marginBottom: '16px' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label htmlFor="bsa-formula">计算公式</label>
                      <select 
                        id="bsa-formula"
                        style={{ 
                          width: '100%', 
                          padding: '10px', 
                          border: '1px solid #cbd5e1', 
                          borderRadius: '4px',
                          fontSize: '16px'
                        }}
                        value={selectedBSAFormula}
                        onChange={(e) => setSelectedBSAFormula(e.target.value)}
                      >
                        <option value="mosteller">Mosteller公式（推荐）</option>
                        <option value="dubois">DuBois公式</option>
                        <option value="haycock">Haycock公式</option>
                        <option value="gehan-george">Gehan-George公式</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* 输入验证错误显示 */}
                  {Object.keys(bsaErrors).length > 0 && (
                    <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fee2e2', borderRadius: '6px', border: '1px solid #fecaca' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#991b1b' }}>
                        {Object.values(bsaErrors).map((error, index) => (
                          <li key={index} style={{ fontSize: '14px' }}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 计算按钮 */}
                  <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                    <button 
                      type="button" 
                      onClick={handleBSACalculation}
                      style={{ 
                        padding: '12px 24px', 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      <FontAwesomeIcon icon={faCalculator} style={{ marginRight: '8px' }} />
                      计算体表面积
                    </button>
                  </div>
                  
                  {/* 结果显示区域 */}
                  <div className="bsa-result" style={{ 
                    padding: '16px', 
                    backgroundColor: '#eff6ff', 
                    borderRadius: '6px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <h5 style={{ 
                      marginBottom: '12px', 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      color: '#1e40af' 
                    }}>
                      计算结果
                    </h5>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '18px', color: '#334155' }}>体表面积：</span>
                      <span style={{ 
                        fontSize: '32px', 
                        fontWeight: 'bold', 
                        color: '#2563eb',
                        backgroundColor: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        {bsaResult || (() => {
                          const weightValue = parseFloat(weight);
                          const heightValue = parseFloat(height);
                          if (isNaN(weightValue) || isNaN(heightValue) || weightValue <= 0 || heightValue <= 0) {
                            return '-';
                          }
                          return calculateBSA(weightValue, heightValue, selectedBSAFormula).toFixed(3);
                        })()}
                      </span>
                      <span style={{ fontSize: '18px', color: '#334155', fontWeight: 'bold' }}>m²</span>
                    </div>
                  </div>
                  
                  {/* 公式说明 */}
                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                    <h5 style={{ 
                      marginBottom: '8px', 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      color: '#374151' 
                    }}>
                      公式说明：
                    </h5>
                    <ul style={{ 
                      fontSize: '12px', 
                      color: '#64748b', 
                      lineHeight: '1.5',
                      paddingLeft: '20px' 
                    }}>
                      <li><strong>Mosteller公式：</strong>BSA(m²) = √(身高(cm) × 体重(kg) / 3600)</li>
                      <li><strong>DuBois公式：</strong>BSA(m²) = 0.007184 × 体重(kg)^0.425 × 身高(cm)^0.725</li>
                      <li><strong>Haycock公式：</strong>BSA(m²) = 0.024265 × 体重(kg)^0.5378 × 身高(cm)^0.3964</li>
                      <li><strong>Gehan-George公式：</strong>BSA(m²) = 0.0235 × 体重(kg)^0.51456 × 身高(cm)^0.42246</li>
                    </ul>
                  </div>
                </div>
                
                {/* 每平方米剂量输入 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="bsaDosage">每平方米剂量</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        id="bsaDosage"
                        step="0.001"
                        placeholder="请输入剂量" 
                        value={bsaDosage}
                        onChange={(e) => setBsaDosage(e.target.value)}
                        className={errors.bsaDosage ? 'error' : ''}
                      />
                      <select 
                        className="unit" 
                        value={bsaUnit}
                        onChange={(e) => setBsaUnit(e.target.value)}
                      >
                        <option value="g/m2">g/m²</option>
                        <option value="mg/m2">mg/m²</option>
                        <option value="ml/m2">ml/m²</option>
                      </select>
                    </div>
                    {errors.bsaDosage && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.bsaDosage}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* 自定义公式计算表单 */}
            {activeMethod === 'custom' && (
              <>
                <div className="input-group">
                  <label htmlFor="drugName">药品名称</label>
                  <div className="drug-search-container">
                    <div className="search-input-wrapper">
                      <FontAwesomeIcon icon={faSearch} className="search-icon" />
                      <input 
                        type="text" 
                        id="drugName"
                        placeholder="请输入或搜索药品名称" 
                        value={drugName}
                        onChange={handleDrugSearchChange}
                        onFocus={() => setShowDrugDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDrugDropdown(false), 200)}
                        className={errors.drugName ? 'error' : ''}
                      />
                    </div>
                    {showDrugDropdown && (
                        <div className="drug-dropdown">
                          {isLoadingMedicines ? (
                            <div className="dropdown-loading">加载中...</div>
                          ) : filteredMedicines.length > 0 ? (
                            filteredMedicines.map(medicine => (
                              <div 
                                key={medicine.id} 
                                className="dropdown-item"
                                onClick={() => handleDrugSelect(medicine)}
                              >
                                <span className="medicine-name">{medicine.name.generic}</span>
                                {medicine.name.brand.length > 0 && (
                                  <span className="medicine-common-names">
                                    ({medicine.name.brand.join(', ')})
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="dropdown-no-results">
                              未找到匹配的药品
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  {errors.drugName && (
                    <div className="error-message">
                      <FontAwesomeIcon icon={faTimesCircle} /> {errors.drugName}
                    </div>
                  )}
                </div>
                
                <div className="input-group">
                  <label htmlFor="customFormula">自定义计算公式</label>
                  <div className="formula-input-container">
                    <input 
                      type="text" 
                      id="customFormula"
                      placeholder="例: weight * 0.05 + (age * 0.1)" 
                      value={customFormula}
                      onChange={handleFormulaChange}
                      onFocus={() => { if (customFormula.trim()) setShowFormulaSuggestions(true); }}
                      onBlur={() => setTimeout(() => setShowFormulaSuggestions(false), 200)}
                      className={errors.customFormula ? 'error' : ''}
                    />
                    {showFormulaSuggestions && formulaSuggestions.length > 0 && (
                      <div className="formula-suggestions">
                        {formulaSuggestions.map(suggestion => (
                          <div 
                            key={suggestion} 
                            className="suggestion-item"
                            onClick={() => handleFormulaSuggestionSelect(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.customFormula && (
                    <div className="error-message">
                      <FontAwesomeIcon icon={faTimesCircle} /> {errors.customFormula}
                    </div>
                  )}
                </div>
                
                {/* 保存状态反馈 */}
                {saveStatus && (
                  <div className={`save-status ${saveStatus}`}>
                    <FontAwesomeIcon 
                      icon={saveStatus === 'success' ? faCheckCircle : faTimesCircle} 
                    />
                    {saveMessage}
                  </div>
                )}
                
                <div className="formula-actions">
                  <button 
                    type="button" 
                    className="save-formula-btn"
                    onClick={() => {
                      setErrors({});
                      setEditingFormulaId(null);
                      setIsFormulaModalOpen(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faSave} /> 保存公式
                  </button>
                  <button 
                    type="button" 
                    className="manage-formulas-btn"
                    onClick={() => {
                      setIsFormulaModalOpen(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faEdit} /> 管理公式
                  </button>
                </div>
                
                <div className="variables-section">
                  <h3>选择变量</h3>
                  <div className="variables-list">
                    {availableVariables.map(variable => (
                      <div key={variable.id} className="variable-item">
                        <label className="checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={selectedVariables.includes(variable.id)}
                            onChange={() => handleVariableToggle(variable.id)}
                          />
                          <span className="checkbox-custom"></span>
                          <span className="variable-name">
                            {variable.name} ({variable.unit})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="form-row">
                  {selectedVariables.map(varId => {
                    const variable = availableVariables.find(v => v.id === varId);
                    return (
                      <div key={varId} className="input-group">
                        <label htmlFor={varId}>{variable.name}</label>
                        <div className="input-with-unit">
                          <input 
                            type="number" 
                            id={varId}
                            step="0.1"
                            placeholder={`请输入${variable.name}`} 
                            value={formulaVariables[varId] || ''}
                            onChange={(e) => handleFormulaVariableChange(varId, e.target.value)}
                            className={errors[varId] ? 'error' : ''}
                          />
                          <span className="unit">{variable.unit}</span>
                        </div>
                        {errors[varId] && (
                          <div className="error-message">
                            <FontAwesomeIcon icon={faTimesCircle} /> {errors[varId]}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="formula-help">
                  <h4>公式使用说明：</h4>
                  <ul>
                    <li>支持的变量：weight（体重）、age（年龄）、height（身高）、adultDose（成人剂量）、bsa（体表面积）</li>
                    <li>支持的运算符：+、-、*、/、^（幂运算）</li>
                    <li>支持的函数：sin()、cos()、tan()、sqrt()、log()、exp()、abs()、round()、floor()、ceil()</li>
                    <li>示例：weight * 0.05（按体重0.05g/kg计算）</li>
                  </ul>
                </div>
              </>
            )}
          </div>
          
          <button type="submit" className="calculate-btn">
            <FontAwesomeIcon icon={faCalculator} />
            计算剂量
          </button>
        </form>
        
        {/* 结果显示 */}
        {results && (
          <div className="result-box">
            <h3>
              <FontAwesomeIcon icon={faCheckCircle} />
              计算结果
            </h3>
            
            {/* 肝损伤调整提示 */}
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '6px', borderLeft: '4px solid #0284c7' }}>
              <p style={{ fontSize: '14px', color: '#0369a1', margin: 0 }}>
                <strong>肝损伤调整：</strong>基于RUCAM肝损伤评估（{injuryPercentage}%），剂量已调整为原剂量的 <strong>{results.adjustmentFactor} 倍</strong>
              </p>
            </div>
            
            {results.type === 'weight' && (
              <>
                <div className="result-item">
                  <span className="result-label">每日总剂量：</span>
                  <span className="result-value">{results.totalDaily} g</span>
                </div>
                <div className="result-item">
                  <span className="result-label">单次剂量：</span>
                  <span className="result-value">{results.singleDose} g</span>
                </div>
                <div className="result-item">
                  <span className="result-label">给药频率：</span>
                  <span className="result-value">{results.frequency} 次/日</span>
                </div>
              </>
            )}
            
            {results.type === 'age' && (
              <div className="result-item">
                <span className="result-label">儿童建议剂量：</span>
                <span className="result-value">{results.childDose} g</span>
              </div>
            )}
            
            {results.type === 'bsa' && (
              <>
                <div className="result-item">
                  <span className="result-label">体表面积：</span>
                  <span className="result-value">{results.bsa} m²</span>
                </div>
                <div className="result-item">
                  <span className="result-label">建议剂量：</span>
                  <span className="result-value">{results.dose} g</span>
                </div>
              </>
            )}
            
            {results.type === 'custom' && (
              <>
                <div className="result-item">
                  <span className="result-label">使用公式：</span>
                  <span className="result-value formula-result">{results.formula}</span>
                </div>
                <div className="result-item">
                  <span className="result-label">计算结果：</span>
                  <span className="result-value">{results.result} g</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* 公式管理模态框 */}
      {isFormulaModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingFormulaId ? '编辑公式' : '管理公式'}</h3>
              <button 
                type="button" 
                className="close-btn"
                onClick={() => {
                  setIsFormulaModalOpen(false);
                  setErrors({});
                  setDrugName('');
                  setCustomFormula('');
                  setEditingFormulaId(null);
                }}
              >
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
            
            <div className="modal-content">
              {editingFormulaId || !savedFormulas.length ? (
                <div className="formula-edit-section">
                  <div className="input-group">
                    <label htmlFor="modal-drugName">药品名称</label>
                    <div className="drug-search-container">
                      <div className="search-input-wrapper">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input 
                          type="text" 
                          id="modal-drugName"
                          placeholder="请输入或搜索药品名称" 
                          value={drugName}
                          onChange={handleDrugSearchChange}
                          onFocus={() => setShowDrugDropdown(true)}
                          onBlur={() => setTimeout(() => setShowDrugDropdown(false), 200)}
                          className={errors.drugName ? 'error' : ''}
                        />
                      </div>
                      {showDrugDropdown && (
                        <div className="drug-dropdown">
                          {isLoadingMedicines ? (
                            <div className="dropdown-loading">加载中...</div>
                          ) : filteredMedicines.length > 0 ? (
                            filteredMedicines.map(medicine => (
                              <div 
                                key={medicine.id} 
                                className="dropdown-item"
                                onClick={() => handleDrugSelect(medicine)}
                              >
                                <span className="medicine-name">{medicine.name.generic}</span>
                                {medicine.name.brand.length > 0 && (
                                  <span className="medicine-common-names">
                                    ({medicine.name.brand.join(', ')})
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="dropdown-no-results">
                              未找到匹配的药品
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {errors.drugName && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.drugName}
                      </div>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="modal-customFormula">计算公式</label>
                    <div className="formula-input-container">
                      <input 
                        type="text" 
                        id="modal-customFormula"
                        placeholder="例: weight * 0.05 + (age * 0.1)" 
                        value={customFormula}
                        onChange={handleFormulaChange}
                        onFocus={() => { if (customFormula.trim()) setShowFormulaSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowFormulaSuggestions(false), 200)}
                        className={errors.customFormula ? 'error' : ''}
                      />
                      {showFormulaSuggestions && formulaSuggestions.length > 0 && (
                        <div className="formula-suggestions">
                          {formulaSuggestions.map(suggestion => (
                            <div 
                              key={suggestion} 
                              className="suggestion-item"
                              onClick={() => handleFormulaSuggestionSelect(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.customFormula && (
                      <div className="error-message">
                        <FontAwesomeIcon icon={faTimesCircle} /> {errors.customFormula}
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="save-btn"
                      onClick={handleSaveFormula}
                    >
                      {editingFormulaId ? '更新公式' : '保存公式'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="formulas-list-section">
                  <div className="search-box">
                    <input 
                      type="text" 
                      placeholder="搜索药品名称..." 
                      value={formulaSearch}
                      onChange={(e) => setFormulaSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="formulas-list">
                    {savedFormulas
                      .filter(formula => formula.drugName.toLowerCase().includes(formulaSearch.toLowerCase()))
                      .map(formula => (
                        <div key={formula.id} className="formula-item">
                          <div className="formula-info">
                            <h4>{formula.drugName}</h4>
                            <p className="formula-text">{formula.formula}</p>
                            <p className="formula-date">
                              更新时间: {new Date(formula.updatedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="formula-item-actions">
                            <button 
                              type="button" 
                              className="use-btn"
                              onClick={() => handleUseFormula(formula)}
                            >
                              使用
                            </button>
                            <button 
                              type="button" 
                              className="edit-btn"
                              onClick={() => handleEditFormula(formula)}
                            >
                              编辑
                            </button>
                            <button 
                              type="button" 
                              className="delete-btn"
                              onClick={() => handleDeleteFormula(formula.id)}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="add-btn"
                      onClick={() => {
                        setErrors({});
                        setDrugName('');
                        setCustomFormula('');
                        setEditingFormulaId(null);
                      }}
                    >
                      添加新公式
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
      
      {/* 智能体交互面板 */}
      {ENABLE_AGENT && isAgentChatOpen && (
        <div className="agent-chat-panel" style={{
          marginTop: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faMessage} style={{ color: '#4CAF50' }} />
              儿童中成药智能体咨询
            </h3>
          </div>
          
          {/* 智能体响应显示 */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            minHeight: '200px'
          }}>
            {isAgentLoading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '20px',
                color: '#666'
              }}>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                智能体正在思考中...
              </div>
            ) : agentResponse ? (
              <div style={{
                backgroundColor: '#ffffff',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                whiteSpace: 'pre-wrap'
              }}>
                <p style={{ margin: 0, color: '#333' }}>{agentResponse}</p>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                color: '#666',
                padding: '20px'
              }}>
                <p>您可以向智能体咨询关于儿童中成药口服制剂的信息，例如：</p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                  <li style={{ margin: '8px 0' }}>• 小儿感冒颗粒的成分是什么？</li>
                  <li style={{ margin: '8px 0' }}>• 儿童感冒发烧应该吃什么药？</li>
                  <li style={{ margin: '8px 0' }}>• 小儿止咳糖浆的用法用量？</li>
                </ul>
              </div>
            )}
          </div>
          
          {/* 问题输入区域 */}
          <form onSubmit={handleAgentSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="请输入您的问题..."
              value={agentQuestion}
              onChange={(e) => setAgentQuestion(e.target.value)}
              disabled={isAgentLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #e0e0e0',
                borderRadius: '24px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <button
              type="submit"
              disabled={!agentQuestion.trim() || isAgentLoading}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
              onDisabledMouseEnter={(e) => e.target.style.backgroundColor = '#cccccc'}
            >
              发送
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChineseMedicineDosageCalculator;