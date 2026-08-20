import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Clock, Calendar, ArrowLeft, Coffee, Sparkles, ArrowRight, Share2 } from 'lucide-react';
import '../../page.css';

function extractFirstImage(content) {
  const match = content?.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
}

function estimateReadingTime(content) {
  if (!content) return '3 min read';
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: article } = await supabase.from('articles').select('*').eq('slug', slug).single();

  if (!article) return { title: 'Article Not Found | Janu Bhai Coffee' };

  const title = article.meta_title || `${article.title} | Janu Bhai Coffee Journal`;
  const description = article.meta_description || article.summary || 'Read the latest stories, brewing guides, and coffee origins from Janu Bhai Coffee.';
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
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://janubhai.com/articles/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;

  const { data: article } = await supabase.from('articles').select('*').eq('slug', slug).single();

  if (!article || !article.published) {
    notFound();
  }

  const imageUrl = extractFirstImage(article.content) || 'https://janubhai.com/arsalanazad.png';
  const readingTime = estimateReadingTime(article.content);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'image': [imageUrl],
    'datePublished': article.created_at,
    'dateModified': article.updated_at || article.created_at,
    'author': {
      '@type': 'Organization',
      'name': 'Janu Bhai Coffee',
      'url': 'https://janubhai.com',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Janu Bhai Coffee',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://janubhai.com/icon.png',
      },
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://janubhai.com/articles/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        style={{
          minHeight: '100vh',
          background: 'radial-gradient(circle at top center, rgba(58, 36, 31, 0.75) 0%, #2a1a17 75%)',
          padding: '120px 16px 100px',
        }}
      >
        <main style={{ maxWidth: '860px', margin: '0 auto' }}>
          
          {/* Back Navigation */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-gold, #d89a1e)',
              fontSize: '0.88rem',
              fontWeight: 600,
              textDecoration: 'none',
              marginBottom: '1.5rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Janu Bhai Coffee
          </Link>

          {/* Article Master Glass Card */}
          <div
            style={{
              background: 'rgba(58, 36, 31, 0.72)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              padding: '48px 40px',
              borderRadius: '28px',
              boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(245, 240, 234, 0.12)',
            }}
          >
            {/* Meta Pill & Tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(216, 154, 30, 0.15)',
                  border: '1px solid rgba(216, 154, 30, 0.3)',
                  color: 'var(--accent-gold, #d89a1e)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                }}
              >
                <Sparkles size={12} /> Coffee Journal
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #cbb9a8)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {readingTime}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #cbb9a8)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={14} /> {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Article Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
                color: 'var(--text-primary, #f5f0ea)',
                marginBottom: '1.5rem',
                lineHeight: 1.15,
                fontFamily: 'var(--font-playfair), serif',
                letterSpacing: '-0.5px',
              }}
            >
              {article.title}
            </h1>

            <div style={{ height: '1px', background: 'rgba(245, 240, 234, 0.1)', marginBottom: '2rem' }} />

            {/* Markdown Body Content */}
            <article
              className="markdown-content"
              style={{ lineHeight: 1.8, fontSize: '1.05rem', color: 'var(--text-secondary, #cbb9a8)' }}
            >
              <ReactMarkdown
                components={{
                  img: ({ node, ...props }) => (
                    <img
                      style={{
                        maxWidth: '100%',
                        borderRadius: '16px',
                        marginTop: '2rem',
                        marginBottom: '2rem',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(245, 240, 234, 0.1)',
                      }}
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      style={{
                        marginTop: '2.5rem',
                        marginBottom: '1rem',
                        color: 'var(--text-primary, #f5f0ea)',
                        fontFamily: 'var(--font-playfair), serif',
                        fontSize: '1.8rem',
                      }}
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      style={{
                        marginTop: '2rem',
                        marginBottom: '0.8rem',
                        color: 'var(--text-primary, #f5f0ea)',
                        fontFamily: 'var(--font-playfair), serif',
                        fontSize: '1.4rem',
                      }}
                      {...props}
                    />
                  ),
                  p: ({ node, ...props }) => <p style={{ marginBottom: '1.5rem' }} {...props} />,
                  ul: ({ node, ...props }) => (
                    <ul style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }} {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol style={{ paddingLeft: '2rem', marginBottom: '1.5rem' }} {...props} />
                  ),
                  li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                  a: ({ node, ...props }) => (
                    <a
                      style={{ color: 'var(--accent-gold, #d89a1e)', textDecoration: 'none', borderBottom: '1px dashed var(--accent-gold, #d89a1e)' }}
                      {...props}
                    />
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </article>

            {/* Read-along Product Recommendation Box */}
            <div
              style={{
                marginTop: '3rem',
                padding: '24px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(58, 36, 31, 0.9) 0%, rgba(216, 154, 30, 0.12) 100%)',
                border: '1px solid rgba(216, 154, 30, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--text-primary, #f5f0ea)', fontFamily: 'var(--font-playfair)' }}>
                  Brewed for Coffee Aficionados
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary, #cbb9a8)' }}>
                  Taste the single-estate Chikmagalur roast featured in this article.
                </p>
              </div>
              <Link
                href="/product/instantcoffee"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--accent-gold, #d89a1e)',
                  color: '#1a0f0c',
                  padding: '10px 20px',
                  borderRadius: '24px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(216, 154, 30, 0.35)',
                }}
              >
                Order Fresh Jar <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
