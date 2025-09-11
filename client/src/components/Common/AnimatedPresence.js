// src/components/Common/AnimatedWrapper.js
// Helper for simple entrance animations
import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20, // Start slightly below
    },
    in: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeInOut"
        }
    },
    out: {
        opacity: 0,
        y: -20, // Exit slightly above
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

// Wrap individual pages with this for transitions
const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      style={{ width: '100%', height: '100%'}} // Ensure it takes up space
    >
      {children}
    </motion.div>
  );
};

AnimatedPage.propTypes = { children: PropTypes.node };

export default AnimatedPage;