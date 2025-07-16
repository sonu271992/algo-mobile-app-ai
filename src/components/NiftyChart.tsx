import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const NiftyChart: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [currentPrice, setCurrentPrice] = useState(23500);
  const [priceChange, setPriceChange] = useState(125.50);

  useEffect(() => {
    // Generate sample Nifty 50 data (in real app, this would come from an API)
    const generateNiftyData = () => {
      const labels = [];
      const prices = [];
      const basePrice = 23400;
      
      // Generate 30 data points for the last 30 intervals
      for (let i = 29; i >= 0; i--) {
        const time = new Date();
        time.setMinutes(time.getMinutes() - (i * 5)); // 5-minute intervals
        labels.push(time.toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }));
        
        // Generate realistic price movement
        const randomChange = (Math.random() - 0.5) * 100;
        const price = basePrice + (Math.sin(i * 0.1) * 200) + randomChange;
        prices.push(Math.round(price * 100) / 100);
      }
      
      setCurrentPrice(prices[prices.length - 1]);
      setPriceChange(prices[prices.length - 1] - prices[prices.length - 2]);
      
      return {
        labels,
        datasets: [
          {
            label: 'Nifty 50',
            data: prices,
            borderColor: priceChange >= 0 ? '#10b981' : '#ef4444',
            backgroundColor: priceChange >= 0 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: priceChange >= 0 ? '#10b981' : '#ef4444',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
          },
        ],
      };
    };

    setChartData(generateNiftyData());

    // Update data every 30 seconds to simulate real-time updates
    const interval = setInterval(() => {
      setChartData(generateNiftyData());
    }, 30000);

    return () => clearInterval(interval);
  }, [priceChange]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: priceChange >= 0 ? '#10b981' : '#ef4444',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            return `Time: ${context[0].label}`;
          },
          label: (context: any) => {
            return `₹${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          color: '#64748b',
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Price Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-slate-800">NIFTY 50</h4>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-slate-800">
              ₹{currentPrice.toLocaleString()}
            </span>
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              priceChange >= 0 
                ? 'text-green-700 bg-green-100' 
                : 'text-red-700 bg-red-100'
            }`}>
              {priceChange >= 0 ? '+' : ''}₹{priceChange.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Last Updated</p>
          <p className="text-sm font-medium text-slate-800">
            {new Date().toLocaleTimeString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit',
              hour12: false 
            })}
          </p>
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
      
      {/* Market Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-slate-600">Market Open</span>
        </div>
        <span className="text-slate-600">5-minute intervals</span>
      </div>
    </div>
  );
};

export default NiftyChart;