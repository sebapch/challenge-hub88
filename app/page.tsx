// app/page.tsx
"use client";

import { useState, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";

// ... (interfaces y query GET_COUNTRIES permanecen igual) ...
interface Country {
  code: string;
  name: string;
}

interface CountriesData {
  countries: Country[];
}

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
    }
  }
`;


export default function HomePage() {
  const [filter, setFilter] = useState("");
  const { loading, error, data } = useQuery<CountriesData>(GET_COUNTRIES);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  // --- NUEVA FUNCIÓN para limpiar el filtro ---
  const handleClearFilter = () => {
    setFilter("");
  };

  const filteredCountries = useMemo(() => {
    // ... (lógica de filtrado permanece igual) ...
    if (!data?.countries) return [];
    const lowerCaseFilter = filter.toLowerCase();
    if (!lowerCaseFilter) return data.countries;

    return data.countries.filter((country) =>
      country.code.toLowerCase().includes(lowerCaseFilter)
    );
  }, [data, filter]);

  const isEmpty = !loading && !error && filteredCountries.length === 0;
  const hasResults = !loading && !error && filteredCountries.length > 0;

  return (
    <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        Country Explorer
      </h1>

      {/* --- Filter Input Section --- */}
      <div className="mb-6 max-w-md mx-auto">
        {/* --- Añadimos un div relativo para posicionar el botón --- */}
        <div className="relative">
          <label htmlFor="countryCodeFilter" className="sr-only">
            Filter by Country Code
          </label>
          <input
            type="text"
            id="countryCodeFilter"
            value={filter}
            onChange={handleFilterChange}
            placeholder="Filter by Country Code (e.g., US, CA)"
            // --- Añadimos padding derecho (pr-10) para dejar espacio al botón ---
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:placeholder-gray-400"
            aria-describedby="filter-description"
          />
          {/* --- Renderizado condicional del botón Clear --- */}
          {filter && ( // Solo muestra el botón si 'filter' no está vacío
            <button
              onClick={handleClearFilter}
              type="button" // Importante para no enviar formularios si estuviera en uno
              aria-label="Clear filter" // Buena práctica para accesibilidad
              // --- Posicionamiento absoluto y estilo del botón ---
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            >
              {/* Puedes usar un icono SVG de 'X' aquí si prefieres */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p id="filter-description" className="sr-only">Enter a country code like US, CA, or BR to filter the list below.</p>
      </div>

      {/* --- Table Section (sin cambios) --- */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col">
           {/* ... (Loading, Error, Table, Empty states sin cambios) ... */}
            {loading && (
              <div className="flex items-center justify-center p-10 text-gray-500 dark:text-gray-400">
                Loading countries...
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center p-10 text-red-600 dark:text-red-400 text-center">
                Error loading data: <br /> {error.message}
              </div>
            )}
            {hasResults && (
               <div className="overflow-x-auto">
                 {/* ... (table, thead, tbody sin cambios) ... */}
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                    <thead className="bg-gray-50 dark:bg-gray-900/60 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                        <th scope="col" className="w-auto px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Country Name
                        </th>
                        <th scope="col" className="w-1/4 sm:w-1/5 md:w-1/6 lg:w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Code
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCountries.map((country) => (
                        <tr key={country.code} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
                        <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900 dark:text-white break-words">
                            {country.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {country.code}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
               </div>
            )}
            {isEmpty && (
             <div className="flex items-center justify-center p-10 text-center text-sm text-gray-500 dark:text-gray-400">
               {filter ? `No countries found matching "${filter}".` : "Enter a code to see countries."}
             </div>
           )}
        </div>
      </div>
    </main>
  );
}