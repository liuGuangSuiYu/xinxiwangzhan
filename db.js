const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

// 初始化数据库
const initDatabase = async () => {
  try {
    // 创建数据库文件路径
    const dbPath = path.join(__dirname, 'db', 'medicines.json');
    
    // 定义默认数据
    const defaultData = {
      medicines: [],
      categories: [],
      version: '1.0.0',
      createdAt: new Date().toISOString()
    };
    
    // 创建适配器和数据库实例 - lowdb v7 需要直接在构造函数中提供默认数据
    const adapter = new JSONFile(dbPath);
    const db = new Low(adapter, defaultData);
    
    // 读取数据
    await db.read();
    
    // 如果没有药品数据，添加初始模拟数据
    if (db.data.medicines.length === 0) {
      db.data.medicines = [
        {
          id: 1,
          name: {
            generic: '小儿感冒颗粒',
            brand: ['小儿氨酚黄那敏颗粒']
          },
          drugCode: 'Y001',
          pinyinCode: 'XEGMKL',
          specification: '每袋6g',
          pharmacyUnit: '袋',
          dosageAmount: '6g',
          dosageForm: '颗粒剂',
          administrationRoute: '口服',
          instructionUrl: 'https://www.dayi.org.cn/drug/1017782.html',
          category: '儿童中成药',
          ingredients: ['对乙酰氨基酚', '马来酸氯苯那敏', '人工牛黄'],
          indications: ['缓解儿童普通感冒及流行性感冒引起的发热、头痛、四肢酸痛、打喷嚏、流鼻涕、鼻塞、咽痛等症状'],
          dosage: '1-3岁：一次0.5-1袋，一日3次；4-6岁：一次1-1.5袋，一日3次；7-9岁：一次1.5-2袋，一日3次；10-12岁：一次2-2.5袋，一日3次；用温水冲服。',
          adverseReactions: ['有时有轻度头晕、乏力、恶心、上腹不适、口干、食欲缺乏和皮疹等，可自行恢复。'],
          contraindications: ['严重肝肾功能不全者禁用。', '对本品过敏者禁用，过敏体质者慎用。'],
          precautions: ['用药3-7天，症状未缓解，请咨询医师或药师。', '不能同时服用与本品成份相似的其他抗感冒药。', '肝、肾功能不全者慎用。', '如服用过量或出现严重不良反应，应立即就医。'],
          drugInteractions: ['与其他解热镇痛药同用，可增加肾毒性的危险。', '本品不宜与氯霉素、巴比妥类（如苯巴比妥）等并用。', '如与其他药物同时使用可能会发生药物相互作用，详情请咨询医师或药师。'],
          shelfLife: 24,
          approvalNumber: '国药准字H11022051',
          manufacturer: '北京同仁堂股份有限公司同仁堂制药厂',
          storageConditions: '密封，在阴凉干燥处保存（不超过20℃）',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          name: {
            generic: '小儿止咳糖浆',
            brand: ['小儿百部止咳糖浆', '小儿清热止咳糖浆']
          },
          drugCode: 'Y002',
          pinyinCode: 'XZEKTY',
          specification: '每支10ml',
          pharmacyUnit: '支',
          dosageAmount: '10ml',
          dosageForm: '糖浆剂',
          administrationRoute: '口服',
          instructionUrl: 'https://www.dayi.org.cn/drug/1017783.html',
          category: '儿童中成药',
          ingredients: ['甘草流浸膏', '桔梗流浸膏', '氯化铵', '橙皮酊'],
          indications: ['祛痰，镇咳。用于小儿感冒引起的咳嗽。'],
          dosage: '2-5岁：一次5毫升，一日3次；6-10岁：一次7.5毫升，一日3次；11岁以上：一次10毫升，一日3次；用温水冲服。',
          adverseReactions: ['尚不明确。'],
          contraindications: ['对本品过敏者禁用。', '糖尿病患儿禁服。'],
          precautions: ['忌食生冷辛辣食物。', '本品含氯化铵。肝肾功能异常者慎用；消化性溃疡患者应在医师指导下使用。', '患有高血压、心脏病等慢性病者均应慎用。', '2岁以下用量应咨询医师或药师。', '服药3天症状无改善者，应及时就医。'],
          drugInteractions: ['如与其他药物同时使用可能会发生药物相互作用，详情请咨询医师或药师。'],
          shelfLife: 36,
          approvalNumber: '国药准字Z11020970',
          manufacturer: '北京同仁堂科技发展股份有限公司制药厂',
          storageConditions: '密封，置阴凉处（不超过20℃）保存',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      // 添加分类数据
      db.data.categories = [...new Set(db.data.medicines.map(m => m.category))];
      
      // 保存初始数据
      await db.write();
      
      console.log('数据库初始化成功，添加了初始药品数据');
    }
    
    return db;
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

module.exports = {
  initDatabase
};
