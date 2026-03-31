import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import LoginView from './LoginView.svelte';

// Mock Gun.js
vi.mock('gun', () => {
  const mockUser = {
    auth: vi.fn((username, password, callback) => {
      if (username === 'testuser' && password === 'testpassword') {
        callback({ pub: 'test-pub-key' });
      } else {
        callback({ err: 'Invalid credentials' });
      }
    }),
    create: vi.fn((username, password, callback) => {
      if (username === 'newuser' && password === 'newpassword') {
        callback({ pub: 'new-pub-key' });
      } else {
        callback({ err: 'Username already exists' });
      }
    })
  };

  const mockGun = vi.fn(() => {
    return {
      user: vi.fn(() => mockUser)
    };
  });

  // For ESM compatibility
  return {
    default: mockGun
  };
});

describe('LoginView', () => {
  const mockOnLogin = vi.fn();
  const defaultProps = {
    onLogin: mockOnLogin,
    language: '简体中文',
    primaryColor: '#2563eb'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form by default', () => {
    render(LoginView, defaultProps);
    expect(screen.getByText('登录')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
  });

  it('should switch to register mode when clicking "还没有账号？"', async () => {
    render(LoginView, defaultProps);
    const switchButton = screen.getByText('还没有账号？');
    await fireEvent.click(switchButton);
    expect(screen.getByText('注册')).toBeInTheDocument();
  });

  it('should switch back to login mode when clicking "返回登录"', async () => {
    render(LoginView, defaultProps);
    // First switch to register mode
    const switchToRegister = screen.getByText('还没有账号？');
    await fireEvent.click(switchToRegister);
    
    // Then switch back to login mode
    const switchToLogin = screen.getByText('返回登录');
    await fireEvent.click(switchToLogin);
    expect(screen.getByText('登录')).toBeInTheDocument();
  });

  it('should update username and password when typing', async () => {
    render(LoginView, defaultProps);
    const usernameInput = screen.getByPlaceholderText('请输入用户名');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    
    await fireEvent.input(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.input(passwordInput, { target: { value: 'testpassword' } });
    
    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpassword');
  });

  it('should call onLogin when login is successful', async () => {
    render(LoginView, defaultProps);
    const usernameInput = screen.getByPlaceholderText('请输入用户名');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const loginButton = screen.getByRole('button', { name: '登录' });
    
    await fireEvent.input(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.input(passwordInput, { target: { value: 'testpassword' } });
    await fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({ name: 'testuser', pub: 'test-pub-key' });
    });
  });

  it('should display error message when login fails', async () => {
    render(LoginView, defaultProps);
    const usernameInput = screen.getByPlaceholderText('请输入用户名');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const loginButton = screen.getByRole('button', { name: '登录' });
    
    await fireEvent.input(usernameInput, { target: { value: 'wronguser' } });
    await fireEvent.input(passwordInput, { target: { value: 'wrongpassword' } });
    await fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/登录失败/)).toBeInTheDocument();
    });
  });

  it('should display loading state when submitting', async () => {
    render(LoginView, defaultProps);
    const usernameInput = screen.getByPlaceholderText('请输入用户名');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const loginButton = screen.getByRole('button', { name: '登录' });
    
    await fireEvent.input(usernameInput, { target: { value: 'testuser' } });
    await fireEvent.input(passwordInput, { target: { value: 'testpassword' } });
    
    // Mock a delayed response to test loading state
    const originalAuth = require('gun').mock?.user?.auth;
    require('gun').mock.user.auth = vi.fn((username, password, callback) => {
      setTimeout(() => callback({ pub: 'test-pub-key' }), 100);
    });
    
    await fireEvent.click(loginButton);
    
    // Check if button is disabled during loading
    expect(loginButton).toBeDisabled();
    
    // Restore original mock
    require('gun').mock.user.auth = originalAuth;
  });

  it('should call onLogin when registration is successful', async () => {
    render(LoginView, defaultProps);
    
    // Switch to register mode
    const switchToRegister = screen.getByText('还没有账号？');
    await fireEvent.click(switchToRegister);
    
    const usernameInput = screen.getByPlaceholderText('请输入用户名');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const registerButton = screen.getByRole('button', { name: '注册' });
    
    await fireEvent.input(usernameInput, { target: { value: 'newuser' } });
    await fireEvent.input(passwordInput, { target: { value: 'newpassword' } });
    await fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({ name: 'newuser', pub: 'new-pub-key' });
    });
  });
});
