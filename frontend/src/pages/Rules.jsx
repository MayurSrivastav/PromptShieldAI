import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Lock, ListFilter, ShieldCheck, Database } from 'lucide-react';
import { getRules, addRule, deleteRule, toggleRule, verifyAdminPassword } from '../services/api';

function Rules() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    keyword: '',
    category: 'VIOLENCE',
    severity: 'HIGH'
  });

  useEffect(() => {
    if (isUnlocked) {
      fetchRules();
    }
  }, [isUnlocked]);

  const handleUnlock = async () => {
    if (!passwordInput.trim()) return;
    setVerifying(true);
    setAuthError('');
    try {
      const result = await verifyAdminPassword(passwordInput);
      if (result.success) {
        setIsUnlocked(true);
      } else {
        setAuthError(result.message || 'Incorrect password.');
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message
        || err.response?.data?.password
        || 'Incorrect password.';
      setAuthError(backendMessage);
    } finally {
      setVerifying(false);
    }
  };

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await getRules();
      setRules(data);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async () => {
    if (!form.keyword.trim()) return;
    setAdding(true);
    try {
      const newRule = await addRule(form, passwordInput);
      setRules([...rules, newRule]);
      setForm({ keyword: '', category: 'VIOLENCE', severity: 'HIGH' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add rule:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRule(id, passwordInput);
      setRules(rules.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await toggleRule(id, passwordInput);
      setRules(rules.map(r => r.id === id ? updated : r));
    } catch (err) {
      console.error('Failed to toggle rule:', err);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'text-red-400 bg-red-900/30 border-red-800';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
      case 'LOW': return 'text-green-400 bg-green-900/30 border-green-800';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'VIOLENCE': return 'text-red-400';
      case 'HATE': return 'text-orange-400';
      case 'SEXUAL': return 'text-pink-400';
      case 'SPAM': return 'text-yellow-400';
      case 'HARASSMENT': return 'text-purple-400';
      case 'SELF_HARM': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  if (!isUnlocked) {

    if (showLoginForm) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0a08',
          padding: 24,
        }}>
          <div style={{
            background: 'linear-gradient(165deg, #1c1813cc, #110f0ccc)',
            backdropFilter: 'blur(24px)',
            border: '1px solid #ffffff14',
            borderRadius: 22,
            padding: 36,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: '#d4a84320',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <Lock size={26} color="#d4a843" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
              Admin access required
            </h2>
            <p style={{ fontSize: 13.5, color: '#ffffff70', margin: '0 0 22px', lineHeight: 1.5 }}>
              Only an admin can view or alter firewall rules. Enter the admin password to continue.
            </p>

            <input
              type="password"
              autoFocus
              value={passwordInput}
              onChange={(e) => {
                if (e.target.value.length <= 10) {
                  setPasswordInput(e.target.value);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Admin password"
              maxLength={10}
              style={{
                width: '100%',
                background: '#00000040',
                border: '1px solid #ffffff18',
                borderRadius: 10,
                padding: '11px 14px',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 6,
              }}
            />
            <p style={{ fontSize: 11.5, color: '#ffffff40', textAlign: 'right', margin: '0 0 12px' }}>
              {passwordInput.length}/10
            </p>

            {authError && (
              <p style={{ color: '#f08785', fontSize: 13, marginBottom: 12 }}>{authError}</p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowLoginForm(false); setPasswordInput(''); setAuthError(''); }}
                style={{
                  flex: 1, border: '1px solid #ffffff18', borderRadius: 10, padding: '11px 0',
                  background: 'transparent', color: '#ffffff80', fontSize: 14, cursor: 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={handleUnlock}
                disabled={verifying || !passwordInput.trim()}
                style={{
                  flex: 1, border: 'none', borderRadius: 10, padding: '11px 0',
                  background: verifying || !passwordInput.trim() ? '#ffffff14' : 'linear-gradient(135deg, #e8c068, #c4953a)',
                  color: verifying || !passwordInput.trim() ? '#ffffff55' : '#251a08',
                  fontWeight: 600, fontSize: 14,
                  cursor: verifying || !passwordInput.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {verifying ? 'Checking…' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh', background: '#0b0a08', color: '#fff', padding: '60px 24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>
              Firewall <span style={{ color: '#d4a843' }}>rules</span>
            </h1>
            <p style={{ color: '#ffffff70', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
              PromptShield's rule engine is the first line of defense. Before a
              prompt is ever sent to the AI model, it's checked against a list
              of banned keywords. A match blocks the prompt instantly, with
              zero AI calls and zero latency cost.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gap: 16, marginBottom: 36 }}>
            {[
              { icon: <ListFilter size={20} />, title: 'Keyword matching', desc: 'Each rule has a keyword, a category (e.g. Violence, Hate Speech), and a severity (High, Medium, Low). If a prompt contains the keyword, it is blocked before reaching the AI model.' },
              { icon: <ShieldCheck size={20} />, title: 'Active / inactive toggle', desc: 'Rules can be turned on or off without deleting them — useful for testing or temporarily relaxing a rule.' },
              { icon: <Database size={20} />, title: 'Stored in PostgreSQL', desc: 'Every rule lives in the rules table and is loaded fresh on each scan, so changes take effect immediately with no redeploy.' },
            ].map((item) => (
              <div key={item.title} style={{
                display: 'flex', gap: 14, padding: 18,
                background: '#ffffff05', border: '1px solid #ffffff10', borderRadius: 14,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: '#d4a84318', color: '#d4a843',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13.5, color: '#ffffff60', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowLoginForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: 'none', borderRadius: 11, padding: '12px 24px',
              background: 'linear-gradient(135deg, #e8c068, #c4953a)',
              color: '#251a08', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            <Lock size={15} />
            Log in as admin to view or edit rules
          </motion.button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">
              Firewall <span className="text-green-400">Rules</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Manage keyword based blocking rules
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-xl transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Add Rule</span>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-900 border border-green-800 rounded-2xl p-6 mb-6"
            >
              <h2 className="text-white font-semibold mb-4 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-green-400" />
                <span>Add New Rule</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Keyword
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. bomb, hack..."
                    value={form.keyword}
                    onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="VIOLENCE">Violence</option>
                    <option value="HATE">Hate Speech</option>
                    <option value="SEXUAL">Sexual</option>
                    <option value="SPAM">Spam</option>
                    <option value="HARASSMENT">Harassment</option>
                    <option value="SELF_HARM">Self Harm</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">
                    Severity
                  </label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 rounded-xl border border-gray-600 text-gray-400 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddRule}
                  disabled={adding || !form.keyword.trim()}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold px-6 py-2 rounded-xl transition-all"
                >
                  {adding ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>{adding ? 'Adding...' : 'Add Rule'}</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-6"
        >
          <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2">
            <span className="text-gray-400 text-sm">Total Rules: </span>
            <span className="text-white font-bold">{rules.length}</span>
          </div>
          <div className="bg-green-900/20 border border-green-800 rounded-xl px-4 py-2">
            <span className="text-gray-400 text-sm">Active: </span>
            <span className="text-green-400 font-bold">
              {rules.filter(r => r.isActive).length}
            </span>
          </div>
          <div className="bg-red-900/20 border border-red-800 rounded-xl px-4 py-2">
            <span className="text-gray-400 text-sm">Inactive: </span>
            <span className="text-red-400 font-bold">
              {rules.filter(r => !r.isActive).length}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-20">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No rules yet. Add your first rule!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left px-6 py-4">ID</th>
                  <th className="text-left px-6 py-4">Keyword</th>
                  <th className="text-left px-6 py-4">Category</th>
                  <th className="text-left px-6 py-4">Severity</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Created</th>
                  <th className="text-left px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {rules.map((rule, index) => (
                    <motion.tr
                      key={rule.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-400 font-mono text-sm">
                        #{rule.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-800 text-white font-mono px-3 py-1 rounded-lg text-sm">
                          {rule.keyword}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${getCategoryColor(rule.category)}`}>
                          {rule.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(rule.severity)}`}>
                          {rule.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rule.isActive
                            ? 'bg-green-900/50 text-green-400 border border-green-800'
                            : 'bg-gray-800 text-gray-500 border border-gray-700'
                        }`}>
                          {rule.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(rule.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleToggle(rule.id)}
                            className="text-gray-400 hover:text-green-400 transition-colors"
                            title="Toggle rule"
                          >
                            {rule.isActive
                              ? <ToggleRight className="w-6 h-6 text-green-400" />
                              : <ToggleLeft className="w-6 h-6 text-gray-500" />
                            }
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(rule.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete rule"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </motion.div>

      </div>
    </div>
  );
}

export default Rules;