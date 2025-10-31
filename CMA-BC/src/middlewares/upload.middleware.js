import multer from 'multer';

const createUploadMiddleware = (allowedMimeTypes) => {
    const storage = multer.memoryStorage();

    const fileFilter = (req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido. Tipos permitidos: ' + allowedMimeTypes.join(', ')), false);
        }
    };

    return multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 }, 
    });
};

export const uploadManual = createUploadMiddleware(['application/pdf']);
export const uploadEvidencia = createUploadMiddleware(['image/jpeg', 'image/png', 'application/pdf']);