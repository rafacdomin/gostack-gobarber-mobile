import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { format, isToday } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Icon from 'react-native-vector-icons/Feather';

import {
  Container,
  Title,
  Description,
  OkButton,
  OkButtonText,
} from './styles';

interface RouteParams {
  date: number;
}

const AppointmentCreated: React.FC = () => {
  const navigation = useNavigation();
  const { date } = useRoute().params as RouteParams;

  const handleOk = useCallback(() => {
    navigation.reset({
      routes: [{ name: 'Dashboard' }],
      index: 0,
    });
  }, [navigation]);

  const formattedSelectDate = useMemo(() => {
    const dateToFormat = new Date(date);

    return format(
      dateToFormat,
      `'${
        isToday(dateToFormat) ? ' Hoje, ' : ' '
      }'EEEE',' 'dia' dd 'de' MMMM 'de' yyyy 'às' HH:mm'h'`,
      {
        locale: ptBR,
      }
    );
  }, [date]);

  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />

      <Title>Agendamento concluído</Title>
      <Description>{formattedSelectDate}</Description>

      <OkButton onPress={handleOk}>
        <OkButtonText>Ok</OkButtonText>
      </OkButton>
    </Container>
  );
};

export default AppointmentCreated;
