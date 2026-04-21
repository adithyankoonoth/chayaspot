import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSpotById, getPhotoUrl } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { isOpenNow, formatTime, openDirections } from '../lib/utils';
import AddSpotModal from '../components/AddSpotModal';
import styles from './SpotDetail.module.css';

export default function SpotDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showEdit, setShowEdit] = useState(false);

  const load = async () => {
    const { data } = await getSpotById(id);
    setSpot(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
    </div>
  );

  if (!spot) return (
    <div className={styles.notFound}>
      <h2>Spot not found</h2>
      <button onClick={() => navigate('/')}>Go home</button>
    </div>
  );

  const open = isOpenNow(spot.opens_at, spot.closes_at);
  const photos = spot.spot_photos?.map(p => getPhotoUrl(p.storage_path)).filter(Boolean) || [];

  return (
    <div className={styles.page}>
      {/* Back */}
      <button className={styles.back} onClick={() => navigate(-1)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back
      </button>

      <div className={styles.layout}>
        {/* Left — photos */}
        <div className={styles.photoSide}>
          <div className={styles.mainPhoto}>
            {photos[activePhoto] ? (
              <img src={photos[activePhoto]} alt={spot.name} className={styles.mainImg} />
            ) : (
              <div className={styles.noPhoto}>☕</div>
            )}
            <span className={`${styles.openBadge} ${open ? styles.open : styles.closed}`}>
              {open ? '● Open now' : '● Closed'}
            </span>
          </div>
          {photos.length > 1 && (
            <div className={styles.thumbs}>
              {photos.map((url, i) => (
                <button key={i} className={`${styles.thumb} ${i === activePhoto ? styles.thumbActive : ''}`} onClick={() => setActivePhoto(i)}>
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — info */}
        <div className={styles.infoSide}>
          <h1 className={styles.name}>{spot.name}</h1>

          {spot.address && (
            <p className={styles.address}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {spot.address}
            </p>
          )}

          <div className={styles.tags}>
            {spot.chai_price && (
              <span className={styles.tag}>₹{spot.chai_price} / chai</span>
            )}
            {spot.opens_at && spot.closes_at && (
              <span className={styles.tag}>
                {formatTime(spot.opens_at)} – {formatTime(spot.closes_at)}
              </span>
            )}
            {spot.phone && (
              <a href={`tel:${spot.phone}`} className={styles.tag}>📞 {spot.phone}</a>
            )}
          </div>

          {spot.description && (
            <p className={styles.description}>{spot.description}</p>
          )}

          <div className={styles.actions}>
            {spot.latitude && spot.longitude && (
              <button
                className={styles.dirBtn}
                onClick={() => openDirections(spot.latitude, spot.longitude, spot.name)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                Get directions
              </button>
            )}
            {user && spot.created_by === user.id && (
                <button className={styles.editBtn} onClick={() => setShowEdit(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit spot
              </button>
            )}
          </div>

          <div className={styles.meta}>
            <p className={styles.metaText}>Added by a community editor</p>
          </div>
        </div>
      </div>

      {showEdit && (
        <AddSpotModal
          initialData={spot}
          onClose={() => setShowEdit(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
