export type AuthenticatedUser = {
  id: string;
  email: string;
  role: 'TEACHER' | 'SUPER_ADMIN';
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
