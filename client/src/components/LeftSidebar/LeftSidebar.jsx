import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LeftSidebar.css';
import lingobee from '../../assets/logo-lingobee.png';
import itbLogo from '../../assets/itb-logo-putih.png';

export default function LeftSidebar({ activePage }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/homepage' },
    { id: 'assignment', label: 'Assignment', path: '/assignment' },
    { id: 'practice', label: 'Practice', path: '/practice' }
  ];

  return (
    <aside className="left-sidebar">
      <div className="sidebar-logo">
        <img src={lingobee} alt="LingoBee" />
      </div>
      
      <p className="menu-label">Menu</p>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button 
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <img src={itbLogo} alt="Institut Teknologi Bandung" className="itb-badge" />
        <p>Institut Teknologi Bandung</p>
      </div>
    </aside>
  );
}