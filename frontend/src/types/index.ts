export type Role = 'admin' | 'hr' | 'manager';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ONBOARDING' | 'TERMINATED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Position {
  id: number;
  department_id: number;
  title: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  department_id: number;
  position_id: number;
  joining_date: string;
  employment_type: string;
  basic_salary: number;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
  department?: Department;
  position?: Position;
}

export interface EmployeeDocument {
  id: number;
  employee_id: number;
  document_type: string;
  original_file_name: string;
  stored_file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Payroll {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface DashboardStats {
  total_employees: number;
  total_departments: number;
  total_positions: number;
  monthly_payroll_total: number;
  pending_payrolls: number;
  recent_employees: Employee[];
}
