import { apiPostJson } from "@/lib/api/client";

export type LoginCredentials = {
  emailId: string;
  passwordHash: string;
};

/**
 * Principal login
 * Matches your curl:
 *   POST http://localhost:8080/api/admin/login
 */
export function postPrincipalLogin(credentials: LoginCredentials) {
  return apiPostJson<unknown>("api/admin/login", credentials);
}

/**
 * Teacher login
 * Default assumes:
 *   POST http://localhost:8080/api/teacher/login
 */
export function postTeacherLogin(credentials: LoginCredentials) {
  return apiPostJson<unknown>("api/admin/login-teacher", credentials);
}
