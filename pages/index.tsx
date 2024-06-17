import Link from 'next/link';
import { Container, Typography, Button, Box } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="sm" sx={{ marginTop: '4rem', textAlign: 'center', backgroundColor: '#f0f0f0', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#333', marginBottom: '2rem' }}>
        Bienvenido al Generador de Calendarios
      </Typography>
      <Typography variant="body1" gutterBottom sx={{ color: '#666', marginBottom: '2rem' }}>
        Selecciona una opción para empezar a crear tu calendario personalizado:
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Link href="/oracion" passHref>
          <Button variant="contained" color="primary" sx={{ padding: '1rem', borderRadius: '8px' }}>
            Generar Calendario de Oraciones
          </Button>
        </Link>
        <Link href="/television" passHref>
          <Button variant="contained" color="secondary" sx={{ padding: '1rem', borderRadius: '8px' }}>
            Generar Calendario de Televisión
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default Home;
