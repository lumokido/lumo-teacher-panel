import { redirect } from "next/navigation";

export default function AddStudentRedirect() {
  redirect("/students");
}
