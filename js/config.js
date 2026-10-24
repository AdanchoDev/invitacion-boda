/* =============================================================
   CONTENIDO DE LA INVITACIÓN
   -------------------------------------------------------------
   Todo lo que ven los invitados sale de este archivo.
   Cambia textos, fechas, lugares y fotos aquí; no hace falta
   tocar el HTML ni el CSS.

   Los valores marcados con  EJEMPLO  son de prueba: reemplázalos.
   Las fotos de picsum.photos son temporales; pon las tuyas en
   assets/fotos/ y cambia la ruta, por ejemplo "assets/fotos/portada.jpg".
   ============================================================= */

window.INVITACION = {
  novios: {
    // En el orden en que aparecen, igual que el monograma de los pases (A&E).
    nombres: ["Adan", "Erika"],
    iniciales: ["A", "E"],
    hashtag: "#AdanYErika2027", // EJEMPLO
  },

  // Inicio (hora de la ceremonia) y cierre de la fiesta, con zona horaria.
  // El centro de México usa UTC-6 todo el año.
  fecha: "2027-03-13T12:00:00-06:00",
  fechaFin: "2027-03-14T00:00:00-06:00", // EJEMPLO: hora en que termina la fiesta
  zonaHoraria: "America/Mexico_City",
  ciudad: "Santa Ana Chiautempan, Tlaxcala",

  // Foto principal (el arco de la portada).
  portada: "https://picsum.photos/id/815/900/1200", // EJEMPLO

  // true  = fotos en tono sepia, combinan con el papel kraft.
  // false = fotos a color.
  fotosEnTono: true,

  // Pon en false cualquier sección que no quieras mostrar.
  secciones: {
    mensaje: true,
    cuenta: true,
    historia: true,
    programa: true,
    lugares: true,
    galeria: true,
    confirmar: true,
    preguntas: true,
  },

  mensaje: {
    frase:
      "Hay momentos que se esperan toda la vida. Este es uno de ellos y queremos compartirlo contigo.",
    bendicion: "Con la bendición de Dios y de nuestros padres",
    padres: [
      { titulo: "Padres de la novia", nombres: ["Alejandro Flores", "Lorena Lopez"] },
      { titulo: "Padres del novio", nombres: ["Sergio Padilla", "Patricia Baeza"] },
    ],
    padrinos: [
      { rol: "Velación", nombres: "Ricardo y Mónica Herrera" }, // EJEMPLO
      { rol: "Anillos", nombres: "Luis y Ana Sofía Pech" }, // EJEMPLO
      { rol: "Lazo", nombres: "Jorge y Marisol Canul" }, // EJEMPLO
    ],
  },

  // EJEMPLO: cuéntanos su historia real y la ponemos aquí.
  historia: [
    {
      anio: "2019",
      titulo: "Un café que se alargó",
      texto:
        "Nos presentaron unos amigos en una cafetería. Lo que iba a ser un rato se convirtió en toda la tarde.",
      foto: "https://picsum.photos/id/431/600/800",
    },
    {
      anio: "2021",
      titulo: "Primer viaje juntos",
      texto: "Bacalar nos regaló el primero de muchos atardeceres. Ahí supimos que viajar juntos era lo nuestro.",
      foto: "https://picsum.photos/id/1011/600/800",
    },
    {
      anio: "2025",
      titulo: "La pregunta",
      texto: "Frente al mar, al caer la tarde, Adan se arrodilló. Erika dijo que sí antes de que terminara la frase.",
      foto: "https://picsum.photos/id/129/600/800",
    },
    {
      anio: "2027",
      titulo: "El sí, frente a todos",
      texto: "Ahora queremos celebrarlo con las personas que han sido parte de esta historia.",
      foto: "https://picsum.photos/id/660/600/800",
    },
  ],

  // Íconos disponibles: https://phosphoricons.com (usa el nombre, sin "ph-").
  programa: [
    { hora: "12:00", evento: "Ceremonia religiosa", lugar: "Parroquia de Nuestra Señora del Carmen", icono: "church" },
    { hora: "15:00", evento: "Recepción", lugar: "Salón Crydas", icono: "champagne" },
    { hora: "16:00", evento: "Comida", lugar: "Salón Crydas", icono: "fork-knife" }, // EJEMPLO
    { hora: "18:00", evento: "Primer baile y fiesta", lugar: "Salón Crydas", icono: "music-notes" }, // EJEMPLO
    { hora: "22:00", evento: "Tornaboda", lugar: "Antojitos para cerrar la fiesta", icono: "moon-stars" }, // EJEMPLO
  ],

  // Los botones de Google Maps y Waze se arman solos con nombre + dirección.
  // Si prefieres un enlace exacto, agrega  mapsUrl: "https://maps.app.goo.gl/..."
  // Sin foto, la tarjeta muestra la corona de laurel con el ícono indicado.
  // "fotoExtra" (opcional) aparece chiquita en la esquina, como una foto impresa.
  // Si la foto es de otra persona, "credito" pone su nombre y licencia debajo.
  lugares: [
    {
      tipo: "Ceremonia",
      nombre: "Parroquia de Nuestra Señora del Carmen",
      hora: "12:00 h",
      direccion: "Ignacio Picazo Sur 5, San Onofre, Centro, 90805 Santa Ana Chiautempan, Tlax.",
      foto: "assets/fotos/parroquia-del-carmen.jpg",
      credito: {
        texto: "Foto: Antuán, CC BY-SA 4.0",
        url: "https://commons.wikimedia.org/wiki/File:Parroquia_de_nuestra_se%C3%B1ora_del_Carmen.jpg",
      },
      icono: "church",
    },
    {
      tipo: "Recepción",
      nombre: "Salón Crydas",
      hora: "15:00 h",
      direccion: "Allende, Guadalupe Ixcotla, 90804 Santa Ana Chiautempan, Tlax.",
      foto: "assets/fotos/salon-crydas-vista.jpg",
      fotoExtra: "assets/fotos/salon-crydas-mesa.jpg",
      credito: { texto: "Fotos: @CrydasCentroReuniones" },
      icono: "champagne",
    },
  ],

  galeria: [
    "https://picsum.photos/id/777/1000/1000", // EJEMPLO
    "https://picsum.photos/id/828/1000/700",
    "https://picsum.photos/id/106/800/800",
    "https://picsum.photos/id/223/500/900",
    "https://picsum.photos/id/1018/1200/500",
  ],

  rsvp: {
    fechaLimite: "13 de febrero de 2027",
    // Número que recibe las confirmaciones: código de país + número, sin espacios ni "+".
    whatsapp: "522461071977", // EJEMPLO
    // Opcional: URL de Google Apps Script o Formspree para guardar las
    // respuestas en una hoja de cálculo. Si se deja vacío, se usa WhatsApp.
    endpoint: "",
    // Lugares por invitado cuando el enlace no trae ?pases=
    pasesPorDefecto: 2,
  },

  preguntas: [
    {
      p: "¿Puedo llevar a mis hijos?",
      r: "Queremos que sea una celebración para adultos, por eso la invitación es para mayores de 12 años. Gracias por entenderlo.", // EJEMPLO
    },
    {
      p: "¿Qué pasa si mi pase dice 1 persona?",
      r: "Tu pase indica los lugares que reservamos para ti. Por cupo del lugar no podremos recibir acompañantes extra.",
    },
    {
      p: "¿A qué hora debo llegar?",
      r: "Te sugerimos llegar 20 minutos antes. La ceremonia empieza puntual a las 12:00 h.",
    },
    { p: "¿Hay estacionamiento?", 
      r: "El lugar tiene estacionamiento gratuito con servicio de valet." 
    }, // EJEMPLO
  ],

  // Música de fondo: empieza al abrir el sobre. Ejemplo: "assets/musica/nuestra-cancion.mp3"
  // Si se deja vacío, no aparece el botón de música.
  musica: { src: "" },

  // Para la página generar.html (enlaces personalizados por invitado).
  generador: {
    // Dirección final de la invitación cuando esté publicada, por ejemplo
    // "https://adanyerika.com". Vacío = usa la dirección actual.
    urlPublica: "",
    codigoPais: "52",
  },
};
