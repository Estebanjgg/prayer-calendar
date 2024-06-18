import { useState } from 'react';
import Calendar from '../components/Calendar';
import { Container, TextField, Button, List, ListItem, ListItemText, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Television = () => {
  const [names, setNames] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const addName = () => {
    if (inputValue.trim() && names.length < 10) {
      setNames([...names, inputValue]);
      setInputValue('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addName();
    }
  };

  const removeName = (index: number) => {
    const newNames = [...names];
    newNames.splice(index, 1);
    setNames(newNames);
  };

  const generateCalendar = () => {
    if (names.length > 0 && names.length <= 10) {
      setShowCalendar(true);
    }
  };

  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem', padding: '2rem', borderRadius: '8px', backgroundColor: '#fafafa' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#000' }}>
        Generador de Calendario de Televisión
      </Typography>
      <Box display="flex" alignItems="center" mb={2} sx={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px' }}>
        <TextField
          label="Ingresa un nombre"
          variant="outlined"
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ marginRight: '1rem', color: '#000' }}
        />
        <Button variant="contained" color="primary" onClick={addName} disabled={names.length >= 10}>
          Agregar
        </Button>
      </Box>
      <List sx={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {names.map((name, index) => (
          <ListItem key={index} secondaryAction={
            <IconButton edge="end" aria-label="delete" onClick={() => removeName(index)}>
              <DeleteIcon />
            </IconButton>
          }>
            <ListItemText primary={name} sx={{ color: '#000' }} />
          </ListItem>
        ))}
      </List>
      {names.length > 0 && (
        <Button variant="contained" color="secondary" onClick={generateCalendar} sx={{ marginTop: '1rem' }}>
          Generar Calendario
        </Button>
      )}
      {showCalendar && <Calendar names={names} title="Calendario de Televisión" type="television" />}
    </Container>
  );
};

export default Television;
