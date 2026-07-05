import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import "../../page.css"; // inherit some global styles

function extractFirstImage(content) {
  const match = content?.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!article) return { title: 'Article Not Found' };

  const title = article.meta_title || article.title;
  const description = article.meta_description;
  const imageUrl = extractFirstImage(article.content) || '/arsalanazad.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.created_at,
      authors: ['Janu Bhai Coffee'],
      images: [imageUrl],
      url: `https://janubhai.com/articles/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl]
    },
    alternates: {
      canonical: `https://janubhai.com/articles/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!article || !article.published) {
    notFound();
  }

  const imageUrl = extractFirstImage(article.content) || 'https://janubhai.com/arsalanazad.png';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "image": [imageUrl],
    "datePublished": article.created_at,
    "dateModified": article.updated_at || article.created_at,
    "author": {
      "@type": "Organization",
      "name": "Janu Bhai Coffee",
      "url": "https://janubhai.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Janu Bhai Coffee",
      "logo": {
        "@type": "ImageObject",
        "url": "https://janubhai.com/icon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://janubhai.com/articles/${slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {/* Basic Navigation Bar */}
        <nav style={{ padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', borderBottom: '1px solid var(--border-color)' }}>
          <Link href="/" style={{ color: 'var(--accent-red)', fontWeight: 800, fontSize: '1.5rem', textDecoration: 'none' }}>
            Janu Bhai Coffee.
          </Link>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>&larr; Back to Home</Link>
        </nav>

        {/* Article Content */}
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.2 }}>{article.title}</h1>
          <div style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1rem' }}>
            Published on {new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <article className="markdown-content" style={{ lineHeight: 1.8, fontSize: '1.1rem', color: '#333' }}>
            <ReactMarkdown
              components={{
                img: ({node, ...props}) => <img style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '2rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} {...props} />,
                h2: ({node, ...props}) => <h2 style={{ marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }} {...props} />,
                h3: ({node, ...props}) => <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }} {...props} />,
                p: ({node, ...props}) => <p style={{ marginBottom: '1.5rem' }} {...props} />,
                ul: ({node, ...props}) => <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }} {...props} />,
                ol: ({node, ...props}) => <ol style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }} {...props} />,
                li: ({node, ...props}) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                a: ({node, ...props}) => <a style={{ color: 'var(--accent-red)', textDecoration: 'underline' }} {...props} />,
              }}
            >
              {article.content}
            </ReactMarkdown>
          </article>
        </main>

        <footer style={{ background: '#fff', padding: '3rem 5%', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
          <p>&copy; {new Date().getFullYear()} Janu Bhai Coffee. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
