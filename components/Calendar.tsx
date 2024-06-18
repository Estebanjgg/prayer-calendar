import { useEffect, useState, useRef } from 'react';
import { Typography, Paper, Button, Box, Modal, List, ListItem, Checkbox, FormControlLabel } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  const [selectedForThree, setSelectedForThree] = useState<string[]>([]);
  const calendarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (names.length > 0) {
      setOpenModal(true);
    }
  }, [names]);

  const calculateDistribution = () => {
    if (selectedForThree.length !== 4) {
      alert("Selecciona exactamente 4 personas para 3 veces a la semana.");
      return;
    }

    const nameCounts = names.reduce((acc, name) => {
      acc[name] = selectedForThree.includes(name) ? 3 : 2;
      return acc;
    }, {} as { [key: string]: number });

    setDistribution(nameCounts);
    generateCalendar(nameCounts);
    setOpenModal(false);
  };

  const generateCalendar = (nameCounts: { [key: string]: number }) => {
    const totalDays = daysOfWeek.length;
    const assignments: Assignment[] = Array(totalDays).fill(null).map(() => ({ lunch: '', dinner: '' }));
  
    const nameQueue: string[] = [];
  
    // Agregar las personas seleccionadas tres veces
    selectedForThree.forEach(name => {
      for (let i = 0; i < 3; i++) {
        nameQueue.push(name);
      }
    });
  
    // Agregar la persona restante dos veces
    const remainingPerson = names.find(name => !selectedForThree.includes(name));
    if (remainingPerson) {
      for (let i = 0; i < 2; i++) {
        nameQueue.push(remainingPerson);
      }
    }
  
    // Mezclar la cola de nombres para distribuirlos de manera más uniforme
    for (let i = nameQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nameQueue[i], nameQueue[j]] = [nameQueue[j], nameQueue[i]];
    }
  
    let index = 0;
  
    for (let i = 0; i < totalDays; i++) {
      assignments[i].lunch = nameQueue[index % nameQueue.length];
      index++;
  
      // Ensure different persons for lunch and dinner
      do {
        assignments[i].dinner = nameQueue[index % nameQueue.length];
        index++;
      } while (assignments[i].lunch === assignments[i].dinner);
    }
  
    const newCalendar = daysOfWeek.map((day, index) => ({
      day,
      lunch: assignments[index].lunch,
      dinner: assignments[index].dinner,
      lunchImage: imageMap[assignments[index].lunch] || '',
      dinnerImage: imageMap[assignments[index].dinner] || ''
    }));
  
    setCalendar(newCalendar);
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

  const generatePrintableCalendar = async () => {
    if (calendarRef.current) {
      const canvas = await html2canvas(calendarRef.current, {
        scale: 2,
        useCORS: true,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        width: calendarRef.current.scrollWidth,
        height: calendarRef.current.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgData = canvas.toDataURL('image/png');

      const img = new Image();
      img.src = imgData;
      img.onload = () => {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        const aspectRatio = imgWidth / imgHeight;

        let renderWidth = pdfWidth;
        let renderHeight = pdfWidth / aspectRatio;

        if (renderHeight > pdfHeight) {
          renderHeight = pdfHeight;
          renderWidth = pdfHeight * aspectRatio;
        }

        const xOffset = (pdfWidth - renderWidth) / 2;
        const yOffset = (pdfHeight - renderHeight) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight);

        const imageHeight = 90; // Fixed height for images
        const yStart = yOffset + 50;

        calendar.forEach((entry, index) => {
          const yPosition = yStart + (index * (imageHeight + 10)); // Adjust vertical position

          if (entry.lunchImage) {
            const lunchImage = new Image();
            lunchImage.src = entry.lunchImage;
            lunchImage.onload = () => {
              const aspectRatio = lunchImage.naturalWidth / lunchImage.naturalHeight;
              const imageWidth = imageHeight * aspectRatio;
              const lunchXOffset = (pdfWidth / 9 - imageWidth) / 2;
              pdf.addImage(lunchImage, 'PNG', lunchXOffset, yPosition, imageWidth, imageHeight);
            };
          }
          if (entry.dinnerImage) {
            const dinnerImage = new Image();
            dinnerImage.src = entry.dinnerImage;
            dinnerImage.onload = () => {
              const aspectRatio = dinnerImage.naturalWidth / dinnerImage.naturalHeight;
              const imageWidth = imageHeight * aspectRatio;
              const dinnerXOffset = (pdfWidth * 3 / 4 - imageWidth) / 2;
              pdf.addImage(dinnerImage, 'PNG', dinnerXOffset, yPosition, imageWidth, imageHeight);
            };
          }
        });

        const currentMonth = months[new Date().getMonth()];
        const filename = type === 'oracion' ? `Oraciones_${currentMonth}.pdf` : `Television_${currentMonth}.pdf`;
        pdf.save(filename);
        router.push('/');
      };
    }
  };

  const handleCheckboxChange = (name: string) => {
    setSelectedForThree(prev => {
      if (prev.includes(name)) {
        return prev.filter(item => item !== name);
      } else if (prev.length < 4) {
        return [...prev, name];
      } else {
        return prev;
      }
    });
  };

  const currentMonth = months[new Date().getMonth()];
  const calendarTitle = type === 'oracion' ? `Oraciones Para Almuerzo 🥡 😋 / Cena ${currentMonth}` : `Horario Television 📺 📺${currentMonth}`;

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
          {calendar.map((entry, index) => (
            <Paper key={index} className="day-box" sx={{ padding: '0.5rem', textAlign: 'center', backgroundColor: '#e0f7fa', margin: '0.25rem', flex: '0 0 18%' }}>
              <Typography variant="h6" component="h3" sx={{ color: '#000', fontSize: '1rem' }}>
                {entry.day}
              </Typography>
              <Typography variant="body1" sx={{ color: '#000', fontSize: '0.8rem' }}>Almuerzo: {entry.lunch}</Typography>
              {entry.lunchImage && (
                <img src={entry.lunchImage} alt={`Imagen para Almuerzo ${entry.day}`} style={{ marginTop: '0.5rem', width: '100%', height: 'auto', maxHeight: '60px', objectFit: 'contain', borderRadius: '8px' }} />
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
                <Button variant="contained" component="span" sx={{ marginTop: '0.5rem', fontSize: '0.7rem' }}>
                  Subir Imagen Almuerzo
                </Button>
              </label>
              <Typography variant="body1" sx={{ marginTop: '0.5rem', color: '#000', fontSize: '0.8rem' }}>Cena: {entry.dinner}</Typography>
              {entry.dinnerImage && (
                <img src={entry.dinnerImage} alt={`Imagen para Cena ${entry.day}`} style={{ marginTop: '0.5rem', width: '100%', height: 'auto', maxHeight: '60px', objectFit: 'contain', borderRadius: '8px' }} />
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
                <Button variant="contained" component="span" sx={{ marginTop: '0.5rem', fontSize: '0.7rem' }}>
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
            Selecciona 4 personas para 3 veces a la semana
          </Typography>
          <List>
            {names.map((name, index) => (
              <ListItem key={index}>
                <FormControlLabel
                  control={<Checkbox checked={selectedForThree.includes(name)} onChange={() => handleCheckboxChange(name)} />}
                  label={`${name}`}
                />
              </ListItem>
            ))}
          </List>
          <Button variant="contained" color="primary" onClick={calculateDistribution}>
            Confirmar y Generar
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default Calendar;
