import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("ddc_user_email").then(async (email) => {
      if (email) {
        try {
          const userData = await api.getMe(email);
          setUser(userData);
        } catch {
          // Session expired or user deleted
          await AsyncStorage.removeItem("ddc_user_email");
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    AsyncStorage.setItem("ddc_user_email", userData.email);
  };

  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem("ddc_user_email");
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
