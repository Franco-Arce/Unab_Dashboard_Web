import React, { createContext, useState, useContext } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
    const [nivel, setNivel] = useState('TODOS');

    return (
        <FilterContext.Provider value={{ nivel, setNivel }}>
            {children}
        </FilterContext.Provider>
    );
}

export const useFilters = () => {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
};
