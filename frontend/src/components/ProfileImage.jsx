import React, { useState } from 'react';

const ProfileImage = ({ imageUrl, size = 'w-16 h-16', fallbackIcon = '👤' }) => {
    const [imageError, setImageError] = useState(false);

    const getImageSrc = () => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;

        // For local images, in development Vite proxy handles /uploads
        // In production, we'll need the full backend URL
        if (import.meta.env.DEV) {
            // Development: use proxy
            return imageUrl;
        } else {
            // Production: use full backend URL
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
            return `${API_BASE_URL}${imageUrl}`;
        }
    };

    const imageSrc = getImageSrc();
    const showImage = imageSrc && !imageError;

    return (
        <div className={`${size} rounded-full overflow-hidden bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg`}>
            {showImage ? (
                <img
                    src={imageSrc}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl">
                    {fallbackIcon}
                </div>
            )}
        </div>
    );
};

export default ProfileImage;
