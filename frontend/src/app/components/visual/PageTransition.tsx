/* @visual-only */
import { useLocation, Outlet } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { motionVariants, pageTransition } from "../../../lib/animations";

export function PageTransition() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={motionVariants(pageTransition)}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex-1 flex flex-col min-h-0"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

PageTransition.displayName = "PageTransition";
