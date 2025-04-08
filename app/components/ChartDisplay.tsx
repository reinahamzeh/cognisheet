import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';

// Register the plugins
Chart.register(ChartDataLabels);

interface ChartData {
  data: Array<[string | number, number]>;
  headers: string[];
}

interface ChartDisplayProps {
  type: string;
  data: ChartData;
  title?: string;
  onDelete?: () => void;
  inChat?: boolean;
}

const ChartContainer = styled.div<{ inChat?: boolean }>`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  padding: ${({ theme }) => theme.spacing.base};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.small};
  width: 100%;
  max-width: 100%;
  align-self: center;
  margin-bottom: 15px;
  position: relative;
  
  &.chat-view {
    max-width: 250px;
    margin: 3px auto;
    height: auto;
    padding: 3px;
    border-width: 1px;
  }
`;

const ChartTitle = styled.h3<{ inChat?: boolean }>`
  font-size: ${({ theme, inChat }) => inChat ? theme.typography.fontSize.small : theme.typography.fontSize.base};
  margin: ${({ inChat }) => inChat ? '1px 0' : '0 0 5px 0'};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const ChartCanvas = styled.canvas<{ inChat?: boolean }>`
  width: 100%;
  height: ${props => props.inChat ? '100px' : '200px'};
`;

const ChartDisplay: React.FC<ChartDisplayProps> = ({ type, data, title, onDelete, inChat = false }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  useEffect(() => {
    if (!chartRef.current || !data) return;
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Prepare data for Chart.js
    const chartData = prepareChartData(data, type);
    
    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: type,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
            position: 'bottom',
            labels: {
              color: '#333333',
              boxWidth: inChat ? 4 : 8,
              font: {
                size: inChat ? 6 : 9
              }
            }
          },
          title: {
            display: false,
            text: title || '',
          },
          tooltip: {
            enabled: !inChat,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== undefined) {
                  label += context.parsed.y;
                } else if (context.parsed !== undefined) {
                  label += context.parsed;
                }
                return label;
              }
            }
          },
          datalabels: {
            display: false,
          }
        },
        scales: !['pie', 'doughnut', 'polarArea', 'radar'].includes(type) ? {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#333333',
              font: {
                size: inChat ? 6 : 8
              },
              maxTicksLimit: inChat ? 3 : 5,
              callback: function(value) {
                if (typeof value === 'number') {
                  if (value >= 1000000) {
                    return (value / 1000000).toFixed(0) + 'M';
                  } else if (value >= 1000) {
                    return (value / 1000).toFixed(0) + 'k';
                  }
                }
                return value;
              }
            },
            grid: {
              display: false,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            border: {
              display: !inChat
            }
          },
          x: {
            ticks: {
              color: '#333333',
              font: {
                size: inChat ? 6 : 8
              },
              maxRotation: inChat ? 45 : 30,
              minRotation: inChat ? 45 : 0,
              autoSkip: true,
              maxTicksLimit: inChat ? 3 : 6,
              callback: function(value) {
                if (typeof value === 'string' && value.length > (inChat ? 3 : 8)) {
                  return value.substr(0, inChat ? 3 : 8) + '...';
                }
                return value;
              }
            },
            grid: {
              display: false,
              color: 'rgba(0, 0, 0, 0.1)'
            },
            border: {
              display: !inChat
            }
          }
        } : undefined,
        layout: {
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        },
        animation: {
          duration: 0
        },
        elements: {
          point: {
            radius: inChat ? 0 : 2,
            hoverRadius: inChat ? 1 : 3
          },
          line: {
            borderWidth: inChat ? 1 : 1.5
          },
          bar: {
            borderWidth: 0
          },
          arc: {
            borderWidth: 0
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, title, inChat]);
  
  const prepareChartData = (data: ChartData, chartType: string) => {
    if (!data || !data.data || !data.headers) {
      return { labels: [], datasets: [] };
    }
    
    const { data: chartData, headers } = data;
    
    const isDistanceData = headers[1]?.toLowerCase().includes('distance') || 
                          headers[1]?.toLowerCase().includes('miles') || 
                          headers[1]?.toLowerCase().includes('km');
    
    const uniqueLabelsMap = new Map<string, number>();
    const countMap = new Map<string, number>();
    
    chartData.forEach(row => {
      const label = String(row[0] || '');
      if (label) {
        const value = parseFloat(String(row[1])) || 0;
        
        if (uniqueLabelsMap.has(label)) {
          if (isDistanceData) {
            uniqueLabelsMap.set(label, (uniqueLabelsMap.get(label) || 0) + value);
            countMap.set(label, (countMap.get(label) || 0) + 1);
          } else {
            uniqueLabelsMap.set(label, (uniqueLabelsMap.get(label) || 0) + value);
          }
        } else {
          uniqueLabelsMap.set(label, value);
          if (isDistanceData) {
            countMap.set(label, 1);
          }
        }
      }
    });
    
    if (isDistanceData) {
      for (const [label, sum] of uniqueLabelsMap.entries()) {
        const count = countMap.get(label) || 1;
        uniqueLabelsMap.set(label, sum / count);
      }
    }
    
    const labels = Array.from(uniqueLabelsMap.keys());
    const values = Array.from(uniqueLabelsMap.values());
    
    const generateColors = (count: number): string[] => {
      const baseColors = [
        '#4A90E2', '#50E3C2', '#F5A623', '#D0021B', '#9013FE',
        '#417505', '#E64B8C', '#7ED321', '#B8E986', '#BD10E0'
      ];
      
      const colors: string[] = [];
      for (let i = 0; i < count; i++) {
        colors.push(baseColors[i % baseColors.length]);
      }
      return colors;
    };
    
    const backgroundColor = generateColors(values.length);
    const borderColor = backgroundColor;
    
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor,
        borderColor,
        borderWidth: 1
      }]
    };
  };
  
  return (
    <ChartContainer inChat={inChat} className={inChat ? 'chat-view' : ''}>
      {title && <ChartTitle inChat={inChat}>{title}</ChartTitle>}
      <ChartCanvas ref={chartRef} inChat={inChat} />
    </ChartContainer>
  );
};

export default ChartDisplay; 