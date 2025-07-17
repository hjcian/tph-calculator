import { Box, Container, Typography } from '@mui/material';
import CustomBar from   './AppBar';

const Layout = ({ children }) => {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {/* Header */}
      <CustomBar />

      {/* Main content */}
      <Container component="main" sx={{ flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
