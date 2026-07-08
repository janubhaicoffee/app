'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ProcessSection() {
  return (
    <section className="process-section section-padding" id="process">
      <div className="container-premium">
        <motion.div
          className="process-intro"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="heading-luxury">
            FROM FARM
            <br />
            <span className="heading-luxury-accent">TO CUP.</span>
          </h2>
          <p className="body-luxury">
            Every single batch goes through four meticulous steps before it is delivered to your
            doorstep.
          </p>
        </motion.div>

        <motion.div
          className="process-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <motion.div className="process-step" variants={cardVariants}>
            <div className="process-img-container">
              <Image
                src="/handpicked.png"
                alt="Handpicked coffee cherries"
                width={320}
                height={320}
                className="process-img"
              />
            </div>
            <span className="process-num">01</span>
            <h3 className="process-title">Handpicked</h3>
            <p className="process-desc">
              Only the ripest cherries, selected by hand from our Chikmagaluru estate.
            </p>
          </motion.div>

          <motion.div className="process-step" variants={cardVariants}>
            <div className="process-img-container">
              <Image
                src="/sun_dried.png"
                alt="Sun dried coffee beans"
                width={320}
                height={320}
                className="process-img"
              />
            </div>
            <span className="process-num">02</span>
            <h3 className="process-title">Sun Dried</h3>
            <p className="process-desc">
              Naturally sun dried over days to develop rich, deep flavour profiles.
            </p>
          </motion.div>

          <motion.div className="process-step" variants={cardVariants}>
            <div className="process-img-container">
              <Image
                src="/expertly_roasted.png"
                alt="Expertly roasted coffee"
                width={320}
                height={320}
                className="process-img"
              />
            </div>
            <span className="process-num">03</span>
            <h3 className="process-title">Roasted</h3>
            <p className="process-desc">
              Small-batch roasted to perfection. Every batch tasted before it ships.
            </p>
          </motion.div>

          <motion.div className="process-step" variants={cardVariants}>
            <div className="process-img-container">
              <Image
                src="/served_fresh.png"
                alt="Fresh coffee served"
                width={320}
                height={320}
                className="process-img"
              />
            </div>
            <span className="process-num">04</span>
            <h3 className="process-title">Delivered</h3>
            <p className="process-desc">
              Sealed and shipped within days of roasting. Freshness guaranteed.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
