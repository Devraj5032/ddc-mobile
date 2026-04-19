import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { api } from "../services/api";
import { setAuthToken } from "../services/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User, token: string) => void;
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
    AsyncStorage.getItem("ddc_auth_token").then(async (token) => {
      if (token) {
        setAuthToken(token);
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          // Token expired or invalid
          setAuthToken(null);
          await AsyncStorage.removeItem("ddc_auth_token");
        }
      }
      setIsLoading(false);
    });
  }, []);

  const login = (userData: User, token: string) => {
    setAuthToken(token);
    setUser(userData);
    AsyncStorage.setItem("ddc_auth_token", token);
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    AsyncStorage.removeItem("ddc_auth_token");
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
