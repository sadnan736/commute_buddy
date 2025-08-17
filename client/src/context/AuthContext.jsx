import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService, profileService } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_ERROR':
    case 'REGISTER_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (user) => {
    if (!user) return 0;
    
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
        if (user[field] && user[field].length > 0) {
            completedFields++;
        }
    });

    return Math.round((completedFields / totalFields) * 100);
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token },
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  // ... existing code ...
  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(email, password);
      const { token } = response;
      
      localStorage.setItem('token', token);
      
      // Get user profile
      const userResponse = await profileService.getProfile(
        JSON.parse(atob(token.split('.')[1])).id
      );
      
      const user = userResponse;
      
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
      
      return { success: true };
    } catch (error) {
      localStorage.removeItem('token');
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({
        type: 'LOGIN_ERROR',
        payload: errorMessage,
// ... existing code ...
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'REGISTER_START' });
    
    try {
      await authService.register(userData);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      dispatch({
        type: 'REGISTER_ERROR',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({
      type: 'UPDATE_USER',
      payload: userData,
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    profileCompletion: calculateProfileCompletion(state.user),
    isAdmin: state.user?.role === 'admin',
    isModerator: state.user?.role === 'moderator' || state.user?.role === 'admin',
    isVerifiedReporter: state.user?.role === 'verifiedReporter' || state.user?.role === 'moderator' || state.user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
