# Step 1 — Backend: accounts, passwords, OTP, Google & Microsoft

**Repo: `techive-api`.** Replaces the login system. Paste this whole file into Devin.


## Rules for Devin (read before you start)
1. Work in the repo named in the step (`techive-api` = Django, `techive-web` = React). Never mix them.
2. **Copy every code block EXACTLY as written.** Do not rename, reformat, "improve", add comments, add dependencies, or split files. If a file says REPLACE, overwrite the whole file. If it says CREATE, make a new file at that exact path.
3. **NEVER delete or edit existing migration files** in `accounts/migrations` or `core/migrations`. Only add the new ones listed.
4. Do not touch any file that is not listed in the step.
5. Run every command in the "Verify" section. If something fails, show me the full error output instead of guessing a fix.
6. Do the steps in order. Do not start the next step until the Verify section of the current step passes.

## Commands (run in `techive-api`)
```bash
pip install -r requirements.txt     # after replacing requirements.txt below (adds PyJWT[crypto])
```
Do NOT run `makemigrations`. The migration files are provided below. Then:
```bash
python manage.py migrate
```

## Files

### `requirements.txt`  —  REPLACE

~~~~text
Django>=5.2,<5.3
djangorestframework>=3.16
djangorestframework-simplejwt>=5.5
django-cors-headers>=4.7
django-environ>=0.12
google-auth>=2.40
requests>=2.32
whitenoise>=6.9
gunicorn>=23
# production database (PostgreSQL). SQLite is used when DATABASE_URL is empty.
psycopg[binary]>=3.2
PyJWT[crypto]>=2.9
~~~~

### `.env.example`  —  REPLACE

~~~~bash
DEBUG=True
SECRET_KEY=change-me-to-a-long-random-string
# Vercel: add your API domain too, e.g. localhost,127.0.0.1,.vercel.app,api.techive.co.ke
ALLOWED_HOSTS=localhost,127.0.0.1,.vercel.app
# Frontend origin(s), comma separated (CORS)
CORS_ALLOWED_ORIGINS=http://localhost:5173
# Production only: same origins, used for CSRF on /django-admin/
CSRF_TRUSTED_ORIGINS=
# Comma separated emails that become admins when they sign in
ADMIN_EMAILS=
# Leave empty for SQLite in dev. Production (Neon): copy the POOLED connection string, e.g.
# postgresql://user:pass@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
DATABASE_URL=

# Google "Web application" OAuth client ID (same one used by the frontend)
GOOGLE_CLIENT_ID=
# Optional: Microsoft sign-up/login (Azure Entra ID app registration, see docs). Empty = Microsoft button shows 'not configured'.
MICROSOFT_CLIENT_ID=
# Public URL of the React site (used for links in emails)
FRONTEND_URL=http://localhost:5173

# Email. Dev default prints emails (OTP codes) to the console.
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=Techive IT Solutions <no-reply@techive.co.ke>
# Inbox that receives new quote / academy requests
TEAM_EMAIL=hello@techive.co.ke
~~~~

### `config/settings.py`  —  REPLACE

~~~~python
import sys
from datetime import timedelta
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(DEBUG=(bool, False))
environ.Env.read_env(BASE_DIR / '.env')

DEBUG = env('DEBUG')
SECRET_KEY = env('SECRET_KEY', default='dev-only-insecure-key' if DEBUG else None)
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['localhost', '127.0.0.1', '.vercel.app'])

INSTALLED_APPS = [
    'django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes',
    'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles',
    'rest_framework', 'corsheaders',
    'accounts', 'core',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

DATABASES = {'default': env.db_url_config(env('DATABASE_URL', default='') or f'sqlite:///{BASE_DIR / "db.sqlite3"}')}
# Serverless: a new process per burst, so don't keep connections open. Use Neon's *pooled* URL (host contains "-pooler").
DATABASES['default']['CONN_MAX_AGE'] = 0
DATABASES['default']['CONN_HEALTH_CHECKS'] = False
AUTH_USER_MODEL = 'accounts.User'
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = False
USE_TZ = True
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    # No collectstatic step needed on Vercel: WhiteNoise serves admin assets straight from the packages.
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage'},
}
WHITENOISE_USE_FINDERS = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --- API ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'],
    'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer'],
    'DEFAULT_THROTTLE_CLASSES': ['rest_framework.throttling.ScopedRateThrottle'],
    'DEFAULT_THROTTLE_RATES': {'otp_request': '10/hour', 'otp_verify': '30/hour', 'google': '30/hour', 'quote': '10/hour', 'waitlist': '20/hour', 'auth': '30/hour', 'academy': '30/hour', 'track': '240/hour'},
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'EXCEPTION_HANDLER': 'config.urls.api_exception_handler',
}
if 'test' in sys.argv:  # rate limits would otherwise be shared across test cases
    REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {k: '1000/minute' for k in REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=14),
    'ROTATE_REFRESH_TOKENS': False,
}

CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['http://localhost:5173'])
GOOGLE_CLIENT_ID = env('GOOGLE_CLIENT_ID', default='')
MICROSOFT_CLIENT_ID = env('MICROSOFT_CLIENT_ID', default='')  # Azure app (Entra ID) application/client ID
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:5173')  # used for links inside emails
# Emails listed here become staff (can open /admin) the next time they sign in.
ADMIN_EMAILS = [e.lower() for e in env.list('ADMIN_EMAILS', default=[])]

# --- Email ---
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='localhost')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_TIMEOUT = 10  # never let a slow mail server hang a serverless request
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='Techive IT Solutions <no-reply@techive.co.ke>')
TEAM_EMAIL = env('TEAM_EMAIL', default='hello@techive.co.ke')

OTP_TTL_MINUTES = 10
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_SECONDS = 60

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)
    SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[])
~~~~

### `accounts/models.py`  —  REPLACE

~~~~python
import hashlib, hmac
from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _make(self, email, password=None, **extra):
        if not email:
            raise ValueError('Email is required')
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()  # Google / Microsoft accounts have no password until they set one
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        return self._make(email, password, **extra)

    def create_superuser(self, email, password=None, **extra):
        return self._make(email, password, is_staff=True, is_superuser=True, email_verified=True, **extra)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=40, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)  # profile photo (from Google); empty = show initials
    email_verified = models.BooleanField(default=False)
    signup_source = models.CharField(max_length=10, default='email')  # email | google | microsoft
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return self.email


class EmailOTP(models.Model):
    """One-time code. Only a keyed hash of the code is stored. `purpose` stops a code made for one flow being used in another."""
    PURPOSES = [('login', 'login'), ('signup', 'signup'), ('reset', 'reset')]
    email = models.EmailField(db_index=True)
    purpose = models.CharField(max_length=10, choices=PURPOSES, default='login')
    code_hash = models.CharField(max_length=64)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def digest(email, purpose, code):
        msg = f'{email}:{purpose}:{code}'.encode()
        return hmac.new(settings.SECRET_KEY.encode(), msg, hashlib.sha256).hexdigest()
~~~~

### `accounts/migrations/0002_emailotp_purpose_user_avatar_url_user_email_verified_and_more.py`  —  CREATE

~~~~python
# Generated by Django 5.2.18 on 2026-10-30 11:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="emailotp",
            name="purpose",
            field=models.CharField(
                choices=[("login", "login"), ("signup", "signup"), ("reset", "reset")],
                default="login",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="avatar_url",
            field=models.URLField(blank=True, max_length=500),
        ),
        migrations.AddField(
            model_name="user",
            name="email_verified",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="phone",
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name="user",
            name="signup_source",
            field=models.CharField(default="email", max_length=10),
        ),
    ]
~~~~

### `accounts/migrations/0003_mark_existing_users_verified.py`  —  CREATE

~~~~python
from django.db import migrations


def verify_existing(apps, schema_editor):
    # Everyone who exists before this release signed in with an email code or Google, so their email is already proven.
    apps.get_model('accounts', 'User').objects.update(email_verified=True)


class Migration(migrations.Migration):
    dependencies = [('accounts', '0002_emailotp_purpose_user_avatar_url_user_email_verified_and_more')]
    operations = [migrations.RunPython(verify_existing, migrations.RunPython.noop)]
~~~~

### `accounts/emails.py`  —  CREATE

~~~~python
"""All outgoing emails: one branded HTML layout + one function per message."""
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils.html import escape


def _layout(title, paragraphs, button=None):
    body = ''.join(f'<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46">{p}</p>' for p in paragraphs)
    btn = (f'<p style="margin:24px 0 0"><a href="{escape(button[1])}" style="background:linear-gradient(90deg,#06c3ff,#a855f7);'
           f'color:#fff;text-decoration:none;padding:12px 28px;border-radius:99px;font-weight:700;font-size:14px;display:inline-block">{escape(button[0])}</a></p>') if button else ''
    return f'''<!doctype html><html><body style="margin:0;background:#f4f4f5;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden" cellspacing="0" cellpadding="0">
<tr><td style="background:#0a0a0b;padding:22px 28px"><span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-.5px">Techive</span>
<span style="color:#a855f7;font-size:11px;letter-spacing:3px;margin-left:8px">IT SOLUTIONS</span></td></tr>
<tr><td style="height:4px;background:linear-gradient(90deg,#06c3ff,#7c5cff,#a855f7)"></td></tr>
<tr><td style="padding:32px 28px"><h1 style="margin:0 0 18px;font-size:22px;color:#0a0a0b">{escape(title)}</h1>{body}{btn}</td></tr>
<tr><td style="padding:18px 28px;background:#fafafa;color:#8b8b95;font-size:12px">Techive IT Solutions &middot; Archiving Innovation. Coding the Future.</td></tr>
</table></td></tr></table></body></html>'''


def send_html(subject, to, text, title, paragraphs, button=None, fail_silently=False):
    msg = EmailMultiAlternatives(subject, text, settings.DEFAULT_FROM_EMAIL, [to] if isinstance(to, str) else to)
    msg.attach_alternative(_layout(title, paragraphs, button), 'text/html')
    msg.send(fail_silently=fail_silently)


def first_name(user):
    return user.first_name or user.email.split('@')[0]


PURPOSE_TEXT = {'login': 'sign in to', 'signup': 'verify your email for', 'reset': 'reset your password for'}


def send_otp(email, code, purpose):
    what = PURPOSE_TEXT.get(purpose, 'sign in to')
    ttl = settings.OTP_TTL_MINUTES
    send_html(
        f'{code} is your Techive verification code', email,
        f'Your Techive IT Solutions code is {code}.\nUse it to {what} your account. It expires in {ttl} minutes.\nIf you did not request it, ignore this email.',
        'Your verification code',
        [f'Use this code to {what} your Techive account:',
         f'<span style="display:inline-block;font-size:34px;font-weight:800;letter-spacing:10px;color:#0a0a0b;background:#f4f4f5;padding:12px 22px;border-radius:14px">{code}</span>',
         f'It expires in {ttl} minutes. If you did not request this, you can safely ignore this email.'])


def send_welcome(user):
    url = settings.FRONTEND_URL
    send_html(
        'Welcome to Techive IT Solutions', user.email,
        f'Hi {first_name(user)}, welcome to Techive IT Solutions! Your account is ready: {url}',
        f'Welcome, {first_name(user)}!',
        ['Your Techive account has been created and your email is verified.',
         'You can now request quotes for websites, apps and business systems, and register for courses at Techive Academy.',
         'If you ever need help, just reply to this email.'],
        ('Open Techive', url), fail_silently=True)


def send_password_changed(user):
    send_html('Your Techive password was changed', user.email,
              'Your password was changed. If this was not you, reset it immediately.',
              'Password changed', ['The password for your Techive account was just changed.',
                                   'If you did not do this, reset your password straight away or contact us.'], fail_silently=True)


def send_course_registration(reg, till_number='', payment_note=''):
    c, u = reg.course, reg.user
    price = f'KSh {c.price:,}' if c.price else 'To be announced'
    lines = [f'Hi {first_name(u)}, you are registered for <b>{escape(c.name)}</b>. Here is what happens next.',
             f'<b>Duration:</b> {escape(c.duration or "To be announced")}<br><b>Mode of teaching:</b> {escape(c.get_mode_display())}<br><b>Fee:</b> {price}']
    if c.rules:
        lines.append('<b>Course rules</b><br>' + escape(c.rules).replace('\n', '<br>'))
    pay = c.payment_plan or payment_note
    if pay:
        lines.append('<b>Payment plan</b><br>' + escape(pay).replace('\n', '<br>'))
    if till_number:
        lines.append(f'<b>Till number:</b> {escape(till_number)}')
    lines.append('Our team will contact you with the class schedule. You can follow your progress any time in the Academy section of the website.')
    text = f'Hi {first_name(u)}, you are registered for {c.name}. Duration: {c.duration}. Mode: {c.get_mode_display()}. Fee: {price}.'
    send_html(f'You are registered: {c.name}', u.email, text, 'Registration confirmed', lines,
              ('View my courses', settings.FRONTEND_URL.rstrip('/') + '/academy'), fail_silently=True)
~~~~

### `accounts/views.py`  —  REPLACE

~~~~python
import secrets
from datetime import timedelta

import jwt
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils import timezone
from google.auth.transport import requests as g_requests
from google.oauth2 import id_token
from rest_framework import permissions
from rest_framework.exceptions import APIException, Throttled, ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from . import emails
from .models import EmailOTP, User


# ---------------------------------------------------------------- helpers
class Unavailable(APIException):
    status_code = 503
    default_detail = 'This sign-in method is not available.'


def bad(msg):
    return DRFValidationError({'detail': msg})


def user_json(u):
    return {'id': u.id, 'email': u.email, 'first_name': u.first_name, 'last_name': u.last_name,
            'phone': u.phone, 'avatar_url': u.avatar_url, 'is_staff': u.is_staff}


def promote_admin(user):
    if user.email in settings.ADMIN_EMAILS and not user.is_staff:
        user.is_staff = True
        user.save(update_fields=['is_staff'])


def session_for(user, remember=False):
    promote_admin(user)
    refresh = RefreshToken.for_user(user)
    refresh.set_exp(lifetime=timedelta(days=30 if remember else 1))  # "remember me" = 30 days, otherwise 1 day
    return {'access': str(refresh.access_token), 'refresh': str(refresh), 'user': user_json(user)}


def clean_email(value):
    value = (value or '').strip().lower()
    try:
        validate_email(value)
    except ValidationError:
        raise bad('Enter a valid email address.')
    return value


def split_name(full):
    parts = (full or '').strip().split(None, 1)
    return (parts[0] if parts else '')[:150], (parts[1] if len(parts) > 1 else '')[:150]


def issue_otp(email, purpose):
    """Create + email a 6-digit code. Returns False (and sends nothing) if one was sent in the last 60 s."""
    now = timezone.now()
    if EmailOTP.objects.filter(email=email, purpose=purpose, created_at__gte=now - timedelta(seconds=settings.OTP_RESEND_SECONDS)).exists():
        return False
    code = f'{secrets.randbelow(10**6):06d}'
    EmailOTP.objects.filter(email=email, purpose=purpose, used=False).update(used=True)  # invalidate older codes
    EmailOTP.objects.create(email=email, purpose=purpose, code_hash=EmailOTP.digest(email, purpose, code),
                            expires_at=now + timedelta(minutes=settings.OTP_TTL_MINUTES))
    emails.send_otp(email, code, purpose)
    return True


def check_otp(email, purpose, code):
    """Raises a 400 unless `code` is the current valid code. Consumes it on success."""
    otp = EmailOTP.objects.filter(email=email, purpose=purpose, used=False, expires_at__gt=timezone.now()).order_by('-created_at').first()
    if not otp or otp.attempts >= settings.OTP_MAX_ATTEMPTS:
        raise bad('Invalid or expired code.')
    if not secrets.compare_digest(otp.code_hash, EmailOTP.digest(email, purpose, str(code or '').strip())):
        otp.attempts += 1
        otp.save(update_fields=['attempts'])
        raise bad('Invalid or expired code.')
    otp.used = True
    otp.save(update_fields=['used'])


def check_password_rules(password, password2, user=None):
    if password != password2:
        raise bad('Passwords do not match.')
    try:
        validate_password(password, user)
    except ValidationError as e:
        raise bad(' '.join(e.messages))


# ---------------------------------------------------------------- email + password
class Register(APIView):
    throttle_scope = 'auth'

    def post(self, request):
        d = request.data
        email = clean_email(d.get('email'))
        name = (d.get('name') or '').strip()
        phone = (d.get('phone') or '').strip()
        if len(name) < 2:
            raise bad('Please enter your name.')
        if len([c for c in phone if c.isdigit()]) < 9:
            raise bad('Please enter a valid phone number.')
        check_password_rules(d.get('password') or '', d.get('password2'))
        user = User.objects.filter(email=email).first()
        if user and user.email_verified:
            raise bad('An account with this email already exists. Please log in.')
        first, last = split_name(name)
        if user is None:
            user = User(email=email)
        user.first_name, user.last_name, user.phone = first, last, phone[:40]
        user.set_password(d['password'])
        user.save()
        issue_otp(email, 'signup')
        return Response({'detail': 'We sent a 6-digit code to your email.', 'email': email, 'purpose': 'signup'}, status=201)


class Login(APIView):
    """Step 1 of login: check email + password, then email a code (step 2 is OTPVerify)."""
    throttle_scope = 'auth'

    def post(self, request):
        email = clean_email(request.data.get('email'))
        user = User.objects.filter(email=email).first()
        password = request.data.get('password') or ''
        if not user or not user.is_active or not user.has_usable_password() or not user.check_password(password):
            raise bad('Incorrect email or password.')
        issue_otp(email, 'login')  # silently skipped if a code was sent in the last minute (still valid)
        return Response({'detail': 'We sent a 6-digit code to your email.', 'email': email, 'purpose': 'login'})


class OTPVerify(APIView):
    throttle_scope = 'otp_verify'

    def post(self, request):
        email = clean_email(request.data.get('email'))
        purpose = request.data.get('purpose') or 'login'
        if purpose not in ('login', 'signup'):
            raise bad('Invalid request.')
        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            raise bad('Invalid or expired code.')
        check_otp(email, purpose, request.data.get('code'))
        if not user.email_verified:  # first successful code = email proven
            user.email_verified = True
            user.save(update_fields=['email_verified'])
            emails.send_welcome(user)
        return Response(session_for(user, bool(request.data.get('remember'))))


class OTPRequest(APIView):
    """Resend a code. Same answer whether or not the email has an account."""
    throttle_scope = 'otp_request'

    def post(self, request):
        email = clean_email(request.data.get('email'))
        purpose = request.data.get('purpose') or 'login'
        if purpose not in ('login', 'signup', 'reset'):
            raise bad('Invalid request.')
        if User.objects.filter(email=email, is_active=True).exists() and not issue_otp(email, purpose):
            raise Throttled(wait=settings.OTP_RESEND_SECONDS, detail='Please wait a minute before requesting another code.')
        return Response({'detail': 'If the email is registered, a code has been sent.'})


class PasswordForgot(APIView):
    throttle_scope = 'otp_request'

    def post(self, request):
        email = clean_email(request.data.get('email'))
        if User.objects.filter(email=email, is_active=True).exists():
            issue_otp(email, 'reset')
        return Response({'detail': 'If the email is registered, a code has been sent.', 'email': email})


class PasswordReset(APIView):
    throttle_scope = 'otp_verify'

    def post(self, request):
        email = clean_email(request.data.get('email'))
        user = User.objects.filter(email=email, is_active=True).first()
        if not user:
            raise bad('Invalid or expired code.')
        check_password_rules(request.data.get('password') or '', request.data.get('password2'), user)
        check_otp(email, 'reset', request.data.get('code'))
        user.set_password(request.data['password'])
        user.email_verified = True
        user.save()
        emails.send_password_changed(user)
        return Response({'detail': 'Password updated. You can now log in.'})


# ---------------------------------------------------------------- Google / Microsoft
def no_account(email, name='', picture=''):
    return Response({'detail': 'No account found for this email. Please sign up first.', 'code': 'no_account',
                     'email': email, 'name': name, 'picture': picture}, status=404)


class GoogleAuth(APIView):
    """mode='login' -> 404 no_account if the email is unknown. mode='signup' -> creates the account (already email-verified by Google)."""
    throttle_scope = 'google'

    def post(self, request):
        credential = request.data.get('credential')
        mode = 'signup' if request.data.get('mode') == 'signup' else 'login'
        if not settings.GOOGLE_CLIENT_ID:
            raise Unavailable('Google sign-in is not available.')
        if not credential:
            raise bad('Google sign-in failed.')
        try:
            info = id_token.verify_oauth2_token(credential, g_requests.Request(), settings.GOOGLE_CLIENT_ID)
        except ValueError:
            raise bad('Google sign-in failed.')
        if not info.get('email_verified') or not info.get('email'):
            raise bad('Your Google email is not verified.')
        email = info['email'].lower()
        user = User.objects.filter(email=email).first()
        if user is None:
            if mode == 'login':
                return no_account(email, info.get('name', ''), info.get('picture', ''))
            user = User(email=email, first_name=info.get('given_name', '')[:150], last_name=info.get('family_name', '')[:150],
                        signup_source='google', email_verified=True)
            user.set_unusable_password()
            user.avatar_url = info.get('picture', '')[:500]
            user.save()
            emails.send_welcome(user)
        else:
            if not user.is_active:
                raise bad('This account is disabled.')
            changed = []
            if info.get('picture') and user.avatar_url != info['picture']:
                user.avatar_url = info['picture'][:500]; changed.append('avatar_url')
            if not user.first_name and info.get('given_name'):
                user.first_name, user.last_name = info['given_name'][:150], info.get('family_name', '')[:150]; changed += ['first_name', 'last_name']
            if not user.email_verified:
                user.email_verified = True; changed.append('email_verified')
            if changed:
                user.save(update_fields=changed)
        return Response(session_for(user, True))


_ms_keys = jwt.PyJWKClient('https://login.microsoftonline.com/common/discovery/v2.0/keys')


def verify_microsoft(token):
    try:
        key = _ms_keys.get_signing_key_from_jwt(token).key
        tid = jwt.decode(token, options={'verify_signature': False}).get('tid', '')
        return jwt.decode(token, key, algorithms=['RS256'], audience=settings.MICROSOFT_CLIENT_ID,
                          issuer=f'https://login.microsoftonline.com/{tid}/v2.0')
    except Exception:
        raise bad('Microsoft sign-in failed.')


class MicrosoftAuth(APIView):
    """Microsoft does not guarantee the email is verified, so after the Microsoft check we still email a code (need_otp)."""
    throttle_scope = 'google'

    def post(self, request):
        if not settings.MICROSOFT_CLIENT_ID:
            raise Unavailable('Microsoft sign-in is not available.')
        mode = 'signup' if request.data.get('mode') == 'signup' else 'login'
        claims = verify_microsoft(request.data.get('id_token') or '')
        email = (claims.get('email') or claims.get('preferred_username') or '').strip().lower()
        if '@' not in email:
            raise bad('Microsoft did not return an email address.')
        user = User.objects.filter(email=email).first()
        if user is None:
            if mode == 'login':
                return no_account(email, claims.get('name', ''))
            first, last = split_name(claims.get('name', ''))
            user = User(email=email, first_name=first, last_name=last, signup_source='microsoft')
            user.set_unusable_password()
            user.save()
        elif not user.is_active:
            raise bad('This account is disabled.')
        purpose = 'login' if user.email_verified else 'signup'
        issue_otp(email, purpose)
        return Response({'need_otp': True, 'email': email, 'purpose': purpose, 'detail': 'We sent a 6-digit code to your email.'})


# ---------------------------------------------------------------- profile
class Me(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(user_json(request.user))

    def patch(self, request):
        u = request.user
        for f in ('first_name', 'last_name'):
            if f in request.data:
                setattr(u, f, str(request.data[f])[:150].strip())
        if 'phone' in request.data:
            u.phone = str(request.data['phone'])[:40].strip()
        u.save()
        return Response(user_json(u))
~~~~

### `accounts/urls.py`  —  REPLACE

~~~~python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.Register.as_view()),
    path('login/', views.Login.as_view()),
    path('otp/verify/', views.OTPVerify.as_view()),
    path('otp/request/', views.OTPRequest.as_view()),      # "resend code"
    path('password/forgot/', views.PasswordForgot.as_view()),
    path('password/reset/', views.PasswordReset.as_view()),
    path('google/', views.GoogleAuth.as_view()),
    path('microsoft/', views.MicrosoftAuth.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('me/', views.Me.as_view()),
]
~~~~

### `accounts/admin.py`  —  REPLACE

~~~~python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, EmailOTP


@admin.register(User)
class TechiveUserAdmin(UserAdmin):
    ordering = ('-date_joined',)
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    fieldsets = ((None, {'fields': ('email', 'password')}),
                 ('Profile', {'fields': ('first_name', 'last_name', 'phone', 'avatar_url', 'email_verified', 'signup_source')}),
                 ('Access', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}))
    add_fieldsets = ((None, {'classes': ('wide',), 'fields': ('email', 'password1', 'password2')}),)


admin.site.register(EmailOTP)
~~~~

### `accounts/tests.py`  —  REPLACE

~~~~python
import re
from datetime import timedelta
from unittest import mock

from django.core import mail
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import EmailOTP, User

A = '/api/auth/'
PW = 'Str0ng-pass-93'


def last_code():
    return re.search(r'code is (\d{6})', mail.outbox[-1].body).group(1)


class RegisterTests(APITestCase):
    def reg(self, **over):
        body = {'name': 'Jane Doe', 'email': 'Jane@Example.com', 'phone': '+254 700 123 456', 'password': PW, 'password2': PW}
        body.update(over)
        return self.client.post(A + 'register/', body, format='json')

    def test_register_then_verify_creates_verified_user_and_sends_welcome(self):
        r = self.reg()
        self.assertEqual(r.status_code, 201)
        u = User.objects.get(email='jane@example.com')
        self.assertFalse(u.email_verified)
        self.assertEqual((u.first_name, u.last_name, u.phone), ('Jane', 'Doe', '+254 700 123 456'))
        self.assertTrue(u.check_password(PW))
        v = self.client.post(A + 'otp/verify/', {'email': 'jane@example.com', 'code': last_code(), 'purpose': 'signup'}, format='json')
        self.assertEqual(v.status_code, 200)
        self.assertEqual(v.data['user']['first_name'], 'Jane')
        u.refresh_from_db()
        self.assertTrue(u.email_verified)
        self.assertTrue(any('Welcome' in m.subject for m in mail.outbox))

    def test_rejects_bad_input(self):
        self.assertEqual(self.reg(password2='different').status_code, 400)
        self.assertEqual(self.reg(password='12345678', password2='12345678').status_code, 400)  # too common / numeric
        self.assertEqual(self.reg(phone='12').status_code, 400)
        self.assertEqual(self.reg(name='J').status_code, 400)
        self.assertEqual(self.reg(email='nope').status_code, 400)
        self.assertFalse(User.objects.exists())

    def test_existing_verified_account_cannot_be_registered_again(self):
        User.objects.create_user('jane@example.com', PW, email_verified=True)
        self.assertEqual(self.reg().status_code, 400)

    def test_unverified_registration_can_be_retried(self):
        self.reg()
        r = self.reg(name='Jane New')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(User.objects.get().first_name, 'Jane')


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('a@example.com', PW, first_name='Ann', email_verified=True)

    def login(self, pw=PW):
        return self.client.post(A + 'login/', {'email': 'A@Example.com', 'password': pw}, format='json')

    def test_password_then_code_gives_tokens(self):
        self.assertEqual(self.login().status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        r = self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': last_code()}, format='json')
        self.assertEqual(r.status_code, 200)
        me = self.client.get(A + 'me/', HTTP_AUTHORIZATION='Bearer ' + r.data['access'])
        self.assertEqual(me.data['first_name'], 'Ann')

    def test_wrong_password_and_unknown_email_look_the_same(self):
        a = self.login('wrong-password')
        b = self.client.post(A + 'login/', {'email': 'nobody@example.com', 'password': PW}, format='json')
        self.assertEqual((a.status_code, b.status_code), (400, 400))
        self.assertEqual(a.data['detail'], b.data['detail'])
        self.assertEqual(len(mail.outbox), 0)

    def test_google_only_account_cannot_use_password_login(self):
        User.objects.create_user('g@example.com', None, email_verified=True)
        r = self.client.post(A + 'login/', {'email': 'g@example.com', 'password': ''}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_remember_me_changes_refresh_lifetime(self):
        self.login()
        code = last_code()
        r = self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': code, 'remember': True}, format='json')
        t = RefreshToken(r.data['refresh'])
        self.assertGreater(t['exp'] - t['iat'], timedelta(days=29).total_seconds())
        self.login(); mail.outbox.clear()
        EmailOTP.objects.update(created_at=EmailOTP.objects.first().created_at - timedelta(minutes=5))
        self.login()
        r = self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': last_code()}, format='json')
        t = RefreshToken(r.data['refresh'])
        self.assertLessEqual(t['exp'] - t['iat'], timedelta(days=1).total_seconds() + 5)

    def test_code_is_hashed_single_use_and_purpose_bound(self):
        self.login()
        code = last_code()
        self.assertNotIn(code, EmailOTP.objects.get().code_hash)
        wrong_purpose = self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': code, 'purpose': 'signup'}, format='json')
        self.assertEqual(wrong_purpose.status_code, 400)
        ok = self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': code}, format='json')
        again = self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': code}, format='json')
        self.assertEqual((ok.status_code, again.status_code), (200, 400))

    def test_wrong_code_locks_after_five_attempts(self):
        self.login()
        real = last_code()
        wrong = '000000' if real != '000000' else '111111'
        for _ in range(6):
            self.assertEqual(self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': wrong}, format='json').status_code, 400)
        self.assertEqual(self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': real}, format='json').status_code, 400)

    def test_resend_cooldown_and_no_enumeration(self):
        self.login()
        r = self.client.post(A + 'otp/request/', {'email': 'a@example.com', 'purpose': 'login'}, format='json')
        self.assertEqual(r.status_code, 429)
        n = len(mail.outbox)
        r = self.client.post(A + 'otp/request/', {'email': 'ghost@example.com', 'purpose': 'login'}, format='json')
        self.assertEqual((r.status_code, len(mail.outbox)), (200, n))

    @override_settings(ADMIN_EMAILS=['a@example.com'])
    def test_admin_email_is_promoted(self):
        self.login()
        r = self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': last_code()}, format='json')
        self.assertTrue(r.data['user']['is_staff'])


class PasswordResetTests(APITestCase):
    def test_forgot_then_reset_then_login_with_new_password(self):
        User.objects.create_user('a@example.com', PW, email_verified=True)
        self.client.post(A + 'password/forgot/', {'email': 'a@example.com'}, format='json')
        code = last_code()
        new = 'An0ther-long-pass'
        bad = self.client.post(A + 'password/reset/', {'email': 'a@example.com', 'code': '999999' if code != '999999' else '111111', 'password': new, 'password2': new}, format='json')
        self.assertEqual(bad.status_code, 400)
        ok = self.client.post(A + 'password/reset/', {'email': 'a@example.com', 'code': code, 'password': new, 'password2': new}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertTrue(User.objects.get().check_password(new))
        self.assertEqual(self.client.post(A + 'login/', {'email': 'a@example.com', 'password': new}, format='json').status_code, 200)

    def test_forgot_for_unknown_email_is_silent(self):
        r = self.client.post(A + 'password/forgot/', {'email': 'ghost@example.com'}, format='json')
        self.assertEqual((r.status_code, len(mail.outbox)), (200, 0))

    def test_reset_code_cannot_be_used_for_login(self):
        User.objects.create_user('a@example.com', PW, email_verified=True)
        self.client.post(A + 'password/forgot/', {'email': 'a@example.com'}, format='json')
        r = self.client.post(A + 'otp/verify/', {'email': 'a@example.com', 'code': last_code(), 'purpose': 'login'}, format='json')
        self.assertEqual(r.status_code, 400)


@override_settings(GOOGLE_CLIENT_ID='cid')
class GoogleTests(APITestCase):
    INFO = {'email': 'G@Example.com', 'email_verified': True, 'given_name': 'Gina', 'family_name': 'Lee', 'picture': 'https://img.example/g.jpg'}

    def post(self, mode, info=None, exc=None):
        with mock.patch('accounts.views.id_token.verify_oauth2_token', return_value=info or self.INFO, side_effect=exc):
            return self.client.post(A + 'google/', {'credential': 'tok', 'mode': mode}, format='json')

    def test_login_with_unknown_account_returns_no_account(self):
        r = self.post('login')
        self.assertEqual(r.status_code, 404)
        self.assertEqual((r.data['code'], r.data['email'], r.data['picture']), ('no_account', 'g@example.com', 'https://img.example/g.jpg'))
        self.assertFalse(User.objects.exists())

    def test_signup_creates_verified_account_with_photo_and_welcome_email(self):
        r = self.post('signup')
        self.assertEqual(r.status_code, 200)
        u = User.objects.get()
        self.assertEqual((u.email, u.avatar_url, u.email_verified, u.signup_source), ('g@example.com', 'https://img.example/g.jpg', True, 'google'))
        self.assertEqual(r.data['user']['avatar_url'], 'https://img.example/g.jpg')
        self.assertTrue(any('Welcome' in m.subject for m in mail.outbox))

    def test_login_existing_updates_photo(self):
        User.objects.create_user('g@example.com', PW, first_name='G', email_verified=True)
        r = self.post('login')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(User.objects.get().avatar_url, 'https://img.example/g.jpg')

    @override_settings(ADMIN_EMAILS=['g@example.com'])
    def test_admin_email_promoted_via_google(self):
        self.assertTrue(self.post('signup').data['user']['is_staff'])

    def test_rejected_tokens(self):
        self.assertEqual(self.post('login', info={'email': 'x@y.com', 'email_verified': False}).status_code, 400)
        self.assertEqual(self.post('login', exc=ValueError).status_code, 400)

    @override_settings(GOOGLE_CLIENT_ID='')
    def test_not_configured(self):
        self.assertEqual(self.client.post(A + 'google/', {'credential': 'x'}, format='json').status_code, 503)


@override_settings(MICROSOFT_CLIENT_ID='mid')
class MicrosoftTests(APITestCase):
    def post(self, mode, claims):
        with mock.patch('accounts.views.verify_microsoft', return_value=claims):
            return self.client.post(A + 'microsoft/', {'id_token': 't', 'mode': mode}, format='json')

    def test_signup_creates_unverified_user_and_emails_code(self):
        r = self.post('signup', {'email': 'M@Example.com', 'name': 'Mo Mwangi'})
        self.assertEqual((r.status_code, r.data['need_otp'], r.data['purpose']), (200, True, 'signup'))
        u = User.objects.get()
        self.assertEqual((u.email, u.first_name, u.signup_source, u.email_verified), ('m@example.com', 'Mo', 'microsoft', False))
        v = self.client.post(A + 'otp/verify/', {'email': 'm@example.com', 'code': last_code(), 'purpose': 'signup'}, format='json')
        self.assertEqual(v.status_code, 200)

    def test_login_unknown_account_returns_no_account(self):
        self.assertEqual(self.post('login', {'preferred_username': 'x@example.com'}).status_code, 404)

    def test_login_existing_requires_code(self):
        User.objects.create_user('m@example.com', None, email_verified=True)
        r = self.post('login', {'email': 'm@example.com'})
        self.assertEqual((r.data['need_otp'], r.data['purpose']), (True, 'login'))

    @override_settings(MICROSOFT_CLIENT_ID='')
    def test_not_configured(self):
        self.assertEqual(self.client.post(A + 'microsoft/', {'id_token': 'x'}, format='json').status_code, 503)


class ProfileTests(APITestCase):
    def test_me_requires_auth_and_patch_updates_phone(self):
        self.assertEqual(self.client.get(A + 'me/').status_code, 401)
        u = User.objects.create_user('a@example.com', PW, email_verified=True)
        self.client.force_authenticate(u)
        r = self.client.patch(A + 'me/', {'phone': '0711222333', 'first_name': 'Ann'}, format='json')
        self.assertEqual((r.data['phone'], r.data['first_name']), ('0711222333', 'Ann'))
~~~~

## Verify
```bash
python manage.py makemigrations --check --dry-run    # must print: No changes detected
python manage.py test accounts                        # must print: OK (26 tests)
```
Existing users keep working: migration 0003 marks every existing user as email-verified.

**What this step added (for your information):** username is the email; email + password login now also requires a 6-digit emailed code; sign-up needs name, phone, password and an emailed code; Google login/sign-up; Microsoft sign-up (always followed by an emailed code); forgot/reset password; welcome email. Remember-me controls refresh-token lifetime (30 days vs 1 day).
