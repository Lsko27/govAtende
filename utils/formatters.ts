export const formatCpf = (value: string) => {
  const cleaned = value.replace(/\D/g, "");

  return cleaned
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
    .slice(0, 14);
};

export const maskCpf = (cpf: string) => {
  const cleanCpf = cpf.replace(/\D/g, "");
  if (cleanCpf.length !== 11) return cpf;
  return `***.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-**`;
};
