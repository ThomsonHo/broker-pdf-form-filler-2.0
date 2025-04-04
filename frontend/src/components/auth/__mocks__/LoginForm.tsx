import React from 'react';

const LoginForm = () => {
  return (
    <form>
      <input type="email" aria-label="email" />
      <input type="password" aria-label="password" />
      <button type="submit">Sign In</button>
    </form>
  );
};

export default LoginForm; 