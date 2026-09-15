export const cleanCpf = (cpf: string) => {
  return cpf.replace(/\D/g, "");
};

export const isValidCpf = (cpf: string) => {
  const cleanedCpf = cleanCpf(cpf);

  if (cleanedCpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cleanedCpf)) {
    return false;
  }

  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += Number(cleanedCpf[i]) * (10 - i);
  }

  let firstDigit = (sum * 10) % 11;

  if (firstDigit === 10) {
    firstDigit = 0;
  }

  if (firstDigit !== Number(cleanedCpf[9])) {
    return false;
  }

  sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += Number(cleanedCpf[i]) * (11 - i);
  }

  let secondDigit = (sum * 10) % 11;

  if (secondDigit === 10) {
    secondDigit = 0;
  }

  return secondDigit === Number(cleanedCpf[10]);
};
