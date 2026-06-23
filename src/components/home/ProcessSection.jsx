"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function ProcessSection() {
  return (
    <section className="process-section" id="process">
      <div className="container">
        <motion.div 
          className="section-intro"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-heading">From Farm to Cup</h2>
          <p className="section-desc">
            Every batch goes through four careful steps before it reaches you.
          </p>
        </motion.div>

        <motion.div 
          className="process-row"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div className="process-card" variants={cardVariants}>
            <div className="process-card-img-wrap">
              <Image src="/handpicked.png" alt="Handpicked coffee cherries" width={300} height={300} className="process-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="process-card-content">
              <span className="process-card-num">01</span>
              <h3>Handpicked</h3>
              <p>Only the ripest cherries, selected by hand from our Chikmagaluru estate.</p>
            </div>
          </motion.div>

          <motion.div className="process-card" variants={cardVariants}>
            <div className="process-card-img-wrap">
              <Image src="/sun_dried.png" alt="Sun dried coffee beans" width={300} height={300} className="process-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="process-card-content">
              <span className="process-card-num">02</span>
              <h3>Sun Dried</h3>
              <p>Naturally sun dried over days to develop rich, deep flavour profiles.</p>
            </div>
          </motion.div>

          <motion.div className="process-card" variants={cardVariants}>
            <div className="process-card-img-wrap">
              <Image src="/expertly_roasted.png" alt="Expertly roasted coffee" width={300} height={300} className="process-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="process-card-content">
              <span className="process-card-num">03</span>
              <h3>Roasted</h3>
              <p>Small-batch roasted to perfection. Every batch tasted before it ships.</p>
            </div>
          </motion.div>

          <motion.div className="process-card" variants={cardVariants}>
            <div className="process-card-img-wrap">
              <Image src="/served_fresh.png" alt="Fresh coffee served" width={300} height={300} className="process-card-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="process-card-content">
              <span className="process-card-num">04</span>
              <h3>Delivered Fresh</h3>
              <p>Sealed and shipped within days of roasting. Freshness guaranteed.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
