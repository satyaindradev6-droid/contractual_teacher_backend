import path from 'path';

export const getUploadPaths = (applicationId: string | number) => {
  const id = parseInt(applicationId.toString());
  
  // Calculate range folder (1-1000, 1001-2000, etc.)
  const start = Math.floor((id - 1) / 1000) * 1000 + 1;
  const end = start + 999;
  const rangeFolder = `${start}-${end}`;
  
  // Filesystem path (relative to project root) - for storing files
  const filesystemPath = path.join('contractual_upload', rangeFolder, applicationId.toString());
  
  // Public path (for URL generation) - matches the static middleware path
  const publicPath = `contractual_upload/${rangeFolder}/${applicationId}`;
  
  return {
    filesystemPath,
    publicPath,
    rangeFolder,
    applicationId: applicationId.toString()
  };
};

export const generateDocumentUrl = (applicationId: string | number, filename: string): string => {
  if (!filename) return '';
  
  const { publicPath } = getUploadPaths(applicationId);
  const baseUrl = process.env.FILE_BASE_URL || 'http://localhost:8000';
  
  return `${baseUrl}/${publicPath}/${filename}`;
};
