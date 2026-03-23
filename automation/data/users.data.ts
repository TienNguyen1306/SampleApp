export interface MockLoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  };
}

export interface UserCredentials {
  username: string;
  password: string;
  expectedName: string;
  description: string;
  mockResponse: MockLoginResponse;
}

export const validUsers: UserCredentials[] = [
  {
    username: 'admin',
    password: 'password123',
    expectedName: 'Admin User',
    description: 'admin account',
    mockResponse: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MzI4NDAwNywiZXhwIjoxNzczODg4ODA3fQ.BQ7Jv5xKfelseHdrcCHzeFtnhN5o0CpCJwqKWJGJcDg',
      user: { id: 1, username: 'admin', name: 'Admin User', role: 'admin' },
    },
  },
  {
    username: 'user',
    password: '123456',
    expectedName: 'Nguyễn Văn A',
    description: 'regular user account',
    mockResponse: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NzMyODQwMDcsImV4cCI6MTc3Mzg4ODgwN30.mocktoken',
      user: { id: 2, username: 'user', name: 'Nguyễn Văn A', role: 'user' },
    },
  },
];

export const invalidUsers = [
  {
    username: 'admin',
    password: 'wrongpassword',
    description: 'wrong password',
  },
  {
    username: 'unknown',
    password: 'password123',
    description: 'non-existent user',
  },
  {
    username: '',
    password: '',
    description: 'empty credentials',
  },
];
