
export const generateUniqueId = (prefix: string = ''): string => {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
};

export const formatDate = (date: Date, locale: string = 'en-GB'): string => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
