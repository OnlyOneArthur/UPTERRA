import { motion } from "motion/react";
import Navbar from "./Navbar";

/**
 * PageWrapper — wraps any page that needs the glass Navbar + page-enter animation.
 *
 * Usage:
 *   <PageWrapper>
 *     <YourPageContent />
 *   </PageWrapper>
 */
export default function PageWrapper({ children, hideNav = false }) {
  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 40%, #e0f2f1 100%)",
      }}
    >
      {/* decorative blurred blobs for depth behind glass elements */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-15%",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(47,168,87,0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "-10%",
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(64,196,255,0.14) 0%, transparent 70%)",
            filter: "blur(36px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "30%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(100,221,150,0.12) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      {/* page content slide-up entrance */}
      <motion.main
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="relative z-10"
        style={{ paddingBottom: hideNav ? 0 : 90 }}
      >
        {children}
      </motion.main>

      {!hideNav && <Navbar />}
    </div>
  );
}
