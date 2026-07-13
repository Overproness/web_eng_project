// .env.production sets VITE_BACKEND_URL="" so production builds use
// same-origin relative requests (frontend + backend share one Vercel
// deployment). Use "??" rather than "||" so that intentional empty string
// isn't replaced by the localhost dev default.
export const backend_url =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000";
