/* Frontend Image Upload Implementation Options */

// Option 1: Local file upload with backend storage
const uploadProfileImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/users/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();
    return result.image_url; // Returns local path like "/uploads/profile_123.jpg"
};

// Option 2: Base64 encoding (for simple implementation)
const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// Option 3: External service (Cloudinary, AWS S3, etc.)
const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_preset');

    const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud/image/upload', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    return result.secure_url;
};
