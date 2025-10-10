import { ExcelDataRow, DoubleRingData, RingDataItem, ManagementTypeScore, ReportData } from '../types';
import { managementTypesConfig } from '../config/managementTypes';
import { parseExcelDate } from './dateParser';

/**
 * 计算排名和粗细
 */
const calculateRankAndThickness = (items: Array<{ label: string; value: number }>): RingDataItem[] => {
  // 按分数降序排序
  const sorted = [...items].sort((a, b) => b.value - a.value);
  
  // 分配排名和粗细
  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
    thickness: index === 0 ? 30 : index === 1 ? 20 : 10
  }));
};

/**
 * 处理Excel数据生成报告数据
 */
export const processExcelData = (row: ExcelDataRow): ReportData => {
  // 处理外环数据（胜任力）
  const outerData = calculateRankAndThickness([
    { label: '想明白', value: row.想明白 },
    { label: '讲清楚', value: row.讲清楚 },
    { label: '执行到位', value: row.执行到位 }
  ]);
  
  // 处理内环数据（管理维度）
  const innerData = calculateRankAndThickness([
    { label: '管自己', value: row.管自己 },
    { label: '管业务', value: row.管业务 },
    { label: '管团队', value: row.管团队 }
  ]);
  
  // 计算总分
  const outerTotal = outerData.reduce((sum, item) => sum + item.value, 0);
  const innerTotal = innerData.reduce((sum, item) => sum + item.value, 0);
  
  // 双环图数据
  const doubleRingData: DoubleRingData = {
    outer: outerData,
    inner: innerData,
    outerTotal,
    innerTotal
  };
  
  // 管理类型得分
  const managementScores: ManagementTypeScore[] = [
    { label: '劳模型', value: row.劳模型 },
    { label: '好人型', value: row.好人型 },
    { label: '严师型', value: row.严师型 },
    { label: '遥控型', value: row.遥控型 },
    { label: '隐身型', value: row.隐身型 },
    { label: '黄牛型', value: row.黄牛型 },
    { label: '军师型', value: row.军师型 },
    { label: '内敛型', value: row.内敛型 }
  ];
  
  // 找出主类型（分数最高的）
  const primaryTypeScore = [...managementScores].sort((a, b) => b.value - a.value)[0];
  const primaryType = primaryTypeScore.label;
  
  // 获取主类型的详细配置
  const typeDetail = managementTypesConfig[primaryType];
  
  return {
    name: row.姓名,
    date: parseExcelDate(row.日期),
    doubleRingData,
    managementScores,
    primaryType,
    typeDetail
  };
};

/**
 * 批量处理Excel数据
 */
export const processBatchExcelData = (data: ExcelDataRow[]): ReportData[] => {
  return data.map(row => processExcelData(row));
};



