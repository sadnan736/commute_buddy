import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { profileService } from '../services/api';
import { User, Mail, MapPin, FileText, Camera } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: '',
    homeLocation: '',
    workLocation: '',
    preferredRegions: '',
    followedRoutes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || '',
        homeLocation: user.homeLocation || '',
        workLocation: user.workLocation || '',
        preferredRegions: user.preferredRegions?.join(', ') || '',
        followedRoutes: user.followedRoutes?.join(', ') || ''
      });
      calculateProfileCompletion(user);
      setIsLoading(false);
    }
  }, [user]);

  const calculateProfileCompletion = (userData) => {
    let completion = 0;
    const fields = [
      'avatar',
      'homeLocation',
      'workLocation',
      'preferredRegions',
      'followedRoutes'
    ];
    const totalFields = fields.length;
    let completedFields = 0;

    fields.forEach(field => {
        if (userData[field] && userData[field].length > 0) {
            completedFields++;
        }
    });

    completion = Math.round((completedFields / totalFields) * 100);
    setProfileCompletion(completion);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const updatedData = {
        ...formData,
        preferredRegions: formData.preferredRegions.split(',').map(item => item.trim()).filter(Boolean),
        followedRoutes: formData.followedRoutes.split(',').map(item => item.trim()).filter(Boolean)
      };
      
      const response = await profileService.update(user._id, updatedData);
      
      if (response.user) {
        setUser(response.user);
        calculateProfileCompletion(response.user);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.error || 'Failed to update profile.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <img
                  src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`}
                  alt="Avatar"
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary-200"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-800 font-poppins">{formData.name}</h1>
                <p className="text-md text-gray-500">{formData.email}</p>
              </div>
              <div className="w-full sm:w-auto sm:ml-auto">
                <div className="text-center">
                    <div className="text-lg font-semibold text-primary-600">{profileCompletion}%</div>
                    <div className="text-sm text-gray-500">Profile Completed</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                    </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" name="email" id="email" value={formData.email} disabled className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-gray-100 cursor-not-allowed" />
                  </div>
                </div>

                {/* Avatar URL */}
                <div className="md:col-span-2">
                  <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="url" name="avatar" id="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://example.com/avatar.jpg" className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                </div>

                {/* Home Location */}
                <div>
                  <label htmlFor="homeLocation" className="block text-sm font-medium text-gray-700 mb-2">Home Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="homeLocation" id="homeLocation" value={formData.homeLocation} onChange={handleChange} placeholder="e.g., Dhaka" className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                </div>
                
                {/* Work Location */}
                <div>
                  <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700 mb-2">Work Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="workLocation" id="workLocation" value={formData.workLocation} onChange={handleChange} placeholder="e.g., Gulshan" className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                </div>

                {/* Preferred Regions */}
                <div>
                  <label htmlFor="preferredRegions" className="block text-sm font-medium text-gray-700 mb-2">Preferred Regions</label>
                   <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="preferredRegions" id="preferredRegions" value={formData.preferredRegions} onChange={handleChange} placeholder="e.g., Dhaka, Chittagong" className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Separate multiple regions with commas</p>
                </div>

                {/* Followed Routes */}
                <div>
                  <label htmlFor="followedRoutes" className="block text-sm font-medium text-gray-700 mb-2">Followed Routes</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="text" name="followedRoutes" id="followedRoutes" value={formData.followedRoutes} onChange={handleChange} placeholder="e.g., Route1, Route2" className="pl-10 w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Separate multiple routes with commas</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400"
                >
                  {isUpdating ? <><LoadingSpinner size="small" /> <span className="ml-2">Updating...</span></> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
