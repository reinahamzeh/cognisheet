import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';

// Register the plugins
Chart.register(ChartDataLabels);

const ChartContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.base};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
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

const ChartTitle = styled.h3`
  font-size: ${({ theme, inChat }) => inChat ? '10px' : '14px'};
  margin: ${({ inChat }) => inChat ? '1px 0' : '0 0 5px 0'};
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const ChartCanvas = styled.canvas`
  width: 100%;
  height: ${props => props.inChat ? '100px' : '200px'};
`;

const ChartDisplay = ({ type, data, title, onDelete, inChat = false }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
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
    chartInstance.current = new Chart(ctx, {
      type: type,
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // Disable legend for all views to save space
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
            display: false, // We're using our own title component
            text: title || '',
          },
          tooltip: {
            enabled: !inChat, // Disable tooltips in chat view to prevent accidental hover
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
            display: false, // Disable data labels in all views to save space
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
                // Shorten large numbers
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(0) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(0) + 'k';
                }
                return value;
              }
            },
            grid: {
              display: false, // Disable grid for cleaner look
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
                // Truncate long labels
                const maxLength = inChat ? 3 : 8;
                if (value && value.length > maxLength) {
                  return value.substr(0, maxLength) + '...';
                }
                return value;
              }
            },
            grid: {
              display: false, // Disable grid for cleaner look
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
          duration: 0 // Disable all animations for better performance
        },
        elements: {
          point: {
            radius: inChat ? 0 : 2, // Hide points in chat view
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
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, title, inChat]);
  
  // Prepare data for Chart.js based on chart type
  const prepareChartData = (data, chartType) => {
    if (!data || !data.data || !data.headers) {
      return { labels: [], datasets: [] };
    }
    
    // Extract data
    const { data: chartData, headers } = data;
    
    // Check if we're dealing with distance data
    const isDistanceData = headers[1]?.toLowerCase().includes('distance') || 
                          headers[1]?.toLowerCase().includes('miles') || 
                          headers[1]?.toLowerCase().includes('km');
    
    // Get unique labels to avoid duplicates
    const uniqueLabelsMap = new Map();
    const countMap = new Map(); // To track count for averaging
    
    chartData.forEach(row => {
      const label = String(row[0] || '');
      if (label) {
        const value = parseFloat(row[1]) || 0;
        
        if (uniqueLabelsMap.has(label)) {
          if (isDistanceData) {
            // For distance data, we'll calculate an average later
            uniqueLabelsMap.set(label, uniqueLabelsMap.get(label) + value);
            countMap.set(label, countMap.get(label) + 1);
          } else {
            // For other data types, sum the values
            uniqueLabelsMap.set(label, uniqueLabelsMap.get(label) + value);
          }
        } else {
          // Create new entry
          uniqueLabelsMap.set(label, value);
          if (isDistanceData) {
            countMap.set(label, 1);
          }
        }
      }
    });
    
    // If this is distance data, calculate averages
    if (isDistanceData) {
      for (const [label, sum] of uniqueLabelsMap.entries()) {
        const count = countMap.get(label);
        uniqueLabelsMap.set(label, sum / count); // Replace sum with average
      }
    }
    
    // Convert to arrays
    const labels = Array.from(uniqueLabelsMap.keys());
    const values = Array.from(uniqueLabelsMap.values());
    
    // Limit the number of data points for readability
    const maxDataPoints = inChat ? 3 : 6;
    let limitedLabels = labels;
    let limitedValues = values;
    
    if (labels.length > maxDataPoints) {
      // Sort by value (descending) and take top items
      const combined = labels.map((label, i) => ({ label, value: values[i] }));
      combined.sort((a, b) => b.value - a.value);
      
      const topItems = combined.slice(0, maxDataPoints - 1);
      const otherItems = combined.slice(maxDataPoints - 1);
      
      if (otherItems.length > 0) {
        const otherSum = otherItems.reduce((sum, item) => sum + item.value, 0);
        topItems.push({ label: 'Other', value: otherSum });
      }
      
      limitedLabels = topItems.map(item => item.label);
      limitedValues = topItems.map(item => item.value);
    }
    
    // Generate colors for charts
    const generateColors = (count) => {
      const colors = [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)',
        'rgba(40, 159, 64, 0.8)',
        'rgba(210, 199, 199, 0.8)',
      ];
      
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
      }
      return result;
    };
    
    // Check if data looks like dates
    const isDateData = limitedLabels.some(label => {
      // Check for common date formats
      return /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(label) || // MM/DD/YYYY
             /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(label);     // YYYY-MM-DD
    });
    
    // Create dataset based on chart type
    if (['pie', 'doughnut', 'polarArea'].includes(chartType)) {
      return {
        labels: limitedLabels,
        datasets: [{
          data: limitedValues,
          backgroundColor: generateColors(limitedValues.length),
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 0,
        }]
      };
    } else if (chartType === 'radar') {
      return {
        labels: limitedLabels,
        datasets: [{
          label: headers[1] || 'Values',
          data: limitedValues,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: inChat ? 1 : 1.5,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        }]
      };
    } else if (chartType === 'scatter') {
      // For scatter plots, we need x and y coordinates
      const points = chartData.map((row, index) => ({
        x: parseFloat(row[0]) || index,
        y: parseFloat(row[1]) || 0
      })).slice(0, maxDataPoints);
      
      return {
        datasets: [{
          label: headers[1] || 'Values',
          data: points,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: inChat ? 1 : 1.5,
          pointRadius: inChat ? 1 : 3,
        }]
      };
    } else {
      // Bar, line, etc.
      return {
        labels: limitedLabels,
        datasets: [{
          label: headers[1] || 'Values',
          data: limitedValues,
          backgroundColor: chartType === 'line' ? 'rgba(54, 162, 235, 0.2)' : generateColors(1)[0],
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: inChat ? 1 : 1.5,
          tension: chartType === 'line' ? 0.1 : 0, // Slight curve for line charts
          fill: chartType === 'line',
          barThickness: inChat ? 'flex' : undefined,
          maxBarThickness: inChat ? 10 : 30,
        }]
      };
    }
  };
  
  return (
    <ChartContainer className={inChat ? 'chat-view' : ''}>
      {title && <ChartTitle inChat={inChat}>{title}</ChartTitle>}
      <ChartCanvas ref={chartRef} inChat={inChat} />
      {onDelete && !inChat && (
        <DeleteButton onClick={onDelete}>
          <TrashIcon />
        </DeleteButton>
      )}
    </ChartContainer>
  );
};

// Delete button for charts
const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.error || '#ff0000'};
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

// Trash icon component
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

export default ChartDisplay; 