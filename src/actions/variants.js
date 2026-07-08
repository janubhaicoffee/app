'use server';
import { supabase } from '@/lib/supabase';

export async function getMatchingVariant(productId, sleepDebt, workload) {
  // Calculate intensity: 60% sleep debt + 40% workload
  const calculatedIntensity = Math.round(Number(sleepDebt) * 0.6 + Number(workload) * 0.4);

  // Query variants for the product in Supabase
  const { data: variants, error } = await supabase
    .from('coffee_variants')
    .select('*')
    .eq('product_id', productId);

  if (error) {
    console.error('Error fetching coffee variants:', error);
    return { error: error.message };
  }

  if (!variants || variants.length === 0) {
    return { error: 'No variants found for this product' };
  }

  // Find the variant with the closest intensity
  let closestVariant = variants[0];
  let minDiff = Math.abs(variants[0].intensity - calculatedIntensity);

  for (let i = 1; i < variants.length; i++) {
    const diff = Math.abs(variants[i].intensity - calculatedIntensity);
    if (diff < minDiff) {
      minDiff = diff;
      closestVariant = variants[i];
    }
  }

  return {
    variant: closestVariant,
    calculatedIntensity,
    allVariants: variants,
  };
}

export async function getVariantBySlug(slug) {
  const { data, error } = await supabase
    .from('coffee_variants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching variant by slug:', error);
    return null;
  }
  return data;
}
