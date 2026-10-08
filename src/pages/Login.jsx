import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import TextButton from '../components/common/TextButton';
import { ROUTES } from '../constants/config';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
    login({ username: formData.username });
    navigate(ROUTES.DASHBOARD || '/');
  };

  return (
    <AuthLayout 
      title="Login" 
      subtitle="Welcome to log in to your background management system."
      logoText="FormNEST"
      imagePosition="left"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input 
          label="Email"
          id="username"
          name="username" 
          placeholder="1185780732@qq.com" 
          value={formData.username}
          onChange={handleChange}
          required
        />
        
        <Input 
          label="Password"
          type="password" 
          id="password"
          name="password" 
          placeholder="Please enter your password" 
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <div className="pt-6">
          <Button type="submit" className="w-full">LOGIN</Button>
        </div>
      </form>
      
      <div className="mt-3 text-left">
        <TextButton to={ROUTES.SIGNUP || '/signup'}>Create an account</TextButton>
      </div>
    </AuthLayout>
  );
};

export default Login;
