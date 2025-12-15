'use client'
import { useState, useEffect } from 'react';
import {
  FiTruck,
  FiDollarSign,
  FiClock,
  FiAlertCircle,
  FiTrendingUp,
  FiCalendar,
} from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { dashboardState, RecentOrder, TopRider, Performance } from '@/services/admincontrol';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function RiderAdminDashboard() {
  const [timeFilter, setTimeFilter] = useState('week'); // 'today' | 'week' | 'month' | 'total'
  const [kpis, setKpis] = useState({
    scope: 'week',
    totalRides: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    inProgress: 0,
    totalRevenue: 0,
    completedToday: 0,
  });
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [weekData, setPerformance] = useState([]);
  const [orderLimit, setOrderLimit] = useState(10); // dropdown state
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [err, setErr] = useState('');

  // Load KPIs when filter changes
  useEffect(() => {
    let abort = false;
    async function load() {
      try {
        setLoading(true);
        setErr('');
        const res = await dashboardState(timeFilter);
        const payload = res?.data ?? res;
        const api = payload?.data ?? payload;
        if (!abort) setKpis(api || {});
      } catch (e) {
        if (!abort) setErr('Failed to load dashboard stats');
        console.error(e);
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => { abort = true; };
  }, [timeFilter]);

  // Load Recent Orders when dropdown changes
  useEffect(() => {
    let abort = false;
    async function loadOrders() {
      try {
        setLoadingOrders(true);
        const res = await RecentOrder(orderLimit);
        console.log("resres==========", res?.data?.data)
        const PerformanceData = await Performance();
        setPerformance(PerformanceData?.data)
        console.log("response", PerformanceData?.data)
        // setRiders(resData?.data)
        if (Array.isArray(res?.data?.data)) {
          setOrders(res?.data?.data || []);
        }
      } catch (e) {
        console.error('Failed to fetch recent orders', e);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
    return () => { abort = true; };
  }, [orderLimit]);

  const isToday = timeFilter === 'today';
  const fmtINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  // Build cards from API data
  const stats = [
    { title: 'Total Created Jobs', value: kpis.totalRides, icon: <FiTruck className="h-6 w-6" />, color: 'bg-blue-500' },
    { title: 'Completed Jobs', value: kpis.completed, icon: <FiTruck className="h-6 w-6" />, color: 'bg-green-500' },
    { title: 'Pending Jobs', value: kpis.pending, icon: <FiClock className="h-6 w-6" />, color: 'bg-yellow-500' },
    { title: 'Cancelled Jobs', value: kpis.cancelled, icon: <FiAlertCircle className="h-6 w-6" />, color: 'bg-red-500' },
  ];

  // Jobs Overview Chart Data
  const jobsChartData = {
    labels: weekData.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      
      {
        label: 'Completed Jobs',
        data: weekData?.completed || [8, 12, 6, 10, 9, 14, 11],
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Pending Jobs',
        data: weekData?.pending || [3, 5, 2, 4, 2, 3, 2],
        backgroundColor: 'rgba(255,205,86,0.2)',
        borderColor: 'rgba(255,205,86,1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'InProgress Jobs',
        data: weekData?.progess || [12, 19, 8, 15, 12, 18, 14],
        backgroundColor: 'rgba(54,162,235,0.2)',
        borderColor: 'rgba(54,162,235,1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Cancelled Jobs',
        data: weekData?.cancelled || [1, 2, 0, 1, 1, 1, 1],
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: true,
        text: 'Jobs Overview',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Jobs'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Days'
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jobs Management Dashboard</h1>
        <p className="text-gray-600">Monitor and manage your delivery jobs performance</p>
      </div>

      {/* Time Filter */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="total">Total</option>
          </select>
        </div>

        {loading && <span className="text-sm text-gray-500">Loading…</span>}
        {!loading && err && <span className="text-sm text-red-600">{err}</span>}
      </div>

      {/* Stats */}
      <div className="mb-8">
         
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center">
                      <FiTrendingUp className="mr-1" /> Updated via {timeFilter}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color} text-white`}>{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>
        
      </div>

      {/* Single Jobs Overview Chart */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Jobs Overview</h2>
          <div className="h-80">
            <Line data={jobsChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Most Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Most Recent Created Jobs</h2>

          {/* Dropdown to select limit */}
          <select
            value={orderLimit}
            onChange={(e) => setOrderLimit(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {[10, 20, 30, 40, 50, 100].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-center table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">S.No</th>
                <th className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">Title</th>
                <th className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">Address</th>
                <th className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">Money Offer</th>
                <th className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">Hirer Name</th>
                <th className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">Hirer Phone</th>
                <th className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">Hirer Email</th>
                <th className="px-4 py-3 text-gray-600 font-medium whitespace-nowrap">Date</th>
              </tr>
            </thead>


            <tbody className="divide-y divide-gray-100">
              {loadingOrders ? (
                <tr>
                  <td colSpan="9" className="py-4 text-gray-500 text-center">Loading orders…</td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((order, idx) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 whitespace-nowrap">{idx + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{order?.title || 'N/A'}</td>

                    {/* ✂️ Truncated Address */}
                    <td className="px-4 py-3 max-w-[200px] truncate" title={order?.address || 'Unassigned'}>
                      {order?.address || 'Unassigned'}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">{order?.moneyOffered || 'Unassigned'}</td>

                    {/* 🎨 Status Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                  ${order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                            : order.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : order.status === 'completed'
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">{order?.hirer?.name || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{order?.hirer?.mobile || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{order?.hirer?.email || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-4 text-gray-500 text-center">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}