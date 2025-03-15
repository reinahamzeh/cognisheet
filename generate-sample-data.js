const fs = require('fs');
const path = require('path');

// Generate sample sales data
const generateSalesData = () => {
  const products = [
    'Laptop', 'Smartphone', 'Tablet', 'Monitor', 'Keyboard', 
    'Mouse', 'Headphones', 'Speakers', 'Webcam', 'Printer'
  ];
  
  const regions = ['North', 'South', 'East', 'West', 'Central'];
  
  // CSV header
  let csv = 'Product,Region,Month,Units,Revenue\n';
  
  // Generate 100 rows of data
  for (let i = 0; i < 100; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const month = Math.floor(Math.random() * 12) + 1;
    const units = Math.floor(Math.random() * 100) + 1;
    const price = (product === 'Laptop') ? 1200 : 
                 (product === 'Smartphone') ? 800 : 
                 (product === 'Tablet') ? 500 : 
                 (product === 'Monitor') ? 300 : 
                 (product === 'Keyboard') ? 80 : 
                 (product === 'Mouse') ? 50 : 
                 (product === 'Headphones') ? 150 : 
                 (product === 'Speakers') ? 120 : 
                 (product === 'Webcam') ? 70 : 100;
    const revenue = units * price;
    
    csv += `${product},${region},${month},${units},${revenue}\n`;
  }
  
  return csv;
};

// Write to file
const sampleData = generateSalesData();
const outputPath = path.join(__dirname, 'sample-sales-data.csv');

fs.writeFileSync(outputPath, sampleData);
console.log(`Sample data written to ${outputPath}`); 