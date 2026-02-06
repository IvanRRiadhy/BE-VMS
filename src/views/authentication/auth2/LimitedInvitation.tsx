import { ArrowLeftSharp } from '@mui/icons-material';
import { Box } from '@mui/system';
import { IconArrowNarrowLeft } from '@tabler/icons-react';
import React from 'react';
import { Link } from 'react-router';
import Logo from 'src/assets/images/logos/bi_pic.png';
import PageContainer from 'src/components/container/PageContainer';

const LimitedInvitation = () => {
  return (
    <PageContainer title="Limited Invitation Page" description="this is Login page">
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f7fa',
          padding: 16,
        }}
      >
        <div
          style={{
            maxWidth: 600,
            width: '100%',
            background: '#fff',
            padding: 40,
            borderRadius: 12,
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" mb={0}>
            <img src={Logo} width={250} height={80} />
          </Box>
          <h1 style={{ marginBottom: '10px' }}>Limited Invitation</h1>
          <p style={{ color: '#555', marginBottom: 24 }}>
            Sorry, the guest registration link has reached its limit.
          </p>
          <p style={{ color: '#777', fontSize: 14 }}>
            Please contact the person or organization who invited you for further assistance.
          </p>
          <Link
            to="/auth/login"
            style={{
              display: 'flex',
              marginTop: 24,
              color: 'gray',
              opacity: '0.9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconArrowNarrowLeft />
            Back to login
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default LimitedInvitation;
