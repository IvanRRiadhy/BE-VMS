import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CodeInvitationContext = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const code = params.get('code');

  useEffect(() => {
    if (!code) {
      navigate('/', { replace: true }); // redirect ke login kalau code hilang
    }
  }, [code, navigate]);

  return code ? children : null;
};

export default CodeInvitationContext;
