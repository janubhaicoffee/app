export const metadata = {
  title: 'Track Your Order | Janu Bhai Coffee',
  description:
    'Track your Janu Bhai Coffee order in real-time. Enter your order ID to see delivery status and estimated arrival.',
  openGraph: {
    title: 'Track Your Order | Janu Bhai Coffee',
    description: 'Track your Janu Bhai Coffee order in real-time.',
    url: 'https://janubhai.com/track',
    images: [{ url: 'https://janubhai.com/arsalanazad.png', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://janubhai.com/track',
  },
};

export default function TrackLayout({ children }) {
  return children;
}
