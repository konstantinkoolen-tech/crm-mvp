export type CompanyEmployeeCount = "1-5" | "6-10" | "11-20" | "21-50" | "50+";
export type CompanyEmployeeCountValue = CompanyEmployeeCount | number | null;

export const employeeCountOptions: CompanyEmployeeCount[] = [
  "1-5",
  "6-10",
  "11-20",
  "21-50",
  "50+",
];

export function employeeCountFromForm(
  value: FormDataEntryValue | null,
): CompanyEmployeeCount | null {
  return employeeCountFromValue(value);
}

export function employeeCountFromValue(
  value: FormDataEntryValue | CompanyEmployeeCountValue | undefined,
): CompanyEmployeeCount | null {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  if (employeeCountOptions.includes(text as CompanyEmployeeCount)) {
    return text as CompanyEmployeeCount;
  }

  const count = Number.parseInt(text, 10);

  if (Number.isNaN(count)) {
    return null;
  }

  if (count <= 5) {
    return "1-5";
  }

  if (count <= 10) {
    return "6-10";
  }

  if (count <= 20) {
    return "11-20";
  }

  if (count <= 50) {
    return "21-50";
  }

  return "50+";
}

export function employeeCountToLegacyInteger(value: CompanyEmployeeCount | null) {
  if (value === "1-5") {
    return 5;
  }

  if (value === "6-10") {
    return 10;
  }

  if (value === "11-20") {
    return 20;
  }

  if (value === "21-50") {
    return 50;
  }

  if (value === "50+") {
    return 51;
  }

  return null;
}

export function employeeCountSortValue(
  value: CompanyEmployeeCountValue | undefined,
) {
  const employeeCount = employeeCountFromValue(value);

  if (!employeeCount) {
    return 0;
  }

  return employeeCountOptions.indexOf(employeeCount) + 1;
}
