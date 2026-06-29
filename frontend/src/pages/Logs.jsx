import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, RefreshCw } from 'lucide-react';
import { getLogs } from '../services/api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || log.action === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0b0a08', padding: 24 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}
        >
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: 0 }}>
              Scan <span style={{ color: '#d4a843' }}>Logs</span>
            </h1>
            <p style={{ color: '#ffffff60', marginTop: 4 }}>Complete history of all scanned prompts</p>
          </div>
          <button
            onClick={fetchLogs}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#ffffff08', border: '1px solid #ffffff18',
              color: '#fff', padding: '9px 16px', borderRadius: 12,
              fontSize: 13.5, cursor: 'pointer',
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#ffffff44' }} />
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#ffffff05', border: '1px solid #ffffff18',
                borderRadius: 12, padding: '11px 14px 11px 38px',
                color: '#fff', fontSize: 13.5, outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={15} color="#ffffff44" />
            {['ALL', 'BLOCKED', 'ALLOWED'].map((f) => {
              const active = filter === f;
              const activeColor = f === 'BLOCKED' ? '#e8615f' : f === 'ALLOWED' ? '#4caf7d' : '#d4a843';
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '10px 16px', borderRadius: 12, fontSize: 12.5, fontWeight: 600,
                    border: `1px solid ${active ? activeColor : '#ffffff14'}`,
                    background: active ? `${activeColor}1f` : '#ffffff05',
                    color: active ? activeColor : '#ffffff60',
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}
        >
          {[
            { label: 'Total', value: logs.length, color: '#fff' },
            { label: 'Blocked', value: logs.filter(l => l.action === 'BLOCKED').length, color: '#e8615f' },
            { label: 'Allowed', value: logs.filter(l => l.action === 'ALLOWED').length, color: '#4caf7d' },
            { label: 'Showing', value: filteredLogs.length, color: '#d4a843' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#ffffff05', border: '1px solid #ffffff14', borderRadius: 10, padding: '8px 14px' }}>
              <span style={{ color: '#ffffff55', fontSize: 12.5 }}>{s.label}: </span>
              <span style={{ color: s.color, fontWeight: 700, fontSize: 13.5 }}>{s.value}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: '#ffffff05', border: '1px solid #ffffff12', borderRadius: 18, overflow: 'hidden' }}
        >
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <div style={{
                width: 40, height: 40, border: '4px solid #d4a84340', borderTopColor: '#d4a843',
                borderRadius: '50%', animation: 'spin 1s linear infinite',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <FileText size={44} color="#ffffff20" style={{ marginBottom: 14 }} />
              <p style={{ color: '#ffffff50' }}>No logs found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#ffffff05', borderBottom: '1px solid #ffffff14' }}>
                  <tr style={{ color: '#ffffff55', fontSize: 12.5 }}>
                    <th style={{ textAlign: 'left', padding: '14px 20px' }}>ID</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px' }}>Prompt</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px' }}>Toxicity Score</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px' }}>Action</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px' }}>Reason</th>
                    <th style={{ textAlign: 'left', padding: '14px 20px' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }}
                      style={{ borderBottom: '1px solid #ffffff0a' }}
                    >
                      <td style={{ padding: '14px 20px', color: '#ffffff55', fontSize: 12.5, fontFamily: 'monospace' }}>#{log.id}</td>
                      <td style={{ padding: '14px 20px', color: '#fff', fontSize: 13.5, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.prompt}>
                        {log.prompt}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: '#ffffff14', borderRadius: 999 }}>
                            <div style={{
                              width: `${log.toxicityScore * 100}%`, height: '100%', borderRadius: 999,
                              background: log.toxicityScore >= 0.7 ? '#e8615f' : log.toxicityScore >= 0.4 ? '#d4a843' : '#4caf7d',
                            }} />
                          </div>
                          <span style={{
                            fontSize: 12.5, fontWeight: 600,
                            color: log.toxicityScore >= 0.7 ? '#e8615f' : log.toxicityScore >= 0.4 ? '#d4a843' : '#4caf7d',
                          }}>
                            {(log.toxicityScore * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                          background: log.action === 'BLOCKED' ? '#e8615f1a' : '#4caf7d1a',
                          color: log.action === 'BLOCKED' ? '#f0918f' : '#7fcba3',
                          border: `1px solid ${log.action === 'BLOCKED' ? '#e8615f40' : '#4caf7d40'}`,
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#ffffff55', fontSize: 12.5, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.reason}>
                        {log.reason}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#ffffff55', fontSize: 12.5 }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

export default Logs;