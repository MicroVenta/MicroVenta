const supabaseUrl = 'https://xdzrnwpxnmjwaasxslrg.supabase.co';

const supabaseAnonKey = 'sb_publishable_9ttUHmyCcgam6azjnylZQQ_mvDss2Ba';

const db = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

console.log('MicroVenta conectado con Supabase.');