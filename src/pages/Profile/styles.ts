import styled from 'styled-components/native';
import { Platform } from 'react-native';

export const Container = styled.ScrollView`
  flex: 1;
  padding: 0 30px ${Platform.OS === 'android' ? 150 : 40}px;
`;

export const Title = styled.Text`
  font-size: 20px;
  color: #f4ede8;
  font-family: 'RobotoSlab-Medium';
  margin: 24px 0;
`;

export const UserAvatar = styled.Image`
  width: 186px;
  height: 186px;
  border-radius: 93px;
  align-self: center;
`;

export const UserAvatarButton = styled.TouchableOpacity`
  margin-top: 24px;
`;

export const BackButton = styled.TouchableOpacity`
  margin-top: 32px;
`;

export const Space = styled.View`
  margin-bottom: 16px;
`;
