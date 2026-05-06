"use client";

import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  schema?: object;
}

export const SEO = ({ title, description, keywords, ogImage, schema }: SEOProps) => {
  useEffect(() => {
    document.title = `${title} | Janu Bhai Coffee`;
    
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('description', description);
    if (keywords) updateMeta('keywords', keywords);
    
    // OpenGraph
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:type', 'website', 'property');
    if (ogImage) updateMeta('og:image', ogImage, 'property');
    
    // Schema Markup
    if (schema) {
      let script = document.querySelector('#schema-markup');
      if (!script) {
        script = document.createElement('script');
        script.id = 'schema-markup';
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schema);
    }
  }, [title, description, keywords, ogImage, schema]);

  return null;
};
