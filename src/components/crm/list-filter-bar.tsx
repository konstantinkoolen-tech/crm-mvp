"use client";

import { ArrowDownUp, UserRound } from "lucide-react";
import type * as React from "react";

type FilterOption = {
  value: string;
  label: string;
};

type ListFilterBarProps = {
  sortValue: string;
  sortOptions: FilterOption[];
  onSortChange: (value: string) => void;
  ownerValue?: string;
  ownerOptions?: FilterOption[];
  onOwnerChange?: (value: string) => void;
  statusValue?: string;
  statusOptions?: FilterOption[];
  onStatusChange?: (value: string) => void;
  typeValue?: string;
  typeOptions?: FilterOption[];
  onTypeChange?: (value: string) => void;
};

export function ListFilterBar({
  sortValue,
  sortOptions,
  onSortChange,
  ownerValue = "all",
  ownerOptions = [],
  onOwnerChange,
  statusValue = "all",
  statusOptions = [],
  onStatusChange,
  typeValue = "all",
  typeOptions = [],
  onTypeChange,
}: ListFilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-neutral-100 pb-4">
      <FilterSelect
        icon={<ArrowDownUp aria-hidden="true" />}
        label="Sortieren"
        value={sortValue}
        options={sortOptions}
        onChange={onSortChange}
      />
      {onOwnerChange ? (
        <FilterSelect
          icon={<UserRound aria-hidden="true" />}
          label="Zuständig"
          value={ownerValue}
          options={[{ value: "all", label: "Alle Personen" }, ...ownerOptions]}
          onChange={onOwnerChange}
        />
      ) : null}
      {onStatusChange ? (
        <FilterSelect
          label="Status"
          value={statusValue}
          options={[{ value: "all", label: "Alle Status" }, ...statusOptions]}
          onChange={onStatusChange}
        />
      ) : null}
      {onTypeChange ? (
        <FilterSelect
          label="Typ"
          value={typeValue}
          options={[{ value: "all", label: "Alle Typen" }, ...typeOptions]}
          onChange={onTypeChange}
        />
      ) : null}
    </div>
  );
}

function FilterSelect({
  icon,
  label,
  value,
  options,
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="inline-flex h-8 items-center gap-1.5 rounded-md bg-neutral-100 px-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200">
      {icon ? <span className="[&_svg]:size-3.5">{icon}</span> : null}
      <span className="text-neutral-500">{label}</span>
      <select
        className="max-w-44 bg-transparent pr-1 text-sm font-semibold text-neutral-950 outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
