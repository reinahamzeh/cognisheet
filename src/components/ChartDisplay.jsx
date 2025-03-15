import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Chart from 'chart.js/auto';

const ChartContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing.base};
  box-shadow: ${({ theme }) => theme.shadows.small};
  width: 100%;
  max-width: 100%;
  align-self: center;
`;

const ChartTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.body};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const ChartCanvas = styled.canvas`
  width: 100%;
  height: 200px;
`;

const ChartDisplay = ({ type, data, title }) => {
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
            display: type === 'pie',
            position: 'bottom',
          },
        },
        scales: type !== 'pie' ? {
          y: {
            beginAtZero: true,
          }
        } : undefined,
      }
    });
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data]);
  
  // Prepare data for Chart.js based on chart type
  const prepareChartData = (data, chartType) => {
    if (!data || !data.data || !data.headers) {
      return { labels: [], datasets: [] };
    }
    
    // Extract data
    const { data: chartData, headers } = data;
    
    // For simplicity, assume first column is labels and second column is values
    // In a real app, we would have more sophisticated logic
    const labels = chartData.map(row => row[0]);
    const values = chartData.map(row => row[1]);
    
    // Generate random colors for pie chart
    const generateColors = (count) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * 200);
        const g = Math.floor(Math.random() * 200);
        const b = Math.floor(Math.random() * 200);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
      }
      return colors;
    };
    
    // Create dataset based on chart type
    if (chartType === 'pie') {
      return {
        labels,
        datasets: [{
          data: values,
          backgroundColor: generateColors(values.length),
        }]
      };
    } else {
      return {
        labels,
        datasets: [{
          label: headers[1] || 'Values',
          data: values,
          backgroundColor: 'rgba(74, 144, 226, 0.7)',
          borderColor: 'rgba(74, 144, 226, 1)',
          borderWidth: 1,
        }]
      };
    }
  };
  
  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      <ChartCanvas ref={chartRef} />
    </ChartContainer>
  );
};

export default ChartDisplay; 