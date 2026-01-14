import React, { useState, useMemo } from 'react';

const RUCAMCalculator = () => {
  // Drug and lab values
  const [drugName, setDrugName] = useState('');
  const [altValue, setAltValue] = useState('');
  const [altUln, setAltUln] = useState('');
  const [alpValue, setAlpValue] = useState('');
  const [alpUln, setAlpUln] = useState('');

  // Scoring selections
  const [timeToOnset, setTimeToOnset] = useState('');
  const [course, setCourse] = useState('');
  const [riskAlcohol, setRiskAlcohol] = useState('');
  const [riskAge, setRiskAge] = useState('');
  const [concomitantDrugs, setConcomitantDrugs] = useState('');
  const [exclusion, setExclusion] = useState('');
  const [previousReport, setPreviousReport] = useState('');
  const [rechallenge, setRechallenge] = useState('');

  // Calculate R value and injury type
  const calculations = useMemo(() => {
    const alt = Number.parseFloat(altValue);
    const altU = Number.parseFloat(altUln);
    const alp = Number.parseFloat(alpValue);
    const alpU = Number.parseFloat(alpUln);

    const altRatio = altU > 0 ? alt / altU : 0;
    const alpRatio = alpU > 0 ? alp / alpU : 0;
    const rValue = alpRatio > 0 ? altRatio / alpRatio : 0;

    let injuryType = null;
    if (rValue >= 5) {
      injuryType = 'hepatocellular';
    } else if (rValue <= 2 && rValue > 0) {
      injuryType = 'cholestatic';
    } else if (rValue > 2 && rValue < 5) {
      injuryType = 'cholestatic';
    }

    return { altRatio, alpRatio, rValue, injuryType };
  }, [altValue, altUln, alpValue, alpUln]);

  // Calculate total score
  const totalScore = useMemo(() => {
    let score = 0;

    // Time to onset
    if (timeToOnset) {
      score += Number.parseInt(timeToOnset);
    }

    // Course
    if (course) {
      score += Number.parseInt(course);
    }

    // Risk factors - Alcohol
    if (riskAlcohol) {
      score += Number.parseInt(riskAlcohol);
    }

    // Risk factors - Age
    if (riskAge) {
      score += Number.parseInt(riskAge);
    }

    // Concomitant drugs
    if (concomitantDrugs) {
      score += Number.parseInt(concomitantDrugs);
    }

    // Exclusion of other causes
    if (exclusion) {
      score += Number.parseInt(exclusion);
    }

    // Previous hepatotoxicity report
    if (previousReport) {
      score += Number.parseInt(previousReport);
    }

    // Rechallenge
    if (rechallenge) {
      score += Number.parseInt(rechallenge);
    }

    return score;
  }, [timeToOnset, course, riskAlcohol, riskAge, concomitantDrugs, exclusion, previousReport, rechallenge]);

  // Calculate liver injury percentage based on RUCAM score
  const injuryPercentage = useMemo(() => {
    // RUCAM score range: typically -5 to 12
    const minScore = -5;
    const maxScore = 12;
    
    // Map score to 0-100% range
    let percentage = Math.round(((totalScore - minScore) / (maxScore - minScore)) * 100);
    
    // Ensure percentage is within 0-100 range
    percentage = Math.max(0, Math.min(100, percentage));
    
    return percentage;
  }, [totalScore]);

  const getScoreInterpretation = (score) => {
    if (score <= 0) return { text: '排除', color: 'text-gray-600' };
    if (score <= 2) return { text: '不太可能', color: 'text-yellow-600' };
    if (score <= 5) return { text: '可能', color: 'text-orange-500' };
    if (score <= 8) return { text: '很可能', color: 'text-red-500' };
    return { text: '极可能', color: 'text-red-700' };
  };

  const handleCalculate = () => {
    // Results will be shown automatically due to useMemo
  };

  const handleReset = () => {
    setDrugName('');
    setAltValue('');
    setAltUln('');
    setAlpValue('');
    setAlpUln('');
    setTimeToOnset('');
    setCourse('');
    setRiskAlcohol('');
    setRiskAge('');
    setConcomitantDrugs('');
    setExclusion('');
    setPreviousReport('');
    setRechallenge('');
  };

  const interpretation = getScoreInterpretation(totalScore);

  return (
    <div className="rucam-calculator">
      <div className="page-header">
        <h1>RUCAM药物性肝损伤评估计算器</h1>
        <p className="subtitle">Roussel Uclaf Causality Assessment Method</p>
      </div>

      <div className="calculator-content">
        {/* Drug Information */}
        <section className="form-section">
          <h2 className="section-title">药物信息</h2>
          <div className="form-group">
            <label htmlFor="drugName">药物名称</label>
            <input
              type="text"
              id="drugName"
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              placeholder="请输入药物名称"
            />
          </div>
        </section>

        {/* Lab Values */}
        <section className="form-section">
          <h2 className="section-title">实验室检查值</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="altValue">ALT值 (U/L)</label>
              <input
                type="number"
                id="altValue"
                value={altValue}
                onChange={(e) => setAltValue(e.target.value)}
                placeholder="请输入ALT值"
              />
            </div>
            <div className="form-group">
              <label htmlFor="altUln">ALT正常上限 (ULN)</label>
              <input
                type="number"
                id="altUln"
                value={altUln}
                onChange={(e) => setAltUln(e.target.value)}
                placeholder="请输入ALT正常上限"
              />
            </div>
            <div className="form-group">
              <label htmlFor="alpValue">ALP值 (U/L)</label>
              <input
                type="number"
                id="alpValue"
                value={alpValue}
                onChange={(e) => setAlpValue(e.target.value)}
                placeholder="请输入ALP值"
              />
            </div>
            <div className="form-group">
              <label htmlFor="alpUln">ALP正常上限 (ULN)</label>
              <input
                type="number"
                id="alpUln"
                value={alpUln}
                onChange={(e) => setAlpUln(e.target.value)}
                placeholder="请输入ALP正常上限"
              />
            </div>
          </div>
        </section>

        {/* R Value Display */}
        <section className="form-section r-value-section">
          <h2 className="section-title">R值计算结果</h2>
          <div className="r-value-grid grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="r-value-item">
              <span className="r-value-label">ALT比值:</span>
              <span className="r-value-result">{calculations.altRatio > 0 ? calculations.altRatio.toFixed(2) : '-'}</span>
            </div>
            <div className="r-value-item">
              <span className="r-value-label">ALP比值:</span>
              <span className="r-value-result">{calculations.alpRatio > 0 ? calculations.alpRatio.toFixed(2) : '-'}</span>
            </div>
            <div className="r-value-item">
              <span className="r-value-label">R值:</span>
              <span className="r-value-result">{calculations.rValue > 0 ? calculations.rValue.toFixed(2) : '-'}</span>
            </div>
            <div className="r-value-item">
              <span className="r-value-label">损伤类型:</span>
              <span className="r-value-result">
                {calculations.injuryType === 'hepatocellular' ? '肝细胞型' : 
                 calculations.injuryType === 'cholestatic' ? '胆汁淤积型' : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* Scoring Criteria */}
        <section className="form-section">
          <h2 className="section-title">评分标准</h2>

          {/* Time to Onset */}
          <div className="score-item">
            <h3 className="score-title">1. 药物使用至发病时间</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="timeToOnset"
                  value="2"
                  checked={timeToOnset === '2'}
                  onChange={(e) => setTimeToOnset(e.target.value)}
                />
                <span className="radio-text">肝细胞型: 5-90天 (+2分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="timeToOnset"
                  value="1"
                  checked={timeToOnset === '1'}
                  onChange={(e) => setTimeToOnset(e.target.value)}
                />
                <span className="radio-text">肝细胞型: &lt;5天或&gt;90天 (+1分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="timeToOnset"
                  value="0"
                  checked={timeToOnset === '0'}
                  onChange={(e) => setTimeToOnset(e.target.value)}
                />
                <span className="radio-text">胆汁淤积型: 5-90天 (+2分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="timeToOnset"
                  value="-1"
                  checked={timeToOnset === '-1'}
                  onChange={(e) => setTimeToOnset(e.target.value)}
                />
                <span className="radio-text">胆汁淤积型: &lt;5天或&gt;90天 (+1分)</span>
              </label>
            </div>
          </div>

          {/* Course */}
          <div className="score-item">
            <h3 className="score-title">2. 停药后病程</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="course"
                  value="3"
                  checked={course === '3'}
                  onChange={(e) => setCourse(e.target.value)}
                />
                <span className="radio-text">肝细胞型: 8天内ALT下降≥50% (+3分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="course"
                  value="2"
                  checked={course === '2'}
                  onChange={(e) => setCourse(e.target.value)}
                />
                <span className="radio-text">肝细胞型: 30天内ALT下降≥50% (+2分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="course"
                  value="0"
                  checked={course === '0'}
                  onChange={(e) => setCourse(e.target.value)}
                />
                <span className="radio-text">肝细胞型: 持续或无改善或无数据 (0分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="course"
                  value="3"
                  checked={course === '3'}
                  onChange={(e) => setCourse(e.target.value)}
                />
                <span className="radio-text">胆汁淤积型: 180天内ALP下降≥50% (+3分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="course"
                  value="1"
                  checked={course === '1'}
                  onChange={(e) => setCourse(e.target.value)}
                />
                <span className="radio-text">胆汁淤积型: 180天内ALP下降&lt;50% (+1分)</span>
              </label>
            </div>
          </div>

          {/* Risk Factors - Alcohol */}
          <div className="score-item">
            <h3 className="score-title">3. 危险因素 - 饮酒</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="riskAlcohol"
                  value="1"
                  checked={riskAlcohol === '1'}
                  onChange={(e) => setRiskAlcohol(e.target.value)}
                />
                <span className="radio-text">肝细胞型: 饮酒 (+1分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="riskAlcohol"
                  value="0"
                  checked={riskAlcohol === '0'}
                  onChange={(e) => setRiskAlcohol(e.target.value)}
                />
                <span className="radio-text">肝细胞型: 无饮酒 (0分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="riskAlcohol"
                  value="0"
                  checked={riskAlcohol === '0'}
                  onChange={(e) => setRiskAlcohol(e.target.value)}
                />
                <span className="radio-text">胆汁淤积型: 饮酒 (0分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="riskAlcohol"
                  value="0"
                  checked={riskAlcohol === '0'}
                  onChange={(e) => setRiskAlcohol(e.target.value)}
                />
                <span className="radio-text">胆汁淤积型: 无饮酒 (0分)</span>
              </label>
            </div>
          </div>

          {/* Risk Factors - Age */}
          <div className="score-item">
            <h3 className="score-title">4. 危险因素 - 年龄</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="riskAge"
                  value="1"
                  checked={riskAge === '1'}
                  onChange={(e) => setRiskAge(e.target.value)}
                />
                <span className="radio-text">肝细胞型: ≥55岁 (+1分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="riskAge"
                  value="0"
                  checked={riskAge === '0'}
                  onChange={(e) => setRiskAge(e.target.value)}
                />
                <span className="radio-text">肝细胞型: &lt;55岁 (0分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="riskAge"
                  value="1"
                  checked={riskAge === '1'}
                  onChange={(e) => setRiskAge(e.target.value)}
                />
                <span className="radio-text">胆汁淤积型: ≥55岁 (+1分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="riskAge"
                  value="0"
                  checked={riskAge === '0'}
                  onChange={(e) => setRiskAge(e.target.value)}
                />
                <span className="radio-text">胆汁淤积型: &lt;55岁 (0分)</span>
              </label>
            </div>
          </div>

          {/* Concomitant Drugs */}
          <div className="score-item">
            <h3 className="score-title">5. 合并用药</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="concomitantDrugs"
                  value="-1"
                  checked={concomitantDrugs === '-1'}
                  onChange={(e) => setConcomitantDrugs(e.target.value)}
                />
                <span className="radio-text">有已知肝毒性药物或停药后改善 (-1分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="concomitantDrugs"
                  value="0"
                  checked={concomitantDrugs === '0'}
                  onChange={(e) => setConcomitantDrugs(e.target.value)}
                />
                <span className="radio-text">无已知肝毒性药物 (0分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="concomitantDrugs"
                  value="1"
                  checked={concomitantDrugs === '1'}
                  onChange={(e) => setConcomitantDrugs(e.target.value)}
                />
                <span className="radio-text">无合并用药 (+1分)</span>
              </label>
            </div>
          </div>

          {/* Exclusion of Other Causes */}
          <div className="score-item">
            <h3 className="score-title">6. 排除其他原因</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="exclusion"
                  value="2"
                  checked={exclusion === '2'}
                  onChange={(e) => setExclusion(e.target.value)}
                />
                <span className="radio-text">排除所有其他原因 (+2分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="exclusion"
                  value="1"
                  checked={exclusion === '1'}
                  onChange={(e) => setExclusion(e.target.value)}
                />
                <span className="radio-text">排除其他原因 (+1分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="exclusion"
                  value="0"
                  checked={exclusion === '0'}
                  onChange={(e) => setExclusion(e.target.value)}
                />
                <span className="radio-text">其他原因可能 (0分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="exclusion"
                  value="-2"
                  checked={exclusion === '-2'}
                  onChange={(e) => setExclusion(e.target.value)}
                />
                <span className="radio-text">其他原因很可能 (-2分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="exclusion"
                  value="-3"
                  checked={exclusion === '-3'}
                  onChange={(e) => setExclusion(e.target.value)}
                />
                <span className="radio-text">其他原因明确 (-3分)</span>
              </label>
            </div>
          </div>

          {/* Previous Hepatotoxicity Report */}
          <div className="score-item">
            <h3 className="score-title">7. 既往肝毒性报告</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="previousReport"
                  value="2"
                  checked={previousReport === '2'}
                  onChange={(e) => setPreviousReport(e.target.value)}
                />
                <span className="radio-text">有 (+2分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="previousReport"
                  value="0"
                  checked={previousReport === '0'}
                  onChange={(e) => setPreviousReport(e.target.value)}
                />
                <span className="radio-text">无 (0分)</span>
              </label>
            </div>
          </div>

          {/* Rechallenge */}
          <div className="score-item">
            <h3 className="score-title">8. 药物再激发</h3>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="rechallenge"
                  value="3"
                  checked={rechallenge === '3'}
                  onChange={(e) => setRechallenge(e.target.value)}
                />
                <span className="radio-text">阳性 (+3分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="rechallenge"
                  value="0"
                  checked={rechallenge === '0'}
                  onChange={(e) => setRechallenge(e.target.value)}
                />
                <span className="radio-text">未进行 (0分)</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="rechallenge"
                  value="-2"
                  checked={rechallenge === '-2'}
                  onChange={(e) => setRechallenge(e.target.value)}
                />
                <span className="radio-text">阴性 (-2分)</span>
              </label>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={handleCalculate}>计算评分</button>
          <button className="btn btn-secondary" onClick={handleReset}>重置</button>
        </div>

        {/* Results Display */}
        <div className="result-section">
          <h2 className="section-title">评估结果</h2>
          <div className="result-card">
            <div className="result-grid grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="result-item">
                <span className="result-label">总分:</span>
                <span className="result-value">{totalScore}</span>
              </div>
              <div className="result-item">
                <span className="result-label">评估结论:</span>
                <span className={`result-value ${interpretation.color}`}>{interpretation.text}</span>
              </div>
              <div className="result-item">
                <span className="result-label">肝损伤可能性:</span>
                <span className="result-value text-blue-600">{injuryPercentage}%</span>
              </div>
            </div>
            
            {/* 肝损伤程度百分比显示 */}
            <div className="injury-percentage-section" style={{ margin: '20px 0' }}>
              <h4 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>肝损伤可能性评估</h4>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
                该百分比基于RUCAM评分系统，反映药物导致肝损伤的可能性程度
              </div>
              <div style={{ width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                <div
                  style={{
                    width: `${injuryPercentage}%`,
                    height: '100%',
                    backgroundColor: injuryPercentage < 20 ? '#4ade80' : 
                                     injuryPercentage < 40 ? '#a3e635' :
                                     injuryPercentage < 60 ? '#facc15' :
                                     injuryPercentage < 80 ? '#f97316' : '#ef4444',
                    transition: 'width 0.5s ease-in-out',
                    borderRadius: '10px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                <span>0% 排除</span>
                <span>20% 不太可能</span>
                <span>40% 可能</span>
                <span>60% 很可能</span>
                <span>100% 极可能</span>
              </div>
            </div>
            
            <div className="score-breakdown">
              <h4>评分明细:</h4>
              <ul>
                {timeToOnset && <li>药物使用至发病时间: {parseInt(timeToOnset) > 0 ? '+' : ''}{timeToOnset}分</li>}
                {course && <li>停药后病程: {parseInt(course) > 0 ? '+' : ''}{course}分</li>}
                {riskAlcohol && <li>危险因素 - 饮酒: {parseInt(riskAlcohol) > 0 ? '+' : ''}{riskAlcohol}分</li>}
                {riskAge && <li>危险因素 - 年龄: {parseInt(riskAge) > 0 ? '+' : ''}{riskAge}分</li>}
                {concomitantDrugs && <li>合并用药: {parseInt(concomitantDrugs) > 0 ? '+' : ''}{concomitantDrugs}分</li>}
                {exclusion && <li>排除其他原因: {parseInt(exclusion) > 0 ? '+' : ''}{exclusion}分</li>}
                {previousReport && <li>既往肝毒性报告: {parseInt(previousReport) > 0 ? '+' : ''}{previousReport}分</li>}
                {rechallenge && <li>药物再激发: {parseInt(rechallenge) > 0 ? '+' : ''}{rechallenge}分</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RUCAMCalculator;
