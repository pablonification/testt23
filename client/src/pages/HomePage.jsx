import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../components/LeftSidebar';   
import RightSidebar from '../components/RightSidebar'; 
import TopHeader from '../components/TopHeader'; 
import MaterialModal from '../components/MaterialModal';
import { dashboardService } from '../services/dashboardService';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFeatured, setCurrentFeatured] = useState(0);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState({
    chapter: '',
    category: '',
    search: ''
  });
  const [availableFilters, setAvailableFilters] = useState({
    chapters: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('material'); 

 
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        const response = await dashboardService.getFeaturedNews(token);
        
        if (response.success) {
          setFeaturedNews(response.news);
        } else {
          console.error('Failed to fetch featured news:', response.error);
          setFeaturedNews([]);
        }
      } catch (err) {
        console.error('Error fetching featured news:', err);
        setFeaturedNews([]);
      }
    };

    if (token) {
      fetchFeaturedNews();
    }
  }, [token]);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const response = await dashboardService.getMaterials(token, filters);
        
        if (response.success) {
          setMaterials(response.materials);
          setError(null);
        } else {
          console.error('Failed to fetch materials:', response.error);
          setError('Gagal memuat materi');
          setMaterials([]);
        }
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError('Terjadi kesalahan saat memuat materi');
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMaterials();
    } else {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await dashboardService.getMaterialFilters(token);
        
        if (response.success) {
          setAvailableFilters(response.filters);
        }
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };

    if (token) {
      fetchFilters();
    }
  }, [token]);

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const openModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  function nextFeatured() {
    setCurrentFeatured((prev) => (prev + 1) % featuredNews.length);
  }

  function prevFeatured() {
    setCurrentFeatured((prev) => (prev - 1 + featuredNews.length) % featuredNews.length);
  }

  return (
    <div className="home-root">
      <LeftSidebar activePage="dashboard" />

      <main className="main-content">
        <TopHeader />

        <h1 className="page-title">Dashboard</h1>

        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cari Sesuatu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>🔍</button>
        </div>

        {featuredNews.length > 0 ? (
          <div className="featured-carousel">
            <button className="carousel-btn prev" onClick={prevFeatured}>
              ‹
            </button>
            
            <div className="featured-card">
              <div className="featured-image" style={{ 
                backgroundImage: `url(${featuredNews[currentFeatured].image_url})` 
              }}></div>
              <div className="featured-content">
                <h2>{featuredNews[currentFeatured].title}</h2>
                <p>{featuredNews[currentFeatured].description}</p>
                <button 
                  className="read-btn"
                  onClick={() => openModal(featuredNews[currentFeatured], 'news')}
                >
                  Read
                </button>
              </div>
            </div>

            <button className="carousel-btn next" onClick={nextFeatured}>
              ›
            </button>

            <div className="carousel-indicators">
              {featuredNews.map((_, index) => (
                <button 
                  key={index}
                  className={`indicator ${index === currentFeatured ? 'active' : ''}`}
                  onClick={() => setCurrentFeatured(index)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="no-featured">Tidak ada featured news</div>
        )}

        <section className="materi-section">
          <h2>Materi</h2>
          
          <div className="materi-filters">
            <select 
              className="filter-select"
              value={filters.chapter}
              onChange={(e) => handleFilterChange('chapter', e.target.value)}
            >
              <option value="">Semua Bab</option>
              {availableFilters.chapters.map((chapter, idx) => (
                <option key={idx} value={chapter}>{chapter}</option>
              ))}
            </select>
            
            <select 
              className="filter-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">Semua Kategori</option>
              {availableFilters.categories.map((category, idx) => (
                <option key={idx} value={category}>{category}</option>
              ))}
            </select>
            
            <button className="search-btn" onClick={handleSearch}>🔍</button>
          </div>

          {loading ? (
            <div className="loading">Memuat materi...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : materials.length === 0 ? (
            <div className="no-materials">Tidak ada materi yang tersedia</div>
          ) : (
            <div className="materi-grid">
              {materials.map(material => (
                <div 
                  key={material.id} 
                  className="materi-card"
                  onClick={() => openModal(material, 'material')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="materi-image" style={{
                    backgroundImage: material.thumbnail_url ? `url(${material.thumbnail_url})` : 'none'
                  }}></div>
                  <div className="materi-info">
                    <h3>{material.title}</h3>
                    <p className="materi-level">{material.description || material.level}</p>
                    <p className="materi-date">
                      {material.date_published ? new Date(material.date_published).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Tanggal tidak tersedia'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <RightSidebar />

      <MaterialModal 
        isOpen={modalOpen}
        onClose={closeModal}
        item={selectedItem}
        type={modalType}
      />
    </div>
  );
}