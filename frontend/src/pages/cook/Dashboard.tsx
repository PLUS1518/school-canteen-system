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
  Restaurant,
  ListAlt,
  Inventory,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 240;

const CookDashboard = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Заказы на сегодня', icon: <Restaurant />, onClick: () => console.log('Заказы') },
    { text: 'Заявки на закупку', icon: <ListAlt />, onClick: () => console.log('Заявки') },
    { text: 'Остатки продуктов', icon: <Inventory />, onClick: () => console.log('Остатки') },
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
            Панель повара
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
            Здесь вы можете управлять заказами и заявками на закупку продуктов.
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

export default CookDashboard;