import { supabase } from "@/lib/supabase";
import ProductClient from "./ProductClient";
import "../product.css";

export async function generateMetadata({ params }) {
  const { id } = params;
  const { data: product } = await supabase
    .from('products')
    .select('name, description, seo_title, seo_description')
    .eq('id', id)
    .single();

  if (!product) {
    return { title: 'Product Not Found | Janu Bhai Coffee' };
  }

  return {
    title: product.seo_title || `${product.name} | Janu Bhai Coffee`,
    description: product.seo_description || product.description || `Buy ${product.name} online from Janu Bhai Coffee.`,
  };
}

export default async function ProductPage({ params }) {
  const { id } = params;
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  return <ProductClient initialProduct={product} />;
}
