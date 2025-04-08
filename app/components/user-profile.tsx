import React from 'react';
import styled from 'styled-components';
import { useUser } from '../context/UserContext';
import { UserButton } from '@clerk/clerk-react';

interface Profile {
  created_at: string;
  spreadsheet_count?: number;
}

interface User {
  id: string;
  fullName?: string;
  primaryEmailAddress?: {
    emailAddress: string;
  };
}

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  isLoaded: boolean;
}

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.base};
  box-shadow: ${({ theme }) => theme.shadows.small};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  width: 100%;
`;

const ProfileInfo = styled.div`
  margin-left: ${({ theme }) => theme.spacing.base};
`;

const ProfileName = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.h2};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const ProfileEmail = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  color: ${({ theme }) => theme.colors.muted};
  margin: ${({ theme }) => theme.spacing.xs} 0 0;
`;

const ProfileDetails = styled.div`
  width: 100%;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.base} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  color: ${({ theme }) => theme.colors.muted};
`;

const DetailValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const UserProfile: React.FC = () => {
  const { user, profile, isLoaded } = useUser() as UserContextType;

  if (!isLoaded) {
    return <div>Loading profile...</div>;
  }

  if (!user) {
    return <div>Please sign in to view your profile</div>;
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <UserButton />
        <ProfileInfo>
          <ProfileName>{user.fullName || 'User'}</ProfileName>
          <ProfileEmail>{user.primaryEmailAddress?.emailAddress}</ProfileEmail>
        </ProfileInfo>
      </ProfileHeader>
      
      <ProfileDetails>
        <DetailItem>
          <DetailLabel>User ID</DetailLabel>
          <DetailValue>{user.id}</DetailValue>
        </DetailItem>
        {profile && (
          <>
            <DetailItem>
              <DetailLabel>Member Since</DetailLabel>
              <DetailValue>
                {new Date(profile.created_at).toLocaleDateString()}
              </DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Spreadsheets</DetailLabel>
              <DetailValue>
                {profile.spreadsheet_count || 0}
              </DetailValue>
            </DetailItem>
          </>
        )}
      </ProfileDetails>
    </ProfileContainer>
  );
}; 