import cloudinary from './cloudinary';

export async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.v2.api.ping();
    console.log('Cloudinary connection successful:', result);
    
    // List all folders
    const folders = await cloudinary.v2.api.root_folders();
    console.log('Available folders:', folders);
    
    return { success: true, result, folders };
  } catch (error) {
    console.error('Cloudinary connection error:', error);
    return { success: false, error };
  }
} 