// import React from 'react';
// import RegisterForm from '../components/Forms/RegisterForm';

// const RegisterPage = ({ onRegister, loading, onSwitchToLogin }) => {
//   return (
//     <RegisterForm
//       onRegister={onRegister}
//       loading={loading}
//       onSwitchToLogin={onSwitchToLogin}
//     />
//   );
// };

// export default RegisterPage;



// src/pages/RegisterPage.jsx
import React from 'react';
import RegisterForm from '../components/Forms/RegisterForm';

const RegisterPage = ({ onRegister, loading, onSwitchToLogin }) => {
  return (
    <div className="flex flex-grow items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm
        onRegister={onRegister}
        loading={loading}
        onSwitchToLogin={onSwitchToLogin}
      />
    </div>
  );
};

export default RegisterPage;