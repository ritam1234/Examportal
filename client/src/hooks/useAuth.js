import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined || context === null) { // Added null check
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default useAuth;