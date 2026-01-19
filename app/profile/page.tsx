'use client';

import { useState, useEffect, FormEvent, useRef } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUser, setUser } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { showError, showSuccess } from '@/lib/swal';

export default function ProfilePage() {
  const [user, setUserState] = useState<any>(null);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUserState(currentUser);
      // Split name into firstName and lastName if available
      if (currentUser.firstName && currentUser.lastName) {
        setName(`${currentUser.firstName} ${currentUser.lastName}`);
      } else {
        setName(currentUser.name || '');
      }
      setPhoneNumber(currentUser.phoneNumber || '');
      if (currentUser.avatar) {
        setPreviewImage(currentUser.avatar);
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await apiClient.updateProfile({
        firstName,
        lastName,
        phoneNumber,
      });

      if (response.success) {
        const updatedUser = {
          ...user,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          name: `${response.data.firstName} ${response.data.lastName}`,
          phoneNumber: response.data.phoneNumber,
          avatar: response.data.avatar,
        };
        setUser(updatedUser);
        setUserState(updatedUser);
        await showSuccess('Profile updated successfully!');
      } else {
        await showError(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      await showError(error.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB before compression)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showError('File size exceeds 5MB limit');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      await showError('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      const response = await apiClient.uploadProfilePicture(file);

      if (response.success) {
        const updatedUser = {
          ...user,
          avatar: response.data.avatar,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          name: `${response.data.firstName} ${response.data.lastName}`,
        };
        setUser(updatedUser);
        setUserState(updatedUser);
        setPreviewImage(response.data.avatar);
        await showSuccess('Profile picture uploaded successfully!');
      } else {
        await showError(response.message || 'Failed to upload profile picture');
      }
    } catch (error: any) {
      await showError(error.response?.data?.message || 'An error occurred while uploading');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

              {/* Profile Picture Section */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                        <svg
                          className="h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {/* Hidden inputs for camera capture */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      id="profilePictureInput"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      id="cameraBackInput"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const dataTransfer = new DataTransfer();
                          dataTransfer.items.add(file);
                          if (fileInputRef.current) {
                            fileInputRef.current.files = dataTransfer.files;
                            handleFileChange({ target: fileInputRef.current } as any);
                          }
                        }
                      }}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      id="cameraFrontInput"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const dataTransfer = new DataTransfer();
                          dataTransfer.items.add(file);
                          if (fileInputRef.current) {
                            fileInputRef.current.files = dataTransfer.files;
                            handleFileChange({ target: fileInputRef.current } as any);
                          }
                        }
                      }}
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label
                        htmlFor="cameraBackInput"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                      >
                        <svg
                          className="mr-2 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Ambil Foto (Kamera Belakang)
                      </label>
                      <label
                        htmlFor="cameraFrontInput"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                      >
                        <svg
                          className="mr-2 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Selfie (Kamera Depan)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          // Create a temporary input for file selection without camera
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Simulate the file input change
                              const dataTransfer = new DataTransfer();
                              dataTransfer.items.add(file);
                              if (fileInputRef.current) {
                                fileInputRef.current.files = dataTransfer.files;
                                handleFileChange({ target: fileInputRef.current } as any);
                              }
                            }
                          };
                          input.click();
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg
                          className="mr-2 h-5 w-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Pilih dari Galeri
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Maximum file size: 5MB. Image will be compressed to 1MB if needed.
                    </p>
                    {previewImage && previewImage !== user?.avatar && (
                      <button
                        type="button"
                        onClick={handleUploadProfilePicture}
                        disabled={isUploading}
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Picture'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={user.role}
                    disabled
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>

                {user.posisi && (
                  <div>
                    <label htmlFor="posisi" className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      id="posisi"
                      value={user.posisi}
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

