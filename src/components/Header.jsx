import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Breadcrumbs,
  Box,
  Link,
  Container,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <>
      {/* Barre d'en-tête stylée */}
      <AppBar position="static" sx={{ boxShadow: 'none' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo / titre */}
 

            {/* Menu de navigation */}
            <Box>
              <Button
                onClick={() => handleNavigation('/dashboard')}
                sx={{
                  color: '#fff',
                  borderRadius: 2,
                  mx: 1,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1F1F1F' },
                }}
              >
                Dashboard
              </Button>
              <Button
                onClick={() => handleNavigation('/forum')}
                sx={{
                  color: '#fff',
                  borderRadius: 2,
                  mx: 1,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1F1F1F' },
                }}
              >
                Forum
              </Button>
              <Button
                onClick={() => handleNavigation('/login')}
                sx={{
                  color: '#fff',
                  borderRadius: 2,
                  mx: 1,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#1F1F1F' },
                }}
              >
                Login
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Breadcrumbs sous la barre */}
      {/* <Box sx={{ px: 3, py: 1.5}}> 
        <Container maxWidth="lg">
          <Breadcrumbs aria-label="breadcrumb" sx={{ color: 'white' }}>
            <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
              Home
            </Link>
            {pathnames.map((value, index) => {
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const isLast = index === pathnames.length - 1;

              return isLast ? (
                <Typography key={to} color="gray">
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </Typography>
              ) : (
                <Link
                  key={to}
                  underline="hover"
                  color="inherit"
                  onClick={() => navigate(to)}
                  sx={{ cursor: 'pointer' }}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Container>
      </Box>
      */}
    </>
  );
}

export default Header;
