import { useState } from "react";
// Additional imports
import { useNavigate } from "react-router-dom";

import CircularProgress from '@mui/material/CircularProgress';

// Existing imports
import { Link } from "react-router-dom";
import Switch from "@mui/material/Switch";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import IllustrationLayout from "layouts/authentication/components/IllustrationLayout";
import bgImage from "assets/images/illustrations/illustration-reset.jpg";

function Illustration() {
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      const response = await fetch('https://bindaladmin.fruitnasta.com/api/auth/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      setIsLoading(false); // Stop loading
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Login failed');
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setIsLoading(false); // Stop loading
      console.error('Login error:', error);
      setErrorMessage('Server error');
      setIsErrorModalOpen(true);
    }
  };


  return (
    <IllustrationLayout
      title="Sign In"
      description="Enter your email and password to sign in"
      illustration={bgImage}
    >
      {isLoading && <CircularProgress color="info" />}

      <MDBox component="form" role="form" onSubmit={handleLogin}>
        <MDBox mb={2}>
          <MDInput type="email" label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
        </MDBox>
        <MDBox mb={2}>
          <MDInput type="password" label="Password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
        </MDBox>
        <MDBox display="flex" alignItems="center" ml={-1}>
          <Switch checked={rememberMe} onChange={handleSetRememberMe} />
          <MDTypography
            variant="button"
            fontWeight="regular"
            color="text"
            onClick={handleSetRememberMe}
            sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
          >
            &nbsp;&nbsp;Remember me
          </MDTypography>
        </MDBox>
        {errorMessage && (
          <MDTypography variant="caption" color="error" sx={{ display: "block", textAlign: "center", marginBottom: '16px' }}>
            {errorMessage}
          </MDTypography>
        )}
        <MDBox mt={4} mb={1}>
          <MDButton variant="gradient" color="info" size="large" fullWidth type="submit">
            sign in
          </MDButton>
        </MDBox>
      </MDBox>
    </IllustrationLayout>
  );
}

export default Illustration;
