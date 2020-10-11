import React, { useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import ImagePicker from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import getValidationErrors from '../../utils/getValidationErros';
import api from '../../services/api';
import { useAuth } from '../../contexts/auth';

import Input from '../../components/Input';
import Button from '../../components/Button';

import {
  Container,
  Title,
  UserAvatarButton,
  UserAvatar,
  Space,
  BackButton,
} from './styles';

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  old_password: string;
}

const Profile: React.FC = () => {
  const navigation = useNavigation();
  const { user, updateUser } = useAuth();
  const formRef = useRef<FormHandles>(null);
  const passwordRef = useRef<TextInput>(null);
  const oldPasswordRef = useRef<TextInput>(null);
  const passwordConfirmationRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const handleSubmit = useCallback(
    async (data: FormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .email('Digite um email válido')
            .required('Email obrigatório'),
          password: Yup.string(),
          password_confirmation: Yup.string().oneOf(
            [Yup.ref('password')],
            'Senhas devem ser iguais'
          ),
          old_password: Yup.string().when('password', {
            is: (val) => !!val.lenght,
            then: Yup.string().required('Senha obrigatória'),
          }),
        });
        await schema.validate(data, {
          abortEarly: false,
        });

        const formData = Object.assign(
          {
            name: data.name,
            email: data.email,
          },
          data.password
            ? {
                password: data.password,
                password_confirmation: data.password_confirmation,
                old_password: data.old_password,
              }
            : {}
        );

        const response = await api.put('/profile', formData);

        await updateUser(response.data);

        Alert.alert(
          'Perfil atualizado com sucesso',
          'Suas informações do perfil foram atualizadas com sucesso'
        );

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);
          return;
        }

        Alert.alert(
          'Erro ao atualizar perfil',
          'Ocorreu um erro na atualização de perfil, verifique seus dados e tente novamente'
        );
      }
    },
    [updateUser, navigation]
  );

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Selecione uma foto de perfil',
        cancelButtonTitle: 'Cancelar',
        takePhotoButtonTitle: 'Usar câmera',
        chooseFromLibraryButtonTitle: 'Escolher da galeria',
      },
      (response) => {
        if (response.didCancel) {
          return;
        }

        if (response.error) {
          Alert.alert(
            'Erro ao atualizar perfil',
            'Ocorreu um erro ao atualizar seu avatar'
          );

          console.log(response.error);
          return;
        }

        const data = new FormData();

        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user?.id}.jpg`,
          uri: response.uri,
        });

        api.patch('/users/avatar', data).then((apiResponse) => {
          updateUser(apiResponse.data);
        });
      }
    );
  }, [updateUser, user]);

  const handleBackButton = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled>
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled">
          <Container>
            <BackButton onPress={handleBackButton}>
              <Icon name="chevron-left" color="#999591" size={24} />
            </BackButton>

            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar source={{ uri: user?.avatar_url }} />
            </UserAvatarButton>

            <View>
              <Title>Meu Perfil</Title>
            </View>

            <Form
              style={{ width: '100%' }}
              ref={formRef}
              initialData={{
                name: user?.name,
                email: user?.email,
              }}
              onSubmit={handleSubmit}>
              <Input
                autoCapitalize="words"
                name="name"
                icon="user"
                placeholder="Nome"
                returnKeyType="next"
                onSubmitEditing={() => {
                  emailRef.current?.focus();
                }}
              />
              <Input
                ref={emailRef}
                autoCorrect={false}
                autoCapitalize="none"
                keyboardType="email-address"
                name="email"
                icon="mail"
                placeholder="E-mail"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordRef.current?.focus();
                }}
              />

              <Space />
              <Input
                ref={passwordRef}
                name="password"
                icon="lock"
                placeholder="Nova senha"
                secureTextEntry
                returnKeyType="next"
                textContentType="newPassword"
                onSubmitEditing={() => {
                  passwordConfirmationRef.current?.focus();
                }}
              />

              <Input
                ref={passwordConfirmationRef}
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar nova senha"
                secureTextEntry
                returnKeyType="next"
                textContentType="newPassword"
                onSubmitEditing={() => {
                  oldPasswordRef.current?.focus();
                }}
              />

              <Input
                ref={oldPasswordRef}
                name="old_password"
                icon="lock"
                placeholder="Senha atual"
                secureTextEntry
                returnKeyType="send"
                textContentType="newPassword"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />

              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}>
                Confirmar mundanças
              </Button>

              <Space />
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
