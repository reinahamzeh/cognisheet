import React from 'react';
import styled from 'styled-components';
import { useUser } from '../context/UserContext';
import { UserButton } from '@clerk/clerk-react';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  width: 100%;
`;

const ProfileInfo = styled.div`
  margin-left: 1rem;
`;

const ProfileName = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.darkGrey};
`;

const ProfileEmail = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.grey};
  margin: 0.25rem 0 0;
`;

const ProfileDetails = styled.div`
  width: 100%;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGrey};
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.grey};
`;

const DetailValue = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.darkGrey};
  font-weight: 500;
`;

const UserProfile = () => {
  const { user, profile, isLoaded } = useUser();

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

export default UserProfile; 