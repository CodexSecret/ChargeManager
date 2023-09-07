import { useState, useEffect } from 'react';

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Implement the logic to check if the user is logged in.
    // For example, you can check the presence of the JWT token in local storage or a cookie.

    const accessToken = localStorage.getItem('accessToken'); // Assuming you store the JWT token in localStorage

    if (accessToken) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  return isLoggedIn;
};

export default useAuth;
