// app/page.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { gql } from '@apollo/client';
import HomePage from './page';

// ... (GET_COUNTRIES, mocksSuccess, mocksError, mocksEmpty sin cambios) ...
const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
    }
  }
`;

const mocksSuccess: MockedResponse[] = [
  {
    request: { query: GET_COUNTRIES },
    result: { data: { countries: [
          { code: 'US', name: 'United States' },
          { code: 'CA', name: 'Canada' },
          { code: 'BR', name: 'Brazil' },
          { code: 'MX', name: 'Mexico' },
    ]}},
  },
];
const mocksError: MockedResponse[] = [ { request: { query: GET_COUNTRIES }, error: new Error('Network Error: Failed to fetch') } ];
const mocksEmpty: MockedResponse[] = [ { request: { query: GET_COUNTRIES }, result: { data: { countries: [] } } } ];


describe('HomePage Component - Pruebas Unitarias/Integración', () => {

  const renderHomePage = (mocks: MockedResponse[] = mocksSuccess) => {
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <HomePage />
      </MockedProvider>
    );
  };

  // ... (pruebas existentes sin cambios: carga, error, renderizado exitoso) ...

  test('debería mostrar el texto "Loading countries..." inicialmente', () => {
      renderHomePage();
      expect(screen.getByText(/Loading countries.../i)).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('debería mostrar un mensaje de error si la carga falla', async () => {
      renderHomePage(mocksError);
      const errorMessage = await screen.findByText(/Error loading data:/i);
      expect(errorMessage).toBeInTheDocument();
      expect(screen.getByText(/Network Error: Failed to fetch/i)).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.queryByText(/Loading countries.../i)).not.toBeInTheDocument();
  });

  test('debería mostrar la tabla con los países después de cargar exitosamente', async () => {
      renderHomePage(mocksSuccess);
      await screen.findByText('United States');
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('CA')).toBeInTheDocument();
      expect(screen.getByText('Brazil')).toBeInTheDocument();
      expect(screen.getByText('MX')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /country name/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /code/i })).toBeInTheDocument();
      expect(screen.queryByText(/Loading countries.../i)).not.toBeInTheDocument();
   });

  test('debería filtrar la tabla al escribir en el input y mostrar/ocultar botón clear', async () => {
    renderHomePage(mocksSuccess);
    await screen.findByText('United States');
    const filterInput = screen.getByPlaceholderText(/Filter by Country Code/i);

    // Verificar que el botón Clear NO está visible inicialmente
    expect(screen.queryByLabelText(/Clear filter/i)).not.toBeInTheDocument();

    // Escribir 'BR'
    fireEvent.change(filterInput, { target: { value: 'BR' } });

    // Verificar filtro y que el botón Clear AHORA SÍ está visible
    expect(await screen.findByText('Brazil')).toBeInTheDocument();
    expect(filterInput).toHaveValue('BR'); // Verificar valor del input
    expect(screen.queryByText('United States')).not.toBeInTheDocument();
    // Usamos getByLabelText aquí porque esperamos que exista
    expect(screen.getByLabelText(/Clear filter/i)).toBeInTheDocument();

    // Borrar el filtro escribiendo vacío
    fireEvent.change(filterInput, { target: { value: '' } });

    // Verificar que todos vuelven y el botón Clear desaparece
    expect(await screen.findByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(filterInput).toHaveValue(''); // Verificar valor del input
    expect(screen.queryByLabelText(/Clear filter/i)).not.toBeInTheDocument();
  });

  // --- NUEVA PRUEBA para el botón Clear ---
  test('debería limpiar el input y mostrar todos los países al hacer clic en el botón Clear', async () => {
    renderHomePage(mocksSuccess);
    await screen.findByText('United States'); // Esperar carga inicial
    const filterInput = screen.getByPlaceholderText(/Filter by Country Code/i);

    // 1. Escribir algo para que aparezca el botón
    fireEvent.change(filterInput, { target: { value: 'CA' } });
    expect(await screen.findByText('Canada')).toBeInTheDocument(); // Esperar filtro aplicado
    expect(filterInput).toHaveValue('CA');
    const clearButton = screen.getByLabelText(/Clear filter/i); // Encontrar el botón ahora que existe
    expect(clearButton).toBeInTheDocument(); // Doble check

    // 2. Hacer clic en el botón Clear
    fireEvent.click(clearButton);

    // 3. Verificar que el input está vacío
    expect(filterInput).toHaveValue('');

    // 4. Verificar que el botón Clear desapareció
    expect(screen.queryByLabelText(/Clear filter/i)).not.toBeInTheDocument();

    // 5. Verificar que todos los países están visibles de nuevo
    expect(await screen.findByText('United States')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('Mexico')).toBeInTheDocument();
  });
  // --- Fin de la nueva prueba ---

  test('debería mostrar mensaje "No countries found" si el filtro no coincide', async () => {
    renderHomePage(mocksSuccess);
    await screen.findByText('United States');
    const filterInput = screen.getByPlaceholderText(/Filter by Country Code/i);
    fireEvent.change(filterInput, { target: { value: 'XYZ' } });
    const noResultsMessage = await screen.findByText(/No countries found matching "XYZ"./i);
    expect(noResultsMessage).toBeInTheDocument();
    // Verificar que el botón Clear está presente cuando no hay resultados pero sí filtro
    expect(screen.getByLabelText(/Clear filter/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('debería mostrar mensaje apropiado si la API devuelve una lista vacía', async () => {
    renderHomePage(mocksEmpty);
    const emptyMessage = await screen.findByText(/Enter a code to see countries./i);
    expect(emptyMessage).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    // Verificar que el botón Clear no aparece si no hay filtro
    expect(screen.queryByLabelText(/Clear filter/i)).not.toBeInTheDocument();
   });

});