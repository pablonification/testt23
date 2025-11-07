import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { practiceService } from '../services/practiceService';
import LeftSidebar from '../components/LeftSidebar';   
import RightSidebar from '../components/RightSidebar'; 
import beeImage from '../assets/bee.png';
import './PracticeDetailsPage.css';

export default function PracticeDetailsPage() {
  const navigate = useNavigate();
  const { sectionId, nodeId } = useParams();

  const [hearts, setHearts] = useState(5);
  const { data: questionsData, loading } = useApi(
    () => practiceService.getQuestions(sectionId, nodeId),
    [sectionId, nodeId]
  );

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [draggedWord, setDraggedWord] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (questionsData?.success && questionsData.questions) {
      setQuestions(questionsData.questions);
      if (questionsData.questions.length > 0) {
        setAvailableWords(questionsData.questions[0].words);
      }
    }
  }, [questionsData]);

  if (loading || questions.length === 0) {
    return (
      <div className="practice-details-root">
        <LeftSidebar activePage="practice" />
        <main
          className="practice-details-content"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #c084fc',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px',
              }}
            ></div>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading questions...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  function handleDragStart(e, word, index) {
    setDraggedWord({ word, index, from: 'available' });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  }

  function handleDragEnd(e) {
    e.target.style.opacity = '1';
    setDraggedWord(null);
  }

  function handleSelectedDragStart(e, word, index) {
    setDraggedWord({ word, index, from: 'selected' });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDropOnAnswer(e) {
    e.preventDefault();
    if (!draggedWord) return;
    if (draggedWord.from === 'available') {
      setSelectedWords([...selectedWords, draggedWord.word]);
      setAvailableWords(availableWords.filter((_, i) => i !== draggedWord.index));
    }
  }

  function handleDropOnBank(e) {
    e.preventDefault();
    if (!draggedWord) return;
    if (draggedWord.from === 'selected') {
      setAvailableWords([...availableWords, draggedWord.word]);
      setSelectedWords(selectedWords.filter((_, i) => i !== draggedWord.index));
    }
  }

  function playAudio() {
    if (currentQuestion.audioUrl) {
      const audio = new Audio(currentQuestion.audioUrl);
      audio.play().catch((err) => console.log('Audio playback failed:', err));
    }
  }

  async function handleSubmit() {
    const userAnswer = selectedWords.join(' ');
    const correctAnswer = currentQuestion.correctAnswer.join(' ');

    if (userAnswer === correctAnswer) {
      setIsCorrect(true);
      setShowFeedback(true);
      setTimeout(async () => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedWords([]);
          setAvailableWords(questions[currentQuestionIndex + 1].words);
          setShowFeedback(false);
          setIsCorrect(null);
        } else {
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          try {
            const response = await practiceService.completeNode(
              sectionId,
              nodeId,
              100,
              timeSpent
            );
            if (response.success) {
              const rewards = response.rewards || {};
              alert(
                `🎉 Congratulations! You earned ${
                  rewards.xpEarned || 10
                } XP!\nTotal XP: ${response.user.xp}\nLevel: ${response.user.level}`
              );
            } else {
              alert('Completed! But failed to save progress.');
            }
          } catch (error) {
            console.error('❌ Error completing node:', error);
            alert('Completed! But failed to save progress.');
          }
          navigate('/practice');
        }
      }, 2000);
    } else {
      setIsCorrect(false);
      setShowFeedback(true);
      const newHearts = hearts - 1;
      setHearts(newHearts);
      if (newHearts <= 0) {
        setTimeout(() => {
          alert('😢 No more hearts! Practice ended.');
          navigate('/practice');
        }, 2000);
        return;
      }
      setTimeout(() => {
        setShowFeedback(false);
        setIsCorrect(null);
      }, 2000);
    }
  }

  function handleSkip() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedWords([]);
      setAvailableWords(questions[currentQuestionIndex + 1].words);
      setShowFeedback(false);
      setIsCorrect(null);
    }
  }

  return (
    <div className="practice-details-root">
      <LeftSidebar activePage="practice" />
      <main className="practice-details-content">
        <header className="practice-top-bar">
          <button className="close-btn" onClick={() => navigate('/practice')}>
            ✕
          </button>
          <div className="progress-container">
            <div className="progress-bar-practice">
              <div
                className="progress-fill-practice"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          <div className="hearts-display">
            <span className="heart-icon">❤️</span>
            <span className="hearts-count">{hearts}</span>
          </div>
        </header>
        <div className="breadcrumb-practice">
          <span onClick={() => navigate('/homepage')} className="breadcrumb-link">
            Dashboard
          </span>
          <span className="breadcrumb-separator">›</span>
          <span onClick={() => navigate('/practice')} className="breadcrumb-link">
            Practice
          </span>
        </div>
        <div className="question-container">
          <div className="question-header">
            <h2 className="question-instruction">{currentQuestion.instruction}</h2>
          </div>
          <div className="question-content">
            <div className="bee-speaking">
              <img src={beeImage} alt="Bee Character" className="bee-character-img" />
            </div>
            <div className="speech-bubble">
              <button className="audio-btn" onClick={playAudio}>
                🔊
              </button>
              <div className="sentence-text">
                <p className="sentence-main">{currentQuestion.sentence}</p>
              </div>
            </div>
          </div>
          <div className="answer-area">
            <h3 className="answer-label">Drag words here to translate:</h3>
            <div
              className="selected-words-area"
              onDragOver={handleDragOver}
              onDrop={handleDropOnAnswer}
            >
              {selectedWords.length === 0 ? (
                <div className="empty-placeholder">
                  <div className="drop-line"></div>
                  <div className="drop-line"></div>
                  <div className="drop-line"></div>
                  <p className="drop-hint">Drop words here</p>
                </div>
              ) : (
                selectedWords.map((word, index) => (
                  <div
                    key={`selected-${index}`}
                    className="word-chip selected"
                    draggable
                    onDragStart={(e) => handleSelectedDragStart(e, word, index)}
                    onDragEnd={handleDragEnd}
                  >
                    {word}
                  </div>
                ))
              )}
            </div>
          </div>
          <div
            className="words-bank"
            onDragOver={handleDragOver}
            onDrop={handleDropOnBank}
          >
            {availableWords.map((word, index) => (
              <div
                key={`available-${index}`}
                className="word-chip available"
                draggable
                onDragStart={(e) => handleDragStart(e, word, index)}
                onDragEnd={handleDragEnd}
              >
                {word}
              </div>
            ))}
          </div>
          <div className="action-buttons">
            <button className="skip-btn" onClick={handleSkip}>
              Skip
            </button>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={selectedWords.length === 0}
            >
              Submit
            </button>
          </div>
          {showFeedback && (
            <div
              className={`feedback-banner ${isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="feedback-content">
                {isCorrect ? (
                  <>
                    <span className="feedback-icon">✅</span>
                    <span className="feedback-text">Correct! Great job!</span>
                  </>
                ) : (
                  <>
                    <span className="feedback-icon">❌</span>
                    <span className="feedback-text">
                      Incorrect. Correct answer:{' '}
                      {currentQuestion.correctAnswer.join(' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <RightSidebar />
    </div>
  );
}
