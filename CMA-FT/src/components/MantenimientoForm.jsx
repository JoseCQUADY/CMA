import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { mantenimientoSchema } from '../schemas/mantenimiento.schema';
import { 
    Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, 
    Typography, IconButton, CircularProgress, Divider, Paper, InputAdornment, Stack, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';
import BuildIcon from '@mui/icons-material/Build';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EventRepeatOutlinedIcon from '@mui/icons-material/EventRepeatOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const MantenimientoForm = ({ open, onClose, onSave, mantenimiento, onDeleteEvidencia, isSubmitting }) => {
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
        <Dialog open={open} onClose={onClose} disableEscapeKeyDown={isSubmitting} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <BuildIcon sx={{ mr: 1 }} />
                {mantenimiento ? 'Editar Registro de Mantenimiento' : 'Añadir Nuevo Mantenimiento'}
            </DialogTitle>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography variant="overline" color="text.secondary">Detalles del Mantenimiento</Typography>
                        <TextField {...register('tipoMantenimiento')} label="Tipo de Mantenimiento" fullWidth required error={!!errors.tipoMantenimiento} helperText={errors.tipoMantenimiento?.message} disabled={isSubmitting} InputProps={{ startAdornment: <InputAdornment position="start"><InfoOutlinedIcon /></InputAdornment> }} />
                        <TextField {...register('fecha')} label="Fecha y Hora" type="datetime-local" InputLabelProps={{ shrink: true }} fullWidth required error={!!errors.fecha} helperText={errors.fecha?.message} disabled={isSubmitting} InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayOutlinedIcon /></InputAdornment> }} />
                        <TextField {...register('fechaProximoManto')} label="Próximo Mantenimiento" type="datetime-local" InputLabelProps={{ shrink: true }} fullWidth error={!!errors.fechaProximoManto} helperText={errors.fechaProximoManto?.message} disabled={isSubmitting} InputProps={{ startAdornment: <InputAdornment position="start"><EventRepeatOutlinedIcon /></InputAdornment> }} />
                        <TextField {...register('observaciones')} label="Observaciones" fullWidth required multiline rows={4} error={!!errors.observaciones} helperText={errors.observaciones?.message} disabled={isSubmitting} InputProps={{ startAdornment: <InputAdornment position="start" sx={{ mt: '1px', alignSelf: 'flex-start' }}><NotesOutlinedIcon /></InputAdornment> }}/>
                        
                        <Typography variant="overline" color="text.secondary" sx={{ pt: 2 }}>Evidencia</Typography>
                        <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                            {mantenimiento?.nombreObjetoEvidencia && !evidenciaFile && (
                                 <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                    <Typography variant="body2" noWrap>Actual: {mantenimiento.nombreObjetoEvidencia.split('/').pop()}</Typography>
                                    <Tooltip title="Eliminar evidencia actual">
                                        <IconButton onClick={() => onDeleteEvidencia(mantenimiento.id)} color="error" size="small" disabled={isSubmitting}><DeleteIcon /></IconButton>
                                    </Tooltip>
                                </Box>
                            )}
                            <Button variant="outlined" component="label" fullWidth disabled={isSubmitting} startIcon={<AttachFileIcon />}>
                                {mantenimiento?.nombreObjetoEvidencia ? 'Reemplazar Evidencia' : 'Cargar Evidencia (PDF o Imagen)'}
                                <input type="file" hidden accept="image/*,application/pdf" onChange={handleFileChange} />
                            </Button>
                            {evidenciaFile && <Typography variant="caption" display="block" mt={1} sx={{ fontStyle: 'italic' }}>Nuevo: {evidenciaFile.name}</Typography>}
                        </Paper>
                    </Stack>
                </DialogContent>
                <Divider />
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ color: 'white' }}>
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default MantenimientoForm;