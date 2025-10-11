import React, { useState, useRef, useEffect } from 'react';
import { Layout, Button, Upload, message, Spin, Select, Space, Card, Row, Col } from 'antd';
import { UploadOutlined, DownloadOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { parseExcelFile, validateExcelData } from './utils/excelParser';
import { processBatchExcelData } from './utils/dataProcessor';
import { ReportPreview, ReportPreviewHandle } from './components/ReportPreview';
import { ConfigManager } from './components/ConfigManager';
import { exportToHTML, exportToPNG, exportToJPEG, batchExportHTML } from './utils/exportUtils';
import { loadSharedConfig } from './utils/sharedConfigApi';
import { ExcelDataRow, ReportData, BaseConfig, ManagementTypeDetail } from './types';
import { managementTypesConfig, defaultBaseConfig } from './config/managementTypes';
import './App.css';

const { Header, Content } = Layout;
const { Option } = Select;

const App: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelDataRow[]>([]);
  const [reportDataList, setReportDataList] = useState<ReportData[]>([]);
  const [selectedReportIndex, setSelectedReportIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  // 从localStorage恢复配置
  const [baseConfig, setBaseConfig] = useState<BaseConfig>(() => {
    try {
      const saved = localStorage.getItem('report_base_config');
      return saved ? JSON.parse(saved) as BaseConfig : defaultBaseConfig;
    } catch {
      return defaultBaseConfig;
    }
  });
  const [managementConfigs, setManagementConfigs] = useState<Record<string, ManagementTypeDetail>>(() => {
    try {
      const saved = localStorage.getItem('report_management_configs');
      return saved ? JSON.parse(saved) as Record<string, ManagementTypeDetail> : managementTypesConfig;
    } catch {
      return managementTypesConfig;
    }
  });
  const [activeView, setActiveView] = useState<'upload' | 'config' | 'preview'>('upload');
  const [batchExporting, setBatchExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  // 持久化配置
  useEffect(() => {
    try {
      localStorage.setItem('report_base_config', JSON.stringify(baseConfig));
    } catch {}
  }, [baseConfig]);
  useEffect(() => {
    try {
      localStorage.setItem('report_management_configs', JSON.stringify(managementConfigs));
    } catch {}
  }, [managementConfigs]);

  // 首次加载尝试拉取共享配置（若存在则覆盖本地）
  useEffect(() => {
    (async () => {
      const shared = await loadSharedConfig();
      if (shared.baseConfig) setBaseConfig(shared.baseConfig);
      if (shared.managementConfigs) setManagementConfigs(shared.managementConfigs);
    })();
  }, []);
  const reportRef = useRef<ReportPreviewHandle>(null);
  const allReportRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // 处理Excel上传
  const handleExcelUpload = async (file: UploadFile) => {
    setLoading(true);
    try {
      const data = await parseExcelFile(file as any);
      const validation = validateExcelData(data);
      
      if (!validation.valid) {
        message.error(`数据验证失败: ${validation.errors.join(', ')}`);
        setLoading(false);
        return false;
      }

      setExcelData(data);
      const reports = processBatchExcelData(data, managementConfigs);
      setReportDataList(reports);
      setSelectedReportIndex(0);
      setActiveView('preview');
      message.success(`成功解析 ${data.length} 条数据`);
    } catch (error: any) {
      message.error(`解析失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
    
    return false; // 阻止自动上传
  };

  // 导出为HTML
  const handleExportHTML = () => {
    const element = reportRef.current?.getReportElement();
    if (!element) {
      message.error('无法获取报告内容');
      return;
    }

    const currentReport = reportDataList[selectedReportIndex];
    const filename = `${currentReport.name}_管理觉察测评报告.html`;
    
    try {
      exportToHTML(element, filename);
      message.success('HTML导出成功');
    } catch (error) {
      message.error('HTML导出失败');
    }
  };

  // 导出为PNG
  const handleExportPNG = async () => {
    const element = reportRef.current?.getReportElement();
    if (!element) {
      message.error('无法获取报告内容');
      return;
    }

    const currentReport = reportDataList[selectedReportIndex];
    const filename = `${currentReport.name}_管理觉察测评报告.png`;
    
    try {
      setLoading(true);
      await exportToPNG(element, filename);
      message.success('PNG导出成功');
    } catch (error) {
      message.error('PNG导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出为JPEG
  const handleExportJPEG = async () => {
    const element = reportRef.current?.getReportElement();
    if (!element) {
      message.error('无法获取报告内容');
      return;
    }

    const currentReport = reportDataList[selectedReportIndex];
    const filename = `${currentReport.name}_管理觉察测评报告.jpg`;
    
    try {
      setLoading(true);
      await exportToJPEG(element, filename);
      message.success('JPEG导出成功');
    } catch (error) {
      message.error('JPEG导出失败');
    } finally {
      setLoading(false);
    }
  };

  // 批量导出HTML
  const handleBatchExportHTML = async () => {
    if (reportDataList.length === 0) {
      message.error('没有可导出的报告');
      return;
    }

    try {
      setBatchExporting(true);
      setExportProgress({ current: 0, total: reportDataList.length });

      // 收集所有报告元素
      const elements: HTMLElement[] = [];
      const names: string[] = [];

      // 临时渲染所有报告
      for (let i = 0; i < reportDataList.length; i++) {
        const element = allReportRefs.current.get(i);
        if (element) {
          elements.push(element);
          names.push(reportDataList[i].name);
        }
      }

      if (elements.length === 0) {
        // 如果没有缓存的元素，使用当前显示的元素
        const element = reportRef.current?.getReportElement();
        if (element) {
          elements.push(element);
          names.push(reportDataList[selectedReportIndex].name);
        }
      }

      await batchExportHTML(elements, names, (current, total) => {
        setExportProgress({ current, total });
      });

      message.success(`批量导出HTML成功！共${reportDataList.length}份报告`);
    } catch (error) {
      console.error('批量导出HTML失败:', error);
      message.error('批量导出HTML失败');
    } finally {
      setBatchExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  // 批量导出PNG
  const handleBatchExportPNG = async () => {
    if (reportDataList.length === 0) {
      message.error('没有可导出的报告');
      return;
    }

    const originalIndex = selectedReportIndex;

    try {
      setBatchExporting(true);
      const zip = (await import('jszip')).default;
      const zipFile = new zip();

      for (let i = 0; i < reportDataList.length; i++) {
        setExportProgress({ current: i + 1, total: reportDataList.length });
        
        // 切换到对应的报告
        setSelectedReportIndex(i);
        
        // 等待UI更新和渲染完成
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const element = reportRef.current?.getReportElement();
        if (element) {
          try {
            const { toPng } = await import('html-to-image');
            
            const dataUrl = await toPng(element, {
              quality: 1.0,
              pixelRatio: 2,
              cacheBust: true,
              skipFonts: false,
              includeQueryParams: true,
              backgroundColor: '#f5f7fa',
              filter: () => true,
              style: {
                margin: '0',
                padding: '0',
                transform: 'scale(1)'
              }
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            zipFile.file(`${reportDataList[i].name}_管理觉察测评报告.png`, blob);
          } catch (error) {
            console.error(`导出PNG失败 (${reportDataList[i].name}):`, error);
          }
        }
      }

      // 生成并下载压缩包
      const content = await zipFile.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().split('T')[0];
      const { saveAs } = await import('file-saver');
      saveAs(content, `管理觉察测评报告_批量导出_PNG_${timestamp}.zip`);

      message.success(`批量导出PNG成功！共${reportDataList.length}份报告`);
    } catch (error) {
      console.error('批量导出PNG失败:', error);
      message.error('批量导出PNG失败');
    } finally {
      setBatchExporting(false);
      setExportProgress({ current: 0, total: 0 });
      setSelectedReportIndex(originalIndex);
    }
  };

  // 批量导出JPEG
  const handleBatchExportJPEG = async () => {
    if (reportDataList.length === 0) {
      message.error('没有可导出的报告');
      return;
    }

    const originalIndex = selectedReportIndex;

    try {
      setBatchExporting(true);
      const zip = (await import('jszip')).default;
      const zipFile = new zip();

      for (let i = 0; i < reportDataList.length; i++) {
        setExportProgress({ current: i + 1, total: reportDataList.length });
        
        // 切换到对应的报告
        setSelectedReportIndex(i);
        
        // 等待UI更新和渲染完成
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const element = reportRef.current?.getReportElement();
        if (element) {
          try {
            const { toJpeg } = await import('html-to-image');
            
            const dataUrl = await toJpeg(element, {
              quality: 0.95,
              pixelRatio: 2,
              cacheBust: true,
              skipFonts: false,
              includeQueryParams: true,
              backgroundColor: '#ffffff',
              filter: () => true,
              style: {
                margin: '0',
                padding: '0',
                transform: 'scale(1)'
              }
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            
            zipFile.file(`${reportDataList[i].name}_管理觉察测评报告.jpg`, blob);
          } catch (error) {
            console.error(`导出JPG失败 (${reportDataList[i].name}):`, error);
          }
        }
      }

      // 生成并下载压缩包
      const content = await zipFile.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().split('T')[0];
      const { saveAs } = await import('file-saver');
      saveAs(content, `管理觉察测评报告_批量导出_JPG_${timestamp}.zip`);

      message.success(`批量导出JPG成功！共${reportDataList.length}份报告`);
    } catch (error) {
      console.error('批量导出JPG失败:', error);
      message.error('批量导出JPG失败');
    } finally {
      setBatchExporting(false);
      setExportProgress({ current: 0, total: 0 });
      setSelectedReportIndex(originalIndex);
    }
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <div className="header-logo">
            <img src="/logo.png" alt="金山云" />
            <h1>管理觉察测评报告生成系统</h1>
          </div>
          <Space>
            <Button 
              type={activeView === 'upload' ? 'primary' : 'default'}
              onClick={() => setActiveView('upload')}
            >
              数据上传
            </Button>
            <Button 
              type={activeView === 'config' ? 'primary' : 'default'}
              onClick={() => setActiveView('config')}
            >
              配置管理
            </Button>
            <Button 
              type={activeView === 'preview' ? 'primary' : 'default'}
              onClick={() => setActiveView('preview')}
              disabled={reportDataList.length === 0}
            >
              报告预览
            </Button>
          </Space>
        </div>
      </Header>

      <Content className="app-content">
        <Spin 
          spinning={loading || batchExporting} 
          tip={batchExporting ? `批量导出中... ${exportProgress.current}/${exportProgress.total}` : "处理中..."}
        >
          {/* 上传视图 */}
          {activeView === 'upload' && (
            <Card className="upload-card">
              <div className="upload-section">
                <h2>上传Excel数据文件</h2>
                <p className="upload-hint">
                  请上传包含以下字段的Excel文件：姓名、日期、想明白、讲清楚、执行到位、管自己、管业务、管团队、劳模型、好人型、严师型、遥控型、隐身型、黄牛型、军师型、内敛型
                </p>
                <Upload
                  beforeUpload={handleExcelUpload}
                  maxCount={1}
                  accept=".xlsx,.xls"
                >
                  <Button icon={<UploadOutlined />} size="large" type="primary">
                    选择Excel文件
                  </Button>
                </Upload>
                
                {excelData.length > 0 && (
                  <div className="upload-success">
                    <p>✓ 已成功上传 {excelData.length} 条数据</p>
                    <Button type="link" onClick={() => setActiveView('preview')}>
                      查看报告预览 →
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 配置管理视图 */}
          {activeView === 'config' && (
            <Card className="config-card">
              <ConfigManager
                baseConfig={baseConfig}
                onConfigChange={setBaseConfig}
                managementConfigs={managementConfigs}
                onManagementConfigChange={(cfgs) => {
                  setManagementConfigs(cfgs);
                  // 若已加载数据，则实时重算报告以反映二维码等变化
                  if (excelData.length > 0) {
                    const newReports = processBatchExcelData(excelData, cfgs);
                    setReportDataList(newReports);
                  }
                }}
              />
            </Card>
          )}

          {/* 报告预览视图 */}
          {activeView === 'preview' && reportDataList.length > 0 && (
            <div className="preview-section">
              <Card className="preview-controls">
                <Row gutter={16} align="middle">
                  <Col flex="auto">
                    <Space>
                      <span>选择报告：</span>
                      <Select
                        value={selectedReportIndex}
                        onChange={setSelectedReportIndex}
                        style={{ width: 200 }}
                      >
                        {reportDataList.map((report, index) => (
                          <Option key={index} value={index}>
                            {report.name} - {report.date}
                          </Option>
                        ))}
                      </Select>
                      <span className="report-type-badge">
                        主类型: {reportDataList[selectedReportIndex].primaryType}
                      </span>
                    </Space>
                  </Col>
                  <Col>
                    <Space direction="vertical" size="small">
                      <Space>
                        <Button 
                          icon={<FileTextOutlined />} 
                          onClick={handleExportHTML}
                        >
                          导出HTML
                        </Button>
                        <Button 
                          icon={<PictureOutlined />} 
                          onClick={handleExportPNG}
                        >
                          导出PNG
                        </Button>
                        <Button 
                          icon={<PictureOutlined />} 
                          onClick={handleExportJPEG}
                        >
                          导出JPG
                        </Button>
                      </Space>
                      {reportDataList.length > 1 && (
                        <Space>
                          <Button 
                            icon={<DownloadOutlined />} 
                            onClick={handleBatchExportHTML}
                            type="dashed"
                            disabled={batchExporting}
                          >
                            批量导出HTML
                          </Button>
                          <Button 
                            icon={<DownloadOutlined />} 
                            onClick={handleBatchExportPNG}
                            type="dashed"
                            disabled={batchExporting}
                          >
                            批量导出PNG
                          </Button>
                          <Button 
                            icon={<DownloadOutlined />} 
                            onClick={handleBatchExportJPEG}
                            type="dashed"
                            disabled={batchExporting}
                          >
                            批量导出JPG
                          </Button>
                        </Space>
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>

              <div className="preview-wrapper">
                <ReportPreview
                  ref={reportRef}
                  reportData={reportDataList[selectedReportIndex]}
                  baseConfig={baseConfig}
                />
              </div>
            </div>
          )}
        </Spin>
      </Content>
    </Layout>
  );
};

export default App;



