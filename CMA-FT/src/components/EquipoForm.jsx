import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { equipoSchema } from '../schemas/equipo.schema';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, Typography, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React from 'react';


const EquipoForm = ({ open, onClose, onSave, equipo, onDeleteManual, isSubmitting }) => {
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
        <Dialog open={open} onClose={onClose} disableEscapeKeyDown={isSubmitting}>

            <DialogTitle><Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {equipo ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
            </Typography></DialogTitle>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <TextField {...register('nombre')} defaultValue={equipo?.nombre || ''} label="Nombre" fullWidth margin="dense" required error={!!errors.nombre} helperText={errors.nombre?.message} disabled={isSubmitting} />
                    <TextField {...register('marca')} defaultValue={equipo?.marca || ''} label="Marca" fullWidth margin="dense" required error={!!errors.marca} helperText={errors.marca?.message} disabled={isSubmitting} />
                    <TextField {...register('modelo')} defaultValue={equipo?.modelo || ''} label="Modelo" fullWidth margin="dense" required error={!!errors.modelo} helperText={errors.modelo?.message} disabled={isSubmitting} />
                    <TextField {...register('numeroSerie')} defaultValue={equipo?.numeroSerie || ''} label="Número de Serie" fullWidth margin="dense" required error={!!errors.numeroSerie} helperText={errors.numeroSerie?.message} disabled={isSubmitting} />
                    <TextField {...register('idControl')} defaultValue={equipo?.idControl || ''} label="ID de Control" fullWidth margin="dense" required error={!!errors.idControl} helperText={errors.idControl?.message} disabled={isSubmitting} />
                    <TextField {...register('ubicacion')} defaultValue={equipo?.ubicacion || ''} label="Ubicación" fullWidth margin="dense" required error={!!errors.ubicacion} helperText={errors.ubicacion?.message} disabled={isSubmitting} />

                    <Box mt={2} border={1} p={2} borderRadius={1} borderColor="grey.300">
                        <Typography variant="subtitle1" gutterBottom>Manual (PDF)</Typography>
                        {equipo?.nombreObjetoPDF && <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}><Typography variant="body2" noWrap>Actual: {equipo.nombreObjetoPDF.split('/').pop()}</Typography><IconButton onClick={() => onDeleteManual(equipo.id)} color="error" size="small" disabled={isSubmitting}><DeleteIcon /></IconButton></Box>}

                        <TextField {...register('descripcionPDF')} defaultValue={equipo?.descripcionPDF || ''} label="Descripción del Manual" fullWidth margin="dense" error={!!errors.descripcionPDF} helperText={errors.descripcionPDF?.message} disabled={isSubmitting} />

                        <Button variant="outlined" component="label" fullWidth sx={{ mt: 1 }} disabled={isSubmitting}>
                            {equipo?.nombreObjetoPDF ? 'Reemplazar Archivo PDF' : 'Cargar Archivo PDF'}
                            <input type="file" hidden accept="application/pdf" onChange={handleFileChange} />
                        </Button>
                        {manualFile && <Typography variant="caption" display="block" mt={1}>Nuevo: {manualFile.name}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Guardar'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default EquipoForm;