import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface UserProps {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface AuthContextData {
  user: UserProps | null;
  loading: boolean;
  Login(userData: Request): Promise<void>;
  updateUser(userData: UserProps): Promise<void>;
  Logout(): void;
}

interface Request {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<UserProps | null>(null);
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

  const updateUser = useCallback(async (data: UserProps) => {
    setUser(data);

    await AsyncStorage.setItem('@GoBarber:user', JSON.stringify(data));
  }, []);

  const Logout = useCallback(async () => {
    setUser(null);
    api.defaults.headers.Authorization = '';

    await AsyncStorage.multiRemove(['@GoBarber:user', '@GoBarber:token']);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user: user, loading: loading, Login, Logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  return context;
}
