import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  restaurantName?: string;
  ownerName?: string;
  role: string;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage
        const userData = localStorage.getItem('restaurantUser');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.isAuthenticated) {
            setUser(parsedUser);
            setIsLoading(false);
            return;
          }
        }

        // If no localStorage data, check server session
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          const userWithAuth = {
            ...data.user,
            ownerName: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim(),
            isAuthenticated: true
          };
          
          setUser(userWithAuth);
          localStorage.setItem('restaurantUser', JSON.stringify(userWithAuth));
        } else {
          localStorage.removeItem('restaurantUser');
        }
      } catch (error) {
        localStorage.removeItem('restaurantUser');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
  };
}
