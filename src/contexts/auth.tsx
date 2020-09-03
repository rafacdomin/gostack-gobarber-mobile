import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface AuthContextData {
  user: object | null;
  loading: boolean;
  Login(userData: Request): Promise<void>;
  Logout(): void;
}

interface Request {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoragedData() {
      const [storagedUser, storagedToken] = await AsyncStorage.multiGet([
        '@GoBarber:user',
        '@GoBarber:token',
      ]);

      if (storagedUser[1] && storagedToken[1]) {
        api.defaults.headers.Authorization = `Bearer ${storagedToken[1]}`;
        setUser(JSON.parse(storagedUser[1]));
      }

      setLoading(false);
    }
    loadStoragedData();
  }, []);

  const Login = useCallback(async ({ email, password }: Request) => {
    const { data } = await api.post('/sessions', {
      email,
      password,
    });

    setUser(data.user);
    api.defaults.headers.Authorization = `Bearer ${data.token}`;

    await AsyncStorage.multiSet([
      ['@GoBarber:user', JSON.stringify(data.user)],
      ['@GoBarber:token', data.token],
    ]);
  }, []);

  const Logout = useCallback(async () => {
    setUser(null);
    api.defaults.headers.Authorization = '';

    await AsyncStorage.multiRemove(['@GoBarber:user', '@GoBarber:token']);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user: user, loading: loading, Login, Logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}
