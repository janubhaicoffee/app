export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/checkout/', '/admin/', '/api/', '/account/'],
    },
    sitemap: 'https://janubhai.com/sitemap.xml',
  };
}
