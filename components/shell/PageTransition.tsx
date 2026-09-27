'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Re-triggers the fade-in animation on route change WITHOUT remounting the
// subtree. Using `key={pathname}` here used to force a full unmount/remount
// exactly when AppShell also swaps between "no shell" and "sidebar+topbar"
// layouts (e.g. right after login) — two structural DOM changes landing in
// the same commit is what caused the "insertBefore: not a child of this
// node" crash. Toggling a CSS class avoids remounting entirely.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const node = ref.current;
    if (!node) return;
    node.classList.remove('page-transition');
    // Force a reflow so the browser registers the class removal before we
    // re-add it, otherwise the animation won't replay.
    void node.offsetWidth;
    node.classList.add('page-transition');
  }, [pathname]);

  return (
    <div ref={ref} className="page-transition">
      {children}
    </div>
  );
}
