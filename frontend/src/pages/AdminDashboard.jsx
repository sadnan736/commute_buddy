import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users, 
  Clock, 
  Eye, 
  Search,
  Filter,
  Calendar,
  FileText,
  UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalPending: 0,
    today: 0,
    thisWeek: 0,
  });

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getPendingVerifications();
      setPendingVerifications(response.users || []);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      
      const todayCount = response.users.filter(u => new Date(u.verificationSubmittedAt) >= today).length;
      const weekCount = response.users.filter(u => new Date(u.verificationSubmittedAt) >= thisWeek).length;
      
      setStats({
        totalPending: response.count || 0,
        today: todayCount,
        thisWeek: weekCount,
      });
      
    } catch (error) {
      toast.error('Failed to fetch pending verifications');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVerifications = pendingVerifications.filter(verification =>
    verification.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    verification.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-poppins">Verification Center</h1>
              <p className="text-gray-600">Review and manage pending user verifications.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Clock} title="Pending Reviews" value={stats.totalPending} color="bg-warning-500" subtitle="Awaiting approval" />
          <StatCard icon={Calendar} title="Today's Submissions" value={stats.today} color="bg-primary-500" subtitle="New today" />
          <StatCard icon={UserCheck} title="This Week" value={stats.thisWeek} color="bg-info-500" subtitle="Last 7 days" />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 font-poppins">Pending Verifications</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input-field w-64"
                />
              </div>
              <button className="btn-secondary">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12"><LoadingSpinner size="large" /></div>
          ) : filteredVerifications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending verifications</h3>
              <p className="text-gray-600">{searchTerm ? 'No verifications match your search.' : 'All caught up!'}</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVerifications.map((verification) => (
                    <tr key={verification._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{verification.name}</div>
                          <div className="text-sm text-gray-500">{verification.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{verification.verifiedDocuments?.length || 0} files</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(verification.verificationSubmittedAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Link to={`/admin/verification/${verification._id}`} className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
