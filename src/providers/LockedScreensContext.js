import React, { createContext, useState, useCallback } from "react";

export const LockedScreensContext = createContext();

export const LockedScreensProvider = ({ children }) => {
  const [lockedScreens, setLockedScreens] = useState([]); 
  
  const addLockedScreen = useCallback((screen) => {
    setLockedScreens((prev) => {
      const exists = prev.some(
        (s) => s.resourceId === screen.resourceId
      );

      return exists ? prev : [...prev, screen];
    });
  }, []);

  const removeLockedScreen = useCallback((resourceId) => {
    setLockedScreens((prev) =>
      prev.filter((s) => !(s.resourceId === resourceId))
    );
  }, []);

  return (
    <LockedScreensContext.Provider value={{ lockedScreens, addLockedScreen, removeLockedScreen }}>
      {children}
    </LockedScreensContext.Provider>
  );
};
