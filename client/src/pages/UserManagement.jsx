import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService, profileService } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, 
  Search, 
  Filter, 
  Shield, 
  User, 
  UserCheck, 
  Crown,
  MoreVertical,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Badge
} from 'lucide-react';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const roles = [
    { value: 'user', label: 'User', icon: User, color: 'bg-gray-500' },
    { value: 'verifiedReporter', label: 'Verified Reporter', icon: UserCheck, color: 'bg-blue-500' },
    { value: 'moderator', label: 'Moderator', icon: Shield, color: 'bg-purple-500' },
    { value: 'admin', label: 'Admin', icon: Crown, color: 'bg-red-500' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await adminService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser._id) {
      toast.error('You cannot change your own role');
      return;
    }

    setActionLoading(true);
    try {
      await adminService.updateUserRole(userId, newRole);
      
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success(`User role updated to ${newRole}`);
      setShowRoleModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user role');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleInfo = (roleValue) => {
    return roles.find(role => role.value === roleValue) || roles[0];
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-danger-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesVerification = filterVerification === 'all' || user.verificationStatus === filterVerification;
    
    return matchesSearch && matchesRole && matchesVerification;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                User Management
              </h1>
              <p className="text-gray-600">Manage user roles and permissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field w-64"
                />
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input-field w-40"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value)}
                className="input-field w-44"
              >
                <option value="all">All Verification Status</option>
                <option value="none">Not Submitted</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <button className="btn-secondary">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 font-poppins">
              Users
            </h2>
          </div>

          {isLoading ? (
            <div className="py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600">
                {searchTerm || filterRole !== 'all' || filterVerification !== 'all' 
                  ? 'Try adjusting your filters.' 
                  : 'No users available.'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verification
                    </th>
                   
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    const IconComponent = roleInfo.icon;
                    const isCurrentUser = user._id === currentUser._id;
                    
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {user.name}
                                {isCurrentUser && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${roleInfo.color}`}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {roleInfo.label}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getVerificationIcon(user.verificationStatus)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {user.verificationStatus === 'none' ? 'Not Submitted' : user.verificationStatus}
                            </span>
                          </div>
                        </td>
                        
                        
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowRoleModal(true);
                            }}
                            disabled={isCurrentUser}
                            className={`inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition-colors ${
                              isCurrentUser 
                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                : 'text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Role
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Role Change Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-xl rounded-2xl bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Change User Role
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{selectedUser.name}</p>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <p className="text-sm text-gray-500">
                  Current Role: <span className="font-medium">{getRoleInfo(selectedUser.role).label}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Role
                </label>
                <div className="space-y-2">
                  {roles.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <button
                        key={role.value}
                        onClick={() => handleRoleChange(selectedUser._id, role.value)}
                        disabled={actionLoading || role.value === selectedUser.role}
                        className={`w-full flex items-center p-3 border rounded-lg transition-colors ${
                          role.value === selectedUser.role
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className={`p-2 rounded-lg ${role.color} mr-3`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{role.label}</p>
                          <p className="text-sm text-gray-500">
                            {role.value === 'admin' && 'Full system access'}
                            {role.value === 'moderator' && 'Moderate content and users'}
                            {role.value === 'verifiedReporter' && 'Submit verified reports'}
                            {role.value === 'user' && 'Standard user access'}
                          </p>
                        </div>
                        {role.value === selectedUser.role && (
                          <Badge className="w-4 h-4 text-primary-500 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {actionLoading && (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="medium" />
                  <span className="ml-2 text-gray-600">Updating role...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
