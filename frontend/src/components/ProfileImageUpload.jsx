import React, { useState, useRef, useEffect } from 'react';
import { tokenStorage } from '../utils/auth';

const ProfileImageUpload = ({ currentImageUrl, onImageUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!currentImageUrl) {
            setPreviewUrl(null);
            return;
        }

        if (currentImageUrl.startsWith('http') || currentImageUrl.startsWith('data:')) {
            setPreviewUrl(currentImageUrl);
        } else {
            // For local images, use the relative path directly
            setPreviewUrl(currentImageUrl);
        }
    }, [currentImageUrl]);

    const handleFileSelect = async (event) => {
        console.log('=== FILE SELECT EVENT ===');
        console.log('Event:', event);
        console.log('Files:', event.target.files);

        const file = event.target.files[0];
        console.log('Selected file:', file);

        if (!file) {
            console.log('No file selected, returning early');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setPreviewUrl(e.target.result);
            reader.readAsDataURL(file);

            // Upload file
            const formData = new FormData();
            formData.append('image', file);

            console.log('Uploading to:', `/api/users/upload-image`);
            console.log('Auth header:', tokenStorage.getAuthHeader());

            const response = await fetch(`/api/users/upload-image`, {
                method: 'POST',
                headers: {
                    ...tokenStorage.getAuthHeader()
                },
                body: formData
            });

            console.log('Response status:', response.status);
            const result = await response.json();
            console.log('Upload result:', result);

            if (result.success) {
                setPreviewUrl(`${result.image_url}`);
                onImageUpdate?.(result.image_url);
                alert('Profile image updated successfully!');
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to upload image. Please try again.');
            setPreviewUrl(currentImageUrl); // Revert preview
        } finally {
            setIsUploading(false);
        }
    };

    const handleButtonClick = (e) => {
        console.log('=== UPLOAD BUTTON CLICKED ===');
        console.log('Opening file dialog...');
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Stop event bubbling
        fileInputRef.current?.click();
    };

    const handleRemoveImage = async (e) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Stop event bubbling

        try {
            const response = await fetch(`/api/users/update-image`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...tokenStorage.getAuthHeader()
                },
                body: JSON.stringify({ image_url: null })
            });

            const result = await response.json();
            if (result.success) {
                setPreviewUrl(null);
                onImageUpdate?.(null);
                alert('Profile image removed successfully!');
            }
        } catch (error) {
            console.error('Remove image error:', error);
            alert('Failed to remove image. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            {/* Image Preview */}
            <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Upload indicator */}
                {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                )}
            </div>

            {/* Upload Controls */}
            <div className="flex space-x-2">
                <button
                    type="button"
                    onClick={handleButtonClick}
                    disabled={isUploading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isUploading ? 'Uploading...' : previewUrl ? 'Change Photo' : 'Upload Photo'}
                </button>

                {previewUrl && (
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Remove
                    </button>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* File format info */}
            <p className="text-sm text-gray-500 text-center">
                JPG, PNG, GIF up to 5MB
            </p>
        </div>
    );
};

export default ProfileImageUpload;
