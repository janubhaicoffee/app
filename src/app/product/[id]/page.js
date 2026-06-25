import { supabase } from "@/lib/supabase";
import ProductClient from "./ProductClient";
import "../product.css";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: product } = await supabase
    .from('products')
    .select('name, description, seo_title, seo_description, image_url, price')
    .eq('id', id)
    .single();

  if (!product) {
    return { title: 'Product Not Found | Janu Bhai Coffee' };
  }

  const title = product.seo_title || `${product.name} | Janu Bhai Coffee`;
  const description = product.seo_description || product.description || `Buy ${product.name} online from Janu Bhai Coffee.`;
  const images = product.image_url ? [product.image_url] : ['/arsalanazad.png'];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    }
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) return <ProductClient initialProduct={null} />;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image_url || "https://janubhaicoffee.com/arsalanazad.png",
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://janubhaicoffee.com/product/${id}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient initialProduct={product} />
    </>
  );
}
