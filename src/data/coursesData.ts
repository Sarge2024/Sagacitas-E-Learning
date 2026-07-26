import { Course, Certificate, Comment } from '../types';

export const USER_PROFILE = {
  name: 'Gabriel Mendes',
  email: 'gabriel.mendes@sagacitas.edu.br',
  role: 'Proprietário & Gestor Gastronômico | Alchymist Manager',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2ufdo_0iti2LuWcPJ9vB0yyBkVdUYje1yk2v6bk3yMz2K7YDllz2VlHE7-DGb8TKpRSRGbUH7sLP1HN_NX_Wq3m2Ip4t7JRx_K7-ez8Z4jVdxycetQhsUWo94gyACjfMdWseD7GFOEuIHNAVVF9RXUzDA7doPKvzHCPtV0HC1wguYa86scFnGWONbQVKU4XJPmfB08t-th2G9hsfJsP28eesapMBWHa2S5TLIgXAd5DC7EKPvLq2457m6bNMqG_dgDFstNBOt59GO',
  completedCoursesCount: 8,
  activeCertificatesCount: 3,
  studyHoursTotal: '92h',
  weeklyProgress: 88,
};

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_CERTIFICATES: Certificate[] = [];

export const INITIAL_COMMENTS: Comment[] = [];
