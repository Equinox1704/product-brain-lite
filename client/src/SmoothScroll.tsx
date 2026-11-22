import { useEffect, useState, type ReactNode } from "react";
import { ReactLenis } from "lenis/react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (reducedMotion) return <>{children}</>;

  return (
    <ReactLenis
      root
      autoRaf={true}
      options={{
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.09,
        prevent: (node) => node instanceof HTMLTextAreaElement,
      }}
    >
      {children}
    </ReactLenis>
  );
}
