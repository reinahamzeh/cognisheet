import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from "./ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import styled from "styled-components";

// Types
interface ChartData {
  data: Array<[string | number, number]>;
  headers: string[];
}

interface RechartsDisplayProps {
  type: string;
  data: ChartData;
  title?: string;
  description?: string;
  xKey?: string;
  yKey?: string;
  colors?: string[];
  inChat?: boolean;
  onDelete?: () => void;
}

interface FormattedDataItem {
  name: string;
  value: number;
}

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
}

/**
 * ChartDisplay component using Recharts
 */
const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  cursor: pointer;
  color: #ff0000;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const TrashIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const RechartsDisplay: React.FC<RechartsDisplayProps> = ({
  type,
  data,
  title,
  description,
  xKey,
  yKey,
  colors = ["#4A90E2", "#50E3C2", "#F5A623", "#D0021B", "#9013FE"],
  inChat = false,
  onDelete
}) => {
  // Adjust height based on whether it's in chat or not
  const height = inChat ? 150 : 300;
  
  // Format data for Recharts if needed
  const formatData = (): FormattedDataItem[] => {
    if (!data || !data.data || !data.headers) {
      return [];
    }
    
    // Extract data
    const { data: chartData, headers } = data;
    
    // Get unique labels to avoid duplicates
    const uniqueLabelsMap = new Map<string, number>();
    const countMap = new Map<string, number>(); // To track count for averaging
    
    chartData.forEach(row => {
      const label = String(row[0] || '');
      if (label) {
        const value = parseFloat(String(row[1])) || 0;
        
        if (uniqueLabelsMap.has(label)) {
          // For other data types, sum the values
          uniqueLabelsMap.set(label, uniqueLabelsMap.get(label)! + value);
        } else {
          // Create new entry
          uniqueLabelsMap.set(label, value);
        }
      }
    });
    
    // Convert to arrays
    const labels = Array.from(uniqueLabelsMap.keys());
    const values = Array.from(uniqueLabelsMap.values());
    
    // Sort by value (descending)
    const combined = labels.map((label, i) => ({ label, value: values[i] }));
    combined.sort((a, b) => b.value - a.value);
    
    // Create formatted data for Recharts - show all data points
    return combined.map(item => ({
      name: item.label,
      value: item.value
    }));
  };
  
  const formattedData = formatData();
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return String(value);
  };
  
  // Custom label formatter for pie charts
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name
  }: CustomLabelProps): React.ReactNode => {
    if (inChat) return null; // Don't show labels in chat view
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#333333" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={inChat ? 8 : 12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Map chart.js types to recharts types
  const mapChartType = (chartJsType: string): string => {
    const typeMap: { [key: string]: string } = {
      'bar': 'bar',
      'line': 'line',
      'pie': 'pie',
      'doughnut': 'pie',
      'polarArea': 'pie',
      'radar': 'radar',
      'scatter': 'scatter',
      'bubble': 'scatter',
      'area': 'area'
    };
    
    return typeMap[chartJsType] || 'bar';
  };
  
  const chartType = mapChartType(type);
  
  const renderChart = (): React.ReactNode => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 5, bottom: 30 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: inChat ? 6 : 12 }}
                tickFormatter={(value: string) => {
                  const maxLength = inChat ? 3 : 10;
                  return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
                }}
                interval={inChat ? 'preserveStartEnd' : 0}
                height={inChat ? 10 : 50}
                textAnchor="end"
                angle={inChat ? 45 : 45}
              />
              <YAxis 
                tick={{ fontSize: inChat ? 6 : 12 }}
                tickFormatter={tooltipFormatter}
                width={inChat ? 20 : 50}
              />
              {!inChat && <CartesianGrid strokeDasharray="3 3" />}
              <Tooltip 
                formatter={tooltipFormatter}
                contentStyle={{ fontSize: inChat ? 8 : 14, padding: inChat ? '2px' : '10px' }}
                wrapperStyle={{ display: inChat ? 'none' : 'block' }}
              />
              {!inChat && <ChartLegend />}
              <Bar 
                dataKey="value" 
                fill={colors[0]} 
                maxBarSize={inChat ? 10 : 50}
                animationDuration={0}
                label={inChat ? null : {
                  position: 'top',
                  formatter: tooltipFormatter,
                  fontSize: 11,
                  fill: '#666',
                  offset: 10
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={inChat ? 40 : 80}
                innerRadius={inChat ? 15 : 30}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={inChat ? null : {
                  fill: '#333333',
                  fontSize: 10,
                  position: 'outside',
                  offset: 10,
                  formatter: (entry: FormattedDataItem) => {
                    // Only show value for cleaner display
                    return `${entry.value}`;
                  }
                }}
                animationDuration={0}
                minAngle={inChat ? 3 : 5}
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={tooltipFormatter}
                contentStyle={{ fontSize: inChat ? 8 : 14, padding: inChat ? '2px' : '10px' }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ 
                  fontSize: 10, 
                  paddingLeft: 20,
                  display: inChat ? 'none' : 'block'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card className={`relative ${inChat ? 'w-full' : ''}`}>
      {onDelete && (
        <DeleteButton onClick={onDelete} title="Delete chart">
          <TrashIcon />
        </DeleteButton>
      )}
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default RechartsDisplay; 