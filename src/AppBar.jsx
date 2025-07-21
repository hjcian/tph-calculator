import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import logo from './assets/image/TAC-Dynamics.jpg';

import {
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  AppBar,
  Divider,
  Stack
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 240;
const navItems = [
  { text: 'Home', path: '/' },
  { text: 'Physical Warehouse Calculation', path: '/warehouse' },
  { text: '并單', path: '/orders' },
  { text: 'Slot', path: '/slot' },
  { text: 'About', path: '/about' }];

export default function TemporaryDrawer() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();  // hook for navigation

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: drawerWidth, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Menu
      </Typography>
      <Divider />
      <List>
        {navItems.map(({ text, path }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              sx={{ textAlign: 'center' }}
              onClick={() => {
                navigate(path);  // navigate to the path
              }}
            >
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar component="nav" position="fixed" elevation={0} sx={{ backgroundColor: '#3f3f3fff' }}>
        <Toolbar>
          <Stack direction={'row'} alignItems={'center'} justifyContent="space-between" width="100%">
            <Stack direction={'row'} alignItems={'center'}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Box
                component="img"
                src={logo} 
                alt="Logo"
                sx={{ height: 40, mr: 2 }}
              />
              <Typography variant="h6" component="div">
                TAC Dynamics
              </Typography>
            </Stack>
            <IconButton variant="contained" ><HomeIcon sx={{ color: 'white' }}/></IconButton>
          </Stack>

        </Toolbar>
      </AppBar>

      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ width: '100%', mt: 8 }}>

      </Box>
    </Box>
  );
}
