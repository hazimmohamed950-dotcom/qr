import { Student } from '../types/attendance';

// Realistic generator of 297 enrolled students corresponding to the official Trombinoscope
// Promotion 2025–2026, FSJES Kelaa des Sraghna, Licence MD & MMS
const LAST_NAMES = [
  'ALAMI', 'BENALI', 'BERRADA', 'CHRAIBI', 'DAOUDI', 'EL AMRANI', 'EL FASSI', 'EL IDRISSI',
  'EL MANSOURI', 'EL OUAZZANI', 'FILALI', 'HASSANI', 'JABRI', 'KABBAJ', 'KADIRI', 'LAHLOU',
  'MOUDDEN', 'NACIRI', 'OUALI', 'RACHIDI', 'SABIR', 'TAZI', 'YAZIDI', 'ZAHIRI', 'AIT LAHCEN',
  'BAKKALI', 'CHAKIR', 'DRISSI', 'EL HILALI', 'FAHMI', 'GHOUMARI', 'HAMIDI', 'IKEN',
  'JOUAHRI', 'KASMI', 'LOUKILI', 'MAAROUF', 'NADIR', 'OMARI', 'QASIMI', 'REDOUANE', 'SALHI',
  'TLEMÇANI', 'WAKRIM', 'YOUCEF', 'ZEROUAL', 'ABOULKACEM', 'BOUAZZA', 'CHAOUKI', 'DOUKKALI',
  'EL HACHIMI', 'FATHI', 'GUENNOUN', 'HADDAD', 'ISMAILI', 'JAOUAD', 'KHLIFI', 'LAMRANI',
  'MAHFOUD', 'NAJIB', 'OURIACHI', 'RAMI', 'SAADI', 'TAHIRI', 'WAHBI', 'ZOUHIR'
];

const FIRST_NAMES_MALE = [
  'Mohamed', 'Yassine', 'Amine', 'Hamza', 'Mehdi', 'Othmane', 'Ayoub', 'Soufiane', 'Anas',
  'Walid', 'Zakaria', 'Ilyas', 'Saad', 'Karim', 'Omar', 'Adil', 'Bilal', 'Ismail', 'Taha',
  'Nabil', 'Reda', 'Tarik', 'Sami', 'Hassan', 'Rachid', 'Mustapha', 'Abderrahim', 'Youssef'
];

const FIRST_NAMES_FEMALE = [
  'Fatima Ezzahra', 'Salma', 'Khadija', 'Hajar', 'Chaimae', 'Imane', 'Zineb', 'Meryem', 'Sara',
  'Noura', 'Asmae', 'Oumaima', 'Houda', 'Kawtar', 'Soukaina', 'Ghita', 'Amina', 'Nisrine',
  'Manal', 'Rania', 'Ikram', 'Siham', 'Boutaina', 'Laila', 'Yassmine', 'Safaa', 'Doha', 'Wissal'
];

export const generate297Students = (): Student[] => {
  const students: Student[] = [];

  for (let i = 1; i <= 297; i++) {
    const isFemale = i % 2 === 0;
    const firstNames = isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
    const prenom = firstNames[(i * 7 + 3) % firstNames.length];
    const nom = LAST_NAMES[(i * 13 + 5) % LAST_NAMES.length];
    
    // Group S5-A (1 to 148), Group S5-B (149 to 297)
    const group: 'S5-A' | 'S5-B' = i <= 148 ? 'S5-A' : 'S5-B';
    
    const apogeeNum = 22000000 + (i * 137) % 89999 + 10000;
    const apogeeId = apogeeNum.toString().slice(0, 8);
    
    const cnePrefix = ['G13', 'D13', 'R14', 'M13', 'K12'][(i * 3) % 5];
    const cneDigits = (1000000 + (i * 9871) % 8999999).toString().slice(0, 6);
    const cne = `${cnePrefix}${cneDigits}`;

    // Standard UCA student email formatting: firstname.lastname.apogee@uca.ac.ma
    const cleanPrenom = prenom.toLowerCase().replace(/[^a-z]/g, '');
    const cleanNom = nom.toLowerCase().replace(/[^a-z]/g, '');
    const email = `${cleanPrenom}.${cleanNom}.${apogeeId.slice(-3)}@uca.ac.ma`;

    // Realistic attendance rate distribution
    const totalSessions = 24;
    let attended = 21 + (i % 4);
    if (i % 25 === 0) attended = 15; // occasional irregular student
    if (i % 60 === 0) attended = 9;  // occasional critical student
    if (attended > totalSessions) attended = totalSessions;

    const rate = Math.round((attended / totalSessions) * 100);
    const status: 'REGULAR' | 'AT_RISK' | 'CRITICAL' = 
      rate >= 80 ? 'REGULAR' : rate >= 65 ? 'AT_RISK' : 'CRITICAL';

    students.push({
      id: `std-${i.toString().padStart(3, '0')}`,
      apogeeId,
      cne,
      nom,
      prenom,
      email,
      group,
      filiere: 'Licence MD & MMS (Marketing Digital & Médias Sociaux)',
      attendanceStats: {
        totalSessions,
        attended,
        rate,
        status,
      },
    });
  }

  return students;
};

export const INITIAL_STUDENTS: Student[] = generate297Students();
