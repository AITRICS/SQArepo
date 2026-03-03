
function must(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`[ENV] ${name} is missing. Set it in .env or CI secrets.`);
  }
  return v.trim();
}

function opt(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() !== '' ? v.trim() : fallback;
}

export const env = {
  BASE_URL: must('BASE_URL'),

  USER: {
    ID: opt('USERID', 'defaultUser'),
    PW: opt('USERPW', 'defaultPass!'),
    NAME: opt('USERNAME', 'defaultName'),
  },

  MANAGER: {
    ID: opt('MANAGERID', 'defaultManager'),
    PW: opt('MANAGERPW', 'defaultManager!'),
  },
  
  ADMIN: {
    ID: opt('ADMINID', 'defaultAdmin'),
    PW: opt('ADMINPW', 'defaultAdmin!'),
  },
} as const;
