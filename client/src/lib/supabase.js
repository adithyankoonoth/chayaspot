import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth
export const signUp = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name: name } }
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Spots — searches name, address, AND description so nearby areas show up
export const getSpots = async ({ search } = {}) => {
  let query = supabase
    .from('spots')
    .select(`*, spot_photos(storage_path, id)`)
    .order('created_at', { ascending: false });

  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(
      `name.ilike.%${term}%,address.ilike.%${term}%,description.ilike.%${term}%`
    );
  }

  const { data, error } = await query;
  return { data, error };
};

export const getSpotById = async (id) => {
  const { data, error } = await supabase
    .from('spots')
    .select(`*, spot_photos(storage_path, id)`)
    .eq('id', id)
    .single();
  return { data, error };
};

export const createSpot = async (spotData) => {
  const { data, error } = await supabase
    .from('spots')
    .insert([spotData])
    .select()
    .single();
  return { data, error };
};

export const updateSpot = async (id, updates) => {
  const { data, error } = await supabase
    .from('spots')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const uploadSpotPhoto = async (spotId, file, index) => {
  const ext = file.name.split('.').pop();
  const path = `${spotId}/${index}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('spot-photos')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return { error: uploadError };
  }

  const { error: dbError } = await supabase
    .from('spot_photos')
    .insert([{ spot_id: spotId, storage_path: path }]);

  if (dbError) {
    console.error('DB insert error:', dbError);
  }

  return { error: dbError };
};

export const getPhotoUrl = (path) => {
  if (!path) return null;
  const { data } = supabase.storage.from('spot-photos').getPublicUrl(path);
  console.log('Photo URL:', data.publicUrl); // temporary debug
  return data.publicUrl;
};
