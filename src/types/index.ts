// 数据类型定义

// Excel数据行
export interface ExcelDataRow {
  姓名: string;
  日期: string;
  想明白: number;
  讲清楚: number;
  执行到位: number;
  管自己: number;
  管业务: number;
  管团队: number;
  劳模型: number;
  好人型: number;
  严师型: number;
  遥控型: number;
  隐身型: number;
  黄牛型: number;
  军师型: number;
  内敛型: number;
}

// 双环图数据项
export interface RingDataItem {
  label: string;
  value: number;
  rank: number;
  thickness: number;
}

// 双环图数据
export interface DoubleRingData {
  outer: RingDataItem[];
  inner: RingDataItem[];
  outerTotal: number;
  innerTotal: number;
}

// 管理类型得分
export interface ManagementTypeScore {
  label: string;
  value: number;
}

// 管理类型详细配置
export interface ManagementTypeDetail {
  type: string; // 类型名称，如"劳模型"
  title: string; // 完整标题
  motto: string; // 引语
  avatar: string; // 头像路径
  qrCode?: string; // 每个类型独立二维码
  advantage: string; // 优势初衷
  behavior: string; // 典型行为
  risk: string; // 潜在风险
  suggestion: string; // 发展建议
}

// 基础配置
export interface BaseConfig {
  banner: string; // banner图片路径
  logo: string; // logo图片路径
  principles: string[]; // 3条原则
  typeDefinitions: Array<{ type: string; definition: string }>; // 8种类型定义
  appendixText: string; // 附录文字
  qrCode: string; // 二维码路径
}

// 报告数据
export interface ReportData {
  name: string;
  date: string;
  doubleRingData: DoubleRingData;
  managementScores: ManagementTypeScore[];
  primaryType: string; // 主类型
  typeDetail: ManagementTypeDetail;
}



