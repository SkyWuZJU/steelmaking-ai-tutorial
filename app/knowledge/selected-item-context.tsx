'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the context type
interface SelectedItemContextType {
  itemId: string;
  setItemId: (newItemId: string) => void;
}

// Create the context with a default value
const SelectedItemContext = createContext<SelectedItemContextType | undefined>(undefined);

/**
 * A provider that maintains the item selection state
 * @param children element 
 * @returns 
 */
export const SelectedItemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [itemId, setItemId] = useState<string>(''); // Default value

  return (
    <SelectedItemContext.Provider value={{ itemId: itemId, setItemId: setItemId }}>
      {children}
    </SelectedItemContext.Provider>
  );
};

// Custom hook for accessing the context
export const useSelectedItem = (): SelectedItemContextType => {
  const context = useContext(SelectedItemContext);
  if (!context) {
    throw new Error('useSelectedItem must be used within a SharedValueProvider');
  }
  return context;
};
