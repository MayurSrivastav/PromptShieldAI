import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Activity, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getStats, getLogs } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, [location.key]);

  const fetchData = async () => {
    try {
      const [statsData, logsData] = await Promise.all([
        getStats(),
        getLogs()
      ]);
      setStats(statsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const last7 = logs.slice(0, 7).reverse();
    return last7.map((log, index) => ({
      name: `Scan ${index + 1}`,
      score: (log.toxicityScore * 100).toFixed(0),
    }));
  };

  const getPieData = () => [
    { name: 'Blocked', value: stats?.blockedScans || 0 },
    { name: 'Allowed', value: stats?.allowedScans || 0 },
  ];

  const COLORS = ['#e8615f', '#4caf7d'];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0b0a08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, border: '4px solid #d4a84340', borderTopColor: '#d4a843',
            borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: '#ffffff60' }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Scans', value: stats?.totalScans || 0, icon: Activity, color: '#7fb8e8' },
    { label: 'Blocked', value: stats?.blockedScans || 0, icon: ShieldAlert, color: '#e8615f' },
    { label: 'Allowed', value: stats?.allowedScans || 0, icon: ShieldCheck, color: '#4caf7d' },
    { label: 'Block Rate', value: `${stats?.blockRate || 0}%`, icon: TrendingUp, color: '#d4a843' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0b0a08', padding: 24 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: 0 }}>
            Security <span style={{ color: '#d4a843' }}>Dashboard</span>
          </h1>
          <p style={{ color: '#ffffff60', marginTop: 4 }}>Real-time threat monitoring and analytics</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 28 }}>
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
                style={{
                  border: `1px solid ${card.color}33`,
                  background: `${card.color}0d`,
                  borderRadius: 18, padding: 22,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <span style={{ color: '#ffffff60', fontSize: 13.5 }}>{card.label}</span>
                  <Icon size={20} color={card.color} />
                </div>
                <p style={{ fontSize: 34, fontWeight: 800, color: card.color, margin: 0 }}>{card.value}</p>
              </motion.div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 28 }}>

          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            style={{ background: '#ffffff05', border: '1px solid #ffffff12', borderRadius: 18, padding: 22 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Activity size={17} color="#d4a843" />
              <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: 0 }}>Toxicity Score Trend</h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={getChartData()}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4a843" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#d4a843" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
                <XAxis dataKey="name" stroke="#ffffff55" tick={{ fontSize: 12 }} />
                <YAxis stroke="#ffffff55" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1c1813', border: '1px solid #ffffff20', borderRadius: 8, color: '#fff' }} />
                <Area type="monotone" dataKey="score" stroke="#d4a843" fill="url(#scoreGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            style={{ background: '#ffffff05', border: '1px solid #ffffff12', borderRadius: 18, padding: 22 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <Shield size={17} color="#d4a843" />
              <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: 0 }}>Scan Results</h2>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={getPieData()} cx="50%" cy="50%" innerRadius={56} outerRadius={76} paddingAngle={5} dataKey="value">
                  {getPieData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1c1813', border: '1px solid #ffffff20', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e8615f' }} />
                <span style={{ color: '#ffffff60', fontSize: 12.5 }}>Blocked</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#4caf7d' }} />
                <span style={{ color: '#ffffff60', fontSize: 12.5 }}>Allowed</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ background: '#ffffff05', border: '1px solid #ffffff12', borderRadius: 18, padding: 22 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Clock size={17} color="#d4a843" />
            <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: 0 }}>Recent Scans</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: '#ffffff55', fontSize: 13, borderBottom: '1px solid #ffffff14' }}>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>ID</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Prompt</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Score</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Action</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 5).map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #ffffff0a' }}>
                    <td style={{ padding: '12px 0', color: '#ffffff55', fontSize: 13, fontFamily: 'monospace' }}>#{log.id}</td>
                    <td style={{ padding: '12px 0', color: '#fff', fontSize: 13.5, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.prompt}
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: log.toxicityScore >= 0.7 ? '#e8615f' : log.toxicityScore >= 0.4 ? '#d4a843' : '#4caf7d',
                      }}>
                        {(log.toxicityScore * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 0' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                        background: log.action === 'BLOCKED' ? '#e8615f1a' : '#4caf7d1a',
                        color: log.action === 'BLOCKED' ? '#f0918f' : '#7fcba3',
                        border: `1px solid ${log.action === 'BLOCKED' ? '#e8615f40' : '#4caf7d40'}`,
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 0', color: '#ffffff55', fontSize: 13 }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default Dashboard;