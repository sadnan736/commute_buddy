import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ShieldAlert, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  XCircle,
  ListFilter
} from 'lucide-react';

const ReportManagement = () => {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getReports();
      setReports(response || []);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;

    setActionLoading(true);
    try {
      await adminService.updateReport(selectedReport._id, {
        type: selectedReport.type,
        severity: selectedReport.severity,
        description: selectedReport.description,
      });
      toast.success('Report updated successfully');
      setShowEditModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action is permanent.')) {
      try {
        await adminService.deleteReport(reportId);
        toast.success('Report deleted successfully');
        fetchReports();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to delete report');
      }
    }
  };
  
  const filteredReports = reports.filter(report =>
    (report.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.reportedBy || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedReports = React.useMemo(() => {
    let sortableItems = [...filteredReports];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        if (sortConfig.key === 'severity') {
          const severityOrder = { Low: 1, Medium: 2, High: 3 };
          aValue = severityOrder[a.severity] || 0;
          bValue = severityOrder[b.severity] || 0;
        } else { // createdAt
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredReports, sortConfig]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Report Management</h1>
          <p className="text-gray-600">Review, edit, or remove user-submitted reports.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by type or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field w-80"
              />
            </div>
            <div className="flex items-center space-x-2">
                <ListFilter className="w-5 h-5 text-gray-400" />
                <select
                    onChange={(e) => {
                        const [key, direction] = e.target.value.split('-');
                        setSortConfig({ key, direction });
                    }}
                    value={`${sortConfig.key}-${sortConfig.direction}`}
                    className="input-field"
                >
                    <option value="createdAt-descending">Newest reported First</option>
                    <option value="createdAt-ascending">Oldest reported First</option>
                    <option value="severity-ascending">Severity: Low to High</option>
                    <option value="severity-descending">Severity: High to Low</option>
                </select>
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center"><LoadingSpinner size="large" /></div>
          ) : sortedReports.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Reports Found</h3>
              <p className="text-gray-600">{searchTerm ? 'No reports match your search criteria.' : 'The report queue is empty.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{report.type}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${report.severity === 'High' ? 'bg-danger-100 text-danger-800' : report.severity === 'Medium' ? 'bg-warning-100 text-warning-800' : 'bg-success-100 text-success-800'}`}>
                          {report.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-sm"><p className="text-sm text-gray-900 truncate">{report.description}</p></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reportedBy}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(report.createdAt)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button onClick={() => { setSelectedReport({ ...report }); setShowEditModal(true); }} className="btn-icon btn-secondary"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteReport(report._id)} className="btn-icon btn-danger"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showEditModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="relative top-20 mx-auto p-6 border w-full max-w-lg shadow-xl rounded-2xl bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Edit Report</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleUpdateReport}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                  <input id="type" type="text" value={selectedReport.type} onChange={(e) => setSelectedReport(prev => ({ ...prev, type: e.target.value }))} className="mt-1 input-field" />
                </div>
                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity</label>
                  <select id="severity" value={selectedReport.severity} onChange={(e) => setSelectedReport(prev => ({ ...prev, severity: e.target.value }))} className="mt-1 input-field">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="description" rows="4" value={selectedReport.description} onChange={(e) => setSelectedReport(prev => ({ ...prev, description: e.target.value }))} className="mt-1 input-field"></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary">{actionLoading ? <LoadingSpinner size="small" /> : 'Save Changes'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
