/**
 * Example usage and test scenarios for the login function with error handling
 * 
 * This file demonstrates how to use the login function and shows
 * various error scenarios that are handled.
 */

import { login, logout, isAuthenticated, getCurrentUser } from '../lib/pocketbase';

/**
 * Example 1: Successful login
 */
export async function exampleSuccessfulLogin() {
  const result = await login({
    email: 'user@example.com',
    password: 'correctPassword123',
  });

  if (result.success) {
    console.log('✅ Login successful!');
    console.log('User:', result.user);
    console.log('Token:', result.token);
    
    // Check authentication status
    console.log('Is authenticated:', isAuthenticated());
    console.log('Current user:', getCurrentUser());
  }
}

/**
 * Example 2: Validation error - empty email
 */
export async function exampleEmptyEmail() {
  const result = await login({
    email: '',
    password: 'password123',
  });

  if (!result.success) {
    console.log('❌ Validation Error:', result.error?.message);
    console.log('Error code:', result.error?.code); // 'VALIDATION_ERROR'
  }
}

/**
 * Example 3: Validation error - invalid email format
 */
export async function exampleInvalidEmailFormat() {
  const result = await login({
    email: 'not-an-email',
    password: 'password123',
  });

  if (!result.success) {
    console.log('❌ Validation Error:', result.error?.message);
    console.log('Error code:', result.error?.code); // 'VALIDATION_ERROR'
  }
}

/**
 * Example 4: Invalid credentials
 */
export async function exampleInvalidCredentials() {
  const result = await login({
    email: 'user@example.com',
    password: 'wrongPassword',
  });

  if (!result.success) {
    console.log('❌ Auth Error:', result.error?.message);
    console.log('Error code:', result.error?.code); // 'INVALID_CREDENTIALS' or 'UNAUTHORIZED'
  }
}

/**
 * Example 5: Network error (server unreachable)
 * This happens when VITE_POCKETBASE_URL is incorrect or server is down
 */
export async function exampleNetworkError() {
  // Note: This will actually hit the configured PocketBase URL
  // To test network error, set VITE_POCKETBASE_URL to an invalid URL
  const result = await login({
    email: 'user@example.com',
    password: 'password123',
  });

  if (!result.success && result.error?.code === 'NETWORK_ERROR') {
    console.log('❌ Network Error:', result.error.message);
  }
}

/**
 * Example 6: Using the login result in a React component
 */
export function ExampleReactUsage() {
  const handleLogin = async (email: string, password: string) => {
    const result = await login({ email, password });

    if (result.success) {
      // Navigate to dashboard or show success message
      console.log('Redirecting to dashboard...');
      // router.push('/dashboard');
    } else {
      // Display error to user
      switch (result.error?.code) {
        case 'VALIDATION_ERROR':
          console.error('Please check your input');
          break;
        case 'INVALID_CREDENTIALS':
        case 'UNAUTHORIZED':
          console.error('Invalid email or password');
          break;
        case 'ACCOUNT_DISABLED':
          console.error('Account disabled - contact support');
          break;
        case 'RATE_LIMITED':
          console.error('Too many attempts - please wait');
          break;
        case 'NETWORK_ERROR':
          console.error('Connection failed - check internet');
          break;
        case 'TIMEOUT_ERROR':
          console.error('Request timeout - try again');
          break;
        case 'SERVER_ERROR':
          console.error('Server error - try later');
          break;
        default:
          console.error('Unexpected error');
      }
    }
  };

  return handleLogin;
}

/**
 * Example 7: Logout
 */
export function exampleLogout() {
  logout();
  console.log('✅ Logged out');
  console.log('Is authenticated:', isAuthenticated()); // false
  console.log('Current user:', getCurrentUser()); // null
}

/**
 * Test all error scenarios
 */
export async function runAllExamples() {
  console.log('=== Testing Login Error Handling ===\n');

  console.log('1. Empty email validation:');
  await exampleEmptyEmail();
  console.log('');

  console.log('2. Invalid email format:');
  await exampleInvalidEmailFormat();
  console.log('');

  console.log('3. Invalid credentials:');
  await exampleInvalidCredentials();
  console.log('');

  console.log('4. Network error test:');
  await exampleNetworkError();
  console.log('');

  console.log('5. Logout test:');
  exampleLogout();
  console.log('');

  console.log('=== All tests completed ===');
}
