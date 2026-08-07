export type TenantRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'VIEWER';

export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface BaseOrganization {
  id: string;
  name: string;
  slug: string;
}
