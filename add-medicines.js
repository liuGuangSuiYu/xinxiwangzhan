const axios = require('axios');

// 药品数据数组
const medicinesData = [
  {
    "name": {
      "generic": "阿莫西林胶囊",
      "brand": ["阿莫仙", "弗莱莫星"]
    },
    "drugCode": "Y006",
    "pinyinCode": "AMSJN",
    "specification": "0.25g*24粒",
    "pharmacyUnit": "盒",
    "dosageAmount": "0.25g",
    "dosageForm": "胶囊剂",
    "administrationRoute": "口服",
    "instructionUrl": "https://www.dayi.org.cn/drug/1000001.html",
    "manufacturer": "珠海联邦制药股份有限公司中山分公司",
    "approvalNumber": "国药准字H44021351",
    "drugType": "处方药",
    "expiryDate": "2028-12-31",
    "stockQuantity": 100,
    "purchasePrice": 12.5,
    "packagingImage": "https://example.com/amsjn.jpg",
    "description": "阿莫西林胶囊，适用于敏感菌所致的感染。",
    "category": "抗生素",
    "ingredients": ["阿莫西林"],
    "indications": ["敏感菌所致的各种感染"],
    "dosage": "成人一次0.5g，每6-8小时1次，一日剂量不超过4g；儿童一日剂量按体重20-40mg/kg，每8小时1次。",
    "adverseReactions": ["恶心、呕吐、腹泻及假膜性肠炎等胃肠道反应；皮疹、药物热和哮喘等过敏反应；贫血、血小板减少、嗜酸性粒细胞增多等；血清氨基转移酶可轻度增高；由念珠菌或耐药菌引起的二重感染；偶见兴奋、焦虑、失眠、头晕以及行为异常等中枢神经系统症状。"],
    "contraindications": ["青霉素过敏及青霉素皮肤试验阳性患者禁用。"],
    "precautions": ["用前必须做青霉素钠皮肤试验，阳性反应者禁用。传染性单核细胞增多症患者应用本品易发生皮疹，应避免使用。疗程较长患者应检查肝、肾功能和血常规。"],
    "drugInteractions": ["丙磺舒竞争性地减少本品的肾小管分泌，两者同时应用可引起阿莫西林血浓度升高、半衰期延长。氯霉素、大环内酯类、磺胺类和四环素类药物在体外干扰阿莫西林的抗菌作用，但其临床意义不明。"],
    "shelfLife": 36,
    "storageConditions": "遮光，密封保存。"
  },
  {
    "name": {
      "generic": "布洛芬缓释胶囊",
      "brand": ["芬必得"]
    },
    "drugCode": "Y007",
    "pinyinCode": "BLFSHJN",
    "specification": "0.3g*20粒",
    "pharmacyUnit": "盒",
    "dosageAmount": "0.3g",
    "dosageForm": "胶囊剂",
    "administrationRoute": "口服",
    "instructionUrl": "https://www.dayi.org.cn/drug/1000002.html",
    "manufacturer": "中美天津史克制药有限公司",
    "approvalNumber": "国药准字H10900089",
    "drugType": "非处方药",
    "expiryDate": "2027-06-30",
    "stockQuantity": 80,
    "purchasePrice": 18.0,
    "packagingImage": "https://example.com/blf.jpg",
    "description": "布洛芬缓释胶囊，用于缓解轻至中度疼痛。",
    "category": "解热镇痛药",
    "ingredients": ["布洛芬"],
    "indications": ["缓解轻至中度疼痛如头痛、关节痛、偏头痛、牙痛、肌肉痛、神经痛、痛经。也用于普通感冒或流行性感冒引起的发热。"],
    "dosage": "成人一次1粒，一日2次（早晚各一次）。",
    "adverseReactions": ["少数病人可出现恶心、呕吐、腹痛、腹泻、便秘、胃烧灼感或轻度消化不良、胃肠道溃疡及出血、转氨酶升高、头痛、头晕、耳鸣、视力模糊、精神紧张、嗜睡、下肢水肿或体重骤增。罕见皮疹、过敏性肾炎、膀胱炎、肾病综合征、肾乳头坏死或肾功能衰竭、支气管痉挛。"],
    "contraindications": ["对其他非甾体抗炎药过敏者禁用。孕妇及哺乳期妇女禁用。对阿司匹林过敏的哮喘患者禁用。严重肝肾功能不全者或严重心力衰竭者禁用。正在服用其他含有布洛芬或其他非甾体抗炎药的患者禁用。"],
    "precautions": ["本品为对症治疗药，不宜长期或大量使用，用于止痛不得超过5天，用于解热不得超过3天，如症状不缓解，请咨询医师或药师。不能同时服用其他含有解热镇痛药的药品（如某些复方抗感冒药）。"],
    "drugInteractions": ["与其他解热、镇痛、抗炎药物同用时可增加胃肠道不良反应，并可能导致溃疡。与肝素、双香豆素等抗凝药同用时，可导致凝血酶原时间延长，增加出血倾向。与地高辛、甲氨蝶呤、口服降血糖药物同用时，能使这些药物的血药浓度增高，不宜同用。"],
    "shelfLife": 30,
    "storageConditions": "密封保存。"
  },
  {
    "name": {
      "generic": "葡萄糖酸钙口服溶液",
      "brand": ["哈药六牌"]
    },
    "drugCode": "Y008",
    "pinyinCode": "PTTSGKFRY",
    "specification": "10ml*12支",
    "pharmacyUnit": "盒",
    "dosageAmount": "10ml",
    "dosageForm": "口服溶液剂",
    "administrationRoute": "口服",
    "instructionUrl": "https://www.dayi.org.cn/drug/1000003.html",
    "manufacturer": "哈药集团制药六厂",
    "approvalNumber": "国药准字H20013241",
    "drugType": "非处方药",
    "expiryDate": "2028-09-30",
    "stockQuantity": 150,
    "purchasePrice": 28.0,
    "packagingImage": "https://example.com/pttsg.jpg",
    "description": "葡萄糖酸钙口服溶液，用于预防和治疗钙缺乏症。",
    "category": "矿物质类",
    "ingredients": ["葡萄糖酸钙"],
    "indications": ["用于预防和治疗钙缺乏症，如骨质疏松、手足抽搐症、骨发育不全、佝偻病以及儿童、妊娠和哺乳期妇女、绝经期妇女、老年人钙的补充。"],
    "dosage": "成人一次10-20毫升，一日3次；儿童一次5-10毫升，一日3次。",
    "adverseReactions": ["偶见便秘。"],
    "contraindications": ["高钙血症、高钙尿症、含钙肾结石或有肾结石病史患者禁用。"],
    "precautions": ["心肾功能不全者慎用。对本品过敏者禁用，过敏体质者慎用。本品性状发生改变时禁止使用。儿童必须在成人监护下使用。请将本品放在儿童不能接触的地方。如正在使用其他药品，使用本品前请咨询医师或药师。"],
    "drugInteractions": ["本品不宜与洋地黄类药物合用。大量饮用含酒精和咖啡因的饮料以及大量吸烟，均会抑制钙剂的吸收。大量进食富含纤维素的食物能抑制钙的吸收，因钙与纤维素结合成不易吸收的化合物。"],
    "shelfLife": 24,
    "storageConditions": "密封，在干燥处保存。"
  },
  {
    "name": {
      "generic": "盐酸二甲双胍片",
      "brand": ["格华止"]
    },
    "drugCode": "Y009",
    "pinyinCode": "YSJEJS",
    "specification": "0.5g*30片",
    "pharmacyUnit": "盒",
    "dosageAmount": "0.5g",
    "dosageForm": "片剂",
    "administrationRoute": "口服",
    "instructionUrl": "https://www.dayi.org.cn/drug/1000004.html",
    "manufacturer": "中美上海施贵宝制药有限公司",
    "approvalNumber": "国药准字H20023370",
    "drugType": "处方药",
    "expiryDate": "2027-11-30",
    "stockQuantity": 60,
    "purchasePrice": 35.8,
    "packagingImage": "https://example.com/ejjs.jpg",
    "description": "盐酸二甲双胍片，用于2型糖尿病的治疗。",
    "category": "降血糖药",
    "ingredients": ["盐酸二甲双胍"],
    "indications": ["用于单纯饮食控制不满意的2型糖尿病病人，尤其是肥胖和伴高胰岛素血症者，用本药不但有降血糖作用，还可能有减轻体重和高胰岛素血症的效果。对某些磺酰脲类疗效差的患者可奏效，如与磺酰脲类、小肠糖苷酶抑制剂或噻唑烷二酮类降糖药合用，较分别单用的效果更好。亦可用于胰岛素治疗的患者，以减少胰岛素用量。"],
    "dosage": "开始用量通常为每日一次，一次一片（0.5g），晚餐时服用，根据血糖和尿糖调整用量，每日最大剂量不超过四片（2.0g）。如果每日一次，每次四片（2.0g）不能达到满意的疗效，可改为每日两次，每次两片（1.0g）。",
    "adverseReactions": ["常见的有：恶心、呕吐、腹泻、口中有金属味；有时有乏力、疲倦、头晕、皮疹；乳酸性酸中毒虽然发生率很低，但应予注意，临床表现为呕吐、腹痛、过度换气、神志障碍，血液中乳酸浓度增加而不能用尿毒症、酮症酸中毒或水杨酸中毒解释；可减少肠道吸收维生素B12，使血红蛋白减少，产生巨红细胞贫血，也可引起吸收不良。"],
    "contraindications": ["2型糖尿病伴有酮症酸中毒、肝及肾功能不全（血清肌酐超过1.5mg/dl）、肺功能不全、心力衰竭、急性心肌梗死、严重感染和外伤、重大手术以及临床有低血压和缺氧情况；糖尿病合并严重的慢性并发症（如糖尿病肾病、糖尿病眼底病变）；静脉肾盂造影或动脉造影前；酗酒者；严重心、肺病患者；维生素B12、叶酸和铁缺乏的患者；全身情况较差的患者（如营养不良、脱水）。"],
    "precautions": ["Ⅰ型糖尿病不应单独应用本品（可与胰岛素合用）；用药期间经常检查空腹血糖、尿糖及尿酮体，定期测血肌酐、血乳酸浓度；与胰岛素合用治疗时，防止出现低血糖反应。"],
    "drugInteractions": ["与胰岛素合用，降血糖作用加强，应调整剂量；与磺酰脲类口服降糖药合用，有协同作用，应调整剂量；与乙醇同服时会增强盐酸二甲双胍对乳酸代谢的影响，易导致乳酸性酸中毒发生，因此，服用本品时应尽量避免饮酒；与树脂类药物合用时，可减少二甲双胍的吸收。"],
    "shelfLife": 36,
    "storageConditions": "密封保存。"
  },
  {
    "name": {
      "generic": "布洛芬混悬液",
      "brand": ["美林"]
    },
    "drugCode": "Y010",
    "pinyinCode": "BLFHXY",
    "specification": "100ml:2g",
    "pharmacyUnit": "瓶",
    "dosageAmount": "20mg/ml",
    "dosageForm": "混悬液",
    "administrationRoute": "口服",
    "instructionUrl": "https://www.dayi.org.cn/drug/1000005.html",
    "manufacturer": "上海强生制药有限公司",
    "approvalNumber": "国药准字H19991011",
    "drugType": "非处方药",
    "expiryDate": "2028-06-30",
    "stockQuantity": 80,
    "purchasePrice": 19.8,
    "packagingImage": "https://example.com/ml.jpg",
    "description": "布洛芬混悬液，用于儿童普通感冒或流感引起的发热。",
    "category": "解热镇痛药",
    "ingredients": ["布洛芬"],
    "indications": ["用于儿童普通感冒或流感引起的发热。也用于缓解儿童轻至中度疼痛，如头痛、关节痛、偏头痛、牙痛、肌肉痛、神经痛、痛经。"],
    "dosage": "1-3岁，体重10-15kg，一次4ml；4-6岁，体重16-21kg，一次5ml；7-9岁，体重22-27kg，一次8ml；10-12岁，体重28-32kg，一次10ml。若持续疼痛或发热，可间隔4-6小时重复用药1次，24小时不超过4次。",
    "adverseReactions": ["少数病人可出现恶心、呕吐、胃烧灼感或轻度消化不良、胃肠道溃疡及出血、转氨酶升高、头痛、头晕、耳鸣、视力模糊、精神紧张、嗜睡、下肢水肿或体重骤增。罕见皮疹、过敏性肾炎、膀胱炎、肾病综合征、肾乳头坏死或肾功能衰竭、支气管痉挛。"],
    "contraindications": ["对其他非甾体抗炎药过敏者禁用。对阿司匹林过敏的哮喘患者禁用。活动期消化道溃疡者禁用。"],
    "precautions": ["本品为对症治疗药，不宜长期或大量使用，用于止痛不得超过5天，用于解热不得超过3天，如症状不缓解，请咨询医师或药师。有下列情况患者应在医师指导下使用：支气管哮喘、肝肾功能不全、凝血机制或血小板功能障碍（如血友病）。"],
    "drugInteractions": ["与其他解热、镇痛、抗炎药物同用时可增加胃肠道不良反应，并可能导致溃疡。与肝素、双香豆素等抗凝药同用时，可导致凝血酶原时间延长，增加出血倾向。与地高辛、甲氨蝶呤、口服降血糖药物同用时，能使这些药物的血药浓度增高，不宜同用。"],
    "shelfLife": 24,
    "storageConditions": "遮光，密闭保存。"
  }
];

// 批量添加药品的函数
async function addMedicines() {
  try {
    console.log('开始添加药品数据...');
    
    for (let i = 0; i < medicinesData.length; i++) {
      const medicine = medicinesData[i];
      console.log(`正在添加第 ${i + 1} 种药品: ${medicine.name.generic}`);
      
      try {
        const response = await axios.post('http://localhost:5000/api/medicines', medicine, {
          timeout: 10000 // 设置10秒超时
        });
        console.log(`添加成功！药品ID: ${response.data.id}`);
      } catch (singleError) {
        console.error(`添加第 ${i + 1} 种药品失败: ${medicine.name.generic}`);
        console.error('错误信息:', singleError.message);
        if (singleError.response) {
          console.error('响应状态:', singleError.response.status);
          console.error('响应数据:', singleError.response.data);
        } else if (singleError.request) {
          console.error('请求已发送但未收到响应');
        } else {
          console.error('请求配置错误:', singleError.config);
        }
      }
      
      // 延迟500ms，避免请求过于频繁
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n所有药品数据添加完成！');
  } catch (error) {
    console.error('批量添加药品失败:', error.message);
    if (error.response) {
      console.error('错误详情:', error.response.data);
    }
  }
}

// 执行添加操作
addMedicines();
