import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(` Servidor de autenticación ESM corriendo en http://localhost:${PORT}`);
});