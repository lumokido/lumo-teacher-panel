import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Alphores Teacher Panel",
  description:
    "Privacy Policy for the Alphores School Teacher Panel mobile and web application.",
};

const lastUpdated = "30 July 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/5 ring-1 ring-slate-200">
              <Image
                src="/logo.svg"
                alt="Alphores"
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-sky-600">
                Alphores School
              </p>
              <p className="font-montserrat text-sm font-semibold text-slate-900">
                Teacher Panel
              </p>
            </div>
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-600">
          Legal
        </p>
        <h1 className="font-montserrat text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Last updated: {lastUpdated}
        </p>

        <div className="prose-sm mt-10 space-y-8 text-slate-700">
          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              1. Introduction
            </h2>
            <p>
              Alphores School (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the{" "}
              <strong>Alphores Teacher Panel</strong> application (the
              &quot;App&quot;), available as a web and mobile application for
              school principals and teachers. This Privacy Policy explains how we
              collect, use, store, and protect information when you use the App.
            </p>
            <p>
              By using the App, you agree to the practices described in this
              policy. If you do not agree, please do not use the App.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              2. Who this App is for
            </h2>
            <p>
              The App is intended for authorized school staff (principals and
              teachers) to manage school operations. It is not directed at
              children for personal use. Student information is entered and
              managed by school staff solely for educational and administrative
              purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              3. Information we collect
            </h2>
            <p>Depending on your role and how you use the App, we may process:</p>

            <h3 className="text-base font-semibold text-slate-900">
              3.1 Staff account information
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Name, email address, and login credentials</li>
              <li>Role (principal or teacher) and school assignment</li>
              <li>Authentication tokens stored on your device for signed-in sessions</li>
            </ul>

            <h3 className="text-base font-semibold text-slate-900">
              3.2 Student and parent information (entered by school staff)
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Student name, date of birth, gender, class, section, and roll number</li>
              <li>Contact / mobile numbers</li>
              <li>Parent or guardian names</li>

              <li>Student profile photographs</li>
            </ul>

            <h3 className="text-base font-semibold text-slate-900">
              3.3 Academic and school operations data
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Attendance records</li>
              <li>Homework, assignments, quizzes, exams, marks, and report cards</li>
              <li>Timetable and class / teacher allocations</li>
              <li>Announcements and school gallery / media uploads</li>
              <li>In-app messages related to school communication</li>
            </ul>

            <h3 className="text-base font-semibold text-slate-900">
              3.4 Technical information
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Device and browser information needed to run the App</li>
              <li>IP address and basic usage logs for security and reliability</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              4. How we use information
            </h2>
            <p>We use the information to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Authenticate users and provide role-based access</li>
              <li>Enable school management features (attendance, academics, communication, gallery, etc.)</li>
              <li>Maintain accurate student and staff records for the school</li>
              <li>Improve App performance, reliability, and security</li>
              <li>Comply with applicable legal obligations</li>
            </ul>
            <p>
              We do <strong>not</strong> sell personal information. We do not use
              student or staff data for third-party advertising.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              5. Sensitive personal data
            </h2>
            <p>
              The App does not collect or store national government identification numbers such as Aadhaar numbers.
            </p>
            <p>
              School staff are responsible for collecting and handling any personal data
              in accordance with applicable Indian laws and school policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              6. How information is stored and shared
            </h2>
            <p>
              Data is stored on secure servers used to operate the Alphores /
              Lumo school platform (including services under{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                api.lumokido.in
              </code>
              ). Access is limited to authenticated school staff according to
              their role.
            </p>
            <p>We may share information only:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>With authorized school administrators and teachers for school operations</li>
              <li>With service providers who help host or operate the App, under confidentiality obligations</li>
              <li>When required by law, regulation, or lawful request by authorities</li>
              <li>To protect the rights, safety, and security of users and the school</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              7. Data retention
            </h2>
            <p>
              We retain information for as long as needed to provide the App to
              the school, meet academic and administrative needs, and comply with
              legal obligations. When an account or school relationship ends,
              data may be retained or deleted according to the school&apos;s
              instructions and applicable law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              8. Security
            </h2>
            <p>
              We use reasonable technical and organizational measures to protect
              personal data, including encrypted connections (HTTPS),
              authenticated API access, and role-based permissions. No method of
              transmission or storage is 100% secure; please keep your login
              credentials confidential.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              9. Your choices and rights
            </h2>
            <p>Authorized users may:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Access and update profile and student records they are permitted to manage</li>
              <li>Request correction of inaccurate information through school administration</li>
              <li>Request deletion or restriction of data, subject to school and legal requirements</li>
            </ul>
            <p>
              Parents or guardians seeking access to or deletion of a student&apos;s
              data should contact the school administration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              10. Children&apos;s privacy
            </h2>
            <p>
              The App is used by adults (school staff). Student data belonging to
              minors is processed only for educational purposes on behalf of the
              school. We do not knowingly allow children to create staff accounts
              in the App.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              11. Third-party services
            </h2>
            <p>
              The App may rely on hosting, cloud, or related infrastructure
              providers to deliver the service. Those providers process data only
              as needed to operate the App and are expected to protect it
              appropriately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              12. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. The
              &quot;Last updated&quot; date at the top will change when we do.
              Continued use of the App after changes means you accept the updated
              policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-montserrat text-xl font-semibold text-slate-900">
              13. Contact us
            </h2>
            <p>
              If you have questions about this Privacy Policy or how we handle
              personal data, please contact:
            </p>
            <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5 text-sm">
              <p className="font-semibold text-slate-900">Alphores School</p>
              <p className="mt-1 text-slate-600">Teacher Panel / Privacy requests</p>
              <p className="mt-3">
                Email:{" "}
                <a
                  href="mailto:privacy@lumokido.in"
                  className="font-medium text-sky-700 underline-offset-2 hover:underline"
                >
                  anas@lumokido.in
                </a>
              </p>
              <p className="mt-1">
                Platform:{" "}
                <a
                  href="https://lumokido.in"
                  className="font-medium text-sky-700 underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  lumokido.in
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Alphores. All rights reserved.</p>
          <p>Built by Lumo</p>
        </div>
      </footer>
    </div>
  );
}
