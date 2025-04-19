// app/page.tsx
"use client";

import { useState, useMemo } from "react";
import { gql, useQuery } from "@apollo/client";

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
    }
  }
`;

interface Country {
  code: string;
  name: string;
}

interface CountriesData {
  countries: Country[];
}

export default function HomePage() {
  const [filter, setFilter] = useState("");
  const { loading, error, data } = useQuery<CountriesData>(GET_COUNTRIES);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredCountries = useMemo(() => {
    if (!data?.countries) return [];
    const lowerCaseFilter = filter.toLowerCase();
    if (!lowerCaseFilter) return data.countries;

    return data.countries.filter((country) =>
      country.code.toLowerCase().includes(lowerCaseFilter)
    );
  }, [data, filter]);

  // Determine if we are effectively 'empty' (no data loaded yet, or filter yields no results)
  const isEmpty = !loading && !error && filteredCountries.length === 0;
  // Determine if we have results to show
  const hasResults = !loading && !error && filteredCountries.length > 0;

  return (
    <main className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        Country Explorer
      </h1>

      {/* --- Filter Input --- */}
      <div className="mb-6 max-w-md mx-auto">
        <label htmlFor="countryCodeFilter" className="sr-only">
          Filter by Country Code
        </label>
        <input
          type="text"
          id="countryCodeFilter"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Filter by Country Code (e.g., US, CA)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:placeholder-gray-400"
          aria-describedby="filter-description"
        />
        <p id="filter-description" className="sr-only">Enter a country code like US, CA, or BR to filter the list below.</p>
      </div>

      {/* --- Table Section --- */}
      
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col">
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

          {/* Render table only when we have results */}
          {hasResults && (
            <div className="overflow-x-auto">
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

          {/* Show 'No results' message only when not loading, no error, and filter yields nothing */}
          {isEmpty && (
             <div className="flex items-center justify-center p-10 text-center text-sm text-gray-500 dark:text-gray-400">
               {filter ? `No countries found matching "${filter}".` : "Enter a code to see countries."} {/* Slightly adjusted message */}
             </div>
           )}
        </div>
      </div>
    </main>
  );
}