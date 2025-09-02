import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Incidents = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    severity: '',
    timeWindow: '',
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Filter out empty string values before sending to the backend
      const filledFilters = Object.keys(filters).reduce((acc, key) => {
        if (filters[key]) {
          acc[key] = filters[key];
        }
        return acc;
      }, {});
      const { data } = await api.get('/reports', { params: filledFilters });
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const formatValidity = (expiresAt) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiryDate = new Date(expiresAt);
    const diffTime = expiryDate - now;

    if (diffTime <= 0) {
      return <span className="text-sm text-red-500 font-medium">Expired</span>;
    }
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return <span className="text-sm text-gray-500">Expires in {diffDays} {diffDays === 1 ? 'day' : 'days'}</span>;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Incidents and Reports</h1>
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="keyword"
            placeholder="Search by keyword..."
            value={filters.keyword}
            onChange={handleFilterChange}
            className="p-2 border rounded-md"
          />
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="p-2 border rounded-md"
          >
            <option value="">All Categories</option>
            <option value="accident">Accident</option>
            <option value="congestion">Congestion</option>
            <option value="flood">Flood</option>
            <option value="event">Event</option>
          </select>
          <select
            name="severity"
            value={filters.severity}
            onChange={handleFilterChange}
            className="p-2 border rounded-md"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select
            name="timeWindow"
            value={filters.timeWindow}
            onChange={handleFilterChange}
            className="p-2 border rounded-md"
          >
            <option value="">All Time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div key={report._id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold capitalize">{report.type}</h2>
                {formatValidity(report.expiresAt)}
              </div>
              <p className="text-gray-600 capitalize">Severity: {report.severity}</p>
              <p className="text-gray-800 mt-2">{report.description}</p>
              <p className="text-sm text-gray-500 mt-4">
                Reported by: {report.reportedBy}
              </p>
              <p className="text-sm text-gray-500">
                Date: {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Incidents;
