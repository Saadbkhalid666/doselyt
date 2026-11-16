import { useEffect, useState } from 'react';

// Demo only: shows skeletons briefly on mount. Replace with your real loading flag.
export default function useSimulatedLoad(ms = 500) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
