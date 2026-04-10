import { useState } from 'react';
import { createSpot, uploadSpotPhoto } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { parseGoogleMapsUrl } from '../lib/utils';
import toast from 'react-hot-toast';
import styles from './AddSpotModal.module.css';

const MAX_PHOTOS = 3;
const MAX_SIZE_MB = 2;

export default function AddSpotModal({ onClose, onSuccess, initialData }) {
  const { user } = useAuth();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([null, null, null]);
  const [form, setForm] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    maps_link: '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
    opens_at: initialData?.opens_at || '06:00',
    closes_at: initialData?.closes_at || '22:00',
    chai_price: initialData?.chai_price || '',
    phone: initialData?.phone || '',
    description: initialData?.description || '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleMapsLink = (url) => {
    set('maps_link', url);
    const coords = parseGoogleMapsUrl(url);
    if (coords) {
      set('latitude', coords.lat);
      set('longitude', coords.lng);
      toast.success('Location extracted!');
    }
  };

  const handlePhoto = (idx, file) => {
    if (!file) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Photo must be under ${MAX_SIZE_MB}MB`);
      return;
    }
    const updated = [...photos];
    updated[idx] = file;
    setPhotos(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please sign in first'); return; }
    setLoading(true);

    const payload = {
      name: form.name,
      address: form.address,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      opens_at: form.opens_at || null,
      closes_at: form.closes_at || null,
      chai_price: form.chai_price ? parseFloat(form.chai_price) : null,
      phone: form.phone || null,
      description: form.description || null,
      created_by: user.id,
    };

    const { data: spot, error } = await createSpot(payload);
    if (error) { toast.error(error.message); setLoading(false); return; }

    const photoUploads = photos
      .filter(Boolean)
      .map((file, i) => uploadSpotPhoto(spot.id, file, i));
    await Promise.all(photoUploads);

    toast.success(isEdit ? 'Spot updated!' : 'Spot added! 🎉');
    setLoading(false);
    onSuccess?.();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.sheetHeader}>
          <div>
            <h2 className={styles.title}>{isEdit ? 'Edit Spot' : 'Add a Chai Spot'}</h2>
            <p className={styles.sub}>Help the community find great chai</p>
          </div>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic info</h3>
            <div className={styles.field}>
              <label className={styles.label}>Spot name *</label>
              <input className={styles.input} type="text" placeholder="e.g. Basheer's Kadal Chaya" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Chai price (₹)</label>
                <input className={styles.input} type="number" placeholder="8" min="0" value={form.chai_price} onChange={e => set('chai_price', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Contact number</label>
                <input className={styles.input} type="tel" placeholder="+91 98..." value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Opens at</label>
                <input className={styles.input} type="time" value={form.opens_at} onChange={e => set('opens_at', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Closes at</label>
                <input className={styles.input} type="time" value={form.closes_at} onChange={e => set('closes_at', e.target.value)} />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.field}>
              <label className={styles.label}>Address</label>
              <input className={styles.input} type="text" placeholder="Beach Road, Kozhikode" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Google Maps link</label>
              <input className={styles.input} type="url" placeholder="Paste Maps link to auto-detect location" value={form.maps_link} onChange={e => handleMapsLink(e.target.value)} />
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Latitude</label>
                <input className={styles.input} type="number" step="any" placeholder="11.2588" value={form.latitude} onChange={e => set('latitude', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Longitude</label>
                <input className={styles.input} type="number" step="any" placeholder="75.7804" value={form.longitude} onChange={e => set('longitude', e.target.value)} />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Photos <span className={styles.hint}>(max 3, under 2MB each)</span></h3>
            <div className={styles.photoGrid}>
              {[0, 1, 2].map(i => (
                <label key={i} className={styles.photoSlot}>
                  {photos[i] ? (
                    <img src={URL.createObjectURL(photos[i])} alt="" className={styles.photoPreview} />
                  ) : (
                    <div className={styles.photoEmpty}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Photo {i + 1}</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className={styles.fileInput} onChange={e => handlePhoto(i, e.target.files[0])} />
                </label>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Description <span className={styles.hint}>(optional)</span></h3>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              rows={3}
              placeholder="e.g. Chill spot near the beach, perfect for evenings. Great view and local vibe."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </section>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save changes' : '+ Submit spot'}
          </button>
        </form>
      </div>
    </div>
  );
}
