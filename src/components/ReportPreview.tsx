import { useRef, forwardRef, useImperativeHandle } from 'react';
import { ReportData, BaseConfig } from '../types';
import { DoubleRingChart } from './DoubleRingChart';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './ReportPreview.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ReportPreviewProps {
  reportData: ReportData;
  baseConfig: BaseConfig;
}

export interface ReportPreviewHandle {
  getReportElement: () => HTMLDivElement | null;
}

export const ReportPreview = forwardRef<ReportPreviewHandle, ReportPreviewProps>(
  ({ reportData, baseConfig }, ref) => {
    const reportRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getReportElement: () => reportRef.current
    }));

    // 条形图数据
    const sortedManagementScores = [...reportData.managementScores].sort((a, b) => b.value - a.value);

    const gradientColors = [
      '#007AFF', '#1E88E5', '#42A5F5', '#64B5F6',
      '#81C784', '#AED581', '#FFCC02', '#FFB74D'
    ];

    const barColors = sortedManagementScores.map((_item, index) => 
      gradientColors[index % gradientColors.length]
    );

    const chartData = {
      labels: sortedManagementScores.map(item => item.label),
      datasets: [{
        data: sortedManagementScores.map(item => item.value),
        backgroundColor: barColors,
        borderRadius: 12,
        borderSkipped: false as const,
        hoverBackgroundColor: barColors.map(color => color + 'CC'),
        borderWidth: 0
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          cornerRadius: 8,
          callbacks: {
            label: function(context: any) {
              return context.label + ': ' + context.parsed.y.toFixed(1) + '分';
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value: any) {
              return value + '分';
            },
            font: {
              family: '-apple-system, BlinkMacSystemFont, sans-serif',
              size: 12
            },
            color: '#6e6e73'
          },
          grid: {
            color: '#f0f0f0'
          },
          border: {
            display: false
          }
        },
        x: {
          ticks: {
            font: {
              family: '-apple-system, BlinkMacSystemFont, sans-serif',
              size: 11,
              weight: 500
            },
            color: '#1d1d1f',
            maxRotation: 0
          },
          grid: {
            display: false
          },
          border: {
            display: false
          }
        }
      }
    };

    // 格式化段落文本
    const formatParagraph = (text: string) => {
      return text.split('\n').map((line, index) => (
        <p key={index} className="section-content" dangerouslySetInnerHTML={{ __html: line }} />
      ));
    };

    return (
      <div ref={reportRef} className="report-container">
        {/* 封面 */}
        <div className="cover has-banner">
          <img src={baseConfig.logo} alt="Logo" className="cover-logo" />
          <img src={baseConfig.banner} alt="Banner" className="cover-banner" />
          <div className="cover-content">
            <div className="subtitle">{reportData.date}</div>
          </div>
        </div>

        <div className="content">
          {/* 一、报告阅读说明 */}
          <div className="section">
            <h2 className="section-title">一、报告阅读说明</h2>
            <div className="reading-guide">
              <div className="guide-header">
                <h3 className="guide-motto">模式无好坏，觉察即改变</h3>
              </div>

              <div className="guide-principles">
                <p className="principles-intro">在阅读本报告前，请掌握以下原则：</p>
                <ol className="principles-list">
                  {baseConfig.principles.map((principle, index) => (
                    <li key={index}>{principle}</li>
                  ))}
                </ol>
              </div>

              <div className="management-overview">
                <h4 className="overview-title">8种管理类型概述</h4>
                <table className="management-types-table">
                  <thead>
                    <tr>
                      <th>模式</th>
                      <th>定义</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baseConfig.typeDefinitions.map((item, index) => (
                      <tr key={index}>
                        <td>{item.type}</td>
                        <td>{item.definition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 二、总体结果 */}
          <div className="section">
            <h2 className="section-title">二、总体结果</h2>
            <div className="overall-results">
              {/* 胜任力得分双环图 */}
              <div className="chart-container">
                <h3 className="chart-title">胜任力得分</h3>
                <div className="chart-wrapper">
                  <DoubleRingChart data={reportData.doubleRingData} />
                </div>
              </div>

              {/* 管理模式柱状图 */}
              <div className="chart-container">
                <h3 className="chart-title">八种管理类型得分</h3>
                <div className="chart-wrapper">
                  <Bar data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* 三、详细结果分析 */}
          <div className="section">
            <h2 className="section-title">三、详细结果分析</h2>
            <div className="detailed-analysis">
              <div className="analysis-header">
                <div className="analysis-content">
                  <div className="primary-type">{reportData.typeDetail.title}</div>
                  <div className="type-motto">{reportData.typeDetail.motto}</div>
                </div>
                <div className="analysis-image">
                  <img src={reportData.typeDetail.avatar} alt="人格图片" className="avatar-img" />
                </div>
              </div>

              <div className="analysis-content-sections">
                <div className="content-section">
                  <h4 className="section-subtitle">优势初衷</h4>
                  {formatParagraph(reportData.typeDetail.advantage)}
                </div>

                <div className="content-section">
                  <h4 className="section-subtitle">典型行为</h4>
                  {formatParagraph(reportData.typeDetail.behavior)}
                </div>

                <div className="content-section">
                  <h4 className="section-subtitle">潜在风险</h4>
                  {formatParagraph(reportData.typeDetail.risk)}
                </div>

                <div className="content-section">
                  <h4 className="section-subtitle">发展建议</h4>
                  {formatParagraph(reportData.typeDetail.suggestion)}
                </div>
              </div>
            </div>
          </div>

          {/* 四、附录 */}
          <div className="section">
            <h2 className="section-title">四、附录</h2>
            <div className="appendix">
              <img 
                src={baseConfig.qrCode} 
                alt="二维码" 
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  marginBottom: '20px', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                }} 
              />
              <div className="appendix-content">
                {baseConfig.appendixText}
              </div>
              <p>报告生成时间：{reportData.date}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ReportPreview.displayName = 'ReportPreview';



