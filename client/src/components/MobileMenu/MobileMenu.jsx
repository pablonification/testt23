import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileMenu.css';
import lingobee from '../../assets/logo-lingobee.png';
import itbLogo from '../../assets/itb-logo-putih.png';

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/homepage' },
    { id: 'assignment', label: 'Assignment', path: '/assignment' },
    { id: 'practice', label: 'Practice', path: '/practice' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose(); 
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <>

      <div 
        className={`mobile-menu-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
      />


      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>

        <div className="mobile-menu-header">
          <img src={lingobee} alt="LingoBee" className="mobile-logo" />
          <button className="mobile-menu-close" onClick={onClose}>
            ✕
          </button>
        </div>


        <p className="mobile-menu-label">Menu</p>

        <nav className="mobile-menu-nav">
          {menuItems.map(item => (
            <button 
              key={item.id}
              className={`mobile-nav-item ${isActivePath(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>


        <div className="mobile-menu-footer">
          <img src={itbLogo} alt="Institut Teknologi Bandung" className="mobile-itb-badge" />
          <p>Institut Teknologi Bandung</p>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;