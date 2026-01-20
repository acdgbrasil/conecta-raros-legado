export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    roleId: string;
    permissions: string[];
    isActive: boolean;
    requiresReset: boolean;
  };
}