import React from 'react';
import LoginForm from '../components/Forms/LoginForm';

const LoginPage = ({ onLogin, loading, onSwitchToRegister }) => {
  return (
    <LoginForm
      onLogin={onLogin}
      loading={loading}
      onSwitchToRegister={onSwitchToRegister}
    />
  );
};

export default LoginPage;