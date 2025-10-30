import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getEquipoById } from '../services/equipo.service.js';
import { 
    Container, Typography, Box, Paper, Grid, CircularProgress, 
    Button, Link, Fade
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import FileViewerModal from '../components/FileViewerModal';
import React from 'react';
import EngineeringIcon from '@mui/icons-material/Engineering';
import ArticleIcon from '@mui/icons-material/Article';

const DetailItem = ({ label, value }) => (
    <Grid item xs={12} sm={6}>
        <Typography color="text.secondary" variant="body2">{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>{value}</Typography>
    </Grid>
);

const EquipoDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [equipo, setEquipo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [fileToView, setFileToView] = useState({ url: '', title: '' });

    const handleOpenFile = (url, title) => {
        setFileToView({ url, title });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setFileToView({ url: '', title: '' });
    };

    useEffect(() => {
        const fetchEquipo = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getEquipoById(id);
                setEquipo(data);
            } catch (err) {
                console.error("Error al cargar el equipo:", err);
                setError("No se pudo cargar la información del equipo.");
            } finally {
                setLoading(false);
            }
        };
        fetchEquipo();
    }, [id]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress size={60} /></Box>;
    }

    if (error) {
        return <Typography variant="h5" align="center" color="error" sx={{ mt: 4 }}>{error}</Typography>;
    }

    if (!equipo) {
        return <Typography variant="h5" align="center" sx={{ mt: 4 }}>Equipo no encontrado.</Typography>;
    }

    return (
        <Container maxWidth="md">
            <Fade in={!loading} timeout={500}>
                <Paper sx={{ p: { xs: 2, md: 4 }, mt: 4, borderRadius: 3 }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {equipo.nombre}
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
                        {equipo.marca} - {equipo.modelo}
                    </Typography>
                    <Grid container spacing={3}>
                        <DetailItem label="Número de Serie" value={equipo.numeroSerie} />
                        <DetailItem label="ID de Control" value={equipo.idControl} />
                        <DetailItem label="Ubicación Actual" value={equipo.ubicacion} />
                    </Grid>
                </Paper>
            </Fade>

            <Fade in={!loading} timeout={800}>
                <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ArticleIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="h6" component="h2">Manual de Usuario</Typography>
                    </Box>
                    {equipo.urlSeguraPDF ? (
                         <Box>
                            <Typography variant="body1" sx={{mb: 2, color: 'text.secondary' }}>{equipo.descripcionPDF || 'Manual principal del equipo.'}</Typography>
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={() => handleOpenFile(equipo.urlSeguraPDF, `Manual: ${equipo.nombre}`)}
                            >
                                Ver Manual (PDF)
                            </Button>
                         </Box>
                    ) : <Typography>No hay manual disponible para este equipo.</Typography>}
                </Paper>
            </Fade>

            <Fade in={!loading} timeout={1100}>
                <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <EngineeringIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="h6" component="h2">Historial de Mantenimientos</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {user ? "Acceda al historial completo para ver, añadir o editar registros." : "A continuación se muestra un resumen. Inicie sesión para gestionar el historial."}
                    </Typography>
                    <Button component={RouterLink} to={`/equipo/${id}/mantenimientos`} variant="contained" sx={{color: 'white'}}>
                        {user ? 'Gestionar Historial Completo' : 'Ver Historial Completo'}
                    </Button>
                </Paper>
            </Fade>

            <FileViewerModal 
                open={modalOpen} 
                onClose={handleCloseModal} 
                fileUrl={fileToView.url} 
                title={fileToView.title} 
            />
        </Container>
    );
};

export default EquipoDetailPage;