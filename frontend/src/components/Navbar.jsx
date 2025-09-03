import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Settings, 
  Shield, 
  ShieldAlert,
  LogOut, 
  Menu, 
  X,
  Home,
  FileCheck,
  Users,
  UserCog,
  Megaphone,
  Activity,
  MapPin
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isModerator } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Incidents', path: '/incidents', icon: Megaphone },
    { name: 'Map', path: '/map', icon: MapPin },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: Shield },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Report Management', path: '/admin/reports', icon: ShieldAlert },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary nav */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CB</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 font-poppins">
                Commute Buddy
              </span>
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActivePath(item.path)
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Admin navigation */}
              {(isAdmin || isModerator) && (
                <>
                  <div className="border-l border-gray-200 mx-2"></div>
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                          isActivePath(item.path)
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.name}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <span className="ml-2 text-gray-700 font-medium hidden sm:block">
                  {user?.name}
                </span>
              </button>

              {/* Profile dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-gray-500">{user?.email}</p>
                    <p className="text-xs text-primary-600 capitalize">{user?.role}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                  
                  <Link
                    to="/activity-history"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Activity History
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                      isActivePath(item.path)
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
              
              {/* Admin mobile navigation */}
              {(isAdmin || isModerator) && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  {adminNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                          isActivePath(item.path)
                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="flex items-center">
                          <Icon className="w-4 h-4 mr-2" />
                          {item.name}
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isProfileMenuOpen || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setIsProfileMenuOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;
