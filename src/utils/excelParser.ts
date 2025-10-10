import * as XLSX from 'xlsx';
import { ExcelDataRow } from '../types';

/**
 * 解析Excel文件
 */
export const parseExcelFile = (file: File): Promise<ExcelDataRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // 读取第一个sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json<ExcelDataRow>(worksheet);
        
        // 验证数据
        if (jsonData.length === 0) {
          throw new Error('Excel文件为空');
        }
        
        // 验证必要字段
        const requiredFields = ['姓名', '日期', '想明白', '讲清楚', '执行到位', 
                               '管自己', '管业务', '管团队', 
                               '劳模型', '好人型', '严师型', '遥控型', 
                               '隐身型', '黄牛型', '军师型', '内敛型'];
        
        const firstRow = jsonData[0];
        const missingFields = requiredFields.filter(field => !(field in firstRow));
        
        if (missingFields.length > 0) {
          throw new Error(`缺少必要字段: ${missingFields.join(', ')}`);
        }
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsBinaryString(file);
  });
};

/**
 * 验证Excel数据格式
 */
export const validateExcelData = (data: ExcelDataRow[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  data.forEach((row, index) => {
    // 验证分数范围 (0-100)
    const scoreFields = ['想明白', '讲清楚', '执行到位', '管自己', '管业务', '管团队',
                         '劳模型', '好人型', '严师型', '遥控型', '隐身型', '黄牛型', '军师型', '内敛型'];
    
    scoreFields.forEach(field => {
      const value = row[field as keyof ExcelDataRow];
      if (typeof value === 'number' && (value < 0 || value > 100)) {
        errors.push(`第${index + 2}行，${field}的值超出范围(0-100): ${value}`);
      }
    });
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};



