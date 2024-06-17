import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
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
          <Link href="/" passHref>
            <Button color="inherit" sx={{ marginLeft: '1rem', fontSize: '1rem' }}>Home</Button>
          </Link>
          <Link href="/oracion" passHref>
            <Button color="inherit" sx={{ marginLeft: '1rem', fontSize: '1rem' }}>Oraciones</Button>
          </Link>
          <Link href="/television" passHref>
            <Button color="inherit" sx={{ marginLeft: '1rem', fontSize: '1rem' }}>Televisión</Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
