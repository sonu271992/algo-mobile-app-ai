import React, { useState, useEffect } from 'react';
import { Filter, Calendar, TrendingUp, TrendingDown, Target, Award, BarChart3 } from 'lucide-react';
import { Order } from '../types';
import { apiService } from '../services/api';

const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month' | 'lastMonth' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [profit, setProfit] = useState(0);
  const [analytics, setAnalytics] = useState({
    totalTrades: 0,
    profitTrades: 0,
    lossTrades: 0,
    winRate: 0,
    avgProfit: 0,
    avgLoss: 0
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filter]);

  const loadOrders = async () => {
    try {
      const ordersData = await apiService.getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        filtered = orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= today;
        });
        break;
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => 
          new Date(order.date) >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = orders.filter(order => 
          new Date(order.date) >= monthAgo
        );
        break;
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        filtered = orders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
        });
        break;
      case 'custom':
        if (customDateFrom && customDateTo) {
          const fromDate = new Date(customDateFrom);
          const toDate = new Date(customDateTo);
          toDate.setHours(23, 59, 59, 999); // Include the entire end date
          filtered = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= fromDate && orderDate <= toDate;
          });
        }
        break;
      default:
        filtered = orders;
    }

    setFilteredOrders(filtered);
    calculateProfit(filtered);
    calculateAnalytics(filtered);
  };

  const calculateProfit = (orderList: Order[]) => {
    // Group orders by instrument to calculate profit/loss
    const instrumentGroups: { [key: string]: Order[] } = {};
    
    orderList.forEach(order => {
      if (!instrumentGroups[order.instrument]) {
        instrumentGroups[order.instrument] = [];
      }
      instrumentGroups[order.instrument].push(order);
    });

    let totalProfit = 0;

    Object.values(instrumentGroups).forEach(group => {
      const buyOrders = group.filter(o => o.type === 'BUY');
      const sellOrders = group.filter(o => o.type === 'SELL');

      buyOrders.forEach(buyOrder => {
        const matchingSell = sellOrders.find(sellOrder => 
          sellOrder.qty === buyOrder.qty && 
          new Date(sellOrder.date) > new Date(buyOrder.date)
        );

        if (matchingSell) {
          totalProfit += (matchingSell.price - buyOrder.price) * buyOrder.qty;
        }
      });
    });

    setProfit(totalProfit);
  };

  const calculateAnalytics = (orderList: Order[]) => {
    const instrumentGroups: { [key: string]: Order[] } = {};
    
    orderList.forEach(order => {
      if (!instrumentGroups[order.instrument]) {
        instrumentGroups[order.instrument] = [];
      }
      instrumentGroups[order.instrument].push(order);
    });

    let totalTrades = 0;
    let profitTrades = 0;
    let lossTrades = 0;
    let totalProfitAmount = 0;
    let totalLossAmount = 0;

    Object.values(instrumentGroups).forEach(group => {
      const buyOrders = group.filter(o => o.type === 'BUY');
      const sellOrders = group.filter(o => o.type === 'SELL');

      buyOrders.forEach(buyOrder => {
        const matchingSell = sellOrders.find(sellOrder => 
          sellOrder.qty === buyOrder.qty && 
          new Date(sellOrder.date) > new Date(buyOrder.date)
        );

        if (matchingSell) {
          totalTrades++;
          const pnl = (matchingSell.price - buyOrder.price) * buyOrder.qty;
          
          if (pnl > 0) {
            profitTrades++;
            totalProfitAmount += pnl;
          } else {
            lossTrades++;
            totalLossAmount += Math.abs(pnl);
          }
        }
      });
    });

    setAnalytics({
      totalTrades,
      profitTrades,
      lossTrades,
      winRate: totalTrades > 0 ? (profitTrades / totalTrades) * 100 : 0,
      avgProfit: profitTrades > 0 ? totalProfitAmount / profitTrades : 0,
      avgLoss: lossTrades > 0 ? totalLossAmount / lossTrades : 0
    });
  };

  const getOrderTypeColor = (type: string) => {
    return type === 'BUY' ? 'text-green-400' : 'text-red-400';
  };

  const getOrderTypeBg = (type: string) => {
    return type === 'BUY' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const groupOrderPairs = (orderList: Order[]) => {
    const pairs: Array<{ buy?: Order; sell?: Order }> = [];
    const instrumentGroups: { [key: string]: Order[] } = {};
    
    // Group orders by instrument
    orderList.forEach(order => {
      if (!instrumentGroups[order.instrument]) {
        instrumentGroups[order.instrument] = [];
      }
      instrumentGroups[order.instrument].push(order);
    });

    // Create pairs for each instrument
    Object.values(instrumentGroups).forEach(group => {
      const buyOrders = group.filter(o => o.type === 'BUY').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const sellOrders = group.filter(o => o.type === 'SELL').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const maxLength = Math.max(buyOrders.length, sellOrders.length);
      
      for (let i = 0; i < maxLength; i++) {
        pairs.push({
          buy: buyOrders[i],
          sell: sellOrders[i]
        });
      }
    });

    return pairs;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h4 className="text-slate-800 font-semibold text-sm">Total P&L</h4>
          </div>
          <div className="flex items-center space-x-2">
            {profit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`font-bold text-lg ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{Math.abs(profit).toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <h4 className="text-slate-800 font-semibold text-sm">Win Rate</h4>
          </div>
          <p className="text-lg font-bold text-purple-600">
            {analytics.winRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-green-600" />
            <h4 className="text-slate-800 font-semibold text-sm">Profit Trades</h4>
          </div>
          <p className="text-lg font-bold text-green-600">{analytics.profitTrades}</p>
          <p className="text-xs text-slate-600">Avg: ₹{analytics.avgProfit.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h4 className="text-slate-800 font-semibold text-sm">Loss Trades</h4>
          </div>
          <p className="text-lg font-bold text-red-600">{analytics.lossTrades}</p>
          <p className="text-xs text-slate-600">Avg: ₹{analytics.avgLoss.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Filter className="w-6 h-6 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Order Filters</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All Orders' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'lastMonth', label: 'Last Month' },
            { value: 'custom', label: 'Custom Range' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        
        {filter === 'custom' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
              <input
                type="date"
                value={customDateFrom}
                onChange={(e) => setCustomDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
              <input
                type="date"
                value={customDateTo}
                onChange={(e) => setCustomDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="w-6 h-6 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">Order Pairs</h3>
          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-sm">
            {filteredOrders.length}
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No orders found for the selected filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupOrderPairs(filteredOrders).map((pair, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                {pair.buy && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded border text-xs font-medium bg-green-50 border-green-200 text-green-600">
                          BUY
                        </span>
                        <span className="text-slate-800 font-medium">{pair.buy.instrument}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-800 font-medium">₹{pair.buy.price.toLocaleString()}</p>
                        <p className="text-sm text-slate-600">{pair.buy.orderStatus}</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>Qty: {pair.buy.qty} | Total: ₹{(pair.buy.price * pair.buy.qty).toLocaleString()}</p>
                      <p>{new Date(pair.buy.date).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                
                {pair.sell ? (
                  <div className={pair.buy ? 'border-t border-slate-200 pt-3' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded border text-xs font-medium bg-red-50 border-red-200 text-red-600">
                          SELL
                        </span>
                        <span className="text-slate-800 font-medium">{pair.sell.instrument}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-800 font-medium">₹{pair.sell.price.toLocaleString()}</p>
                        <p className="text-sm text-slate-600">{pair.sell.orderStatus}</p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p>Qty: {pair.sell.qty} | Total: ₹{(pair.sell.price * pair.sell.qty).toLocaleString()}</p>
                      <p>{new Date(pair.sell.date).toLocaleString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-center py-2">
                      <span className="text-orange-600 font-medium text-sm">OPEN POSITION</span>
                    </div>
                  </div>
                )}
                
                {pair.buy && pair.sell && (
                  <div className="border-t border-slate-200 pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">P&L:</span>
                      <span className={`font-semibold ${
                        (pair.sell.price - pair.buy.price) * pair.buy.qty >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        ₹{((pair.sell.price - pair.buy.price) * pair.buy.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersTab;