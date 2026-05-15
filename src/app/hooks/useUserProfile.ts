import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export interface UserProfileData {
  firstName: string;
  lastName: string;
  mobile: string;
  avatarUrl: string | null;
  initials: string;
}

const API_URL = 'http://185.222.163.113:7000/api/user/profile';

function parseUserProfile(user: Record<string, unknown>): UserProfileData {
  const firstName =
    (user.first_name as string) ||
    (user.firstName as string) ||
    (user.name as string)?.split(' ')[0] ||
    '';
  const lastName =
    (user.last_name as string) ||
    (user.lastName as string) ||
    (user.name as string)?.split(' ').slice(1).join(' ') ||
    '';
  const mobile =
    (user.phone as string) ||
    (user.mobile as string) ||
    (user.phone_number as string) ||
    '';

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.trim() ||
    (user.name as string)?.charAt(0) ||
    '؟';

  return {
    firstName,
    lastName,
    mobile,
    avatarUrl:
      (user.avatar_url as string) ||
      (user.avatar as string) ||
      (user.image_url as string) ||
      null,
    initials: initials.toUpperCase(),
  };
}

export function useUserProfile(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!accessToken) {
      setProfile(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      if (data.success && data.data?.user) {
        setProfile(parseUserProfile(data.data.user));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (enabled) {
      fetchProfile();
    }
  }, [enabled, fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}
