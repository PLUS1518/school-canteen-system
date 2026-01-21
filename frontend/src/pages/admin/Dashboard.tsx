import React from 'react';
import { 
  Container, 
  Typography, 
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline
} from '@mui/material';
import { 
  Menu as MenuIcon,
  BarChart,
  Assignment,
  People,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Статистика', icon: <BarChart />, onClick: () => console.log('Статистика') },
    { text: 'Заявки на закупку', icon: <Assignment />, onClick: () => console.log('Заявки') },
    { text: 'Пользователи', icon: <People />, onClick: () => console.log('Пользователи') },
    { text: 'Выйти', icon: <ExitToApp />, onClick: logout },
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={item.onClick}>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Панель администратора
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="body1">
            {user?.fullName}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        <Container>
          <Typography variant="h4" gutterBottom>
            Добро пожаловать, {user?.fullName}!
          </Typography>
          <Typography variant="body1" paragraph>
            Здесь вы можете управлять системой, просматривать статистику и заявки.
          </Typography>
          
          <Box mt={4}>
            <Typography variant="h6">
              Функциональность в разработке...
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;