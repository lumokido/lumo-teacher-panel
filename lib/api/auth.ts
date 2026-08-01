import { apiPostJson } from "@/lib/api/client";

export type LoginCredentials = {
  emailId?: string;
  passwordHash?: string;
  mobileNumber?: string;
  dateOfBirth?: string;
};

/**
 * Principal login
 *   POST http://localhost:8080/api/admin/login
 */
export function postPrincipalLogin(credentials: { emailId: string; passwordHash: string }) {
  return apiPostJson<unknown>("api/admin/login", credentials);
}

/**
 * Teacher login
 *   POST http://localhost:8080/api/admin/login-teacher
 */
export function postTeacherLogin(credentials: { mobileNumber: string; dateOfBirth: string }) {
  return apiPostJson<unknown>("api/admin/login-teacher", credentials);
}
