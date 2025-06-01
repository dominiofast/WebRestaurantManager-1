import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user data
    const userData = localStorage.getItem('restaurantUser');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.isAuthenticated) {
          setUser(parsedUser);
        }
      } catch (error) {
        localStorage.removeItem('restaurantUser');
      }
    }
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
  };
}
