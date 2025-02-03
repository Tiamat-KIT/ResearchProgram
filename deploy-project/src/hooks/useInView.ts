import { RefObject, useEffect, useState } from 'react';

export const useInView = (ref: RefObject<HTMLElement>) => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, setInView]);

  return inView;
};

