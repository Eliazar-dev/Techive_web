# Techive API contract (Django <-> React)

Base URL = `VITE_API_URL` (e.g. `https://api.techive.co.ke/api`). JSON in/out.
Errors: HTTP 4xx with `{ "detail": "human readable message" }` (field errors from DRF look like `{ "message": ["This field is required."] }`).
Auth header: `Authorization: Bearer <access>` (SimpleJWT, access 30 min, refresh 14 days).

## Auth
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/auth/otp/request/` | `{ email }` | `200 { detail }`. Emails a 6-digit code, valid 10 min. Same answer for unknown emails. `429` if asked again within 60 s. |
| POST | `/auth/otp/verify/` | `{ email, code }` | `200 { access, refresh, user }`. Creates the user on first success. 5 wrong attempts invalidates the code. `400 Invalid or expired code.` |
| POST | `/auth/google/` | `{ credential }` (Google ID token) | `200 { access, refresh, user }`. Verified server-side against `GOOGLE_CLIENT_ID`; email must be verified. |
| POST | `/auth/token/refresh/` | `{ refresh }` | `200 { access }` |
| GET | `/auth/me/` | none | `200 user` |
| PATCH | `/auth/me/` | `{ first_name?, last_name? }` | `200 user` |

`user` = `{ id, email, first_name, last_name, is_staff }`.
Emails listed in the backend `ADMIN_EMAILS` env var become staff automatically on sign-in.

## Quotes (sign-in required)
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/quotes/` | `{ name?, phone?, service?, budget?, message }` (auth required) | `201 { detail: "ok" }`. Email comes from the signed-in user. Team is emailed (`TEAM_EMAIL`) and the user gets a confirmation. `401` if not signed in. |

## Academy
| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/academy/waitlist/` | `{ email, name?, course? }` (public) | `201 { detail: "ok" }`. Idempotent per email. |

## Staff only (`is_staff`), used by the React `/admin` page
Lists are paginated: `{ count, next, previous, results }`, 50 per page, `?page=N`.

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/stats/` | `{ quotes_total, quotes_new, quotes_week, users_total, waitlist_total, by_service:[{service,n}], by_status:{status:n} }` |
| GET | `/admin/quotes/?status=new` | quote list, newest first |
| PATCH | `/admin/quotes/<id>/` | only `status` (`new, contacted, in_progress, won, lost`) and `notes` are writable |
| GET | `/admin/users/` | users with their quote count |
| GET | `/admin/waitlist/` | academy waitlist |

Non-staff get `403`, anonymous get `401`.
CORS: only the frontend origin(s) in `CORS_ALLOWED_ORIGINS`.
The built-in Django admin is also available at `/django-admin/`.
