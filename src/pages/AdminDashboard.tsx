/**
 * PHASE 3 - ADMIN DASHBOARD
 * 
 * Real-time monitoring dashboard for the ingestion system:
 * - Scraper health status
 * - Queue statistics
 * - Price change tracking
 * - Outlier detection
 * - System alerts
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, XCircle, Clock, 
  Zap, TrendingUp, TrendingDown, RefreshCw, Server,
  Database, BarChart3, Eye, Play, Pause
} from 'lucide-react';
import { getIngestionController } from '../ingestion';
import { useToast } from '../context/ToastContext';

const AdminDashboard: React.FC = () => {
  const { addToast } = useToast();
  const controller = getIngestionController();
  
  const [health, setHealth] = useState(controller.getHealthStatus());
  const [queueStats, setQueueStats] = useState(controller.getQueueStats());
  const [priceChanges, setPriceChanges] = useState(controller.getRecentPriceChanges(20));
  const [outliers, setOutliers] = useState(controller.getOutliers());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshData = () => {
    setIsRefreshing(true);
    setHealth(controller.getHealthStatus());
    setQueueStats(controller.getQueueStats());
    setPriceChanges(controller.getRecentPriceChanges(20));
    setOutliers(controller.getOutliers());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleTriggerScrape = async () => {
    try {
      const result = await controller.triggerScrape(
        'https://jumia.com.ng/product/iphone-15-pro',
        'jumia'
      );
      addToast(`Scrape job queued: ${result.jobId}`, 'success');
      refreshData();
    } catch (error: any) {
      addToast(`Failed to trigger scrape: ${error.message}`, 'error');
    }
  };

  const handleTriggerCategoryScrape = async (category: string) => {
    try {
      const result = await controller.triggerCategoryScrape(category, 'jumia', 5);
      addToast(`Category scrape completed: ${result.productsScraped} products`, 'success');
      refreshData();
    } catch (error: any) {
      addToast(`Failed to scrape category: ${error.message}`, 'error');
    }
  };

  const handleFullSync = async () => {
    try {
      const result = await controller.triggerFullSync('jumia');
      addToast(`Full sync completed for ${result.retailerId}`, 'success');
      refreshData();
    } catch (error: any) {
      addToast(`Full sync failed: ${error.message}`, 'error');
    }
  };

  const getHealthColor = (healthStatus: string) => {
    switch (healthStatus) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'critical': return 'text-red-700 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ingestion System Dashboard</h1>
            <p className="text-sm text-gray-500">Real-time monitoring of scrapers, queues, and data pipeline</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {autoRefresh ? <Activity size={16} className="animate-pulse" /> : <Pause size={16} />}
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Overall Health */}
        <div className={`rounded-xl p-6 mb-6 ${getHealthColor(health.overallHealth)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">System Health</h2>
              <p className="text-3xl font-bold capitalize">{health.overallHealth}</p>
              <p className="text-sm mt-2 opacity-80">
                Last updated: {new Date(health.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl">
                {health.overallHealth === 'healthy' && <CheckCircle className="inline" />}
                {health.overallHealth === 'degraded' && <AlertTriangle className="inline" />}
                {health.overallHealth === 'critical' && <XCircle className="inline" />}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Scrapers</span>
              <Server size={20} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {health.scrapers.filter(s => s.isHealthy).length}/{health.scrapers.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Healthy / Total</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Jobs Waiting</span>
              <Clock size={20} className="text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {queueStats.scrapeQueue.waiting + queueStats.feedQueue.waiting + queueStats.validationQueue.waiting}
            </p>
            <p className="text-xs text-gray-500 mt-1">Across all queues</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Jobs Failed</span>
              <XCircle size={20} className="text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {queueStats.scrapeQueue.totalFailed + queueStats.feedQueue.totalFailed + queueStats.validationQueue.totalFailed}
            </p>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Alerts</span>
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{health.alerts.length}</p>
            <p className="text-xs text-gray-500 mt-1">Unresolved</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={handleTriggerScrape}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Zap size={16} />
              Trigger Scrape
            </button>
            <button
              onClick={() => handleTriggerCategoryScrape('phones')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              <BarChart3 size={16} />
              Scrape Phones
            </button>
            <button
              onClick={() => handleTriggerCategoryScrape('electronics')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Database size={16} />
              Scrape Electronics
            </button>
            <button
              onClick={handleFullSync}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <RefreshCw size={16} />
              Full Sync
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Scraper Health */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Server size={20} className="text-indigo-600" />
              Scraper Health
            </h3>
            <div className="space-y-3">
              {health.scrapers.map((scraper) => (
                <div key={scraper.retailerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${scraper.isHealthy ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{scraper.retailerId}</p>
                      <p className="text-xs text-gray-500">
                        {scraper.totalRequests} requests • {scraper.successRate.toFixed(1)}% success
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {scraper.isBlocked && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">BLOCKED</span>
                    )}
                    {scraper.consecutiveFailures > 0 && (
                      <p className="text-xs text-orange-600">{scraper.consecutiveFailures} failures</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Queue Statistics */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              Queue Statistics
            </h3>
            <div className="space-y-4">
              {Object.entries(queueStats).map(([name, stats]) => (
                <div key={name} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{name}</p>
                    <span className="text-xs text-gray-500">{stats.totalProcessed} processed</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{stats.waiting}</p>
                      <p className="text-xs text-gray-500">Waiting</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{stats.completed}</p>
                      <p className="text-xs text-gray-500">Done</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">{stats.failed}</p>
                      <p className="text-xs text-gray-500">Failed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-yellow-600">{stats.delayed}</p>
                      <p className="text-xs text-gray-500">Delayed</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Price Changes */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-600" />
            Recent Price Changes
          </h3>
          {priceChanges.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No recent price changes</p>
          ) : (
            <div className="space-y-2">
              {priceChanges.slice(0, 10).map((change, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${change.isOutlier ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    {change.percentageChange > 0 ? (
                      <TrendingUp size={16} className="text-green-600" />
                    ) : (
                      <TrendingDown size={16} className="text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">Product: {change.productId}</p>
                      <p className="text-xs text-gray-500">
                        {change.currency}{change.oldPrice.toLocaleString()} → {change.currency}{change.newPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${change.percentageChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {change.percentageChange > 0 ? '+' : ''}{change.percentageChange.toFixed(2)}%
                    </p>
                    {change.isOutlier && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">OUTLIER</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-600" />
            System Alerts ({health.alerts.length})
          </h3>
          {health.alerts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No active alerts</p>
          ) : (
            <div className="space-y-2">
              {health.alerts.slice(0, 10).map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                      {alert.retailerId && ` • ${alert.retailerId}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
