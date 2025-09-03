import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  Trash2
} from 'lucide-react';

const VerificationCenter = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    fetchVerificationStatus();
  }, [user]);

  const fetchVerificationStatus = async () => {
    if (!user) return;
    
    try {
      const response = await profileService.getProfile(user._id);
      setVerificationData(response);
      if (response.verifiedDocuments && response.verifiedDocuments.length > 0) {
        setUploadedFiles(response.verifiedDocuments.map((doc, index) => ({
          id: index,
          name: doc,
          url: doc,
          type: getFileType(doc)
        })));
      }
    } catch (error) {
      toast.error('Failed to fetch verification status');
    }
  };

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    return 'document';
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid file type. Please upload JPG, PNG, or PDF files.`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      
      return true;
    });

    const newFiles = validFiles.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      file: file,
      type: getFileType(file.name),
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const updated = prev.filter(file => file.id !== fileId);
      // Revoke object URLs to prevent memory leaks
      const fileToRemove = prev.find(file => file.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const submitVerification = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    // Filter out files that have already been submitted
    const newFiles = uploadedFiles.filter(f => f.file);
    if (newFiles.length === 0) {
      toast.info('No new documents to submit.');
      return;
    }

    setIsLoading(true);
    
    const formData = new FormData();
    newFiles.forEach(fileObject => {
      formData.append('documents', fileObject.file);
    });
    
    try {
      const response = await profileService.submitVerification(formData);
      
      // Update local state with the user data from the response
      const updatedUser = response.user;
      const updatedDocuments = updatedUser.verifiedDocuments || [];
      
      updateUser(updatedUser);
      
      setVerificationData(prev => ({
        ...prev,
        verificationStatus: updatedUser.verificationStatus,
        verificationSubmittedAt: updatedUser.verificationSubmittedAt,
        verifiedDocuments: updatedDocuments
      }));

      // Update the uploadedFiles state to reflect what is now on the server
      setUploadedFiles(updatedDocuments.map((doc, index) => ({
        id: doc._id || index, // Use the doc ID from the server if available
        name: doc.name,
        // Since we don't have the file object anymore, we can't show a preview
        // This part needs adjustment based on how you want to display already-uploaded files
      })));
      
      toast.success('Verification documents submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit verification');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-success-500" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-danger-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-warning-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Under Review';
      default:
        return 'Not Submitted';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'rejected':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'pending':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canSubmit = () => {
    return verificationData?.verificationStatus !== 'pending' && uploadedFiles.length > 0;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">
            Verification Center
          </h1>
          <p className="mt-2 text-gray-600">
            Submit your documents to become a verified reporter
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Status */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
                Verification Status
              </h2>
              
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(verificationData?.verificationStatus)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(verificationData?.verificationStatus)}`}>
                  {getStatusText(verificationData?.verificationStatus)}
                </span>
              </div>

              {verificationData?.verificationSubmittedAt && (
                <div className="text-sm text-gray-600 mb-4">
                  <strong>Submitted:</strong> {new Date(verificationData.verificationSubmittedAt).toLocaleDateString()}
                </div>
              )}

              {verificationData?.verificationComments && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Admin Feedback:</h3>
                  <p className="text-sm text-gray-700">{verificationData.verificationComments}</p>
                </div>
              )}
            </div>
          </div>

          {/* Document Upload */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
                Upload Documents
              </h2>

              {/* Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  isDragging
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop your files here
                </h3>
                <p className="text-gray-600 mb-4">
                  or click to browse files
                </p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn-primary cursor-pointer inline-block"
                >
                  Choose Files
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: JPG, PNG, PDF (Max 10MB each)
                </p>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Uploaded Documents ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {file.type === 'image' ? (
                              file.preview ? (
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-gray-600" />
                                </div>
                              )
                            ) : (
                              <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                                <FileText className="w-5 h-5 text-red-600" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            {file.size && (
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.url && (
                            <button
                              onClick={() => window.open(file.url, '_blank')}
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={submitVerification}
                  disabled={!canSubmit() || isLoading}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                    canSubmit() && !isLoading
                      ? 'btn-primary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="small" />
                      <span>Submitting...</span>
                    </div>
                  ) : verificationData?.verificationStatus === 'rejected' ? (
                    'Resubmit for Verification'
                  ) : (
                    'Submit for Verification'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationCenter;
