'use server';
import { createClient } from '@/lib/supabaseWrapper';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function getAuthenticatedUser(accessToken) {
  if (!accessToken) return null;
  const client = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function getUserProgression(accessToken) {
  if (!accessToken) {
    return { error: 'No access token provided' };
  }

  try {
    const user = await getAuthenticatedUser(accessToken);
    if (!user) {
      return { error: 'Invalid session or unauthorized' };
    }

    // Fetch user's real points ledger
    const { data: ledger, error: ledgerError } = await supabaseAdmin
      .from('points_ledger')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ledgerError) {
      console.error('Error loading points ledger:', ledgerError);
    }

    const userLedger = ledger || [];
    const calculatedTotal = userLedger.reduce(
      (sum, item) => sum + (Number(item.points_awarded) || 0),
      0,
    );

    // Upsert user_profiles row for this user to match their real ledger total
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          id: user.id,
          total_points: calculatedTotal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .select('*')
      .single();

    if (profileError) {
      console.error('Failed to sync user profile:', profileError);
    }

    return {
      success: true,
      profile: profile || { id: user.id, total_points: calculatedTotal },
      ledger: userLedger,
      user: {
        email: user.email,
        id: user.id,
      },
    };
  } catch (err) {
    console.error('Progression server action error:', err);
    return { error: 'Internal server error' };
  }
}

export async function awardPoints(accessToken, points, actionType) {
  if (!accessToken) return { error: 'No access token provided' };

  try {
    const user = await getAuthenticatedUser(accessToken);
    if (!user) return { error: 'Unauthorized' };

    const pointsNum = Number(points);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      return { error: 'Invalid points amount' };
    }

    // Check for duplicate one-time achievements
    const oneTimeActions = ['Verify Phone', 'Link Google Account', 'Link Facebook Account', 'Register Passkey', 'Welcome Bonus'];
    if (oneTimeActions.includes(actionType)) {
      const { data: existing } = await supabaseAdmin
        .from('points_ledger')
        .select('id')
        .eq('user_id', user.id)
        .eq('action_type', actionType)
        .maybeSingle();

      if (existing) {
        return { success: true, message: 'Already rewarded', alreadyAwarded: true };
      }
    }

    // Insert new ledger entry
    const { data: ledgerEntry, error: insertError } = await supabaseAdmin
      .from('points_ledger')
      .insert({
        user_id: user.id,
        points_awarded: pointsNum,
        action_type: actionType,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Recalculate total points from ledger
    const { data: ledger } = await supabaseAdmin
      .from('points_ledger')
      .select('points_awarded')
      .eq('user_id', user.id);

    const newTotal = (ledger || []).reduce((sum, item) => sum + (Number(item.points_awarded) || 0), 0);

    // Update user profile
    await supabaseAdmin
      .from('user_profiles')
      .upsert(
        {
          id: user.id,
          total_points: newTotal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

    return { success: true, newPoints: newTotal, ledgerEntry };
  } catch (err) {
    console.error('Error awarding points:', err);
    return { error: err.message };
  }
}
