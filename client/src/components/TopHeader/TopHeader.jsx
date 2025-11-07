import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { authService } from '../../services/authService';
import MobileMenu from '../MobileMenu/MobileMenu'; 
import './TopHeader.css';

export default function TopHeader() {
  const { data: profileData, loading } = useApi(() => authService.getProfile(), []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  function calculateMaxXp(level) {
    return level * 100;
  }

  function getProgressPercentage(xp, maxXp) {
    if (maxXp === 0) return 0;
    return Math.min((xp / maxXp) * 100, 100);
  }


  const getUserProfile = () => {
    if (profileData?.success && profileData.user) {
      return profileData.user;
    }

    const localUser = authService.getCurrentUser();
    return localUser || { streak: 0, level: 1, xp: 0 };
  };

  const user = getUserProfile();
  const maxXp = calculateMaxXp(user.level || 1);
  const progressPercent = getProgressPercentage(user.xp || 0, maxXp);

  return (
    <>
      <header className="top-header">

        <button 
          className="hamburger-btn show-mobile"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>

        <div className="level-info">
          {loading ? (
            <>
              <span className="streak loading">-</span>
              <span className="level loading">Lvl -</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '0%' }}></div>
              </div>
              <span className="xp-text">- XP</span>
            </>
          ) : (
            <>
              <span className="streak">{user.streak || 0} 🔥</span>
              <span className="level">Lvl {user.level || 1}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="xp-text">{user.xp || 0}/{maxXp} XP</span>
            </>
          )}
        </div>
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}