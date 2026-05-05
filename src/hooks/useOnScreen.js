import { useState, useEffect, useRef } from "react";

export const useOnScreen = (ref) => {
  const [isOnScreen, setOnScreen] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: [0.25, 0.5, 0.75] },
    );

    const el = ref.current;
    if (el) observerRef.current.observe(el);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [ref]);

  return isOnScreen;
};
