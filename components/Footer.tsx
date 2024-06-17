import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box component="footer" sx={{ backgroundColor: '#3f51b5', color: '#fff', padding: '1rem', textAlign: 'center', marginTop: 'auto' }}>
      <Typography variant="body1">
        © {new Date().getFullYear()} Creado y desarrollado por Esteban Gonzalez
      </Typography>
    </Box>
  );
};

export default Footer;
