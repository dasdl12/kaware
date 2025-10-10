import { toPng, toJpeg } from 'html-to-image';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

/**
 * 导出为HTML文件
 */
export const exportToHTML = (element: HTMLElement, filename: string, includeStyles: boolean = true) => {
  // 获取所有样式
  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        console.warn('无法访问某些样式表:', e);
        return '';
      }
    })
    .join('\n');

  // 克隆元素
  const clone = element.cloneNode(true) as HTMLElement;
  
  // 创建完整的HTML文档
  const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理觉察测评报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    ${includeStyles ? `<style>${styles}</style>` : ''}
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.47059;
            color: #1d1d1f;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            font-weight: 400;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    ${clone.outerHTML}
</body>
</html>`;

  // 创建Blob并下载
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  saveAs(blob, filename);
};

/**
 * 导出为PNG长图（使用html-to-image）
 */
export const exportToPNG = async (element: HTMLElement, filename: string) => {
  try {
    // 等待所有图片和SVG加载完成
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 使用html-to-image的toPng方法
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2, // 2倍分辨率
      cacheBust: true,
      skipFonts: false,
      fontEmbedCSS: '',
      includeQueryParams: true,
      skipAutoScale: false,
      preferredFontFormat: 'woff2',
      backgroundColor: '#f5f7fa',
      filter: (node) => {
        // 确保所有节点都被包含
        return true;
      },
      style: {
        margin: '0',
        padding: '0',
        transform: 'scale(1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }
    });

    // 转换dataUrl为blob并下载
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    saveAs(blob, filename);
  } catch (error) {
    console.error('导出PNG失败:', error);
    throw error;
  }
};

/**
 * 导出为JPEG长图（使用html-to-image）
 */
export const exportToJPEG = async (element: HTMLElement, filename: string) => {
  try {
    // 等待所有图片和SVG加载完成
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 使用html-to-image的toJpeg方法
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2, // 2倍分辨率
      cacheBust: true,
      skipFonts: false,
      fontEmbedCSS: '',
      includeQueryParams: true,
      skipAutoScale: false,
      preferredFontFormat: 'woff2',
      backgroundColor: '#ffffff',
      filter: (node) => {
        // 确保所有节点都被包含
        return true;
      },
      style: {
        margin: '0',
        padding: '0',
        transform: 'scale(1)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }
    });

    // 转换dataUrl为blob并下载
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    saveAs(blob, filename);
  } catch (error) {
    console.error('导出JPEG失败:', error);
    throw error;
  }
};

/**
 * 批量导出HTML到压缩包
 */
export const batchExportHTML = async (
  elements: HTMLElement[],
  names: string[],
  onProgress?: (current: number, total: number) => void
) => {
  const zip = new JSZip();
  
  for (let i = 0; i < elements.length; i++) {
    if (onProgress) {
      onProgress(i + 1, elements.length);
    }
    
    const element = elements[i];
    const name = names[i];
    
    // 获取所有样式
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    const clone = element.cloneNode(true) as HTMLElement;
    
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理觉察测评报告 - ${name}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>${styles}</style>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.47059;
            color: #1d1d1f;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            font-weight: 400;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
    ${clone.outerHTML}
</body>
</html>`;

    zip.file(`${name}_管理觉察测评报告.html`, htmlContent);
  }
  
  // 生成压缩包
  const content = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().split('T')[0];
  saveAs(content, `管理觉察测评报告_批量导出_${timestamp}.zip`);
};

/**
 * 批量导出PNG到压缩包
 */
export const batchExportPNG = async (
  elements: HTMLElement[],
  names: string[],
  onProgress?: (current: number, total: number) => void
) => {
  const zip = new JSZip();
  
  for (let i = 0; i < elements.length; i++) {
    if (onProgress) {
      onProgress(i + 1, elements.length);
    }
    
    const element = elements[i];
    const name = names[i];
    
    try {
      // 等待元素完全渲染
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
        includeQueryParams: true,
        backgroundColor: '#f5f7fa',
        filter: (node) => {
          return true;
        },
        style: {
          margin: '0',
          padding: '0',
          transform: 'scale(1)'
        }
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      zip.file(`${name}_管理觉察测评报告.png`, blob);
      
      // 添加延迟避免浏览器阻塞
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`导出PNG失败 (${name}):`, error);
    }
  }
  
  // 生成压缩包
  const content = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().split('T')[0];
  saveAs(content, `管理觉察测评报告_批量导出_PNG_${timestamp}.zip`);
};

/**
 * 批量导出JPEG到压缩包
 */
export const batchExportJPEG = async (
  elements: HTMLElement[],
  names: string[],
  onProgress?: (current: number, total: number) => void
) => {
  const zip = new JSZip();
  
  for (let i = 0; i < elements.length; i++) {
    if (onProgress) {
      onProgress(i + 1, elements.length);
    }
    
    const element = elements[i];
    const name = names[i];
    
    try {
      // 等待元素完全渲染
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dataUrl = await toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
        includeQueryParams: true,
        backgroundColor: '#ffffff',
        filter: (node) => {
          return true;
        },
        style: {
          margin: '0',
          padding: '0',
          transform: 'scale(1)'
        }
      });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      zip.file(`${name}_管理觉察测评报告.jpg`, blob);
      
      // 添加延迟避免浏览器阻塞
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`导出JPEG失败 (${name}):`, error);
    }
  }
  
  // 生成压缩包
  const content = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().split('T')[0];
  saveAs(content, `管理觉察测评报告_批量导出_JPG_${timestamp}.zip`);
};
