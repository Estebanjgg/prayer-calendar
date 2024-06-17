import { useEffect, useState, useRef } from 'react';
import { Typography, Paper, Button, Box, Modal, List, ListItem, ListItemText } from '@mui/material';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/router';

interface CalendarProps {
  names: string[];
  title: string;
  type: 'oracion' | 'television';
}

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

interface Assignment {
  lunch: string;
  dinner: string;
}

const Calendar = ({ names, title, type }: CalendarProps) => {
  const [calendar, setCalendar] = useState<{ day: string; lunch: string; dinner: string; lunchImage: string; dinnerImage: string }[]>([]);
  const [distribution, setDistribution] = useState<{ [key: string]: number }>({});
  const [imageMap, setImageMap] = useState<{ [key: string]: string }>({});
  const [openModal, setOpenModal] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (names.length > 0) {
      calculateDistribution(names);
    }
  }, [names]);

  const calculateDistribution = (names: string[]) => {
    const totalDays = daysOfWeek.length;
    const totalAssignments = totalDays * 2;
    const baseCount = Math.floor(totalAssignments / names.length);
    const remainder = totalAssignments % names.length;

    const nameCounts = names.reduce((acc, name) => {
      acc[name] = baseCount;
      return acc;
    }, {} as { [key: string]: number });

    for (let i = 0; i < remainder; i++) {
      nameCounts[names[i]]++;
    }

    setDistribution(nameCounts);
    setOpenModal(true);
  };

  const distributeEvenly = (names: string[]): Assignment[] => {
    const totalDays = daysOfWeek.length;
    const totalAssignments = totalDays * 2;

    const assignments: Assignment[] = Array(totalDays).fill(null).map(() => ({ lunch: '', dinner: '' }));

    const nameQueue: string[] = [];

    names.forEach(name => {
      for (let i = 0; i < distribution[name]; i++) {
        nameQueue.push(name);
      }
    });

    // Shuffle the queue
    for (let i = nameQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nameQueue[i], nameQueue[j]] = [nameQueue[j], nameQueue[i]];
    }

    let index = 0;

    for (let i = 0; i < totalDays; i++) {
      assignments[i].lunch = nameQueue[index % nameQueue.length];
      index++;
      assignments[i].dinner = nameQueue[index % nameQueue.length];
      index++;

      // Ensure different persons for lunch and dinner
      if (assignments[i].lunch === assignments[i].dinner) {
        index++;
        assignments[i].dinner = nameQueue[index % nameQueue.length];
      }
    }

    return assignments;
  };

  const handleGenerateCalendar = () => {
    const assignments = distributeEvenly(names);

    const newCalendar = daysOfWeek.map((day, index) => ({
      day,
      lunch: assignments[index].lunch,
      dinner: assignments[index].dinner,
      lunchImage: imageMap[assignments[index].lunch] || '',
      dinnerImage: imageMap[assignments[index].dinner] || ''
    }));

    setCalendar(newCalendar);
    setOpenModal(false);
  };

  const handleImageUpload = (name: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedImageMap = { ...imageMap };
        updatedImageMap[name] = reader.result as string;
        setImageMap(updatedImageMap);

        const updatedCalendar = [...calendar];
        updatedCalendar.forEach((entry) => {
          if (entry.lunch === name) {
            entry.lunchImage = reader.result as string;
          }
          if (entry.dinner === name) {
            entry.dinnerImage = reader.result as string;
          }
        });

        setCalendar(updatedCalendar);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePrintableCalendar = () => {
    const elements = document.querySelectorAll('.hide-on-print');
    elements.forEach(el => (el as HTMLElement).style.display = 'none');

    if (calendarRef.current) {
      html2canvas(calendarRef.current, {
        scale: 2,
        useCORS: true,
        width: 958,
        height: 952,
      }).then(canvas => {
        const link = document.createElement('a');
        const currentMonth = months[new Date().getMonth()];
        const filename = type === 'oracion' ? `Oraciones_${currentMonth}.png` : `Television_${currentMonth}.png`;
        link.download = filename;
        link.href = canvas.toDataURL("image/png");
        link.click();

        elements.forEach(el => (el as HTMLElement).style.display = '');
        router.push('/');
      });
    }
  };

  const currentMonth = months[new Date().getMonth()];
  const calendarTitle = type === 'oracion' ? `Oraciones ${currentMonth}` : `Television ${currentMonth}`;

  return (
    <div>
      <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#000' }}>
        {title} - {currentMonth}
      </Typography>
      <Box ref={calendarRef} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap' }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#000', width: '100%', textAlign: 'center' }}>
          {calendarTitle}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
          {calendar.slice(0, 4).map((entry, index) => (
            <Paper key={index} sx={{ padding: '1rem', textAlign: 'center', backgroundColor: '#e0f7fa', margin: '0.5rem', flex: '0 0 23%' }}>
              <Typography variant="h6" component="h3" sx={{ color: '#000' }}>
                {entry.day}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>Almuerzo: {entry.lunch}</Typography>
              {entry.lunchImage && (
                <img src={entry.lunchImage} alt={`Imagen para Almuerzo ${entry.day}`} style={{ marginTop: '1rem', width: '100%', height: '100px', objectFit: 'cover' }} />
              )}
              <input
                accept="image/*"
                className="hide-on-print"
                style={{ display: 'none' }}
                id={`upload-lunch-image-${index}`}
                type="file"
                onChange={(e) => handleImageUpload(entry.lunch, e)}
              />
              <label htmlFor={`upload-lunch-image-${index}`} className="hide-on-print">
                <Button variant="contained" component="span" sx={{ marginTop: '1rem' }}>
                  Subir Imagen Almuerzo
                </Button>
              </label>
              <Typography variant="body1" sx={{ marginTop: '1rem', color: '#000' }}>Cena: {entry.dinner}</Typography>
              {entry.dinnerImage && (
                <img src={entry.dinnerImage} alt={`Imagen para Cena ${entry.day}`} style={{ marginTop: '1rem', width: '100%', height: '100px', objectFit: 'cover' }} />
              )}
              <input
                accept="image/*"
                className="hide-on-print"
                style={{ display: 'none' }}
                id={`upload-dinner-image-${index}`}
                type="file"
                onChange={(e) => handleImageUpload(entry.dinner, e)}
              />
              <label htmlFor={`upload-dinner-image-${index}`} className="hide-on-print">
                <Button variant="contained" component="span" sx={{ marginTop: '1rem' }}>
                  Subir Imagen Cena
                </Button>
              </label>
            </Paper>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
          {calendar.slice(4).map((entry, index) => (
            <Paper key={index + 4} sx={{ padding: '1rem', textAlign: 'center', backgroundColor: '#e0f7fa', margin: '0.5rem', flex: '0 0 23%' }}>
              <Typography variant="h6" component="h3" sx={{ color: '#000' }}>
                {entry.day}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000' }}>Almuerzo: {entry.lunch}</Typography>
              {entry.lunchImage && (
                <img src={entry.lunchImage} alt={`Imagen para Almuerzo ${entry.day}`} style={{ marginTop: '1rem', width: '100%', height: '100px', objectFit: 'cover' }} />
              )}
              <input
                accept="image/*"
                className="hide-on-print"
                style={{ display: 'none' }}
                id={`upload-lunch-image-${index + 4}`}
                type="file"
                onChange={(e) => handleImageUpload(entry.lunch, e)}
              />
              <label htmlFor={`upload-lunch-image-${index + 4}`} className="hide-on-print">
                <Button variant="contained" component="span" sx={{ marginTop: '1rem' }}>
                  Subir Imagen Almuerzo
                </Button>
              </label>
              <Typography variant="body1" sx={{ marginTop: '1rem', color: '#000' }}>Cena: {entry.dinner}</Typography>
              {entry.dinnerImage && (
                <img src={entry.dinnerImage} alt={`Imagen para Cena ${entry.day}`} style={{ marginTop: '1rem', width: '100%', height: '100px', objectFit: 'cover' }} />
              )}
              <input
                accept="image/*"
                className="hide-on-print"
                style={{ display: 'none' }}
                id={`upload-dinner-image-${index + 4}`}
                type="file"
                onChange={(e) => handleImageUpload(entry.dinner, e)}
              />
              <label htmlFor={`upload-dinner-image-${index + 4}`} className="hide-on-print">
                <Button variant="contained" component="span" sx={{ marginTop: '1rem' }}>
                  Subir Imagen Cena
                </Button>
              </label>
            </Paper>
          ))}
        </Box>
      </Box>
      <Box mt={4} textAlign="center">
        <Button variant="contained" color="primary" onClick={generatePrintableCalendar}>
          Generar Calendario Imprimible
        </Button>
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: '#fff', border: '2px solid #000', boxShadow: 24, p: 4, color: '#000' }}>
          <Typography variant="h6" component="h2" sx={{ color: '#000' }}>
            Distribución de {type === 'oracion' ? 'Oraciones' : 'Televisión'}
          </Typography>
          <List>
            {Object.keys(distribution).map((name, index) => (
              <ListItem key={index}>
                <ListItemText primary={`${name}: ${distribution[name]} veces`} sx={{ color: '#000' }} />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" color="primary" onClick={handleGenerateCalendar}>
            Confirmar y Generar
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Calendar;
