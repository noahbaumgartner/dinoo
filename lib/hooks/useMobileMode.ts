import { useState, useEffect } from 'react';

const useMobileMode = () => {
  const [mobileMode, setMobileMode] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 800) !mobileMode && setMobileMode(true);
      else mobileMode && setMobileMode(false);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMode]);

  return mobileMode;
};

export default useMobileMode;