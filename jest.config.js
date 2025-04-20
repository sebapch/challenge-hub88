// jest.config.js

module.exports = {
    // ¡Esta es la línea clave!
    testEnvironment: 'jsdom',
  
    // Otras configuraciones que podrías necesitar (añadir si no están):
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Para cargar jest-dom
  
    // Configuración para manejar alias (si usas '@/' en tus imports)
    moduleNameMapper: {
      // Ejemplo: si tienes alias en tsconfig.json como "@/*": ["./src/*"]
      // '^@/(.*)$': '<rootDir>/src/$1', // Ajusta la ruta 'src' si es diferente (ej. './')
      // Asegúrate de mapear los alias que uses en tu proyecto
  
      // Para manejar importaciones de CSS (si las hubiera en tus componentes)
      '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
      '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js' // Mock para otros archivos
    },
  
    // Puedes añadir más configuraciones de Jest aquí si es necesario
  };