import React, { useState } from 'react';
import { Tabs, Form, Input, Upload, Button, Table, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { BaseConfig, ManagementTypeDetail } from '../types';
import { saveSharedConfig } from '../utils/sharedConfigApi';

const { TabPane } = Tabs;
const { TextArea } = Input;

interface ConfigManagerProps {
  baseConfig: BaseConfig;
  onConfigChange: (config: BaseConfig) => void;
  managementConfigs: Record<string, ManagementTypeDetail>;
  onManagementConfigChange: (configs: Record<string, ManagementTypeDetail>) => void;
}

export const ConfigManager: React.FC<ConfigManagerProps> = ({
  baseConfig,
  onConfigChange,
  managementConfigs,
  onManagementConfigChange
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedType, setSelectedType] = useState('劳模型');

  // 基础配置更新
  const updateBaseConfig = (field: string, value: any) => {
    onConfigChange({
      ...baseConfig,
      [field]: value
    });
  };

  // 原则更新
  const updatePrinciple = (index: number, value: string) => {
    const newPrinciples = [...baseConfig.principles];
    newPrinciples[index] = value;
    updateBaseConfig('principles', newPrinciples);
  };

  // 类型定义更新
  const updateTypeDefinition = (index: number, field: 'type' | 'definition', value: string) => {
    const newDefinitions = [...baseConfig.typeDefinitions];
    newDefinitions[index] = {
      ...newDefinitions[index],
      [field]: value
    };
    updateBaseConfig('typeDefinitions', newDefinitions);
  };

  // 管理类型配置更新
  const updateManagementConfig = (type: string, field: keyof ManagementTypeDetail, value: string) => {
    const next = {
      ...managementConfigs,
      [type]: {
        ...managementConfigs[type],
        [field]: value
      }
    };
    onManagementConfigChange(next);
  };

  // 图片上传处理
  const handleImageUpload = (field: string, file: UploadFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      updateBaseConfig(field, dataUrl);
      message.success('图片上传成功');
    };
    reader.readAsDataURL(file as any);
    return false; // 阻止自动上传
  };

  const typeDefinitionColumns = [
    {
      title: '模式',
      dataIndex: 'type',
      key: 'type',
      render: (text: string, _record: any, index: number) => (
        <Input 
          value={text} 
          onChange={(e) => updateTypeDefinition(index, 'type', e.target.value)}
        />
      )
    },
    {
      title: '定义',
      dataIndex: 'definition',
      key: 'definition',
      render: (text: string, _record: any, index: number) => (
        <Input 
          value={text} 
          onChange={(e) => updateTypeDefinition(index, 'definition', e.target.value)}
        />
      )
    }
  ];

  const handleSaveShared = async () => {
    try {
      await saveSharedConfig({ baseConfig, managementConfigs });
      message.success('共享配置已保存（全员可见）');
    } catch (e) {
      message.error('保存共享配置失败');
    }
  };

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '8px' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* 基础配置 */}
        <TabPane tab="基础配置" key="basic">
          <Form layout="vertical">
            <Form.Item label="Banner图片">
              <Upload
                beforeUpload={(file) => handleImageUpload('banner', file)}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传Banner</Button>
              </Upload>
              {baseConfig.banner && (
                <img src={baseConfig.banner} alt="Banner" style={{ marginTop: '10px', maxWidth: '300px' }} />
              )}
            </Form.Item>

            <Form.Item label="Logo图片">
              <Upload
                beforeUpload={(file) => handleImageUpload('logo', file)}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传Logo</Button>
              </Upload>
              {baseConfig.logo && (
                <img src={baseConfig.logo} alt="Logo" style={{ marginTop: '10px', maxHeight: '60px' }} />
              )}
            </Form.Item>
          </Form>
        </TabPane>

        {/* 阅读说明配置 */}
        <TabPane tab="阅读说明" key="reading">
          <Form layout="vertical">
            <h3>三条原则</h3>
            {baseConfig.principles.map((principle, index) => (
              <Form.Item key={index} label={`原则 ${index + 1}`}>
                <TextArea
                  value={principle}
                  onChange={(e) => updatePrinciple(index, e.target.value)}
                  rows={2}
                />
              </Form.Item>
            ))}
          </Form>
        </TabPane>

        {/* 类型概述配置 */}
        <TabPane tab="类型概述" key="types">
          <h3>8种管理类型定义</h3>
          <Table
            dataSource={baseConfig.typeDefinitions}
            columns={typeDefinitionColumns}
            pagination={false}
            rowKey="type"
          />
        </TabPane>

        {/* 详细分析配置 */}
        <TabPane tab="详细分析" key="details">
          <div style={{ marginBottom: '20px' }}>
            <span style={{ marginRight: '10px' }}>选择管理类型：</span>
            {Object.keys(managementConfigs).map(type => (
              <Button
                key={type}
                type={selectedType === type ? 'primary' : 'default'}
                onClick={() => setSelectedType(type)}
                style={{ marginRight: '8px', marginBottom: '8px' }}
              >
                {type}
              </Button>
            ))}
          </div>

          <Form layout="vertical">
            <Form.Item label="标题">
              <Input
                value={managementConfigs[selectedType]?.title}
                onChange={(e) => updateManagementConfig(selectedType, 'title', e.target.value)}
              />
            </Form.Item>

            <Form.Item label="引语">
              <Input
                value={managementConfigs[selectedType]?.motto}
                onChange={(e) => updateManagementConfig(selectedType, 'motto', e.target.value)}
              />
            </Form.Item>

            <Form.Item label="头像图片">
              <Upload
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const dataUrl = e.target?.result as string;
                    updateManagementConfig(selectedType, 'avatar', dataUrl);
                    message.success('头像上传成功');
                  };
                  reader.readAsDataURL(file as any);
                  return false;
                }}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传头像</Button>
              </Upload>
              {managementConfigs[selectedType]?.avatar && (
                <img 
                  src={managementConfigs[selectedType].avatar} 
                  alt="Avatar" 
                  style={{ marginTop: '10px', width: '80px', height: '80px', borderRadius: '50%' }} 
                />
              )}
            </Form.Item>

            <Form.Item label="二维码图片">
              <Upload
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const dataUrl = e.target?.result as string;
                    updateManagementConfig(selectedType, 'qrCode' as any, dataUrl);
                    message.success('二维码上传成功');
                  };
                  reader.readAsDataURL(file as any);
                  return false;
                }}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传类型二维码</Button>
              </Upload>
              {managementConfigs[selectedType]?.qrCode && (
                <img 
                  src={managementConfigs[selectedType].qrCode as string} 
                  alt="Type QRCode" 
                  style={{ marginTop: '10px', width: '120px', height: '120px', borderRadius: '8px' }} 
                />
              )}
            </Form.Item>

            <Form.Item label="优势初衷">
              <TextArea
                value={managementConfigs[selectedType]?.advantage}
                onChange={(e) => updateManagementConfig(selectedType, 'advantage', e.target.value)}
                rows={4}
              />
            </Form.Item>

            <Form.Item label="典型行为">
              <TextArea
                value={managementConfigs[selectedType]?.behavior}
                onChange={(e) => updateManagementConfig(selectedType, 'behavior', e.target.value)}
                rows={4}
              />
            </Form.Item>

            <Form.Item label="潜在风险">
              <TextArea
                value={managementConfigs[selectedType]?.risk}
                onChange={(e) => updateManagementConfig(selectedType, 'risk', e.target.value)}
                rows={4}
              />
            </Form.Item>

            <Form.Item label="发展建议">
              <TextArea
                value={managementConfigs[selectedType]?.suggestion}
                onChange={(e) => updateManagementConfig(selectedType, 'suggestion', e.target.value)}
                rows={8}
              />
            </Form.Item>
          </Form>
        </TabPane>

        {/* 附录配置 */}
        <TabPane tab="附录" key="appendix">
          <Form layout="vertical">
            <Form.Item label="附录文字">
              <TextArea
                value={baseConfig.appendixText}
                onChange={(e) => updateBaseConfig('appendixText', e.target.value)}
                rows={3}
              />
            </Form.Item>

            <Form.Item label="二维码图片">
              <Upload
                beforeUpload={(file) => handleImageUpload('qrCode', file)}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传二维码</Button>
              </Upload>
              {baseConfig.qrCode && (
                <img src={baseConfig.qrCode} alt="QR Code" style={{ marginTop: '10px', width: '150px' }} />
              )}
            </Form.Item>
          </Form>
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={handleSaveShared}>保存为共享配置（全站生效）</Button>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};



