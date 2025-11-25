import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { mantenimientoSchema } from '../schemas/mantenimiento.schema';
import { 
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, 
    Typography, IconButton, CircularProgress, Divider, Paper, InputAdornment, Stack, Tooltip,
    useMediaQuery, Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';
import BuildIcon from '@mui/icons-material/Build';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const MantenimientoForm = ({ open, onClose, onSave, mantenimiento, onDeleteEvidencia, isSubmitting }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [evidenciaFile, setEvidenciaFile] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(mantenimientoSchema),
    });

    useEffect(() => {
        if (open) {
            if (mantenimiento) {
                const localDate = new Date(mantenimiento.fecha).toISOString().slice(0, 16);
                const proximoMantoDate = mantenimiento.fechaProximoManto ? new Date(mantenimiento.fechaProximoManto).toISOString().slice(0, 16) : '';
                reset({ ...mantenimiento, fecha: localDate, fechaProximoManto: proximoMantoDate });
            } else {
                reset({ tipoMantenimiento: '', fecha: '', observaciones: '', fechaProximoManto: '' });
            }
            setEvidenciaFile(null);
        }
    }, [mantenimiento, open, reset]);

    const handleFileChange = (e) => setEvidenciaFile(e.target.files[0]);

    const onSubmit = (data) => {
        onSave(data, evidenciaFile);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            disableEscapeKeyDown={isSubmitting} 
            maxWidth="sm" 
            fullWidth
            fullScreen={isMobile}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BuildIcon color="primary" />
                    <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {mantenimiento ? 'Editar Registro de Mantenimiento' : 'Añadir Nuevo Mantenimiento'}
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {mantenimiento ? 'Modifique los datos del registro' : 'Complete los datos del nuevo mantenimiento'}
                </Typography>
            </DialogTitle>
            <Divider />
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                Detalles del Mantenimiento
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                {...register('tipoMantenimiento')} 
                                label="Tipo de Mantenimiento" 
                                fullWidth 
                                required 
                                error={!!errors.tipoMantenimiento} 
                                helperText={errors.tipoMantenimiento?.message} 
                                disabled={isSubmitting} 
                                placeholder="Ej: Preventivo, Correctivo, Calibración..."
                                InputProps={{ 
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <InfoOutlinedIcon color="action" />
                                        </InputAdornment>
                                    ) 
                                }} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                {...register('fecha')} 
                                label="Fecha y Hora" 
                                type="datetime-local" 
                                InputLabelProps={{ shrink: true }} 
                                fullWidth 
                                required 
                                error={!!errors.fecha} 
                                helperText={errors.fecha?.message} 
                                disabled={isSubmitting} 
                                InputProps={{ 
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarTodayOutlinedIcon color="action" />
                                        </InputAdornment>
                                    ) 
                                }} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                {...register('fechaProximoManto')} 
                                label="Próximo Mantenimiento" 
                                type="datetime-local" 
                                InputLabelProps={{ shrink: true }} 
                                fullWidth 
                                error={!!errors.fechaProximoManto} 
                                helperText={errors.fechaProximoManto?.message || 'Opcional'} 
                                disabled={isSubmitting} 
                                InputProps={{ 
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EventRepeatOutlinedIcon color="action" />
                                        </InputAdornment>
                                    ) 
                                }} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                {...register('observaciones')} 
                                label="Observaciones" 
                                fullWidth 
                                required 
                                multiline 
                                rows={4} 
                                error={!!errors.observaciones} 
                                helperText={errors.observaciones?.message} 
                                disabled={isSubmitting}
                                placeholder="Describa el trabajo realizado, piezas reemplazadas, hallazgos, etc."
                                InputProps={{ 
                                    startAdornment: (
                                        <InputAdornment position="start" sx={{ mt: '1px', alignSelf: 'flex-start' }}>
                                            <NotesOutlinedIcon color="action" />
                                        </InputAdornment>
                                    ) 
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                Evidencia
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                                {mantenimiento?.nombreObjetoEvidencia && !evidenciaFile && (
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
                                            📎 {mantenimiento.nombreObjetoEvidencia.split('/').pop()}
                                        </Typography>
                                        <Tooltip title="Eliminar evidencia actual">
                                            <IconButton 
                                                onClick={() => onDeleteEvidencia(mantenimiento.id)} 
                                                color="error" 
                                                size="small" 
                                                disabled={isSubmitting}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                                <Button 
                                    variant="outlined" 
                                    component="label" 
                                    fullWidth 
                                    disabled={isSubmitting} 
                                    startIcon={<AttachFileIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {mantenimiento?.nombreObjetoEvidencia ? 'Reemplazar Evidencia' : 'Cargar Evidencia (PDF o Imagen)'}
                                    <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
                                </Button>
                                {evidenciaFile && (
                                    <Typography 
                                        variant="caption" 
                                        display="block" 
                                        sx={{ mt: 1, fontStyle: 'italic', color: 'success.main' }}
                                    >
                                        ✓ Nuevo archivo: {evidenciaFile.name}
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

export default MantenimientoForm;