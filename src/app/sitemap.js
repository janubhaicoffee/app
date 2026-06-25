import { getProductCatalog } from "@/lib/products";
import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://janubhai.com';
  
  const products = await getProductCatalog();
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(product.created_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const { data: articles } = await supabase.from('articles').select('slug, created_at').eq('published', true);
  
  const articleUrls = (articles || []).map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.created_at || new Date()),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...productUrls,
    ...articleUrls,
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/process`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    }
  ];
}
