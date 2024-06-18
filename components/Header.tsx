import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import { useMediaQuery } from '@mui/material';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState<null | HTMLElement>(null); 
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuOpen(event.currentTarget); 
  };

  const handleMenuClose = () => {
    setMenuOpen(null); 
  };

  const renderDesktopMenu = () => (
    <>
      <Link href="/" passHref>
        <Button color="inherit" sx={{ marginLeft: '1rem', fontSize: '1rem' }}>Home</Button>
      </Link>
      <Link href="/oracion" passHref>
        <Button color="inherit" sx={{ marginLeft: '1rem', fontSize: '1rem' }}>Oraciones</Button>
      </Link>
      <Link href="/television" passHref>
        <Button color="inherit" sx={{ marginLeft: '1rem', fontSize: '1rem' }}>Televisión</Button>
      </Link>
    </>
  );

  const renderMobileMenu = () => (
    <>
      <IconButton onClick={handleMenuOpen} color="inherit">
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={menuOpen}
        open={Boolean(menuOpen)} 
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Link href="/" passHref>
            <Button color="inherit">Home</Button>
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/oracion" passHref>
            <Button color="inherit">Oraciones</Button>
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/television" passHref>
            <Button color="inherit">Televisión</Button>
          </Link>
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <AppBar position="static" sx={{ marginBottom: '2rem', backgroundColor: '#3f51b5' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Image src="https://i.postimg.cc/6pSL0rMr/DALL-E-2024-06-17-01-33-56-A-car-removebg-preview.png" alt="Logo" width={70} height={60} />
          <Typography variant="h6" component="div" sx={{ marginLeft: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            Generador de Calendarios
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile ? renderMobileMenu() : renderDesktopMenu()}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
