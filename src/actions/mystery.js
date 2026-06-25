"use server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { awardPoints } from "./progression";

// Verifies physical packaging token, retrieves decrypted content, and awards discovery points
export async function verifyMysteryDrop(token, accessToken) {
  if (!token) return { error: "Verification code is required" };

  try {
    // Look up token in mystery_drops using admin client to enforce data masking shield
    const { data: drop, error } = await supabaseAdmin
      .from("mystery_drops")
      .select("*")
      .eq("physical_token", token.trim())
      .single();

    if (error || !drop) {
      return { error: "Cryptographic check failed: Invalid physical packaging token." };
    }

    // Award 50 points to the user for finding the secret drop
    let pointsAwarded = false;
    if (accessToken) {
      const awardRes = await awardPoints(accessToken, 50, `Mystery Discovery: ${drop.name}`);
      if (awardRes.success) {
        pointsAwarded = true;
      }
    }

    return {
      success: true,
      drop: {
        name: drop.name,
        origin: drop.origin_masked,
        roastLevel: drop.roast_level,
        tastingNotes: drop.tasting_notes
      },
      pointsAwarded
    };
  } catch (err) {
    console.error("verifyMysteryDrop error:", err);
    return { error: "Verification routine failed" };
  }
}
