import { objectstorage } from 'oci-sdk';
import { ConfigFileAuthenticationDetailsProvider } from 'oci-common';
import { Readable } from 'stream';

const OCI_CONFIG_PATH = process.env.OCI_CONFIG_PATH;
const OCI_PROFILE = process.env.OCI_PROFILE; 

const provider = new ConfigFileAuthenticationDetailsProvider(
    OCI_CONFIG_PATH,
    OCI_PROFILE
);


const objectStorageClient = new objectstorage.ObjectStorageClient({
    authenticationDetailsProvider: provider,
});

export async function uploadFile(fileBuffer, objectName, contentDisposition = 'inline', contentType) {
    try {
        const putObjectRequest = {
            namespaceName: process.env.OCI_NAMESPACE,
            bucketName: process.env.OCI_BUCKET_NAME,
            objectName: objectName,
            putObjectBody: Readable.from(fileBuffer),
            contentLength: fileBuffer.length,
            contentDisposition: contentDisposition,
            contentType : contentType
        };
        await objectStorageClient.putObject(putObjectRequest);
        return objectName;
    } catch (error) {
        console.error("Error subiendo archivo a OCI:", error);
        throw new Error("No se pudo subir el archivo a OCI.");
    }
}

export async function generatePresignedUrl(objectName) {
    if (!objectName) return null;
    try {
        const expirationTime = new Date(Date.now() + 20 * 60 * 1000);
        const requestDetails = {
            name: `par-get-${objectName.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`,
            objectName: objectName,
            accessType: 'ObjectRead',
            timeExpires: expirationTime,
        };
        const parRequest = {
            namespaceName: process.env.OCI_NAMESPACE,
            bucketName: process.env.OCI_BUCKET_NAME,
            createPreauthenticatedRequestDetails: requestDetails,
        };
        const response = await objectStorageClient.createPreauthenticatedRequest(parRequest);
        const fullUrl = `https://objectstorage.${process.env.OCI_REGION}.oraclecloud.com${response.preauthenticatedRequest.accessUri}`;
        return fullUrl;
    } catch (error) {
        console.error(`Error generando URL para el objeto ${objectName}:`, error);
        return null;
    }
}

export async function deleteFile(objectName) {
    if (!objectName) return;
    try {
        await objectStorageClient.deleteObject({
            namespaceName: process.env.OCI_NAMESPACE,
            bucketName: process.env.OCI_BUCKET_NAME,
            objectName: objectName,
        });
        console.log(`Archivo eliminado de OCI: ${objectName}`);
    } catch (error) {
        console.error(`Error al eliminar el archivo ${objectName} de OCI:`, error);
    }
}