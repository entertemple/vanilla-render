import { motion } from 'motion/react';

const FONT_BODY = "'DM Sans', Arial, sans-serif";
const FONT_SERIF = "'DM Serif Display', Georgia, serif";

export default function LandingHero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-20 pt-[72px] pb-20">
      <motion.div
        className="flex flex-col items-center text-center max-w-[700px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1
          className="text-foreground mb-4"
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
          }}
        >
          Built for clarity
        </h1>

        <p
          className="text-muted-foreground"
          style={{
            fontFamily: FONT_BODY,
            fontSize: 'clamp(16px, 1.5vw, 20px)',
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Unravel with Temple
        </p>
      </motion.div>
    </section>
  );
}
