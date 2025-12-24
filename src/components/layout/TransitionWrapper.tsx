"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime"; 
import { useContext, useRef } from "react";

// Helper to disable animation on initial render if needed, 
// or simplified logic: Home (index 0) <-> Notes (index 1)
const getPageIndex = (pathname: string) => {
  if (pathname === "/") return 0;
  if (pathname === "/notes") return 1;
  return 0;
};

// We need to freeze the context to keep the old page alive during exit animation
// This is a known pattern for Next.js App Router w/ AnimatePresence
function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;
  
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {props.children}
    </LayoutRouterContext.Provider>
  );
}

export default function TransitionWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const index = getPageIndex(pathname);
  
  // We need to determine direction based on previous index.
  // Ideally store previous index in ref?
  // Limitation: On server render or hard refresh we lose history.
  // Using simple heuristic:
  // If moving to index 1 (Notes), coming from 0 (Home) -> Slide Left (enter from right)
  // If moving to index 0 (Home), coming from 1 (Notes) -> Slide Right (enter from left)
  
  // To strictly track "previous", we can't easily do it in RSC structure without Context.
  // But since we only have 2 main pages, we can just use the indices logic relative to "Home".
  
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial={{ x: index === 0 ? -300 : 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: index === 0 ? 300 : -300, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full"
      >
         <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
