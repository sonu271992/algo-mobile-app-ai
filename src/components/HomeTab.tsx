import React, { useState, useEffect } from 'react';
import { Settings, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';
import { User, Settings as SettingsType, Order } from '../types';
import { apiService } from '../services/api';

interface HomeTabProps {
  user: User;
}

const HomeTab: React.FC<HomeTabProps> = ({ user }) => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [todaysOrders, setTodaysOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, ordersData] = await Promise.all([
        apiService.getAllSettings(),
        apiService.getAllOrders(),
      ]);

      setSettings(settingsData);
      
      // Filter today's orders
      const today = new Date().toDateString();
      const todayOrders = ordersData.filter(order => 
        new Date(order.date).toDateString() === today
      );
      setTodaysOrders(todayOrders);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getOrderTypeColor = (type: string) => {
    return type === 'BUY' ? 'text-green-400' : 'text-red-400';
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
      {/* Greeting */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {getGreeting()}, {user.name}!
        </h2>
        <p className="text-slate-600">
          Client ID: {user.clientcode}
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Order Settings</h3>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-800 font-medium">Live Orders</p>
            <p className="text-sm text-slate-600">
              {settings?.isLiveOrdresAllowed ? 'Orders are enabled' : 'Orders are disabled'}
            </p>
          </div>
          <div className={`w-12 h-6 rounded-full ${
            settings?.isLiveOrdresAllowed ? 'bg-green-500' : 'bg-slate-300'
          } relative transition-colors`}>
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
              settings?.isLiveOrdresAllowed ? 'translate-x-6' : 'translate-x-0.5'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Today's Orders */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="w-6 h-6 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">Today's Orders</h3>
          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-sm">
            {todaysOrders.length}
          </span>
        </div>

        {todaysOrders.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No orders placed today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupOrderPairs(todaysOrders.slice(0, 10)).map((pair, index) => (
              <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                {pair.buy && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getOrderStatusIcon(pair.buy.orderStatus)}
                        <span className="font-semibold text-green-600">BUY</span>
                      </div>
                      <span className="text-sm text-slate-600">
                        {new Date(pair.buy.date).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-800 font-medium">{pair.buy.instrument}</p>
                        <p className="text-sm text-slate-600">
                          {pair.buy.qty} @ ₹{pair.buy.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-800 font-medium">
                          ₹{(pair.buy.price * pair.buy.qty).toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-600">{pair.buy.orderStatus}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {pair.sell ? (
                  <div className={pair.buy ? 'border-t border-slate-200 pt-3' : ''}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getOrderStatusIcon(pair.sell.orderStatus)}
                        <span className="font-semibold text-red-600">SELL</span>
                      </div>
                      <span className="text-sm text-slate-600">
                        {new Date(pair.sell.date).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-800 font-medium">{pair.sell.instrument}</p>
                        <p className="text-sm text-slate-600">
                          {pair.sell.qty} @ ₹{pair.sell.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-800 font-medium">
                          ₹{(pair.sell.price * pair.sell.qty).toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-600">{pair.sell.orderStatus}</p>
                      </div>
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

  function groupOrderPairs(orders: Order[]) {
    const pairs: Array<{ buy?: Order; sell?: Order }> = [];
    const instrumentGroups: { [key: string]: Order[] } = {};
    
    // Group orders by instrument
    orders.forEach(order => {
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
  }
};

export default HomeTab;