export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const createWhatsAppLink = (message: string, phone?: string): string => {
  const p = phone ? phone.replace(/[^0-9]/g, '') : '50370000000';
  return `https://api.whatsapp.com/send?phone=${p}&text=${encodeURIComponent(message)}`;
};

export const generateContactMessage = (vehicleName: string, price: number, cuota?: number) => {
  let msg = `Hola AutoSelect SV, me interesa el ${vehicleName} con precio de $${price.toLocaleString()}.`;
  if (cuota) msg += ` Me gustaría financiarlo con cuotas de aproximadamente $${cuota.toFixed(2)}/mes. ¿Está disponible?`;
  else msg += ` ¿Podrían darme más información?`;
  return msg;
};

export const calculateMonthlyPayment = (price: number, downPayment: number, term: number, rate: number = 0.10): number => {
  const finance = price - downPayment;
  if (finance <= 0) return 0;
  const monthlyRate = rate / 12;
  return finance * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
};
