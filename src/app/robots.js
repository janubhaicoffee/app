export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/checkout/', '/admin/', '/api/', '/account/'],
    },
    sitemap: 'https://janubhaicoffee.com/sitemap.xml',
  };
}
