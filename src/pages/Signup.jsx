import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/common/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import TextButton from '../components/common/TextButton';
import { ROUTES } from '../constants/config';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Signup data:', formData);
    navigate(ROUTES.LOGIN);
  };

  return (
    <AuthLayout 
      title="Signup" 
      subtitle="Create your account to start managing your data."
      logoText="FormNEST"
      imagePosition="right"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <Input 
            label="First Name"
            id="firstName"
            name="firstName" 
            placeholder="John" 
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input 
            label="Last Name"
            id="lastName"
            name="lastName" 
            placeholder="Doe" 
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        <Input 
          label="Mobile Number"
          type="tel" 
          id="mobile"
          name="mobile" 
          placeholder="+1 (555) 000-0000" 
          value={formData.mobile}
          onChange={handleChange}
          required
        />
        
        <Input 
          label="Email Address"
          type="email" 
          id="email"
          name="email" 
          placeholder="john@example.com" 
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <Input 
            label="Password"
            type="password" 
            id="password"
            name="password" 
            placeholder="••••••••" 
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Input 
            label="Confirm Password"
            type="password" 
            id="confirmPassword"
            name="confirmPassword" 
            placeholder="••••••••" 
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="pt-4">
          <Button type="submit" className="w-full">SIGNUP</Button>
        </div>
      </form>
      
      <div className="mt-3 text-left">
        <span className="text-[11px] text-gray-400">Already have an account? </span>
        <TextButton to={ROUTES.LOGIN}>Log in</TextButton>
      </div>
    </AuthLayout>
  );
};

export default Signup;
