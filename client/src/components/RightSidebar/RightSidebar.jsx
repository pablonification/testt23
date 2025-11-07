import React, { useState, useEffect, useRef } from 'react';
import { useApi } from '../../hooks/useApi';
import { authService } from '../../services/authService';
import { todoService } from '../../services/todoService';
import './RightSidebar.css';

export default function RightSidebar() {
  const dropdownRef = useRef(null);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [newTodo, setNewTodo] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [todos, setTodos] = useState([]);


  const { data: profileData } = useApi(() => authService.getProfile(), []);

  const { data: todosData, loading: isLoadingTodos, refetch: refetchTodos } = useApi(() => todoService.getTodos(), []);

  useEffect(() => {
    if (todosData?.success && todosData.todos) {
      setTodos(todosData.todos);
    }
  }, [todosData]);


  const getUserProfile = () => {
    if (profileData?.success && profileData.user) {
      return {
        name: profileData.user.full_name,
        fakultas: profileData.user.fakultas || 'Institut Teknologi Bandung',
        nim: profileData.user.nim
      };
    }
    
    const localUser = authService.getCurrentUser();
    if (localUser) {
      return {
        name: localUser.full_name,
        fakultas: localUser.fakultas || 'Institut Teknologi Bandung',
        nim: localUser.nim
      };
    }
    
    return {
      name: 'Loading...',
      fakultas: 'Loading...',
      nim: 'Loading...'
    };
  };

  const userProfile = getUserProfile();


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function toggleProfileDropdown() {
    setShowProfileDropdown(!showProfileDropdown);
  }

  async function handleLogout() {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
      try {
        console.log('🚪 Logging out...');
        await authService.logout();
        console.log('✅ Logout successful');
        window.location.href = '/';
      } catch (error) {
        console.error('❌ Logout error:', error);
        window.location.href = '/';
      }
    }
  }

  async function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic update
    setTodos(todos.map(t => 
      t.id === id ? { ...t, checked: !t.checked } : t
    ));

    const response = await todoService.updateTodo(id, { checked: !todo.checked });
    
    if (!response.success) {
      console.error('Failed to toggle todo:', response.error);
      // Revert on error
      setTodos(todos.map(t => 
        t.id === id ? { ...t, checked: todo.checked } : t
      ));
    }
  }

  async function addTodo() {
    if (newTodo.trim() === '') return;
    
    const todoData = {
      text: newTodo.trim(),
      deadline: newDeadline || null
    };

    const response = await todoService.createTodo(todoData);
    
    if (response.success && response.todo) {
      setTodos([...todos, response.todo]);
      setNewTodo('');
      setNewDeadline('');
      console.log('✅ Todo created:', response.todo);
    } else {
      console.error('Failed to create todo:', response.error);
      alert('Failed to create todo. Please try again.');
    }
  }

  async function deleteTodo(id) {
    const originalTodos = [...todos];
    setTodos(todos.filter(todo => todo.id !== id));

    const response = await todoService.deleteTodo(id);
    
    if (!response.success) {
      console.error('Failed to delete todo:', response.error);
      setTodos(originalTodos);
      alert('Failed to delete todo. Please try again.');
    }
  }

  function handleDragStart(e, index) {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === index) return;
    
    const newTodos = [...todos];
    const draggedTodo = newTodos[draggedItem];
    
    newTodos.splice(draggedItem, 1);
    newTodos.splice(index, 0, draggedTodo);
    
    setDraggedItem(index);
    setTodos(newTodos);
  }

  async function handleDragEnd() {
    setDraggedItem(null);
    
    const todosWithPosition = todos.map((todo, index) => ({
      id: todo.id,
      position: index
    }));

    const response = await todoService.reorderTodos(todosWithPosition);
    
    if (!response.success) {
      console.error('Failed to save todo order:', response.error);
    }
  }

  function getDaysInMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    return { firstDay, daysInMonth };
  }

  function changeMonth(offset) {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarDate(newDate);
  }

  function isToday(day) {
    const today = new Date();
    return day === today.getDate() && 
           calendarDate.getMonth() === today.getMonth() && 
           calendarDate.getFullYear() === today.getFullYear();
  }

  const { firstDay, daysInMonth } = getDaysInMonth(calendarDate);
  const monthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const formattedDate = currentTime.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <aside className="right-sidebar">

      <div className="user-profile-card" ref={dropdownRef}>
        <div className="profile-avatar-wrapper" onClick={toggleProfileDropdown}>
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=0063a3&color=fff&size=80`}
            alt="User" 
            className="profile-avatar" 
          />
        </div>
        
        <div className="profile-details">
          <h3>{userProfile.name}</h3>
          <p>{userProfile.fakultas}</p>
          <span className="profile-nim">{userProfile.nim}</span>
        </div>

        {showProfileDropdown && (
          <div className="profile-dropdown">
            <button className="dropdown-item" onClick={handleLogout}>
              <span className="dropdown-icon">🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="datetime-pills">
        <div className="date-pill">{formattedDate}</div>
        <div className="time-pill">{formattedTime}</div>
      </div>

      <div className="calendar-widget">
        <h3>Calendar</h3>
        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>‹</button>
          <span>{monthName}</span>
          <button onClick={() => changeMonth(1)}>›</button>
        </div>
        <div className="calendar-grid">
          {dayNames.map((day, i) => (
            <div key={i} className="calendar-day-name">{day}</div>
          ))}
          
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}
          
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            return (
              <div 
                key={day} 
                className={`calendar-day ${isToday(day) ? 'active' : ''}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="todo-widget">
        <div className="todo-header">
          <h3>To Do List</h3>
        </div>

        <div className="todo-add-form">
          <input 
            type="text"
            placeholder="Task name..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="todo-input"
          />
          <input 
            type="text"
            placeholder="Deadline (optional)..."
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="todo-input-deadline"
          />
          <button onClick={addTodo} className="todo-add-btn">+ Add</button>
        </div>

        <div className="todo-list">
          {isLoadingTodos ? (
            <p className="todo-empty">Loading todos...</p>
          ) : todos.length === 0 ? (
            <p className="todo-empty">Add your to do list!</p>
          ) : (
            todos.map((todo, index) => (
              <div
                key={todo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`todo-item ${todo.checked ? 'checked' : ''} ${draggedItem === index ? 'dragging' : ''}`}
              >
                <div className="todo-drag-handle">⋮⋮</div>
                <input 
                  type="checkbox" 
                  checked={todo.checked}
                  onChange={() => toggleTodo(todo.id)}
                />
                <div className="todo-content">
                  <p className="todo-text">{todo.text}</p>
                  <p className="todo-deadline">{todo.deadline || 'No deadline'}</p>
                </div>
                <button 
                  className="todo-delete-btn"
                  onClick={() => deleteTodo(todo.id)}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}