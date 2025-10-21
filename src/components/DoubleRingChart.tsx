import React, { useEffect, useRef } from 'react';
import { DoubleRingData } from '../types';

interface DoubleRingChartProps {
  data: DoubleRingData;
}

export const DoubleRingChart: React.FC<DoubleRingChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = svgRef.current;
    const outerRing = svg.querySelector('#outerRing');
    const innerRing = svg.querySelector('#innerRing');

    if (!outerRing || !innerRing) return;

    // 清空现有内容
    outerRing.innerHTML = '';
    innerRing.innerHTML = '';

    const centerX = 200;
    const centerY = 200;

    // 外环配置
    const outerInnerRadius = 115;

    // 创建渐变定义
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    // 外环渐变
    const gradients = [
      { id: 'outerGrad1', start: '#4A90E2', end: '#7B68EE' },
      { id: 'outerGrad2', start: '#5AC8FA', end: '#007AFF' },
      { id: 'outerGrad3', start: '#AF52DE', end: '#5856D6' },
      { id: 'innerGrad1', start: '#9F7AEA', end: '#D946EF' },
      { id: 'innerGrad2', start: '#60A5FA', end: '#3B82F6' },
      { id: 'innerGrad3', start: '#8B5CF6', end: '#6366F1' }
    ];

    gradients.forEach(grad => {
      const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      gradient.setAttribute('id', grad.id);
      gradient.setAttribute('x1', '0%');
      gradient.setAttribute('y1', '0%');
      gradient.setAttribute('x2', '100%');
      gradient.setAttribute('y2', '100%');

      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', grad.start);

      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', grad.end);

      gradient.appendChild(stop1);
      gradient.appendChild(stop2);
      defs.appendChild(gradient);
    });

    // 计算动态角度
    const calculateDynamicAngles = (dataArray: any[]) => {
      const maxScore = Math.max(...dataArray.map(item => item.value));
      const minScore = Math.min(...dataArray.map(item => item.value));
      const scoreRange = maxScore - minScore;

      const baseAngle = (360 / dataArray.length) * 0.7;
      const bonusAngle = (360 / dataArray.length) * 0.3;

      return dataArray.map(item => {
        if (scoreRange === 0) {
          return 360 / dataArray.length;
        }
        const scoreRatio = (item.value - minScore) / scoreRange;
        const dynamicBonus = bonusAngle * (0.3 + scoreRatio * 0.7);
        return baseAngle + dynamicBonus;
      });
    };

    // 创建环形扇区路径
    const createRingSector = (
      cx: number,
      cy: number,
      innerRadius: number,
      outerRadius: number,
      startAngle: number,
      angle: number
    ) => {
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = ((startAngle + angle) * Math.PI) / 180;

      const x1 = cx + innerRadius * Math.cos(startAngleRad);
      const y1 = cy + innerRadius * Math.sin(startAngleRad);
      const x2 = cx + outerRadius * Math.cos(startAngleRad);
      const y2 = cy + outerRadius * Math.sin(startAngleRad);

      const x3 = cx + outerRadius * Math.cos(endAngleRad);
      const y3 = cy + outerRadius * Math.sin(endAngleRad);
      const x4 = cx + innerRadius * Math.cos(endAngleRad);
      const y4 = cy + innerRadius * Math.sin(endAngleRad);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3}`,
        `L ${x4} ${y4}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1}`,
        'Z'
      ].join(' ');

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      return path;
    };

    const outerColors = ['url(#outerGrad1)', 'url(#outerGrad2)', 'url(#outerGrad3)'];
    const innerColors = ['url(#innerGrad1)', 'url(#innerGrad2)', 'url(#innerGrad3)'];

    const thicknessMultiplier = 2.2;

    // 🧩 压缩外环厚度差异
    const outerThicknessValues = data.outer.map(o => o.thickness);
    const maxT = Math.max(...outerThicknessValues);
    const minT = Math.min(...outerThicknessValues);
    const avgT = (maxT + minT) / 2;
    const compressionFactor = 0.6; // 可调 (0.5~0.7 推荐值)

    // 计算外环动态角度
    const outerAngles = calculateDynamicAngles(data.outer);
    const outerTotalAngle = outerAngles.reduce((sum, angle) => sum + angle, 0);
    const outerNormalizedAngles = outerAngles.map(angle => (angle / outerTotalAngle) * 360);

    // 绘制外环
    let outerStartAngle = -90;
    data.outer.forEach((item, index) => {
      const angle = outerNormalizedAngles[index];

      // 压缩厚度差异
      const normalizedThickness = item.thickness - avgT;
      const adjustedThickness = avgT + normalizedThickness * compressionFactor;

      const dynamicOuterRadius = outerInnerRadius + adjustedThickness * thicknessMultiplier;

      const path = createRingSector(centerX, centerY, outerInnerRadius, dynamicOuterRadius, outerStartAngle, angle);
      path.setAttribute('fill', outerColors[index % outerColors.length]);
      path.setAttribute('class', 'ring-sector');
      path.setAttribute('stroke', 'none');
      outerRing.appendChild(path);

      // 添加标签
      const labelAngle = outerStartAngle + angle / 2;
      const labelRadius = outerInnerRadius + (dynamicOuterRadius - outerInnerRadius) * 0.4;
      const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
      const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(labelX));
      text.setAttribute('y', String(labelY));
      text.setAttribute('class', 'ring-text');
      text.setAttribute(
        'style',
        'font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600; fill: white; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); text-anchor: middle; dominant-baseline: central; font-size: 17px;'
      );

      let textRotation = labelAngle - 90;
      let normalizedAngle = ((labelAngle % 360) + 360) % 360;

      if (normalizedAngle >= 180 && normalizedAngle <= 360) {
        textRotation += 180;
      }

      text.setAttribute('transform', `rotate(${textRotation}, ${labelX}, ${labelY})`);
      text.textContent = `${item.label} ${Math.round(item.value)}`;
      outerRing.appendChild(text);

      outerStartAngle += angle;
    });

    // 计算内环动态角度
    const innerAngles = calculateDynamicAngles(data.inner);
    const innerTotalAngle = innerAngles.reduce((sum, angle) => sum + angle, 0);
    const innerNormalizedAngles = innerAngles.map(angle => (angle / innerTotalAngle) * 360);

    // 绘制内环
    let innerStartAngle = -35;
    data.inner.forEach((item, index) => {
      const angle = innerNormalizedAngles[index];
      const baseInnerRadius = 45;
      const thicknessPerRank = 15;
      const rankBasedThickness = (4 - item.rank) * thicknessPerRank;
      const startRadius = baseInnerRadius;
      const endRadius = baseInnerRadius + 20 + rankBasedThickness;

      const path = createRingSector(centerX, centerY, startRadius, endRadius, innerStartAngle, angle);
      path.setAttribute('fill', innerColors[index % innerColors.length]);
      path.setAttribute('class', 'ring-sector');
      path.setAttribute('stroke', 'none');
      innerRing.appendChild(path);

      // 添加标签
      const labelAngle = innerStartAngle + angle / 2;
      const labelRadius = startRadius + (endRadius - startRadius) * 0.5;
      const labelX = centerX + labelRadius * Math.cos((labelAngle * Math.PI) / 180);
      const labelY = centerY + labelRadius * Math.sin((labelAngle * Math.PI) / 180);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(labelX));
      text.setAttribute('y', String(labelY));
      text.setAttribute('class', 'ring-text');
      text.setAttribute(
        'style',
        'font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600; fill: white; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); text-anchor: middle; dominant-baseline: central; font-size: 15px;'
      );

      let textRotation = labelAngle - 90;
      let normalizedAngle = ((labelAngle % 360) + 360) % 360;

      if (normalizedAngle >= 180 && normalizedAngle <= 360) {
        textRotation += 180;
      }

      text.setAttribute('transform', `rotate(${textRotation}, ${labelX}, ${labelY})`);
      text.textContent = `${item.label} ${Math.round(item.value)}`;
      innerRing.appendChild(text);

      innerStartAngle += angle;
    });
  }, [data]);

  return (
    <div className="double-ring-chart">
      <svg ref={svgRef} id="doubleRingSvg" viewBox="0 0 400 400" style={{ width: '115%', height: '115%' }}>
        <g id="outerRing" className="outer-ring"></g>
        <g id="innerRing" className="inner-ring"></g>
        <circle cx="200" cy="200" r="40" fill="#f8f9fa" stroke="#e5e5e7" strokeWidth="2" />
      </svg>
    </div>
  );
}