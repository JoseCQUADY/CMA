import { Dialog, DialogContent, DialogTitle, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import React from 'react';

const FileViewerModal = ({ open, onClose, fileUrl, title }) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const renderContent = () => {
        if (!fileUrl) return null;

        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].some(ext => fileUrl.toLowerCase().endsWith(ext));
        if (isImage) {
            return <Box component="img" src={fileUrl} alt={title || 'Evidencia'} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />;
        }
        
        const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            return (
                <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
                    <Viewer
                        fileUrl={fileUrl}
                        plugins={[defaultLayoutPluginInstance]}
                    />
                </Worker>
            );
        }

        return <Typography>La previsualización no está disponible para este tipo de archivo.</Typography>;
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="lg"
            PaperProps={{ sx: { height: '90vh', display: 'flex', flexDirection: 'column' } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {title || 'Visor de Archivo'}
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ flexGrow: 1, p: 0, overflow: 'hidden' }}>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
};

export default FileViewerModal;