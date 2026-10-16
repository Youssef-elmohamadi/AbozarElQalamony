import React from "react";

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  accessor?: (item: T) => React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: "start" | "center" | "end";
}

export interface FilterOption {
  label: string;
  value: string;
  group?: string;
  disabled?: boolean;
}

export interface FilterField {
  key: string;
  label: string;
  type: "search" | "select";
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: string;
  className?: string;
}

export interface CreateButtonConfig {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}
