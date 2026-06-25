import { SignIn } from '@clerk/clerk-react';
import './Login.css';

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-card login-card--clerk">
        <div className="login-card__logo">
          <div className="login-card__logo-circle">
            <img src="/logo-mark.webp" alt="Siri Traders" className="login-card__logo-img" />
          </div>
        </div>
        <div className="login-card__header">
          <h2 className="login-card__title">Welcome Back</h2>
          <p className="login-card__subtitle">Sign in to your Siri Traders account</p>
        </div>
        <SignIn
          signUpUrl="/signup"
          forceRedirectUrl="/home"
          appearance={{
            variables: {
              colorPrimary: '#2D5016',
              colorBackground: '#ffffff',
              colorText: '#1c1c1c',
              colorTextSecondary: '#687466',
              colorInputBackground: '#F7F4EE',
              colorInputText: '#1c1c1c',
              borderRadius: '10px',
              fontFamily: 'Poppins, sans-serif',
            },
            elements: {
              card: { boxShadow: 'none', padding: 0, background: 'transparent' },
              headerTitle: { display: 'none' },
              headerSubtitle: { display: 'none' },
              socialButtonsBlockButton: {
                border: '1.5px solid rgba(45,80,22,0.2)',
                borderRadius: '10px',
                fontWeight: '700',
              },
              formButtonPrimary: {
                background: '#2D5016',
                color: '#ffffff',
                fontWeight: '800',
                borderRadius: '10px',
                height: '48px',
              },
              footerActionLink: { color: '#B08D57', fontWeight: '700' },
              formFieldInput: {
                borderColor: 'rgba(45,80,22,0.2)',
                background: '#F7F4EE',
                borderRadius: '10px',
              },
            }
          }}
        />
      </div>
    </div>
  );
};

export default Login;
