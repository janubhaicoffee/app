export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/checkout/'],
    },
    sitemap: 'https://janubhaicoffee.com/sitemap.xml',
  };
}
