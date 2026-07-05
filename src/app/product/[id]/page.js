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
      url: `https://janubhai.com/product/${id}`,
      type: 'website',
      siteName: 'Janu Bhai Coffee',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
    alternates: {
      canonical: `https://janubhai.com/product/${id}`,
    },
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


  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.image_url || "https://janubhai.com/arsalanazad.png",
      "description": product.description,
      "brand": {
        "@type": "Brand",
        "name": "Janu Bhai Coffee"
      },
      "sku": product.id,
      "category": product.category || "Coffee",
      "condition": "https://schema.org/NewCondition",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": product.price,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": `https://janubhai.com/product/${id}`,
        "seller": {
          "@type": "Organization",
          "name": "Janu Bhai Coffee"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0",
            "currency": "INR"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "IN"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 2,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 3,
              "maxValue": 5,
              "unitCode": "DAY"
            }
          }
        }
      },
      "aggregateRating": product.rating ? {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.review_count || 1
      } : undefined
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://janubhai.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": product.name,
          "item": `https://janubhai.com/product/${id}`
        }
      ]
    }
  ];

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
