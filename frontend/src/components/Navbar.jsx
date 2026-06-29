import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Settings, Workflow } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Scanner', icon: Shield },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/logs', label: 'Logs', icon: FileText },
    { path: '/rules', label: 'Rules', icon: Settings },
    { path: '/how-it-works', label: 'How it works', icon: Workflow },
  ];

  return (
    <nav style={{
      background: '#0a0e16ee',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #ffffff0f',
      padding: '0 28px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Shield size={22} color="#d4a843" strokeWidth={1.8} />
        <span style={{
          fontFamily: 'Georgia, serif',
          fontSize: 17,
          letterSpacing: 0.2,
          color: '#fff',
        }}>
          Prompt<span style={{ color: '#d4a843', fontStyle: 'italic' }}>Shield</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px', borderRadius: 10,
                background: isActive ? '#d4a84318' : 'transparent',
                color: isActive ? '#d4a843' : '#ffffff70',
                fontSize: 13.5, fontWeight: 500,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}>
                <Icon size={15} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4a843', boxShadow: '0 0 8px #d4a843' }} />
        <span style={{ fontSize: 12.5, color: '#ffffff55' }}>System active</span>
      </div>
    </nav>
  );
}

export default Navbar;