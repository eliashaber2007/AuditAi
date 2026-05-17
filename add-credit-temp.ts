import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: users, error: userErr } = await supabaseAdmin
    .from('auth.users')
    .select('id')
    .eq('email', 'eliashaber2007@gmail.com')
    .limit(1);

  if (userErr) {
    console.error('Error fetching user:', userErr.message);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.error('User not found: eliashaber2007@gmail.com');
    process.exit(1);
  }

  const userId = users[0].id;
  console.log('Found user_id:', userId);

  const { data: existing } = await supabaseAdmin
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .maybeSingle();

  const currentCredits = existing?.credits ?? 0;
  const newCredits = currentCredits + 1;

  const { error: upsertErr } = await supabaseAdmin
    .from('user_credits')
    .upsert({
      user_id: userId,
      credits: newCredits,
      updated_at: new Date().toISOString()
    });

  if (upsertErr) {
    console.error('Error upserting credit:', upsertErr.message);
    process.exit(1);
  }

  console.log(`Credits updated: ${currentCredits} → ${newCredits}`);
}

main().catch(e => { console.error(e); process.exit(1); });
