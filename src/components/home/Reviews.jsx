'use client';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Vikram Malhotra',
    title: 'Coffee Connoisseur',
    rating: 5,
    text: 'Janu Bhai has completely ruined other instant coffees for me. The aroma is indistinguishable from a fresh pour-over. 100% Arabica makes all the difference.',
    initials: 'VM',
  },
  {
    id: 2,
    name: 'Anjali Sen',
    title: 'Daily Brewer',
    rating: 5,
    text: 'Having lived in Bangalore, I missed fresh Chikmagalur filter coffee in Delhi. This freeze-dried blend gives me exactly that rich flavor in under a minute.',
    initials: 'AS',
  },
  {
    id: 3,
    name: 'Kabir Mehta',
    title: 'Tech Entrepreneur',
    rating: 5,
    text: 'Minimal luxury at its best. The packet looks stunning on my kitchen counter, and the coffee itself tastes premium, bold, and incredibly smooth.',
    initials: 'KM',
  },
];

export default function Reviews() {
  return (
    <section className="reviews-section section-padding">
      <div className="container-premium">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="heading-luxury">
            TESTED BY PURISTS.
            <br />
            <span className="heading-luxury-accent">LOVED BY ALL.</span>
          </h2>
          <p className="body-luxury">
            Read what coffee lovers, baristas, and daily brewers say about their Janu Bhai Coffee
            experience.
          </p>
        </motion.div>

        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="review-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
            >
              <span className="quote-icon">“</span>
              <div className="stars">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" stroke="none" />
                ))}
              </div>
              <p className="review-text">{review.text}</p>

              <div className="customer-info">
                <div
                  className="customer-photo-container"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(216, 154, 30, 0.1)',
                    color: 'var(--accent-gold-mustard)',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    border: '1px solid rgba(216, 154, 30, 0.2)',
                  }}
                >
                  {review.initials}
                </div>
                <div>
                  <h4 className="customer-name">{review.name}</h4>
                  <span className="customer-title">{review.title}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
