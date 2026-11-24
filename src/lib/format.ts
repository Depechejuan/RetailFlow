export const euros = (value: number) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
export const dateLabel = (value: string) => new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" }).format(new Date(value));
