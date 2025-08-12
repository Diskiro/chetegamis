'use client';

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-pizza-red text-white py-6 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Logo placeholder - se definirá después */}
          <div className="w-16 h-16 bg-pizza-yellow rounded-full flex items-center justify-center">
            <span className="text-pizza-dark text-2xl font-bold">🍕</span>
          </div>
          
          {/* Nombre de la pizzería */}
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider">
            CHETEGAMIS
          </h1>
        </div>
        
        {/* Subtítulo opcional */}
        <p className="text-center mt-2 text-pizza-light text-lg">
          La mejor pizza de la ciudad
        </p>
      </div>
    </header>
  );
};

export default Header; 