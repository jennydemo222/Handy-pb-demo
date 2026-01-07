import PocketBase from 'pocketbase';

// Initialize PocketBase client
// Replace with your actual PocketBase server URL
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Custom error types for better error handling
export class LoginError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'LoginError';
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  token?: string;
  error?: LoginError;
}

/**
 * Login function with comprehensive error handling
 * @param credentials - User email and password
 * @returns LoginResult with success status and user data or error details
 */
export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    // Validate input
    if (!credentials.email || !credentials.email.trim()) {
      throw new LoginError(
        'Email is required',
        'VALIDATION_ERROR'
      );
    }

    if (!credentials.password || !credentials.password.trim()) {
      throw new LoginError(
        'Password is required',
        'VALIDATION_ERROR'
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new LoginError(
        'Please enter a valid email address',
        'VALIDATION_ERROR'
      );
    }

    // Attempt authentication
    const authData = await pb.collection('users').authWithPassword(
      credentials.email,
      credentials.password
    );

    // Return success result
    return {
      success: true,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name || undefined,
      },
      token: authData.token,
    };
  } catch (error: unknown) {
    // Handle PocketBase specific errors
    if (error && typeof error === 'object' && 'status' in error) {
      const pbError = error as { status: number; data?: { message?: string } };
      
      switch (pbError.status) {
        case 400:
          return {
            success: false,
            error: new LoginError(
              pbError.data?.message || 'Invalid email or password',
              'INVALID_CREDENTIALS',
              error
            ),
          };
        
        case 401:
          return {
            success: false,
            error: new LoginError(
              'Invalid email or password',
              'UNAUTHORIZED',
              error
            ),
          };
        
        case 403:
          return {
            success: false,
            error: new LoginError(
              'Your account has been disabled. Please contact support.',
              'ACCOUNT_DISABLED',
              error
            ),
          };
        
        case 429:
          return {
            success: false,
            error: new LoginError(
              'Too many login attempts. Please try again later.',
              'RATE_LIMITED',
              error
            ),
          };
        
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            success: false,
            error: new LoginError(
              'Server error. Please try again later.',
              'SERVER_ERROR',
              error
            ),
          };
        
        default:
          return {
            success: false,
            error: new LoginError(
              'An unexpected error occurred. Please try again.',
              'UNKNOWN_ERROR',
              error
            ),
          };
      }
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: new LoginError(
          'Network error. Please check your internet connection.',
          'NETWORK_ERROR',
          error
        ),
      };
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: new LoginError(
          'Request timeout. Please try again.',
          'TIMEOUT_ERROR',
          error
        ),
      };
    }

    // Handle validation errors thrown earlier
    if (error instanceof LoginError) {
      return {
        success: false,
        error,
      };
    }

    // Handle any other unexpected errors
    return {
      success: false,
      error: new LoginError(
        'An unexpected error occurred. Please try again.',
        'UNKNOWN_ERROR',
        error
      ),
    };
  }
}

/**
 * Logout the current user
 */
export function logout(): void {
  pb.authStore.clear();
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  return pb.authStore.isValid;
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser() {
  return pb.authStore.model;
}

export default pb;
