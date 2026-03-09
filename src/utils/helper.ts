import path from 'path';

export const getUploadPaths = (applicationId: string | number) => {
  const id = parseInt(applicationId.toString());
  
  // Calculate range folder (1-1000, 1001-2000, etc.)
  const start = Math.floor((id - 1) / 1000) * 1000 + 1;
  const end = start + 999;
  const rangeFolder = `${start}-${end}`;
  
  // Filesystem path (relative to project root)
  const filesystemPath = path.join('contractual_upload', rangeFolder, applicationId.toString());
  
  // Public URL path (for browser access)
  const publicUrlPath = `/uploads/${rangeFolder}/${applicationId}`;
  
  return {
    filesystemPath,
    publicUrlPath,
    rangeFolder,
    applicationId: applicationId.toString()
  };
};
