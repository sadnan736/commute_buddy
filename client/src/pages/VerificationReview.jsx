import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeft,
  User,
  Mail,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Shield,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';

const VerificationReview = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageZoom, setImageZoom] = useState(100);
  const [imageRotation, setImageRotation] = useState(0);

  const commonRejectionReasons = [
    'Documents are not clear or readable',
    'Invalid document type submitted',
    'Documents appear to be altered or fake',
    'Missing required documents',
    'Documents do not match user information',
    'Poor quality images/scans'
  ];

  useEffect(() => {
    if (userId) {
      fetchVerificationDetails();
    }
  }, [userId]);

  const fetchVerificationDetails = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getVerificationDetails(userId);
      setUserDetails(response.user);
    } catch (error) {
      toast.error('Failed to fetch verification details');
      navigate('/admin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await adminService.approveVerification(userId, comments || 'Documents verified successfully');
      toast.success('Verification approved successfully');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve verification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.rejectVerification(userId, rejectionReason);
      toast.success('Verification rejected');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject verification');
    } finally {
      setActionLoading(false);
    }
  };

  const openImageModal = (doc) => {
    setSelectedDocument(doc);
    setShowImageModal(true);
    setImageZoom(100);
    setImageRotation(0);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedDocument(null);
  };

  const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    if (['pdf'].includes(extension)) return 'pdf';
    return 'document';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-success-600 bg-success-100';
      case 'rejected':
        return 'text-danger-600 bg-danger-100';
      case 'pending':
        return 'text-warning-600 bg-warning-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <button onClick={() => navigate('/admin')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                  Verification Review
                </h1>
                <p className="text-gray-600">Review documents for {userDetails.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userDetails.verificationStatus)}`}>
                {userDetails.verificationStatus?.charAt(0).toUpperCase() + userDetails.verificationStatus?.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Information Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Details */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
                User Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {userDetails.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{userDetails.name}</h3>
                    <p className="text-sm text-gray-500">User ID: {userDetails._id}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{userDetails.email}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">Role: {userDetails.role}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">
                      Submitted: {formatDate(userDetails.verificationSubmittedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Comments */}
            {userDetails.verificationComments && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Previous Feedback
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{userDetails.verificationComments}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Actions
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Add any comments for the user..."
                  />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    {actionLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Verification
                      </>
                    )}
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason
                    </label>
                    <select
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="input-field mb-2"
                    >
                      <option value="">Select a reason...</option>
                      {commonRejectionReasons.map((reason, index) => (
                        <option key={index} value={reason}>{reason}</option>
                      ))}
                      <option value="custom">Custom reason...</option>
                    </select>
                    
                    {rejectionReason === 'custom' && (
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={2}
                        className="input-field"
                        placeholder="Enter custom rejection reason..."
                      />
                    )}
                  </div>

                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectionReason}
                    className="w-full btn-danger flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Verification
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Review Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
                Documents ({userDetails.verifiedDocuments?.length || 0})
              </h2>

              {userDetails.verifiedDocuments?.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No documents submitted
                  </h3>
                  <p className="text-gray-600">This user hasn't uploaded any verification documents.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userDetails.verifiedDocuments.map((doc, index) => {
                    const fileType = getFileType(doc);
                    
                    return (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 truncate">{doc}</h4>
                          <div className="flex space-x-2">
                            {fileType === 'image' && (
                              <button
                                onClick={() => openImageModal(doc)}
                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => window.open(`/documents/${doc}`, '_blank')}
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                          {fileType === 'image' ? (
                            <img
                              src={`/documents/${doc}`}
                              alt={doc}
                              className="w-full h-48 object-cover cursor-pointer"
                              onClick={() => openImageModal(doc)}
                            />
                          ) : fileType === 'pdf' ? (
                            <div className="flex items-center justify-center h-48 bg-red-50">
                              <FileText className="w-12 h-12 text-red-500" />
                              <span className="ml-2 text-red-700 font-medium">PDF Document</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-48 bg-gray-50">
                              <FileText className="w-12 h-12 text-gray-400" />
                              <span className="ml-2 text-gray-600 font-medium">Document</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {fileType.toUpperCase()}
                          </span>
                          <button
                            onClick={() => window.open(`/documents/${doc}`, '_blank')}
                            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                          >
                            Open Full Size
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-screen overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">{selectedDocument}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setImageZoom(Math.max(50, imageZoom - 25))}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">{imageZoom}%</span>
                <button
                  onClick={() => setImageZoom(Math.min(200, imageZoom + 25))}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setImageRotation((imageRotation + 90) % 360)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={closeImageModal}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-auto">
              <img
                src={`/documents/${selectedDocument}`}
                alt={selectedDocument}
                className="max-w-full h-auto"
                style={{
                  transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                  transformOrigin: 'center'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationReview;
