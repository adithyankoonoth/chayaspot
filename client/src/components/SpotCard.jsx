import { useNavigate } from 'react-router-dom';
import { isOpenNow, formatTime, openDirections, formatDistance } from '../lib/utils';
import { getPhotoUrl } from '../lib/supabase';
import styles from './SpotCard.module.css';

export default function SpotCard({ spot, userLocation }) {
  const navigate = useNavigate();
  const open = isOpenNow(spot.opens_at, spot.closes_at);
  const photoUrl = spot.spot_photos?.[0]?.storage_path
    ? getPhotoUrl(spot.spot_photos[0].storage_path)
    : null;

  const handleDirections = (e) => {
    e.stopPropagation();
    if (spot.latitude && spot.longitude) {
      openDirections(spot.latitude, spot.longitude, spot.name);
    }
  };

  return (
    <div className={styles.card} onClick={() => navigate(`/spot/${spot.id}`)}>
      <div className={styles.imgWrap}>
        {photoUrl ? (
          <img src={photoUrl} alt={spot.name} className={styles.img} />
        ) : (
          <div className={styles.imgPlaceholder}>
            <span>☕</span>
          </div>
        )}
        <span className={`${styles.badge} ${open === true ? styles.open : open === false ? styles.closed : styles.unknown}`}>
          {open === true ? '● Open' : open === false ? '● Closed' : '? Unknown'}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <h3 className={styles.name}>{spot.name}</h3>
          {spot.chai_price && (
            <span className={styles.price}>₹{spot.chai_price}</span>
          )}
        </div>

        <p className={styles.address}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {spot.address || 'Location not specified'}
        </p>

        <div className={styles.meta}>
          {spot.opens_at && spot.closes_at && (
            <span className={styles.hours}>
              {formatTime(spot.opens_at)} – {formatTime(spot.closes_at)}
            </span>
          )}
        </div>

        {spot.description && (
          <p className={styles.desc}>{spot.description}</p>
        )}

        <button className={styles.dirBtn} onClick={handleDirections}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Directions
        </button>
      </div>
    </div>
  );
}
