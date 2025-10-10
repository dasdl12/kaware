/**
 * Excel日期解析工具
 * Excel的日期是从1900年1月1日开始的天数（序列号）
 */

/**
 * 将Excel日期序列号转换为日期字符串
 * @param excelDate Excel日期序列号或日期字符串
 * @returns 格式化的日期字符串 (YYYY/MM/DD)
 */
export const parseExcelDate = (excelDate: any): string => {
  // 如果已经是字符串格式的日期，直接返回
  if (typeof excelDate === 'string') {
    // 检查是否是日期格式
    if (excelDate.includes('/') || excelDate.includes('-')) {
      return formatDate(excelDate);
    }
  }

  // 如果是数字，说明是Excel的日期序列号
  if (typeof excelDate === 'number') {
    // Excel日期从1900年1月1日开始计数
    // 但Excel错误地将1900年当作闰年，所以需要修正
    const excelEpoch = new Date(1900, 0, 1);
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // Excel日期序列号转换
    // 注意：Excel有一个bug，认为1900年是闰年，所以日期>=60时需要减1
    let days = excelDate;
    if (excelDate >= 60) {
      days = excelDate - 1;
    }
    
    const date = new Date(excelEpoch.getTime() + (days - 1) * msPerDay);
    
    // 格式化为 YYYY/MM/DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
  }

  // 如果是Date对象
  if (excelDate instanceof Date) {
    const year = excelDate.getFullYear();
    const month = String(excelDate.getMonth() + 1).padStart(2, '0');
    const day = String(excelDate.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  // 默认返回当前日期
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

/**
 * 格式化日期字符串
 * @param dateStr 日期字符串
 * @returns 统一格式的日期字符串 (YYYY/MM/DD)
 */
const formatDate = (dateStr: string): string => {
  // 替换各种分隔符为 /
  let normalized = dateStr.replace(/-/g, '/');
  
  // 尝试解析日期
  const parts = normalized.split('/');
  
  if (parts.length === 3) {
    let [year, month, day] = parts;
    
    // 处理年份
    if (year.length === 2) {
      const yearNum = parseInt(year);
      year = yearNum < 50 ? `20${year}` : `19${year}`;
    }
    
    // 补零
    month = month.padStart(2, '0');
    day = day.padStart(2, '0');
    
    return `${year}/${month}/${day}`;
  }
  
  return dateStr;
};

