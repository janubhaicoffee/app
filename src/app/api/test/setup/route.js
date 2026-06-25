import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/supabaseMockDb';
import { createClient } from '@/lib/supabaseWrapper';

export async function POST(request) {
  // Protection: only active in development or test environment
  const isAllowedEnv = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  if (!isAllowedEnv) {
    return NextResponse.json({ error: "Forbidden in production" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, email, points, token } = body;

    const db = readDb();

    if (action === "cleanup") {
      const targetEmail = (email || "testuser@example.com").toLowerCase();
      
      // Find matching profiles
      const profilesToDelete = db.user_profiles.filter(
        p => p.email?.toLowerCase() === targetEmail
      );
      const profileIds = profilesToDelete.map(p => p.id);

      // Delete profiles
      db.user_profiles = db.user_profiles.filter(
        p => p.email?.toLowerCase() !== targetEmail
      );

      // Delete ledger items
      db.points_ledger = db.points_ledger.filter(
        l => !profileIds.includes(l.user_id)
      );

      // Also clean up any orders associated with target email
      db.orders = db.orders.filter(
        o => o.customer_email?.toLowerCase() !== targetEmail
      );

      writeDb(db);
      return NextResponse.json({ success: true, message: `Cleaned up data for ${targetEmail}` });
    }

    if (action === "seed-mystery-drop") {
      // Ensure the token exists
      const targetToken = token || "SECRET-ARABICA-50";
      
      // Remove existing if any
      db.mystery_drops = db.mystery_drops.filter(
        d => d.physical_token?.toUpperCase() !== targetToken.toUpperCase()
      );

      db.mystery_drops.push({
        id: "secret-arabica-50",
        physical_token: targetToken,
        name: "Secret Arabica Gold",
        origin_masked: "Chikmagalur Peak",
        roast_level: "Medium-Dark",
        tasting_notes: "Honey, Milk Chocolate, Jasmine",
        created_at: new Date().toISOString()
      });

      writeDb(db);
      return NextResponse.json({ success: true, message: `Seeded mystery drop ${targetToken}` });
    }

    if (action === "seed-user-progression") {
      const targetEmail = (email || "testuser@example.com").toLowerCase();
      const targetPoints = points !== undefined ? Number(points) : 15;

      // Find or create profile
      let profile = db.user_profiles.find(
        p => p.email?.toLowerCase() === targetEmail
      );

      if (!profile) {
        profile = {
          id: `seeded-user-${Math.floor(Math.random() * 1000000)}`,
          email: targetEmail,
          total_points: targetPoints,
          created_at: new Date().toISOString()
        };
        db.user_profiles.push(profile);
      } else {
        profile.total_points = targetPoints;
      }

      // Add a ledger entry
      db.points_ledger.push({
        id: `ledger-${Math.floor(Math.random() * 1000000)}`,
        user_id: profile.id,
        points_awarded: targetPoints,
        action_type: targetPoints === 15 ? "Welcome Bonus" : "Progression Seeding",
        created_at: new Date().toISOString()
      });

      writeDb(db);
      return NextResponse.json({ success: true, message: `Seeded points progression (${targetPoints}) for ${targetEmail}` });
    }

    if (action === "cleanup-orders") {
      const targetEmail = (email || "testuser@example.com").toLowerCase();
      db.orders = db.orders.filter(
        o => o.customer_email?.toLowerCase() !== targetEmail
      );
      writeDb(db);
      return NextResponse.json({ success: true, message: `Cleaned up orders for ${targetEmail}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Test setup API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
