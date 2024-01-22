import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for window dimensions
const WindowDimensionsContext = createContext();

export const useWindowDimensions = () => {
  return useContext(WindowDimensionsContext);
};

const WindowDimensionsProvider = ({ children }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 100,
    height: typeof window !== 'undefined' ? window.innerHeight : 100,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window?.innerWidth,
        height: window?.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    // Cleanup: remove the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array means this effect runs once after initial render

  return (
    <WindowDimensionsContext.Provider value={windowDimensions}>
      {children}
    </WindowDimensionsContext.Provider>
  );
};

export default WindowDimensionsProvider;
