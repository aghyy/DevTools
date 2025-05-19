export interface UserData {
  id?: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: 'public' | 'private' | 'connections';
  showEmail: boolean;
  showActivity: boolean;
}
