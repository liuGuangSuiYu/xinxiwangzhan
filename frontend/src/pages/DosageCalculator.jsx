import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faExclamationTriangle, faBirthdayCake, faBalanceScale, faChartArea } from '@fortawesome/free-solid-svg-icons';

function DosageCalculator() {
  const [activeType, setActiveType] = useState('age');
  const [results, setResults] = useState(null);
  
  // 体重计算相关状态
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [dailyDosage, setDailyDosage] = useState('');
  const [dosageUnit, setDosageUnit] = useState('mg/kg');
  const [frequency, setFrequency] = useState('3');
  
  // 年龄计算相关状态
  const [age, setAge] = useState('');
  const [ageUnit, setAgeUnit] = useState('years');
  const [adultDosage, setAdultDosage] = useState('');
  
  // 体表面积计算相关状态
  const [height, setHeight] = useState('');
  const [bsaDosage, setBsaDosage] = useState('');
  const [bsaUnit, setBsaUnit] = useState('mg/m2');

  // 根据体重计算剂量
  const calculateByWeight = () => {
    if (!weight || !dailyDosage) {
      alert('请填写完整的体重和每日剂量信息');
      return;
    }
    
    const weightValue = parseFloat(weight);
    const dosageValue = parseFloat(dailyDosage);
    
    if (isNaN(weightValue) || isNaN(dosageValue)) {
      alert('请输入有效的数字');
      return;
    }
    
    // 转换为统一单位（kg）
    const weightInKg = weightUnit === 'g' ? weightValue / 1000 : weightValue;
    
    // 计算每日总剂量
    const totalDaily = weightInKg * dosageValue;
    // 计算单次剂量
    const singleDose = totalDaily / parseInt(frequency);
    
    setResults({
      type: 'weight',
      totalDaily: totalDaily.toFixed(2),
      singleDose: singleDose.toFixed(2),
      frequency: frequency
    });
  };

  // 根据年龄计算剂量
  const calculateByAge = () => {
    if (!age || !adultDosage) {
      alert('请填写完整的年龄和成人剂量信息');
      return;
    }
    
    const ageValue = parseFloat(age);
    const adultDose = parseFloat(adultDosage);
    
    if (isNaN(ageValue) || isNaN(adultDose)) {
      alert('请输入有效的数字');
      return;
    }
    
    // 转换为统一单位（岁）
    const ageInYears = ageUnit === 'months' ? ageValue / 12 : ageValue;
    let childDose = 0;
    
    // 根据年龄计算儿童剂量（简化公式）
    if (ageInYears <= 1) {
      childDose = adultDose * (ageInYears / 24);
    } else if (ageInYears <= 12) {
      childDose = adultDose * (ageInYears / (ageInYears + 12));
    } else {
      childDose = adultDose;
    }
    
    setResults({
      type: 'age',
      childDose: childDose.toFixed(2)
    });
  };

  // 根据体表面积计算剂量
  const calculateByBSA = () => {
    if (!weight || !height || !bsaDosage) {
      alert('请填写完整的体重、身高和剂量信息');
      return;
    }
    
    const weightValue = parseFloat(weight);
    const heightValue = parseFloat(height);
    const dosageValue = parseFloat(bsaDosage);
    
    if (isNaN(weightValue) || isNaN(heightValue) || isNaN(dosageValue)) {
      alert('请输入有效的数字');
      return;
    }
    
    // 计算体表面积（m²）- 使用Mosteller公式：√(身高(cm) × 体重(kg) / 3600)
    const bsa = Math.sqrt((heightValue * weightValue) / 3600);
    // 计算剂量
    const dose = bsa * dosageValue;
    
    setResults({
      type: 'bsa',
      bsa: bsa.toFixed(3),
      dose: dose.toFixed(2)
    });
  };

  // 处理计算按钮点击
  const handleCalculate = () => {
    switch (activeType) {
      case 'weight':
        calculateByWeight();
        break;
      case 'age':
        calculateByAge();
        break;
      case 'bsa':
        calculateByBSA();
        break;
      default:
        break;
    }
  };

  return (
    <div className="dosage-calculator">
      <header>
        <div className="logo">
          <FontAwesomeIcon icon={faCalculator} />
          <h1>儿童用药剂量计算器</h1>
        </div>
        <p className="subtitle">为您的孩子提供安全、准确的用药剂量参考</p>
      </header>
      
      <div className="warning-box">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <strong>温馨提示：</strong>本计算器仅供参考，实际用药请严格遵循医嘱或药品说明书。
      </div>
      
      <div className="calculator-types">
        <div 
          className={`calc-type ${activeType === 'age' ? 'active' : ''}`}
          onClick={() => setActiveType('age')}
        >
          <div className="calc-icon">
            <FontAwesomeIcon icon={faBirthdayCake} />
          </div>
          <h3>按年龄计算</h3>
          <p>根据儿童年龄和成人剂量计算</p>
        </div>
        
        <div 
          className={`calc-type ${activeType === 'weight' ? 'active' : ''}`}
          onClick={() => setActiveType('weight')}
        >
          <div className="calc-icon">
            <FontAwesomeIcon icon={faBalanceScale} />
          </div>
          <h3>按体重计算</h3>
          <p>根据儿童体重和每日剂量计算</p>
        </div>
        
        <div 
          className={`calc-type ${activeType === 'bsa' ? 'active' : ''}`}
          onClick={() => setActiveType('bsa')}
        >
          <div className="calc-icon">
            <FontAwesomeIcon icon={faChartArea} />
          </div>
          <h3>按体表面积计算</h3>
          <p>根据儿童身高、体重计算</p>
        </div>
      </div>
      
      <div className="calculator-container">
        <div className="calc-header">
          <FontAwesomeIcon icon={faCalculator} />
          <h2>{activeType === 'age' ? '按年龄计算' : activeType === 'weight' ? '按体重计算' : '按体表面积计算'}</h2>
        </div>
        
        <div className="form-row">
          {/* 年龄计算表单 */}
          {activeType === 'age' && (
            <>
              <div className="input-group">
                <label>儿童年龄</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    placeholder="请输入年龄" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
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
              </div>
              
              <div className="input-group">
                <label>成人剂量</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    placeholder="请输入成人剂量" 
                    value={adultDosage}
                    onChange={(e) => setAdultDosage(e.target.value)}
                  />
                  <span className="unit">mg</span>
                </div>
              </div>
            </>
          )}
          
          {/* 体重计算表单 */}
          {activeType === 'weight' && (
            <>
              <div className="input-group">
                <label>儿童体重</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="请输入体重" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
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
              </div>
              
              <div className="input-group">
                <label>每日剂量</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    placeholder="请输入每日剂量" 
                    value={dailyDosage}
                    onChange={(e) => setDailyDosage(e.target.value)}
                  />
                  <select 
                    className="unit" 
                    value={dosageUnit}
                    onChange={(e) => setDosageUnit(e.target.value)}
                  >
                    <option value="mg/kg">mg/kg</option>
                    <option value="g/kg">g/kg</option>
                  </select>
                </div>
              </div>
              
              <div className="input-group">
                <label>每日给药次数</label>
                <div className="input-with-unit">
                  <select 
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <option value="1">1次</option>
                    <option value="2">2次</option>
                    <option value="3">3次</option>
                    <option value="4">4次</option>
                  </select>
                  <span className="unit">/日</span>
                </div>
              </div>
            </>
          )}
          
          {/* 体表面积计算表单 */}
          {activeType === 'bsa' && (
            <>
              <div className="input-group">
                <label>儿童体重</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="请输入体重" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  <span className="unit">kg</span>
                </div>
              </div>
              
              <div className="input-group">
                <label>儿童身高</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    step="0.1" 
                    placeholder="请输入身高" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                  <span className="unit">cm</span>
                </div>
              </div>
              
              <div className="input-group">
                <label>每平方米剂量</label>
                <div className="input-with-unit">
                  <input 
                    type="number" 
                    placeholder="请输入剂量" 
                    value={bsaDosage}
                    onChange={(e) => setBsaDosage(e.target.value)}
                  />
                  <select 
                    className="unit" 
                    value={bsaUnit}
                    onChange={(e) => setBsaUnit(e.target.value)}
                  >
                    <option value="mg/m2">mg/m²</option>
                    <option value="g/m2">g/m²</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
        
        <button className="calculate-btn" onClick={handleCalculate}>
          <FontAwesomeIcon icon={faCalculator} />
          计算剂量
        </button>
        
        {/* 结果显示 */}
        {results && (
          <div className="result-box">
            <h3>计算结果</h3>
            {results.type === 'weight' && (
              <>
                <div className="result-item">
                  <span className="result-label">每日总剂量：</span>
                  <span className="result-value">{results.totalDaily} mg</span>
                </div>
                <div className="result-item">
                  <span className="result-label">单次剂量：</span>
                  <span className="result-value">{results.singleDose} mg</span>
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
                <span className="result-value">{results.childDose} mg</span>
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
                  <span className="result-value">{results.dose} mg</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      

    </div>
  );
}

export default DosageCalculator;