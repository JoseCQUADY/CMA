import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Esto asegura que el servidor de Vite escuche en todas las interfaces de red
    // dentro del contenedor, reemplazando la necesidad del flag --host.
    host: true,

    // Esta sección es crucial para que el Hot-Reloading (HMR) funcione detrás de un proxy.
    hmr: {
      clientPort: 443, // Asume que accedes a tu dominio por HTTPS (puerto 443)
    },
    
    // Esta sección mejora la detección de cambios de archivos dentro de Docker.
    watch: {
      usePolling: true,
    },

    // --- ¡AQUÍ ESTÁ LA SOLUCIÓN AL ERROR! ---
    // Añadimos tu dominio a la lista de hosts permitidos.
    allowedHosts: [
      'jcqprobots.duckdns.org'
    ],
  }
});
