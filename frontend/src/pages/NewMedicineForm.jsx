import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';

const NewMedicineForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // 状态管理
  const [formData, setFormData] = useState({
    name: {
      generic: '',
      brand: ['']
    },
    drugCode: '',
    pinyinCode: '',
    specification: '',
    pharmacyUnit: '',
    dosageAmount: '',
    dosageForm: '',
    administrationRoute: '',
    instructionUrl: '',
    // 新增必填字段
    manufacturer: '',
    approvalNumber: '',
    drugType: '', // 药品类型（处方药/非处方药）
    expiryDate: '', // 有效期至
    stockQuantity: '', // 库存数量
    purchasePrice: '', // 采购单价
    packagingImage: '', // 药品包装图片URL
    description: '' // 简要药品说明书
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 批量导入导出状态
  const [importFile, setImportFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState({ success: 0, failed: 0, errors: [] });
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState([
    'drugCode', 'name.generic', 'pinyinCode', 'specification', 
    'pharmacyUnit', 'dosageAmount', 'dosageForm', 'administrationRoute', 'instructionUrl'
  ]);
  const [isExporting, setIsExporting] = useState(false);

  // 加载现有药品数据（编辑模式）
  useEffect(() => {
    if (isEditMode) {
      loadMedicineData();
    }
  }, [isEditMode, id]);

  const loadMedicineData = async () => {
    try {
      const response = await axios.get(`/api/medicines/${id}`);
      const medicine = response.data;
      setFormData(medicine);
    } catch (error) {
      console.error('加载药品数据失败:', error);
      alert('加载药品数据失败，请重试');
      navigate('/');
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    // 必填字段验证
    if (!formData.name.generic.trim()) {
      newErrors.genericName = '请输入药品通用名称';
    }

    if (!formData.name.brand.some(brand => brand.trim())) {
      newErrors.brandName = '请输入商品名称';
    }

    if (!formData.drugCode.trim()) {
      newErrors.drugCode = '请输入药品编码';
    }

    if (!formData.specification.trim()) {
      newErrors.specification = '请输入药品规格';
    }

    if (!formData.drugType.trim()) {
      newErrors.drugType = '请选择药品类型';
    }

    if (!formData.dosageForm.trim()) {
      newErrors.dosageForm = '请输入药品剂型';
    }

    if (!formData.pharmacyUnit.trim()) {
      newErrors.pharmacyUnit = '请输入药房单位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单字段变化
  const handleChange = (e, field) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除该字段的错误信息
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 处理嵌套字段变化
  const handleNestedChange = (e, parentField, childField) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
    
    // 清除相关错误信息
    if (errors[childField]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[childField];
        return newErrors;
      });
    }
  };

  // 处理数组字段变化
  const handleArrayChange = (index, value, field) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
    
    // 清除相关错误信息
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 添加数组项
  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // 删除数组项
  const removeArrayItem = (index, field) => {
    if (formData[field].length <= 1) return; // 至少保留一个
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      [field]: newArray
    }));
  };
  
  // 批量导入功能
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
    }
  };
  
  // 验证导入数据
  const validateImportData = (data) => {
    const errors = [];
    
    data.forEach((item, index) => {
      const rowErrors = [];
      
      // 验证必填字段
      if (!item.drugCode?.trim()) {
        rowErrors.push('药品编码不能为空');
      }
      
      if (!item.genericName?.trim()) {
        rowErrors.push('药品名称不能为空');
      }
      
      if (!item.specification?.trim()) {
        rowErrors.push('规格不能为空');
      }
      
      if (!item.pharmacyUnit?.trim()) {
        rowErrors.push('药房单位不能为空');
      }
      
      if (!item.dosageForm?.trim()) {
        rowErrors.push('剂型不能为空');
      }
      
      if (rowErrors.length > 0) {
        errors.push({
          row: index + 2, // 考虑表头行
          data: item,
          errors: rowErrors
        });
      }
    });
    
    return errors;
  };
  
  // 处理导入数据
  const processImportedData = (data) => {
    return data.map(item => ({
      name: {
        generic: item.genericName?.trim() || '',
        brand: [item.brandName?.trim() || '']
      },
      drugCode: item.drugCode?.trim() || '',
      pinyinCode: item.pinyinCode?.trim() || '',
      specification: item.specification?.trim() || '',
      pharmacyUnit: item.pharmacyUnit?.trim() || '',
      dosageAmount: item.dosageAmount?.trim() || '',
      dosageForm: item.dosageForm?.trim() || '',
      administrationRoute: item.administrationRoute?.trim() || '',
      instructionUrl: item.instructionUrl?.trim() || ''
    }));
  };
  
  // 执行批量导入
  const handleImport = async () => {
    if (!importFile) {
      alert('请先选择要导入的文件');
      return;
    }
    
    setIsImporting(true);
    setImportProgress(0);
    setImportResult({ success: 0, failed: 0, errors: [] });
    
    try {
      // 读取文件
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // 验证数据
        const validationErrors = validateImportData(jsonData);
        if (validationErrors.length > 0) {
          setImportResult({ 
            success: 0, 
            failed: jsonData.length, 
            errors: validationErrors 
          });
          setIsImporting(false);
          return;
        }
        
        // 处理数据
        const processedData = processImportedData(jsonData);
        
        // 导入数据
        let successCount = 0;
        let failedCount = 0;
        const importErrors = [];
        
        for (let i = 0; i < processedData.length; i++) {
          try {
            await axios.post('/api/medicines', processedData[i]);
            successCount++;
          } catch (error) {
            failedCount++;
            importErrors.push({
              row: i + 2,
              data: jsonData[i],
              errors: [error.response?.data?.message || '导入失败']
            });
          }
          
          // 更新进度
          const progress = Math.round(((i + 1) / processedData.length) * 100);
          setImportProgress(progress);
        }
        
        setImportResult({ success: successCount, failed: failedCount, errors: importErrors });
        setIsImporting(false);
        
        // 重置文件输入
        document.getElementById('import-file').value = '';
        setImportFile(null);
      };
      
      reader.readAsArrayBuffer(importFile);
    } catch (error) {
      console.error('导入失败:', error);
      setImportResult({ 
        success: 0, 
        failed: 1, 
        errors: [{ row: 1, data: {}, errors: ['文件读取失败'] }] 
      });
      setIsImporting(false);
    }
  };
  
  // 批量导出功能
  const getExportData = async () => {
    try {
      const response = await axios.get('/api/medicines');
      return response.data.medicines;
    } catch (error) {
      console.error('获取导出数据失败:', error);
      alert('获取导出数据失败');
      return [];
    }
  };
  
  // 格式化导出数据
  const formatExportData = (data) => {
    return data.map(medicine => {
      const formatted = {};
      
      exportFields.forEach(field => {
        if (field.includes('.')) {
          // 处理嵌套字段，如name.generic
          const [parent, child] = field.split('.');
          formatted[field] = medicine[parent]?.[child] || '';
        } else {
          formatted[field] = medicine[field] || '';
        }
      });
      
      return formatted;
    });
  };
  
  // 执行批量导出
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // 获取数据
      const data = await getExportData();
      const formattedData = formatExportData(data);
      
      // 创建工作簿和工作表
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '药品数据');
      
      // 导出文件
      const fileName = `药品数据_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
      XLSX.writeFile(wb, fileName, { bookType: exportFormat, type: 'file' });
      
      setIsExporting(false);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
      setIsExporting(false);
    }
  };
  
  // 切换导出字段
  const toggleExportField = (field) => {
    setExportFields(prev => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      } else {
        return [...prev, field];
      }
    });
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 清理空数组项并为隐藏字段添加默认值
      const cleanedData = {
        ...formData,
        ingredients: formData.ingredients.filter(item => item.trim()),
        indications: formData.indications.filter(item => item.trim()),
        adverseReactions: formData.adverseReactions.filter(item => item.trim()),
        contraindications: formData.contraindications.filter(item => item.trim()),
        precautions: formData.precautions.filter(item => item.trim()),
        drugInteractions: formData.drugInteractions.filter(item => item.trim()),
        name: {
          ...formData.name,
          brand: formData.name.brand.filter(item => item.trim())
        },
        // 为隐藏字段添加默认值
        manufacturer: formData.manufacturer || '未填写',
        approvalNumber: formData.approvalNumber || '未填写',
        expiryDate: formData.expiryDate || new Date().toISOString().split('T')[0],
        stockQuantity: formData.stockQuantity || 0,
        purchasePrice: formData.purchasePrice || 0,
        packagingImage: formData.packagingImage || '',
        description: formData.description || ''
      };

      let response;
      if (isEditMode) {
        response = await axios.put(`/api/medicines/${id}`, cleanedData);
        alert('药品信息更新成功');
      } else {
        response = await axios.post('/api/medicines', cleanedData);
        alert('药品信息添加成功');
      }

      navigate('/');
    } catch (error) {
      console.error('提交失败:', error);
      alert(`操作失败: ${error.response?.data?.message || '未知错误'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染数组字段输入
  const renderArrayField = (field, label, placeholder) => {
    return (
      <div className="form-group">
        <label>{label} *</label>
        {formData[field].map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(index, e.target.value, field)}
              placeholder={placeholder}
              style={{ flex: 1, padding: '8px' }}
            />
            {formData[field].length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem(index, field)}
                className="btn-danger"
                style={{ padding: '8px', minWidth: '30px' }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem(field)}
          className="btn-secondary"
          style={{ marginTop: '4px', padding: '6px 12px' }}
        >
          + 添加{label}
        </button>
        {errors[field] && <div className="error-message">{errors[field]}</div>}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="feature-container">
        <h2 className="page-title">{isEditMode ? '编辑药品' : '添加药品'}</h2>
        
        {/* 批量导入导出功能 */}
        {!isEditMode && (
          <div className="batch-operations" style={{ marginBottom: '32px', padding: '24px', backgroundColor: '#f0f8ff', borderRadius: '12px', border: '1px solid #e3f2fd' }}>
            <h3 style={{ marginBottom: '20px', color: '#0d47a1', fontSize: '20px', fontWeight: '600' }}>批量操作</h3>
            
            {/* 批量导入 */}
            <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <h4 style={{ marginBottom: '16px', color: '#333', fontSize: '18px', fontWeight: '600' }}>批量导入</h4>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <input
                  type="file"
                  id="import-file"
                  accept=".xlsx, .csv"
                  onChange={handleFileChange}
                  style={{ flex: 1, padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px' }}
                  disabled={isImporting}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={isImporting || !importFile}
                >
                  {isImporting ? '导入中...' : '导入'}
                </button>
              </div>
              
              {/* 导入进度 */}
              {isImporting && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '8px', fontSize: '16px', color: '#666' }}>导入进度: {importProgress}%</div>
                  <div style={{ width: '100%', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div
                      style={{
                        width: `${importProgress}%`,
                        height: '100%',
                        backgroundColor: '#007bff',
                        transition: 'width 0.3s ease',
                        borderRadius: '5px',
                        boxShadow: '0 2px 4px rgba(0, 123, 255, 0.3)'
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* 导入结果 */}
              {(importResult.success > 0 || importResult.failed > 0) && (
                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '16px' }}>
                  <div style={{ marginBottom: '12px', fontWeight: '600', color: '#333' }}>导入结果:</div>
                  <div style={{ marginBottom: '8px' }}>成功: <span style={{ color: '#28a745', fontWeight: '600' }}>{importResult.success}</span> 条</div>
                  <div style={{ marginBottom: '12px' }}>失败: <span style={{ color: '#dc3545', fontWeight: '600' }}>{importResult.failed}</span> 条</div>
                  
                  {importResult.errors.length > 0 && (
                    <div style={{ marginTop: '16px', maxHeight: '250px', overflowY: 'auto', backgroundColor: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#333' }}>错误详情:</div>
                      {importResult.errors.map((error, index) => (
                        <div key={index} style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#fff3f3', borderRadius: '8px', fontSize: '14px', borderLeft: '4px solid #dc3545' }}>
                          <div style={{ fontWeight: '600', color: '#dc3545' }}>行 {error.row}:</div>
                          <div style={{ margin: '8px 0', color: '#666' }}>{error.errors.join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* 批量导出 */}
            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <h4 style={{ marginBottom: '16px', color: '#333', fontSize: '18px', fontWeight: '600' }}>批量导出</h4>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '12px', fontWeight: '600', color: '#333' }}>导出格式:</div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      style={{ width: '20px', height: '20px', accentColor: '#007bff' }}
                    />
                    <span>CSV</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="exportFormat"
                      value="xlsx"
                      checked={exportFormat === 'xlsx'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      style={{ width: '20px', height: '20px', accentColor: '#007bff' }}
                    />
                    <span>Excel</span>
                  </label>
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '12px', fontWeight: '600', color: '#333' }}>导出字段:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                  {[
                    { field: 'drugCode', label: '药品编码' },
                    { field: 'name.generic', label: '药品名称' },
                    { field: 'pinyinCode', label: '拼音码' },
                    { field: 'specification', label: '规格' },
                    { field: 'pharmacyUnit', label: '药房单位' },
                    { field: 'dosageAmount', label: '剂量' },
                    { field: 'dosageForm', label: '剂型' },
                    { field: 'administrationRoute', label: '用药途径' },
                    { field: 'instructionUrl', label: '说明书网址' }
                  ].map(({ field, label }) => (
                    <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={exportFields.includes(field)}
                        onChange={() => toggleExportField(field)}
                        style={{ width: '20px', height: '20px', accentColor: '#007bff' }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExport}
                  disabled={isExporting || exportFields.length === 0}
                >
                  {isExporting ? '导出中...' : '导出'}
                </button>
                {exportFields.length === 0 && (
                  <span style={{ color: '#dc3545', fontSize: '16px' }}>请至少选择一个导出字段</span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="medicine-form">
          {/* 药品基本信息 */}
          <div className="card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '24px', color: '#333', fontSize: '20px', fontWeight: '600', borderBottom: '3px solid #007bff', paddingBottom: '12px', display: 'inline-block' }}>药品基本信息</h3>
            
            {/* 药品编码和通用名称 */}
            <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '16px' }}>药品编码 *</label>
                <input
                  type="text"
                  value={formData.drugCode}
                  onChange={(e) => handleChange(e, 'drugCode')}
                  placeholder="请输入药品编码"
                />
                {errors.drugCode && <div className="error-message">{errors.drugCode}</div>}
              </div>
              
              <div className="form-group" style={{ flex: 2, minWidth: '300px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '16px' }}>药品通用名称 *</label>
                <input
                  type="text"
                  value={formData.name.generic}
                  onChange={(e) => handleNestedChange(e, 'name', 'generic')}
                  placeholder="请输入药品通用名称"
                />
                {errors.genericName && <div className="error-message">{errors.genericName}</div>}
              </div>
            </div>
            
            {/* 商品名称 */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '16px' }}>商品名称 *</label>
              {formData.name.brand.map((brand, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'name.brand')}
                    placeholder="请输入商品名称"
                    style={{ flex: 1, padding: '8px' }}
                  />
                  {formData.name.brand.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'name.brand')}
                      className="btn-danger"
                      style={{ padding: '8px 12px' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('name.brand')}
                className="btn-secondary"
                style={{ marginTop: '4px', padding: '6px 12px' }}
              >
                + 添加商品名称
              </button>
              {errors.brandName && <div className="error-message">{errors.brandName}</div>}
            </div>
            
            {/* 生产厂家和批准文号 - 已隐藏 */}
            
            {/* 药品类型和剂型 */}
            <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '16px' }}>药品类型 *</label>
                <select
                  value={formData.drugType}
                  onChange={(e) => handleChange(e, 'drugType')}
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">请选择药品类型</option>
                  <option value="处方药">处方药</option>
                  <option value="非处方药">非处方药</option>
                </select>
                {errors.drugType && <div className="error-message">{errors.drugType}</div>}
              </div>
              
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '16px' }}>药品剂型 *</label>
                <input
                  type="text"
                  value={formData.dosageForm}
                  onChange={(e) => handleChange(e, 'dosageForm')}
                  placeholder="请输入药品剂型（如：颗粒剂、片剂）"
                />
                {errors.dosageForm && <div className="error-message">{errors.dosageForm}</div>}
              </div>
            </div>
            
            {/* 规格和药房单位 */}
            <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '250px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '16px' }}>药品规格 *</label>
                <input
                  type="text"
                  value={formData.specification}
                  onChange={(e) => handleChange(e, 'specification')}
                  placeholder="请输入药品规格（如：每袋6g）"
                />
                {errors.specification && <div className="error-message">{errors.specification}</div>}
              </div>
              
              <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '16px' }}>药房单位 *</label>
                <input
                  type="text"
                  value={formData.pharmacyUnit}
                  onChange={(e) => handleChange(e, 'pharmacyUnit')}
                  placeholder="请输入药房单位（如：袋、盒）"
                />
                {errors.pharmacyUnit && <div className="error-message">{errors.pharmacyUnit}</div>}
              </div>
            </div>
            
            {/* 有效期至、库存数量和采购单价 - 已隐藏 */}
            
            {/* 剂量和用药途径 */}
            <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '16px' }}>剂量</label>
                <input
                  type="text"
                  value={formData.dosageAmount}
                  onChange={(e) => handleChange(e, 'dosageAmount')}
                  placeholder="请输入剂量（如：6g）"
                />
              </div>
              
              <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '16px' }}>用药途径</label>
                <input
                  type="text"
                  value={formData.administrationRoute}
                  onChange={(e) => handleChange(e, 'administrationRoute')}
                  placeholder="请输入用药途径（如：口服、外用）"
                />
              </div>
            </div>
            
            {/* 药品包装图片和说明书网址 - 已隐藏 */}
            
            {/* 简要药品说明书 - 已隐藏 */}
          </div>

          {/* 提交按钮 */}
          <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '提交中...' : (isEditMode ? '更新药品' : '添加药品')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMedicineForm;