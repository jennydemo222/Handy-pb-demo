# PocketBase Login Implementation

This directory contains a complete login implementation with comprehensive error handling for PocketBase authentication.

## Files

### `src/lib/pocketbase.ts`
Core PocketBase service with:
- **Login function** with comprehensive error handling
- Error categorization (validation, network, auth, server errors)
- Helper functions (logout, isAuthenticated, getCurrentUser)
- Custom `LoginError` class for structured error handling

### `src/components/Login.tsx`
Login UI component with:
- Form validation
- Error display
- Loading states
- Accessibility features

## Error Handling

The login function handles the following error scenarios:

### Validation Errors
- Empty email or password
- Invalid email format

### Authentication Errors
- **400/401**: Invalid credentials
- **403**: Account disabled
- **429**: Rate limited (too many attempts)

### Network Errors
- Connection failures
- Timeout errors
- Server errors (500, 502, 503, 504)

### Generic Errors
- Unexpected errors with fallback messages

## Usage

### Basic Login
```typescript
import { login } from './lib/pocketbase';

const result = await login({
  email: 'user@example.com',
  password: 'password123'
});

if (result.success) {
  console.log('Logged in:', result.user);
} else {
  console.error('Login failed:', result.error?.message);
}
```

### Using the Login Component
```typescript
import { Login } from './components/Login';

function App() {
  return (
    <Login
      onSuccess={(result) => {
        console.log('User logged in:', result.user);
        // Navigate to dashboard, etc.
      }}
    />
  );
}
```

## Configuration

1. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Update `VITE_POCKETBASE_URL` with your PocketBase server URL:
   ```
   VITE_POCKETBASE_URL=https://your-pocketbase-server.com
   ```

## Testing Error Scenarios

To test different error scenarios:

1. **Validation Errors**: Submit empty fields or invalid email
2. **Invalid Credentials**: Use incorrect email/password
3. **Network Error**: Set incorrect PocketBase URL or disconnect internet
4. **Rate Limiting**: Submit multiple login attempts rapidly
5. **Server Error**: Stop PocketBase server while testing

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `UNAUTHORIZED` | Authentication failed |
| `ACCOUNT_DISABLED` | User account is disabled |
| `RATE_LIMITED` | Too many login attempts |
| `NETWORK_ERROR` | Network connection issue |
| `TIMEOUT_ERROR` | Request timed out |
| `SERVER_ERROR` | Server-side error |
| `UNKNOWN_ERROR` | Unexpected error |

## Security Notes

- Passwords are never logged or stored in plain text
- Error messages are user-friendly but don't reveal sensitive information
- Rate limiting protection is handled server-side
- Session tokens are managed securely by PocketBase SDK
