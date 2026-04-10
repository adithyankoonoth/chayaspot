import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSpots } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { geocodePlace, filterSpotsByProximity } from '../lib/nominatim';
import { isOpenNow } from '../lib/utils';
import SpotCard from '../components/SpotCard';
import AddSpotModal from '../components/AddSpotModal';
import AuthModal from '../components/AuthModal';
import styles from './Home.module.css';

const FILTERS = ['All', 'Open now', 'Closed'];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allSpots, setAllSpots] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [searchHint, setSearchHint] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  const debounceRef = useRef(null);

  // Load all spots once
  const loadSpots = useCallback(async () => {
    setLoading(true);
    const { data } = await getSpots();
    setAllSpots(data || []);
    setDisplayed(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadSpots(); }, [loadSpots]);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  // Smart search — text match + OSM location lookup
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim()) {
      setDisplayed(allSpots);
      setSearchHint('');
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setSearchHint('');

      const q = search.trim().toLowerCase();

      // Step 1 — basic text match against name, address, description
      const textMatches = allSpots.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      );

      // Step 2 — try OSM geocoding to find if the query is a place name
      const location = await geocodePlace(search.trim());

      if (location) {
        // Proximity search: spots within 30km of the searched place
        const nearby = filterSpotsByProximity(allSpots, location.lat, location.lng, 30);

        // Merge: proximity results first, then text matches not already included
        const nearbyIds = new Set(nearby.map(s => s.id));
        const extra = textMatches.filter(s => !nearbyIds.has(s.id));
        const merged = [...nearby, ...extra];

        setSearchHint(
          nearby.length > 0
            ? `Showing spots near ${search.trim()} and surrounding areas`
            : `No spots found near ${search.trim()}`
        );
        setDisplayed(merged);
      } else {
        // No geocode result — just use text matches
        setDisplayed(textMatches);
        if (textMatches.length === 0) {
          setSearchHint('No spots found. Try a different name or area.');
        }
      }

      setSearching(false);
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [search, allSpots]);

  // Filter by open/closed on top of search results
  const now = new Date();
  const filtered = displayed.filter(s => {
    if (filter === 'All') return true;
    const open = isOpenNow(s.opens_at, s.closes_at);
    return filter === 'Open now' ? open === true : open === false;
  });

  const handleAddClick = () => {
    if (!user) { setShowAuth(true); return; }
    setShowAdd(true);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroTag}>🫖 Community-powered chai map</div>
          <h1 className={styles.heroTitle}>
            Find your next
            <span className={styles.heroAccent}>cup of chai</span>
          </h1>
          <p className={styles.heroSub}>
            Real spots. Real hours. Directions in one tap.
          </p>

          <div className={styles.searchWrap}>
            {searching ? (
              <div className={styles.searchSpinner} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            )}
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search by name, spot or area..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button className={styles.searchClear} onClick={() => { setSearch(''); setSearchHint(''); }}>✕</button>
            )}
          </div>

          {searchHint && (
            <p className={styles.searchHint}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {searchHint}
            </p>
          )}
        </div>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
      </section>

      {/* Spots */}
      <section className={styles.section}>
        <div className={styles.sectionTop}>
          <div>
            <h2 className={styles.sectionTitle}>
              {search ? `Results for "${search}"` : 'Chai spots near you'}
            </h2>
            <p className={styles.sectionSub}>{filtered.length} spot{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <button className={styles.addBtn} onClick={handleAddClick}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add spot
          </button>
        </div>

        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.grid}>
            {[1,2,3,4,5,6].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>☕</div>
            <h3>No spots found</h3>
            <p>Be the first to add a chai spot here!</p>
            <button className={styles.emptyBtn} onClick={handleAddClick}>Add a spot</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(spot => (
              <SpotCard key={spot.id} spot={spot} userLocation={userLocation} />
            ))}
          </div>
        )}
      </section>

      <button className={styles.fab} onClick={handleAddClick}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Spot
      </button>

      {showAdd && <AddSpotModal onClose={() => setShowAdd(false)} onSuccess={loadSpots} />}
      {showAuth && <AuthModal mode="login" onClose={() => setShowAuth(false)} onSwitch={() => {}} />}
    </div>
  );
}
