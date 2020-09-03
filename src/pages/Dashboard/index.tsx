import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../../contexts/auth';
import Button from '../../components/Button';

// import { Container } from './styles';

const Dashboard: React.FC = () => {
  const { Logout } = useAuth();

  return (
    <View>
      <Button onPress={Logout}>Sair</Button>
    </View>
  );
};

export default Dashboard;
