export type FieldOption = { value: string; label: string };

export const toFieldOptions = (values: readonly string[]): FieldOption[] =>
  values.map((value) => ({ value, label: value }));

export const matchesQuery = (option: FieldOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase());
