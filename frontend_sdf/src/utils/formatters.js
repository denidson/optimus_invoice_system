export const formatMoney = (value) => {
  return 'Bs. ' + new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(Number(value || 0));
};

export const formatDecimal = (value) => {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(Number(value || 0));
};

export const formatInteger = (value) => {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(Number(value || 0));
};

export const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTime = (value, withSeconds = true) => {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds && { second: "2-digit" }),
  });
};

export const formatText = (value) => {
  if (value === null || value === undefined) return "";

  return value
    .toString()
    .trim()        // elimina espacios al inicio y al final
    .toUpperCase(); // convierte a mayúsculas
};

export const formatFiscalPeriod = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

export const validateFormatEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
  const isValidEmail = emailRegex.test(email);
  return isValidEmail;
};

export const validateFormatPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^\d{4}-\d{7}$/;
  const isValidPhone = phoneRegex.test(phone);
  return isValidPhone;
};

export const validateFormatRif = (rif) => {
  if (!rif) return false;
  const rifRegex = /^(?:\d{6,8}|[JVEGP]-\d{8}-\d)$/;
  return rifRegex.test(rif);
};