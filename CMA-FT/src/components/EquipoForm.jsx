import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { equipoSchema } from '../schemas/equipo.schema';
import { 
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, 
    Typography, IconButton, CircularProgress, useMediaQuery, Grid, InputAdornment, 
    Paper, Divider, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import DevicesIcon from '@mui/icons-material/Devices';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import QrCodeIcon from '@mui/icons-material/QrCode';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import React from 'react';


const EquipoForm = ({ open, onClose, onSave, equipo, onDeleteManual, isSubmitting }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [manualFile, setManualFile] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(equipoSchema),
    });

    useEffect(() => {
        if (open) {
            if (equipo) {
                reset({ ...equipo, descripcionPDF: equipo.descripcionPDF || '' });
            } else {
                reset({ nombre: '', marca: '', modelo: '', numeroSerie: '', idControl: '', ubicacion: '', descripcionPDF: '' });
            }
            setManualFile(null);
        }
    }, [equipo, open, reset]);

    const handleFileChange = (e) => setManualFile(e.target.files[0]);

    const onSubmit = (data) => {
        onSave(data, manualFile);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            disableEscapeKeyDown={isSubmitting}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DevicesIcon color="primary" />
                    <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {equipo ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {equipo ? 'Modifique los datos del equipo' : 'Complete los datos del nuevo equipo'}
                </Typography>
            </DialogTitle>
            <Divider />
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField 
                                {...register('nombre')} 
                                defaultValue={equipo?.nombre || ''} 
                                label="Nombre del Equipo" 
                                fullWidth 
                                required 
                                error={!!errors.nombre} 
                                helperText={errors.nombre?.message} 
                                disabled={isSubmitting}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <DevicesIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                {...register('marca')} 
                                defaultValue={equipo?.marca || ''} 
                                label="Marca" 
                                fullWidth 
                                required 
                                error={!!errors.marca} 
                                helperText={errors.marca?.message} 
                                disabled={isSubmitting}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BusinessIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                {...register('modelo')} 
                                defaultValue={equipo?.modelo || ''} 
                                label="Modelo" 
                                fullWidth 
                                required 
                                error={!!errors.modelo} 
                                helperText={errors.modelo?.message} 
                                disabled={isSubmitting}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CategoryIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                {...register('numeroSerie')} 
                                defaultValue={equipo?.numeroSerie || ''} 
                                label="Número de Serie" 
                                fullWidth 
                                required 
                                error={!!errors.numeroSerie} 
                                helperText={errors.numeroSerie?.message} 
                                disabled={isSubmitting}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <QrCodeIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                {...register('idControl')} 
                                defaultValue={equipo?.idControl || ''} 
                                label="ID de Control" 
                                fullWidth 
                                required 
                                error={!!errors.idControl} 
                                helperText={errors.idControl?.message} 
                                disabled={isSubmitting}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FingerprintIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                {...register('ubicacion')} 
                                defaultValue={equipo?.ubicacion || ''} 
                                label="Ubicación" 
                                fullWidth 
                                required 
                                error={!!errors.ubicacion} 
                                helperText={errors.ubicacion?.message} 
                                disabled={isSubmitting}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationOnIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Manual PDF Section */}
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: 'grey.50' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <DescriptionIcon color="primary" />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                        Manual (PDF)
                                    </Typography>
                                </Box>

                                {equipo?.nombreObjetoPDF && (
                                    <Box 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            mb: 2,
                                            p: 1,
                                            backgroundColor: 'white',
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'grey.300',
                                        }}
                                    >
                                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                                            📄 {equipo.nombreObjetoPDF.split('/').pop()}
                                        </Typography>
                                        <Tooltip title="Eliminar manual actual">
                                            <IconButton 
                                                onClick={() => onDeleteManual(equipo.id)} 
                                                color="error" 
                                                size="small" 
                                                disabled={isSubmitting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}

                                <TextField 
                                    {...register('descripcionPDF')} 
                                    defaultValue={equipo?.descripcionPDF || ''} 
                                    label="Descripción del Manual" 
                                    fullWidth 
                                    error={!!errors.descripcionPDF} 
                                    helperText={errors.descripcionPDF?.message} 
                                    disabled={isSubmitting}
                                    sx={{ mb: 2 }}
                                />

                                <Button 
                                    variant="outlined" 
                                    component="label" 
                                    fullWidth 
                                    disabled={isSubmitting}
                                    startIcon={<AttachFileIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {equipo?.nombreObjetoPDF ? 'Reemplazar Archivo PDF' : 'Cargar Archivo PDF'}
                                    <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
                                </Button>
                                {manualFile && (
                                    <Typography 
                                        variant="caption" 
                                        display="block" 
                                        sx={{ mt: 1, fontStyle: 'italic', color: 'success.main' }}
                                    >
                                        ✓ Nuevo archivo: {manualFile.name}
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={onClose} disabled={isSubmitting} sx={{ borderRadius: 2 }}>
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={isSubmitting}
                        sx={{ borderRadius: 2, minWidth: 120, color: 'white' }}
                    >
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default EquipoForm;