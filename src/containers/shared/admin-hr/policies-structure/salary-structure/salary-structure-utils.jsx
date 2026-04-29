'use client'

import { CreditCard } from "lucide-react";

export const API_PATH = "/salary-structures";

export const STRUCTURE_META = {
  key: "salary-structure",
  label: "Salary Structure",
  title: "Salary Structures",
  description: "Manage employee salary structures, allowances, and deductions.",
  Icon: CreditCard,
  color: "text-green-600 dark:text-green-400",
  bg: "bg-green-50 dark:bg-green-900/20",
};

export const extractErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const validateStructureForm = (form) => {
  if (!form.name?.trim()) return "Structure name is required";
  if (!form.selectedEmployee) return "Employee selection is required";
  if (form.basic_salary === "") return "Basic salary is required";
  if (Number(form.basic_salary) <= 0) return "Basic salary must be greater than 0";
  return null;
};

export const normalizeStructureData = (structure) => {
  return {
    id: structure.id,
    name: structure.name,
    employee: structure.employee,
    basic_salary: structure.basic_salary,
    currency: structure.currency || "PKR",
    effective_from: structure.effective_from,
    is_active: structure.is_active,
    allowances: structure.allowances || [],
    deductions: structure.deductions || [],
    policies: structure.policies || {},
  };
};
