// app/page.test.tsx

import React from 'react';
// Funciones de React Testing Library para renderizar e interactuar
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Matchers de Jest-DOM para hacer verificaciones (ej. si algo está en pantalla)
import '@testing-library/jest-dom';
// Herramientas de Apollo para simular datos
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
// Importamos gql para definir la consulta (¡debe ser la misma que usa el componente!)
import { gql } from '@apollo/client';

// ¡Importante! Importa el componente que quieres probar
import HomePage from './page'; // Asegúrate que la ruta sea correcta

// -------------------------------------------------------------------------
// PASO 1: Definir la Consulta GraphQL (EXACTAMENTE igual que en HomePage)
// -------------------------------------------------------------------------
const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
    }
  }
`;

// -------------------------------------------------------------------------
// PASO 2: Preparar los Datos Simulados (Mocks)
// -------------------------------------------------------------------------

// Mock para el caso EXITOSO (cuando la API responde bien)
const mocksSuccess: MockedResponse[] = [
  {
    request: {
      query: GET_COUNTRIES,
      // variables: {} // <-- Añadir si la consulta real usara variables
    },
    result: {
      data: {
        countries: [
          { code: 'US', name: 'United States' },
          { code: 'CA', name: 'Canada' },
          { code: 'BR', name: 'Brazil' },
          { code: 'MX', name: 'Mexico' },
        ],
      },
    },
  },
];

// Mock para el caso de ERROR (cuando la API falla)
const mocksError: MockedResponse[] = [
  {
    request: {
      query: GET_COUNTRIES,
    },
    error: new Error('Network Error: Failed to fetch'), // Simula un error típico
  },
];

// Mock para el caso VACÍO (cuando la API responde pero sin países)
const mocksEmpty: MockedResponse[] = [
 {
    request: {
      query: GET_COUNTRIES,
    },
    result: {
      data: {
        countries: [], // La API responde con un array vacío
      },
    },
  },
];

// -------------------------------------------------------------------------
// PASO 3: Escribir las Pruebas Agrupadas
// -------------------------------------------------------------------------

describe('HomePage Component - Pruebas Unitarias/Integración', () => {

  // --- Helper para no repetir el renderizado con MockedProvider ---
  const renderHomePage = (mocks: MockedResponse[] = mocksSuccess) => {
    // addTypename={false} es importante porque no estamos incluyendo __typename en nuestros mocks
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <HomePage />
      </MockedProvider>
    );
  };

  // --- Prueba 1: Estado de Carga Inicial ---
  test('debería mostrar el texto "Loading countries..." inicialmente', () => {
    // Arrange: Renderizar el componente (usará mocksSuccess por defecto aquí)
    renderHomePage();

    // Act: No se necesita acción, es el estado inicial.

    // Assert: Verificar que el texto de carga esté presente
    expect(screen.getByText(/Loading countries.../i)).toBeInTheDocument();
    // También verificar que la tabla NO esté aún
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  // --- Prueba 2: Estado de Error ---
  test('debería mostrar un mensaje de error si la carga falla', async () => { // async porque esperamos
    // Arrange: Renderizar usando el mock de ERROR
    renderHomePage(mocksError);

    // Act: Esperar a que aparezca el mensaje de error (findBy* espera)
    const errorMessage = await screen.findByText(/Error loading data:/i);

    // Assert: Verificar que el mensaje de error y el detalle están presentes
    expect(errorMessage).toBeInTheDocument();
    expect(screen.getByText(/Network Error: Failed to fetch/i)).toBeInTheDocument(); // El error específico del mock
    // Asegurarse que la tabla NO se muestre
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    // Asegurarse que el estado de carga desapareció
     expect(screen.queryByText(/Loading countries.../i)).not.toBeInTheDocument();
  });

   // --- Prueba 3: Renderizado Exitoso de Datos ---
   test('debería mostrar la tabla con los países después de cargar exitosamente', async () => {
    // Arrange: Renderizar con los mocks exitosos
    renderHomePage(mocksSuccess);

    // Act: Esperar a que aparezca algún dato de la tabla (ej. el primer país)
    await screen.findByText('United States'); // findBy* espera a que Apollo termine y React renderice

    // Assert: Verificar que varios países y códigos de los mocks están en pantalla
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('CA')).toBeInTheDocument(); // Código de Canada
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('MX')).toBeInTheDocument(); // Código de México

    // Verificar que el elemento 'table' existe
    expect(screen.getByRole('table')).toBeInTheDocument();
    // Verificar que los encabezados de columna están
    expect(screen.getByRole('columnheader', { name: /country name/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /code/i })).toBeInTheDocument();

    // Verificar que el mensaje de carga ya no está
    expect(screen.queryByText(/Loading countries.../i)).not.toBeInTheDocument();
   });

   // --- Prueba 4: Funcionalidad de Filtrado ---
   test('debería filtrar la tabla al escribir en el input de filtro', async () => {
     // Arrange: Renderizar con datos exitosos y esperar a que carguen
     renderHomePage(mocksSuccess);
     await screen.findByText('United States'); // Espera a que la tabla esté lista

     // Encontrar el input por su texto placeholder (más robusto que un ID)
     const filterInput = screen.getByPlaceholderText(/Filter by Country Code/i);

     // Act 1: Escribir 'BR' en el input
     fireEvent.change(filterInput, { target: { value: 'BR' } });

     // Assert 1: Solo Brasil debería estar visible
     // Usamos findBy para asegurar que React tuvo tiempo de re-renderizar
     expect(await screen.findByText('Brazil')).toBeInTheDocument();
     expect(screen.getByText('BR')).toBeInTheDocument();
     expect(screen.queryByText('United States')).not.toBeInTheDocument();
     expect(screen.queryByText('Canada')).not.toBeInTheDocument();
     expect(screen.queryByText('Mexico')).not.toBeInTheDocument();

     // Act 2: Borrar el filtro
     fireEvent.change(filterInput, { target: { value: '' } });

     // Assert 2: Todos los países deberían volver a aparecer
     expect(await screen.findByText('United States')).toBeInTheDocument();
     expect(screen.getByText('Canada')).toBeInTheDocument();
     expect(screen.getByText('Brazil')).toBeInTheDocument();
     expect(screen.getByText('Mexico')).toBeInTheDocument();
   });

   // --- Prueba 5: Filtro Sin Resultados ---
   test('debería mostrar mensaje "No countries found" si el filtro no coincide', async () => {
     // Arrange: Renderizar, esperar carga, obtener input
     renderHomePage(mocksSuccess);
     await screen.findByText('United States');
     const filterInput = screen.getByPlaceholderText(/Filter by Country Code/i);

     // Act: Escribir un código que no existe en los mocks
     fireEvent.change(filterInput, { target: { value: 'XYZ' } });

     // Assert: Verificar que aparece el mensaje de "no encontrado"
     // Usar findByText para esperar el mensaje
     const noResultsMessage = await screen.findByText(/No countries found matching "XYZ"./i);
     expect(noResultsMessage).toBeInTheDocument();
     // Asegurarse que la tabla ya NO es visible (o no tiene filas, dependiendo de tu impl.)
     expect(screen.queryByRole('table')).not.toBeInTheDocument(); // O verifica que tbody está vacío
   });

   // --- Prueba 6: Respuesta Vacía de la API ---
   test('debería mostrar mensaje apropiado si la API devuelve una lista vacía', async () => {
    // Arrange: Renderizar usando el mock VACÍO
    renderHomePage(mocksEmpty);

    // Act: Esperar a que aparezca el mensaje para el caso vacío
    // Ajusta el texto exacto según lo que tu componente renderice en este caso
    const emptyMessage = await screen.findByText(/Enter a code to see countries./i);

    // Assert: Verificar que el mensaje está y la tabla no
    expect(emptyMessage).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText(/Loading countries.../i)).not.toBeInTheDocument();
   });

}); // Fin del describe 'HomePage Component'