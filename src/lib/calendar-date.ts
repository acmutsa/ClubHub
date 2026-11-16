export const toLocalDate = (date: Date) => new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
export const toUtcDate = (date: Date) => new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
