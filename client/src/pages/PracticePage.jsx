import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import LeftSidebar from '../components/LeftSidebar';   
import RightSidebar from '../components/RightSidebar'; 
import { practiceService } from '../services/practiceService';
import { authService } from '../services/authService';
import beeImage from '../assets/bee.png';
import './PracticePage.css';

export default function PracticePage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const { data: sectionsData, loading: loadingSections } = useApi(() => practiceService.getSections(), []);
  const { data: completedData, loading: loadingCompleted } = useApi(() => practiceService.getCompletedNodes(), []);

  const getUserProfile = () => {
    const localUser = authService.getCurrentUser();
    return localUser || { streak: 0, level: 1, xp: 0 };
  };

  const userProfile = getUserProfile();

  useEffect(() => {
    if (sectionsData?.success && sectionsData.sections) {
      setSections(sectionsData.sections);
    }
  }, [sectionsData]);

  useEffect(() => {
    if (completedData?.success && sections.length > 0) {
      const completedNodesArray = completedData.completedNodes || [];
      applyCompletionStatus(completedNodesArray);
    }
  }, [completedData, sections.length]);

  function applyCompletionStatus(completedNodes) {
    setSections(prevSections => {
      const updatedSections = prevSections.map((section, sectionIndex) => {
        const updatedNodes = section.nodes.map((node, nodeIndex) => {
          const nodeKey = `${section.id}-${node.id}`;
          const isCompleted = completedNodes.includes(nodeKey);
          let shouldUnlock = false;
          if (section.id === 1 && nodeIndex === 0) {
            shouldUnlock = true;
          }
          if (nodeIndex > 0) {
            const prevNodeKey = `${section.id}-${section.nodes[nodeIndex - 1].id}`;
            if (completedNodes.includes(prevNodeKey)) {
              shouldUnlock = true;
            }
          }
          if (nodeIndex === 0 && sectionIndex > 0) {
            const prevSection = prevSections[sectionIndex - 1];
            const allPrevCompleted = prevSection.nodes.every(n => {
              const nKey = `${prevSection.id}-${n.id}`;
              return completedNodes.includes(nKey);
            });
            if (allPrevCompleted) {
              shouldUnlock = true;
            }
          }
          return { ...node, completed: isCompleted, unlocked: shouldUnlock };
        });
        return { ...section, nodes: updatedNodes };
      });
      return updatedSections;
    });
  }

  function isSectionCompleted(sectionNodes) {
    return sectionNodes.every(node => node.completed);
  }

  async function handleNodeClick(node, section, sectionIndex) {
    if (sectionIndex > 0) {
      const previousSection = sections[sectionIndex - 1];
      const previousSectionCompleted = isSectionCompleted(previousSection.nodes);
      if (!previousSectionCompleted) {
        alert('🔒 Complete the previous section first!');
        return;
      }
    }
    if (!node.unlocked) {
      alert('🔒 This lesson is locked! Complete previous lessons first.');
      return;
    }
    navigate(`/practice/${section.id}/${node.id}`);
  }

  function getNodeIcon(type, unlocked, completed) {
    if (!unlocked) return '🔒';
    if (completed) return '✅';
    switch (type) {
      case 'star': return '⭐';
      case 'practice': return '🎯';
      case 'lesson': return '🎧';
      case 'book': return '📖';
      case 'trophy': return '🏆';
      case 'chest': return '🎁';
      case 'microphone': return '🎤';
      default: return '⚪';
    }
  }

  function getSectionStatus(sectionIndex) {
    if (sectionIndex === 0) return 'active';
    for (let i = 0; i < sectionIndex; i++) {
      const previousSectionCompleted = isSectionCompleted(sections[i].nodes);
      if (!previousSectionCompleted) return 'locked';
    }
    return 'active';
  }

  const loading = loadingSections || loadingCompleted;

  if (loading) {
    return (
      <div className="practice-root">
        <LeftSidebar activePage="practice" />
        <main className="practice-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #c084fc', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading practice data...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  return (
    <div className="practice-root">
      <LeftSidebar activePage="practice" />
      <main className="practice-content">
        <header className="top-header">
          <div className="level-info">
            <span className="streak">{userProfile?.streak || 0} 🔥</span>
            <span className="level">Lvl {userProfile?.level || 1}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${userProfile ? (userProfile.xp % 100) : 0}%` }}></div>
            </div>
          </div>
        </header>

        <div className="breadcrumb">
          <span onClick={() => navigate('/homepage')} className="breadcrumb-link">Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Practice</span>
        </div>

        <div className="practice-sections">
          {sections.map((section, sectionIndex) => {
            const sectionStatus = getSectionStatus(sectionIndex);
            return (
              <div key={section.id} className={`practice-section ${sectionStatus === 'locked' ? 'section-locked' : ''}`}>
                <div className="section-header" style={{ backgroundColor: section.color }}>
                  <div className="section-info">
                    <span className="section-label">{section.section}</span>
                    <h2 className="section-title">{section.title}{sectionStatus === 'locked' && ' 🔒'}</h2>
                  </div>
                  <button className="section-menu-btn">☰</button>
                </div>

                <div className={`practice-path ${sectionStatus === 'locked' ? 'path-locked' : ''}`}>
                  {sectionIndex === 0 && (
                    <div className="bee-character" style={{ bottom: '12%', left: '8%' }}>
                      <img src={beeImage} alt="Bee Character" className="bee-image" />
                    </div>
                  )}
                  {sectionIndex === 1 && (
                    <div className="bee-character" style={{ bottom: '8%', left: '8%' }}>
                      <img src={beeImage} alt="Bee Character" className="bee-image" />
                    </div>
                  )}
                  {sectionIndex === 2 && (
                    <div className="bee-character" style={{ bottom: '10%', right: '8%' }}>
                      <img src={beeImage} alt="Bee Character" className="bee-image" />
                    </div>
                  )}

                  <svg className="path-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {section.nodes.map((node, index) => {
                      if (index < section.nodes.length - 1) {
                        const current = section.nodes[index];
                        const next = section.nodes[index + 1];
                        const x1 = parseFloat(current.position.left);
                        const y1 = parseFloat(current.position.top);
                        const x2 = parseFloat(next.position.left);
                        const y2 = parseFloat(next.position.top);
                        const controlX = (x1 + x2) / 2;
                        const controlY = (y1 + y2) / 2;
                        return (
                          <path
                            key={`line-${node.id}`}
                            d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                            fill="none"
                            stroke={current.completed ? '#10b981' : current.unlocked ? '#cbd5e1' : '#e5e7eb'}
                            strokeWidth="0.5"
                            strokeDasharray={current.unlocked ? '0' : '2,2'}
                          />
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {section.nodes.map((node) => (
                    <button
                      key={node.id}
                      className={`practice-node ${node.type} ${node.unlocked ? 'unlocked' : 'locked'} ${node.completed ? 'completed' : ''}`}
                      style={{ top: node.position.top, left: node.position.left }}
                      onClick={() => handleNodeClick(node, section, sectionIndex)}
                    >
                      <span className="node-icon">{getNodeIcon(node.type, node.unlocked, node.completed)}</span>
                    </button>
                  ))}

                  {sectionStatus === 'locked' && (
                    <div className="section-lock-overlay">
                      <div className="lock-message">
                        <span className="lock-icon">🔒</span>
                        <p>Complete the previous section to unlock</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <RightSidebar />
    </div>
  );
}
