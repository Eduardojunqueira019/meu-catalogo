export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatKM = (value: number) => {
  return new Intl.NumberFormat("pt-BR").format(value) + " km";
};
