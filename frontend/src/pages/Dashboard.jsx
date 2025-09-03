import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileCheck, 
  Users, 
  Shield, 
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  ShieldAlert,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { user, profileCompletion, isAdmin, isModerator } = useAuth();

  const adminActions = [
    {
      title: 'Admin Dashboard',
      description: 'Review pending verifications',
      icon: Shield,
      link: '/admin',
      color: 'bg-red-500'
    },
    {
      title: 'User Management',
      description: 'Manage user roles and permissions',
      icon: Users,
      link: '/admin/users',
      color: 'bg-indigo-500'
    },
    {
      title: 'Report Management',
      description: 'Review and manage user reports',
      icon: ShieldAlert,
      link: '/admin/reports',
      color: 'bg-rose-500'
    }
  ];

  if (isAdmin || isModerator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-poppins">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's your administrative dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Role Badge */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Account Role</h3>
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${
                    user?.role === 'admin' ? 'bg-red-500' : 'bg-purple-500'
                  }`}>
                    {user?.role === 'admin' ? 'Admin' : 'Moderator'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {user?.role === 'admin' 
                    ? 'You have full administrative access' 
                    : 'You can moderate content and users'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
              Administration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {adminActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className="card hover:shadow-xl transition-shadow duration-200 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getVerificationStatusInfo = () => {
    switch (user?.verificationStatus) {
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Verified',
          color: 'text-success-600 bg-success-100',
          description: 'You are a verified reporter'
        };
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Rejected',
          color: 'text-danger-600 bg-danger-100',
          description: 'Your verification was rejected. You can resubmit documents.'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Under Review',
          color: 'text-warning-600 bg-warning-100',
          description: 'Your documents are being reviewed by our team'
        };
      default:
        return {
          icon: XCircle,
          text: 'Not Submitted',
          color: 'text-gray-600 bg-gray-100',
          description: 'Submit your documents to become a verified reporter'
        };
    }
  };

  const verificationStatus = getVerificationStatusInfo();
  const StatusIcon = verificationStatus.icon;

  const quickActions = [
    {
      title: 'Verification Center',
      description: 'Submit or manage your verification documents',
      icon: FileCheck,
      link: '/VerificationCenter',
      color: 'bg-primary-500'
    },
    {
      title: 'Activity History',
      description: 'View all your submitted reports and their status',
      icon: Activity,
      link: '/activity-history',
      color: 'bg-blue-500'
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile and preferences',
      icon: Users,
      link: '/profile',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-poppins">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profile Completion */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Profile Completion</h3>
              <TrendingUp className="w-5 h-5 text-primary-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{profileCompletion}%</span>
                <span className="text-sm text-gray-500">Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {profileCompletion < 100 
                  ? 'Complete your profile to unlock all features'
                  : 'Your profile is fully completed!'
                }
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Verification Status</h3>
              <StatusIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${verificationStatus.color}`}>
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {verificationStatus.text}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {verificationStatus.description}
              </p>
              {user?.verificationStatus !== 'approved' && (
                <Link to="/VerificationCenter" className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                  Manage VerificationCenter →
                </Link>
              )}
            </div>
          </div>

          {/* Role Badge */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Account Role</h3>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${
                  user?.role === 'admin' ? 'bg-red-500' :
                  user?.role === 'moderator' ? 'bg-purple-500' :
                  user?.role === 'verifiedReporter' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}>
                  {user?.role === 'admin' && 'Admin'}
                  {user?.role === 'moderator' && 'Moderator'}
                  {user?.role === 'verifiedReporter' && 'Verified Reporter'}
                  {user?.role === 'user' && 'User'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {user?.role === 'admin' && 'You have full administrative access'}
                {user?.role === 'moderator' && 'You can moderate content and users'}
                {user?.role === 'verifiedReporter' && 'You can submit verified traffic reports'}
                {user?.role === 'user' && 'Standard user account'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 font-poppins">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="card hover:shadow-xl transition-shadow duration-200 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
