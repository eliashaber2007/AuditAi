import { createClient } from '@supabase/supabase-js';

async function main() {
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // Use auth admin API to list users and find by email
  const { data, error: userErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (userErr) {
    console.error('Error fetching users:', userErr.message);
    process.exit(1);
  }

  const user = data.users.find((u: any) => u.email === 'eliashaber2007@gmail.com');
  if (!user) {
    console.error('User not found: eliashaber2007@gmail.com');
    process.exit(1);
  }

  const userId = user.id;
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
