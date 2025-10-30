import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getMantenimientoById } from '../services/mantenimiento.service.js';
import { 
    Container, Typography, Box, Paper,CircularProgress, 
    Button, Link, Chip, Fade, Divider, Grid, Avatar
} from '@mui/material';
import FileViewerModal from '../components/FileViewerModal';
import React from 'react';
import BuildIcon from '@mui/icons-material/Build';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import DevicesIcon from '@mui/icons-material/Devices';
import NotesIcon from '@mui/icons-material/Notes';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import AttachmentIcon from '@mui/icons-material/Attachment';

const DetailItem = ({ icon, label, children }) => (
    <Grid sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {icon}
        </Avatar>
        <Box>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>{children}</Typography>
        </Box>
    </Grid>
);

const MantenimientoDetailPage = () => {
    const { id } = useParams();
    const [mantenimiento, setMantenimiento] = useState(null);
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
    };

    useEffect(() => {
        const fetchMantenimiento = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await getMantenimientoById(id);
                setMantenimiento(data);
            } catch (err) {
                console.error("Error al cargar el mantenimiento:", err);
                setError("No se pudo cargar la información del mantenimiento.");
            } finally {
                setLoading(false);
            }
        };
        fetchMantenimiento();
    }, [id]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress size={60} /></Box>;
    }

    if (error) {
        return <Typography variant="h5" align="center" color="error" sx={{ mt: 4 }}>{error}</Typography>;
    }

    if (!mantenimiento) {
        return <Typography variant="h5" align="center" sx={{ mt: 4 }}>Registro de Mantenimiento no encontrado.</Typography>;
    }

    return (
        <Container maxWidth="md">
            <Fade in={!loading} timeout={500}>
                <Box sx={{ mt: 4, mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <BuildIcon color="primary" sx={{ fontSize: 32 }} />
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                            Detalle del Mantenimiento
                        </Typography>
                    </Box>
                    <Chip 
                        label={mantenimiento.tipoMantenimiento} 
                        color={mantenimiento.tipoMantenimiento === 'Correctivo' ? 'warning' : 'info'} 
                        size="small"
                        sx={{ ml: 6 }}
                    />
                </Box>
            </Fade>

            <Grid container spacing={3} direction="column">
                <Grid item xs={12}>
                    <Fade in={!loading} timeout={700}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem icon={<CalendarTodayIcon />} label="Fecha Realizada">
                                        {new Date(mantenimiento.fecha).toLocaleString()}
                                    </DetailItem>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <DetailItem icon={<PersonIcon />} label="Técnico Responsable">
                                        {mantenimiento.tecnico?.nombre}
                                    </DetailItem>
                                </Grid>
                                {mantenimiento.fechaProximoManto && (
                                    <Grid item xs={12} sm={6}>
                                        <DetailItem icon={<EventRepeatIcon />} label="Próximo Mantenimiento">
                                            {new Date(mantenimiento.fechaProximoManto).toLocaleDateString()}
                                        </DetailItem>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Fade>
                </Grid>

                <Grid item xs={12}>
                     <Fade in={!loading} timeout={900}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <NotesIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="h6">Observaciones</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary' }}>
                                {mantenimiento.observaciones}
                            </Typography>
                            {mantenimiento.urlSeguraEvidencia && (
                                <Button 
                                    variant="contained" 
                                    onClick={() => handleOpenFile(mantenimiento.urlSeguraEvidencia, `Evidencia: ${mantenimiento.tipoMantenimiento}`)}
                                    startIcon={<AttachmentIcon />}
                                    sx={{ mt: 3 }}
                                >
                                    Ver Evidencia
                                </Button>
                            )}
                        </Paper>
                    </Fade>
                </Grid>

                <Grid item xs={12}>
                    <Fade in={!loading} timeout={1100}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DevicesIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="h6">Equipo Relacionado</Typography>
                            </Box>
                             <Divider sx={{ mb: 2 }} />
                            <Link component={RouterLink} to={`/equipo/${mantenimiento.equipo?.id}`} sx={{ fontWeight: 500, display: 'block' }}>
                                {mantenimiento.equipo?.nombre}
                            </Link>
                            <Typography variant="body2" color="text.secondary">S/N: {mantenimiento.equipo?.numeroSerie}</Typography>
                        </Paper>
                    </Fade>
                </Grid>
            </Grid>

            <FileViewerModal 
                open={modalOpen} 
                onClose={handleCloseModal} 
                fileUrl={fileToView.url} 
                title={fileToView.title} 
            />
        </Container>
    );
};

export default MantenimientoDetailPage;