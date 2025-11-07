import React from 'react';
import styles from './MaterialModal.module.css';

export default function MaterialModal({ isOpen, onClose, item, type }) {
  if (!isOpen || !item) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <button className={styles.modalCloseBtn} onClick={onClose}>
          ✕
        </button>

        <div className={styles.modalContent}>
          {(item.image_url || item.thumbnail_url) && (
            <div
              className={styles.modalCoverImage}
              style={{
                backgroundImage: `url(${item.image_url || item.thumbnail_url})`,
              }}
            />
          )}
          <div className={styles.modalHeader}>
            <h1 className={styles.modalTitle}>{item.title}</h1>

            {type === 'material' && (
              <div className={styles.modalMeta}>
                {item.level && (
                  <span className={`${styles.badge} ${styles.badgeLevel}`}>
                    {item.level}
                  </span>
                )}
                {item.category && (
                  <span className={`${styles.badge} ${styles.badgeCategory}`}>
                    {item.category}
                  </span>
                )}
                {item.chapter && (
                  <span className={`${styles.badge} ${styles.badgeChapter}`}>
                    {item.chapter}
                  </span>
                )}
              </div>
            )}

            {item.date_published && (
              <p className={styles.modalDate}>
                {new Date(item.date_published).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>

          {item.description && (
            <div className={styles.modalDescription}>
              <p>{item.description}</p>
            </div>
          )}
          {item.content && (
            <div className={styles.modalBody}>
              <div className={styles.modalTextContent}>{item.content}</div>
            </div>
          )}


          {item.content_url && (
            <div className={styles.modalFooter}>
              <a
                href={item.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnOpenContent}
              >
                Buka Materi Lengkap
              </a>
            </div>
          )}


          {item.link_url && item.link_url !== '#' && (
            <div className={styles.modalFooter}>
              <a
                href={item.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnOpenContent}
              >
                Baca Selengkapnya
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}