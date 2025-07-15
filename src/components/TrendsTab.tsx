import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { SuperTrend } from '../types';
import { apiService } from '../services/api';

const TrendsTab: React.FC = () => {
  const [trends, setTrends] = useState<SuperTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      const trendsData = await apiService.getSuperTrend();
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading trends:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrends();
  };

  const getDirectionIcon = (direction: string) => {
    if (direction === 'up') {
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    } else {
      return <TrendingDown className="w-5 h-5 text-red-500" />;
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'up' ? 'text-green-400' : 'text-red-400';
  };

  const getDirectionBg = (direction: string) => {
    return direction === 'up' ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600';
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
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">Super Trend Analysis</h3>
            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-sm">
              {trends.length}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Trends Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {trends.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No trend data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-4 px-6 text-slate-700 font-semibold">Value</th>
                  <th className="text-left py-4 px-6 text-slate-700 font-semibold">Direction</th>
                  <th className="text-left py-4 px-6 text-slate-700 font-semibold">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trends.map((trend, index) => (
                  <tr key={trend._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-slate-800 font-medium text-lg">
                        ₹{trend.superTrendValue.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getDirectionIcon(trend.superTrendDirection)}
                        <span className={`px-2 py-1 rounded border text-xs font-medium capitalize ${
                          trend.superTrendDirection === 'up' 
                            ? 'bg-green-50 border-green-200 text-green-600' 
                            : 'bg-red-50 border-red-200 text-red-600'
                        }`}>
                          {trend.superTrendDirection}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-800">
                        {new Date(trend.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-slate-600 text-sm">
                        {new Date(trend.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h4 className="text-slate-800 font-semibold">Up Trends</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {trends.filter(t => t.superTrendDirection === 'up').length}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingDown className="w-6 h-6 text-red-500" />
            <h4 className="text-slate-800 font-semibold">Down Trends</h4>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {trends.filter(t => t.superTrendDirection === 'down').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendsTab;