# Step 2 — Backend: Academy, editable pages, cookie visitors, emails

**Repo: `techive-api`.** Do Step 1 first. Paste this whole file into Devin.


## Rules for Devin (read before you start)
1. Work in the repo named in the step (`techive-api` = Django, `techive-web` = React). Never mix them.
2. **Copy every code block EXACTLY as written.** Do not rename, reformat, "improve", add comments, add dependencies, or split files. If a file says REPLACE, overwrite the whole file. If it says CREATE, make a new file at that exact path.
3. **NEVER delete or edit existing migration files** in `accounts/migrations` or `core/migrations`. Only add the new ones listed.
4. Do not touch any file that is not listed in the step.
5. Run every command in the "Verify" section. If something fails, show me the full error output instead of guessing a fix.
6. Do the steps in order. Do not start the next step until the Verify section of the current step passes.

## Commands (run in `techive-api`)
```bash
python manage.py migrate
```
Do NOT run `makemigrations`. Migrations `0002` and `0003` for `core` are provided below; `0003_seed_courses` adds the 6 draft courses (all "coming soon", no prices).

## Files

### `core/models.py`  —  REPLACE

~~~~python
from django.conf import settings
from django.db import models


class Quote(models.Model):
    class Status(models.TextChoices):
        NEW = 'new', 'New'
        CONTACTED = 'contacted', 'Contacted'
        IN_PROGRESS = 'in_progress', 'In progress'
        WON = 'won', 'Won'
        LOST = 'lost', 'Lost'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quotes')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    service = models.CharField(max_length=120, blank=True)
    budget = models.CharField(max_length=80, blank=True)
    message = models.TextField(max_length=5000)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    notes = models.TextField(blank=True)  # internal, staff only
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.service or "General"}'


class WaitlistEntry(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True)
    course = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'academy waitlist'

    def __str__(self):
        return self.email


class Course(models.Model):
    class Mode(models.TextChoices):
        ONLINE = 'online', 'Online'
        PHYSICAL = 'physical', 'Physical (in person)'
        HYBRID = 'hybrid', 'Hybrid (online + in person)'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open for registration'
        SOON = 'coming_soon', 'Coming soon (waitlist)'

    name = models.CharField(max_length=150)
    track = models.CharField(max_length=100, blank=True, help_text='Group label, e.g. "Building with AI"')
    description = models.TextField(blank=True)
    duration = models.CharField(max_length=60, blank=True, help_text='e.g. "6 weeks"')
    mode = models.CharField(max_length=10, choices=Mode.choices, default=Mode.ONLINE)
    price = models.PositiveIntegerField(null=True, blank=True, help_text='Fee in KSh. Empty = "Price to be announced"')
    tutor = models.CharField(max_length=150, blank=True)
    rules = models.TextField(blank=True, help_text='Shown to the student after they register')
    payment_plan = models.TextField(blank=True, help_text='Shown to the student after they register')
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.OPEN)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.name


class CourseRegistration(models.Model):
    class Status(models.TextChoices):
        REGISTERED = 'registered', 'Registered'
        ACTIVE = 'active', 'In progress'
        COMPLETED = 'completed', 'Completed'
        DROPPED = 'dropped', 'Dropped'

    class Payment(models.TextChoices):
        UNPAID = 'unpaid', 'Unpaid'
        PARTIAL = 'partial', 'Part paid'
        PAID = 'paid', 'Paid'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='registrations')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='registrations')
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.REGISTERED)
    progress = models.PositiveSmallIntegerField(default=0, help_text='0-100, updated by staff')
    progress_note = models.CharField(max_length=300, blank=True, help_text='Shown to the student')
    payment_status = models.CharField(max_length=10, choices=Payment.choices, default=Payment.UNPAID)
    payment_ref = models.CharField(max_length=60, blank=True, help_text='M-Pesa transaction code (till)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [models.UniqueConstraint(fields=['user', 'course'], name='one_registration_per_course')]

    def __str__(self):
        return f'{self.user.email} -> {self.course.name}'


class SiteContent(models.Model):
    """Editable page content. `page` is home | features | about | contact | academy. `data` overrides the defaults in the React app."""
    page = models.CharField(max_length=30, unique=True)
    data = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.page


class Visitor(models.Model):
    """Only created after the visitor clicks "Accept" on the cookie banner. No IP address is stored."""
    vid = models.UUIDField(unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='visits')
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)
    visits = models.PositiveIntegerField(default=1)
    last_path = models.CharField(max_length=200, blank=True)
    user_agent = models.CharField(max_length=200, blank=True)

    class Meta:
        ordering = ['-last_seen']
~~~~

### `core/migrations/0002_course_sitecontent_visitor_courseregistration.py`  —  CREATE

~~~~python
# Generated by Django 5.2.18 on 2026-10-30 11:11

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Course",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=150)),
                (
                    "track",
                    models.CharField(
                        blank=True,
                        help_text='Group label, e.g. "Building with AI"',
                        max_length=100,
                    ),
                ),
                ("description", models.TextField(blank=True)),
                (
                    "duration",
                    models.CharField(
                        blank=True, help_text='e.g. "6 weeks"', max_length=60
                    ),
                ),
                (
                    "mode",
                    models.CharField(
                        choices=[
                            ("online", "Online"),
                            ("physical", "Physical (in person)"),
                            ("hybrid", "Hybrid (online + in person)"),
                        ],
                        default="online",
                        max_length=10,
                    ),
                ),
                (
                    "price",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text='Fee in KSh. Empty = "Price to be announced"',
                        null=True,
                    ),
                ),
                ("tutor", models.CharField(blank=True, max_length=150)),
                (
                    "rules",
                    models.TextField(
                        blank=True, help_text="Shown to the student after they register"
                    ),
                ),
                (
                    "payment_plan",
                    models.TextField(
                        blank=True, help_text="Shown to the student after they register"
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("open", "Open for registration"),
                            ("coming_soon", "Coming soon (waitlist)"),
                        ],
                        default="open",
                        max_length=12,
                    ),
                ),
                ("is_published", models.BooleanField(default=True)),
                ("order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["order", "id"],
            },
        ),
        migrations.CreateModel(
            name="SiteContent",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("page", models.CharField(max_length=30, unique=True)),
                ("data", models.JSONField(default=dict)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="Visitor",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("vid", models.UUIDField(unique=True)),
                ("first_seen", models.DateTimeField(auto_now_add=True)),
                ("last_seen", models.DateTimeField(auto_now=True)),
                ("visits", models.PositiveIntegerField(default=1)),
                ("last_path", models.CharField(blank=True, max_length=200)),
                ("user_agent", models.CharField(blank=True, max_length=200)),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="visits",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-last_seen"],
            },
        ),
        migrations.CreateModel(
            name="CourseRegistration",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("registered", "Registered"),
                            ("active", "In progress"),
                            ("completed", "Completed"),
                            ("dropped", "Dropped"),
                        ],
                        default="registered",
                        max_length=12,
                    ),
                ),
                (
                    "progress",
                    models.PositiveSmallIntegerField(
                        default=0, help_text="0-100, updated by staff"
                    ),
                ),
                (
                    "progress_note",
                    models.CharField(
                        blank=True, help_text="Shown to the student", max_length=300
                    ),
                ),
                (
                    "payment_status",
                    models.CharField(
                        choices=[
                            ("unpaid", "Unpaid"),
                            ("partial", "Part paid"),
                            ("paid", "Paid"),
                        ],
                        default="unpaid",
                        max_length=10,
                    ),
                ),
                (
                    "payment_ref",
                    models.CharField(
                        blank=True,
                        help_text="M-Pesa transaction code (till)",
                        max_length=60,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "course",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="registrations",
                        to="core.course",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="registrations",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "constraints": [
                    models.UniqueConstraint(
                        fields=("user", "course"), name="one_registration_per_course"
                    )
                ],
            },
        ),
    ]
~~~~

### `core/migrations/0003_seed_courses.py`  —  CREATE

~~~~python
from django.db import migrations

# Draft courses. Staff edit descriptions, price, duration and mode in the Admin > Courses tab,
# then switch a course from "Coming soon" to "Open for registration".
COURSES = [
    ('Certified Prompt Engineering', 'Building with AI', 'Learn to write clear, reliable prompts and get consistent results from AI tools, and earn a Techive certificate. (Draft: edit in Admin.)'),
    ('AI for Startups', 'Building with AI', 'Use AI to validate ideas, speed up product work, marketing and operations in a young company. (Draft: edit in Admin.)'),
    ('AI for Kids', 'Building with AI', 'A safe, hands-on introduction to AI and creative technology for young learners. (Draft: edit in Admin.)'),
    ('AI for Programming: Web Development', 'Building with AI', 'Build modern websites faster by pairing your coding skills with AI assistants. (Draft: edit in Admin.)'),
    ('AI for Programming: Mobile App Development', 'Building with AI', 'Design and build mobile apps with AI-assisted coding workflows. (Draft: edit in Admin.)'),
    ('Cybersecurity', 'Cybersecurity', 'Understand common threats and learn practical ways to protect people, systems and data. (Draft: edit in Admin.)'),
]


def seed(apps, schema_editor):
    Course = apps.get_model('core', 'Course')
    if Course.objects.exists():
        return
    for i, (name, track, desc) in enumerate(COURSES, start=1):
        Course.objects.create(name=name, track=track, description=desc, status='coming_soon', order=i)


class Migration(migrations.Migration):
    dependencies = [('core', '0002_course_sitecontent_visitor_courseregistration')]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
~~~~

### `core/views.py`  —  REPLACE

~~~~python
import json
import logging
import uuid
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Count
from django.utils import timezone
from rest_framework import generics, serializers
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts import emails
from .models import Course, CourseRegistration, Quote, SiteContent, Visitor, WaitlistEntry

log = logging.getLogger(__name__)


# ---------- serializers ----------
class QuoteIn(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ['name', 'phone', 'service', 'budget', 'message']
        extra_kwargs = {'name': {'required': False, 'allow_blank': True}}  # blank -> falls back to profile name


class QuoteAdminSer(serializers.ModelSerializer):
    class Meta:
        model = Quote
        fields = ['id', 'name', 'email', 'phone', 'service', 'budget', 'message', 'status', 'notes', 'created_at']
        read_only_fields = ['id', 'name', 'email', 'phone', 'service', 'budget', 'message', 'created_at']


class UserAdminSer(serializers.ModelSerializer):
    quotes = serializers.IntegerField(source='quote_count', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined', 'last_login', 'quotes']


class WaitlistSer(serializers.ModelSerializer):
    class Meta:
        model = WaitlistEntry
        fields = ['id', 'email', 'name', 'course', 'created_at']


# ---------- public / signed-in ----------
class QuoteCreate(generics.CreateAPIView):
    """Quotes require a signed-in (OTP or Google) user."""
    permission_classes = [IsAuthenticated]
    serializer_class = QuoteIn
    throttle_scope = 'quote'

    def perform_create(self, serializer):
        u = self.request.user
        name = serializer.validated_data.get('name') or f'{u.first_name} {u.last_name}'.strip() or u.email.split('@')[0]
        q = serializer.save(user=u, email=u.email, name=name)
        try:
            send_mail(
                f'New quote request: {q.service or "General"} - {q.name}',
                f'Name: {q.name}\nEmail: {q.email}\nPhone: {q.phone}\nService: {q.service}\nBudget: {q.budget}\n\n{q.message}',
                settings.DEFAULT_FROM_EMAIL, [settings.TEAM_EMAIL], fail_silently=False)
            send_mail(
                'We received your quote request',
                f'Hi {q.name},\n\nThanks for contacting Techive IT Solutions. We received your request and will reply within one business day.\n\nTechive IT Solutions',
                settings.DEFAULT_FROM_EMAIL, [q.email], fail_silently=False)
        except Exception:
            log.exception('Quote email failed (quote %s saved)', q.pk)

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response({'detail': 'ok'}, status=201)


class WaitlistCreate(APIView):
    permission_classes = []
    throttle_scope = 'waitlist'

    def post(self, request):
        s = WaitlistSer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        WaitlistEntry.objects.get_or_create(
            email=d['email'].lower(), defaults={'name': d.get('name', ''), 'course': d.get('course', '')})
        return Response({'detail': 'ok'}, status=201)  # same answer whether new or existing


# ---------- staff-only (React /admin) ----------
class AdminStats(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        week = timezone.now() - timedelta(days=7)
        return Response({
            'quotes_total': Quote.objects.count(),
            'quotes_new': Quote.objects.filter(status='new').count(),
            'quotes_week': Quote.objects.filter(created_at__gte=week).count(),
            'users_total': User.objects.count(),
            'waitlist_total': WaitlistEntry.objects.count(),
            'registrations_total': CourseRegistration.objects.count(),
            'visitors_total': Visitor.objects.count(),
            'by_service': list(Quote.objects.exclude(service='').values('service').annotate(n=Count('id')).order_by('-n')[:8]),
            'by_status': {r['status']: r['n'] for r in Quote.objects.values('status').annotate(n=Count('id'))},
        })


class AdminQuoteList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = QuoteAdminSer

    def get_queryset(self):
        qs = Quote.objects.all()
        st = self.request.query_params.get('status')
        return qs.filter(status=st) if st else qs


class AdminQuoteDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = QuoteAdminSer
    queryset = Quote.objects.all()


class AdminUserList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserAdminSer
    queryset = User.objects.annotate(quote_count=Count('quotes')).order_by('-date_joined')


class AdminWaitlistList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = WaitlistSer
    queryset = WaitlistEntry.objects.all()


class AdminWaitlistDetail(generics.RetrieveUpdateDestroyAPIView):
    """Staff can fix a name/course or remove an entry."""
    permission_classes = [IsAdminUser]
    serializer_class = WaitlistSer
    queryset = WaitlistEntry.objects.all()
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']


# ======================================================================
# Academy: courses, registrations
# ======================================================================
class CourseSer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'track', 'description', 'duration', 'mode', 'price', 'tutor', 'rules', 'payment_plan', 'status', 'is_published', 'order']


class CoursePublicSer(serializers.ModelSerializer):
    """Rules and payment plan are NOT in the public list: they are only revealed after registering."""
    class Meta:
        model = Course
        fields = ['id', 'name', 'track', 'description', 'duration', 'mode', 'price', 'tutor', 'status']


class RegistrationSer(serializers.ModelSerializer):
    course = CoursePublicSer(read_only=True)
    rules = serializers.CharField(source='course.rules', read_only=True)
    payment_plan = serializers.CharField(source='course.payment_plan', read_only=True)

    class Meta:
        model = CourseRegistration
        fields = ['id', 'course', 'status', 'progress', 'progress_note', 'payment_status', 'created_at', 'rules', 'payment_plan']


class RegistrationAdminSer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    name = serializers.SerializerMethodField()
    phone = serializers.CharField(source='user.phone', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)

    class Meta:
        model = CourseRegistration
        fields = ['id', 'email', 'name', 'phone', 'course', 'course_name', 'status', 'progress', 'progress_note', 'payment_status', 'payment_ref', 'created_at']
        read_only_fields = ['id', 'email', 'name', 'phone', 'course', 'course_name', 'created_at']

    def get_name(self, obj):
        return f'{obj.user.first_name} {obj.user.last_name}'.strip()

    def validate_progress(self, v):
        if not 0 <= v <= 100:
            raise ValidationError('Progress must be between 0 and 100.')
        return v


def academy_settings():
    row = SiteContent.objects.filter(page='academy').first()
    return (row.data if row else {}) or {}


class PublicCourseList(generics.ListAPIView):
    permission_classes = []
    serializer_class = CoursePublicSer
    pagination_class = None
    queryset = Course.objects.filter(is_published=True)


class MyRegistrations(generics.ListCreateAPIView):
    """Signed-in students: GET their registrations (with progress), POST {course} to register."""
    permission_classes = [IsAuthenticated]
    serializer_class = RegistrationSer
    pagination_class = None
    throttle_scope = 'academy'

    def get_queryset(self):
        return CourseRegistration.objects.filter(user=self.request.user).select_related('course')

    def get_throttles(self):
        return super().get_throttles() if self.request.method == 'POST' else []

    def create(self, request, *args, **kwargs):
        course = Course.objects.filter(pk=request.data.get('course'), is_published=True).first()
        if not course:
            raise ValidationError({'detail': 'Course not found.'})
        if course.status != Course.Status.OPEN:
            raise ValidationError({'detail': 'This course is not open for registration yet. Join the waitlist instead.'})
        phone = (request.data.get('phone') or '').strip()
        if phone and not request.user.phone:
            request.user.phone = phone[:40]
            request.user.save(update_fields=['phone'])
        reg, created = CourseRegistration.objects.get_or_create(user=request.user, course=course)
        if created:
            cfg = academy_settings()
            emails.send_course_registration(reg, cfg.get('till_number', ''), cfg.get('payment_instructions', ''))
            try:
                send_mail(f'New course registration: {course.name}',
                          f'{request.user.email} ({request.user.first_name} {request.user.last_name}, {request.user.phone}) registered for {course.name}.',
                          settings.DEFAULT_FROM_EMAIL, [settings.TEAM_EMAIL], fail_silently=True)
            except Exception:
                log.exception('Team notice failed')
        return Response(RegistrationSer(reg).data, status=201 if created else 200)


# ---- staff: courses / students ----
class AdminCourseList(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CourseSer
    queryset = Course.objects.all()


class AdminCourseDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CourseSer
    queryset = Course.objects.all()


class AdminRegistrationList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = RegistrationAdminSer

    def get_queryset(self):
        qs = CourseRegistration.objects.select_related('user', 'course')
        p = self.request.query_params
        if p.get('course'):
            qs = qs.filter(course_id=p['course'])
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        return qs


class AdminRegistrationDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = RegistrationAdminSer
    queryset = CourseRegistration.objects.select_related('user', 'course')
    http_method_names = ['get', 'patch', 'head', 'options']


# ======================================================================
# Editable page content (CMS) + cookie-consented visitors
# ======================================================================
CONTENT_PAGES = ('home', 'features', 'about', 'contact', 'academy')


def check_page(page):
    if page not in CONTENT_PAGES:
        raise ValidationError({'detail': 'Unknown page.'})


class PublicContent(APIView):
    """GET /content/<page>/ -> the saved overrides ({} if none). The React app merges them over its built-in defaults."""
    permission_classes = []

    def get(self, request, page):
        check_page(page)
        row = SiteContent.objects.filter(page=page).first()
        data = dict(row.data) if row else {}
        if page == 'academy':
            data.pop('till_number', None)  # till number is only revealed to registered students (see /academy/info/)
        return Response(data)


class AcademyInfo(APIView):
    """Payment details for signed-in students."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cfg = academy_settings()
        return Response({k: cfg.get(k, '') for k in ('till_number', 'payment_instructions', 'general_rules')})


class AdminContent(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, page):
        check_page(page)
        row = SiteContent.objects.filter(page=page).first()
        return Response(row.data if row else {})

    def put(self, request, page):
        check_page(page)
        data = request.data
        if not isinstance(data, dict):
            raise ValidationError({'detail': 'Content must be a JSON object.'})
        if len(json.dumps(data)) > 200_000:
            raise ValidationError({'detail': 'Content is too large.'})
        row, _ = SiteContent.objects.update_or_create(page=page, defaults={'data': data})
        return Response(row.data)


class Track(APIView):
    """POST {vid, path}. The React app only calls this after the visitor accepted cookies."""
    permission_classes = []
    throttle_scope = 'track'

    def post(self, request):
        try:
            vid = uuid.UUID(str(request.data.get('vid')))
        except ValueError:
            raise ValidationError({'detail': 'Invalid visitor id.'})
        path = str(request.data.get('path') or '')[:200]
        user = request.user if request.user.is_authenticated else None
        v, created = Visitor.objects.get_or_create(vid=vid, defaults={'user': user, 'last_path': path, 'user_agent': request.META.get('HTTP_USER_AGENT', '')[:200]})
        if not created:
            v.visits += 1
            v.last_path = path
            if user:
                v.user = user
            v.save()
        return Response({'detail': 'ok'})


class VisitorSer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()

    class Meta:
        model = Visitor
        fields = ['id', 'vid', 'email', 'first_seen', 'last_seen', 'visits', 'last_path', 'user_agent']

    def get_email(self, obj):
        return obj.user.email if obj.user_id else ''


class AdminVisitorList(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = VisitorSer
    queryset = Visitor.objects.select_related('user')
~~~~

### `config/urls.py`  —  REPLACE

~~~~python
from django.contrib import admin
from django.urls import path, include
from core import views as core
from core import status
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    """Always return {"detail": "..."} so the frontend has one error shape."""
    resp = exception_handler(exc, context)
    if resp is not None and isinstance(resp.data, dict) and 'detail' not in resp.data:
        first = next(iter(resp.data.values()), 'Invalid request')
        if isinstance(first, (list, tuple)) and first:
            first = first[0]
        resp.data = {'detail': str(first), 'errors': resp.data}
    return resp


urlpatterns = [
    path('', status.status_page),            # animated "API is running" page
    path('api/health/', status.health),      # JSON used by that page and by uptime monitors
    path('django-admin/', admin.site.urls),  # built-in Django admin (backup tool)
    path('api/auth/', include('accounts.urls')),
    path('api/quotes/', core.QuoteCreate.as_view()),
    path('api/academy/waitlist/', core.WaitlistCreate.as_view()),
    path('api/admin/stats/', core.AdminStats.as_view()),
    path('api/admin/quotes/', core.AdminQuoteList.as_view()),
    path('api/admin/quotes/<int:pk>/', core.AdminQuoteDetail.as_view()),
    path('api/admin/users/', core.AdminUserList.as_view()),
    path('api/admin/waitlist/', core.AdminWaitlistList.as_view()),
    path('api/admin/waitlist/<int:pk>/', core.AdminWaitlistDetail.as_view()),
    path('api/academy/courses/', core.PublicCourseList.as_view()),
    path('api/academy/registrations/', core.MyRegistrations.as_view()),
    path('api/academy/info/', core.AcademyInfo.as_view()),
    path('api/content/<str:page>/', core.PublicContent.as_view()),
    path('api/track/', core.Track.as_view()),
    path('api/admin/courses/', core.AdminCourseList.as_view()),
    path('api/admin/courses/<int:pk>/', core.AdminCourseDetail.as_view()),
    path('api/admin/registrations/', core.AdminRegistrationList.as_view()),
    path('api/admin/registrations/<int:pk>/', core.AdminRegistrationDetail.as_view()),
    path('api/admin/content/<str:page>/', core.AdminContent.as_view()),
    path('api/admin/visitors/', core.AdminVisitorList.as_view()),
]
~~~~

### `core/admin.py`  —  REPLACE

~~~~python
from django.contrib import admin
from .models import Quote, WaitlistEntry


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'service', 'budget', 'status', 'created_at')
    list_filter = ('status', 'service')
    search_fields = ('name', 'email', 'message')
    list_editable = ('status',)


@admin.register(WaitlistEntry)
class WaitlistAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'course', 'created_at')
    search_fields = ('email', 'name')


from .models import Course, CourseRegistration, SiteContent, Visitor  # noqa: E402


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'track', 'duration', 'mode', 'price', 'status', 'is_published', 'order')
    list_editable = ('status', 'is_published', 'order')


@admin.register(CourseRegistration)
class CourseRegistrationAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'status', 'progress', 'payment_status', 'created_at')
    list_filter = ('course', 'status', 'payment_status')


admin.site.register(SiteContent)
admin.site.register(Visitor)
~~~~

### `core/tests.py`  —  REPLACE

~~~~python
import re
import uuid

from django.core import mail
from django.test import override_settings
from rest_framework.test import APITestCase

from accounts.models import User
from core.models import Course, CourseRegistration, Quote, SiteContent, Visitor, WaitlistEntry

PW = 'Str0ng-pass-93'


def login(client, email='client@example.com'):
    """Real login flow: password, then the emailed code."""
    if not User.objects.filter(email=email).exists():
        User.objects.create_user(email, PW, first_name='Client', email_verified=True)
    client.post('/api/auth/login/', {'email': email, 'password': PW}, format='json')
    code = re.search(r'code is (\d{6})', mail.outbox[-1].body).group(1)
    r = client.post('/api/auth/otp/verify/', {'email': email, 'code': code}, format='json')
    assert r.status_code == 200, r.content
    client.credentials(HTTP_AUTHORIZATION='Bearer ' + r.data['access'])
    return r.data


class QuoteAndAdminTests(APITestCase):
    def test_quote_requires_sign_in(self):
        self.assertEqual(self.client.post('/api/quotes/', {'message': 'hi'}, format='json').status_code, 401)

    def test_signed_in_user_can_request_quote(self):
        login(self.client)
        r = self.client.post('/api/quotes/', {'service': 'Web Development', 'budget': '50k', 'message': 'Need a site', 'phone': '0700'}, format='json')
        self.assertEqual(r.status_code, 201)
        q = Quote.objects.get()
        self.assertEqual((q.email, q.status), ('client@example.com', 'new'))
        self.assertTrue(any('New quote request' in m.subject for m in mail.outbox))

    def test_blank_name_falls_back_to_profile_name(self):
        login(self.client)
        r = self.client.post('/api/quotes/', {'name': '', 'phone': '', 'service': '', 'budget': '', 'message': 'Hi'}, format='json')
        self.assertEqual(r.status_code, 201, r.content)
        self.assertEqual(Quote.objects.get().name, 'Client')

    def test_quote_needs_message(self):
        login(self.client)
        self.assertEqual(self.client.post('/api/quotes/', {'service': 'x'}, format='json').status_code, 400)

    def test_waitlist_is_idempotent_and_public(self):
        for _ in range(2):
            self.assertEqual(self.client.post('/api/academy/waitlist/', {'email': 'Z@Example.com', 'course': 'Python'}, format='json').status_code, 201)
        self.assertEqual(WaitlistEntry.objects.count(), 1)

    def test_admin_api_blocked_for_normal_users(self):
        self.assertEqual(self.client.get('/api/admin/stats/').status_code, 401)
        login(self.client)
        for p in ('stats', 'quotes', 'users', 'waitlist', 'courses', 'registrations', 'visitors'):
            self.assertEqual(self.client.get(f'/api/admin/{p}/').status_code, 403, p)
        self.assertEqual(self.client.put('/api/admin/content/home/', {'a': 1}, format='json').status_code, 403)

    @override_settings(ADMIN_EMAILS=['boss@example.com'])
    def test_admin_can_manage_quotes_and_waitlist(self):
        client_user = User.objects.create_user('c@example.com')
        q = Quote.objects.create(user=client_user, name='C', email='c@example.com', message='m', service='SEO')
        w = WaitlistEntry.objects.create(email='w@example.com')
        login(self.client, 'boss@example.com')
        s = self.client.get('/api/admin/stats/').data
        self.assertEqual((s['quotes_total'], s['registrations_total'], s['visitors_total']), (1, 0, 0))
        self.assertEqual(self.client.get('/api/admin/quotes/?status=new').data['count'], 1)
        r = self.client.patch(f'/api/admin/quotes/{q.pk}/', {'status': 'won', 'notes': 'signed', 'message': 'hacked'}, format='json')
        self.assertEqual(r.status_code, 200)
        q.refresh_from_db()
        self.assertEqual((q.status, q.notes, q.message), ('won', 'signed', 'm'))
        self.assertEqual(self.client.patch(f'/api/admin/waitlist/{w.pk}/', {'name': 'Wanjiku'}, format='json').status_code, 200)
        self.assertEqual(self.client.delete(f'/api/admin/waitlist/{w.pk}/').status_code, 204)
        self.assertEqual(self.client.get('/api/admin/users/').status_code, 200)


class AcademyTests(APITestCase):
    def setUp(self):
        self.open = Course.objects.create(name='Prompt Eng', price=15000, duration='4 weeks', mode='online', status='open',
                                          rules='Attend 80% of classes.', payment_plan='50% upfront, 50% mid-course.', order=1)
        self.soon = Course.objects.create(name='Cyber', status='coming_soon', order=2)
        self.hidden = Course.objects.create(name='Secret', is_published=False, order=3)
        SiteContent.objects.create(page='academy', data={'till_number': '123456', 'payment_instructions': 'Pay via Lipa na M-Pesa Till.'})

    def test_seed_migration_created_draft_courses(self):
        self.assertGreaterEqual(Course.objects.filter(track='Building with AI').count(), 5)  # from migration 0003 (+ the 3 made in setUp)

    def test_public_list_hides_unpublished_and_secret_fields(self):
        data = self.client.get('/api/academy/courses/').json()
        names = [c['name'] for c in data]
        self.assertIn('Prompt Eng', names)
        self.assertNotIn('Secret', names)
        self.assertNotIn('rules', data[0])
        self.assertNotIn('payment_plan', data[0])

    def test_registration_requires_sign_in(self):
        self.assertEqual(self.client.post('/api/academy/registrations/', {'course': self.open.id}, format='json').status_code, 401)

    def test_register_emails_student_with_rules_and_till_and_is_idempotent(self):
        login(self.client)
        r = self.client.post('/api/academy/registrations/', {'course': self.open.id, 'phone': '0700111222'}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data['rules'], 'Attend 80% of classes.')
        self.assertEqual(User.objects.get(email='client@example.com').phone, '0700111222')
        student_mail = [m for m in mail.outbox if m.to == ['client@example.com'] and 'registered' in m.subject][-1]
        self.assertIn('Attend 80%', student_mail.alternatives[0][0])
        self.assertIn('123456', student_mail.alternatives[0][0])
        self.assertEqual(self.client.post('/api/academy/registrations/', {'course': self.open.id}, format='json').status_code, 200)
        self.assertEqual(CourseRegistration.objects.count(), 1)
        mine = self.client.get('/api/academy/registrations/').json()
        self.assertEqual((len(mine), mine[0]['progress']), (1, 0))

    def test_cannot_register_for_coming_soon_or_hidden_course(self):
        login(self.client)
        for c in (self.soon, self.hidden):
            self.assertEqual(self.client.post('/api/academy/registrations/', {'course': c.id}, format='json').status_code, 400)

    def test_academy_info_needs_sign_in(self):
        self.assertEqual(self.client.get('/api/academy/info/').status_code, 401)
        login(self.client)
        self.assertEqual(self.client.get('/api/academy/info/').json()['till_number'], '123456')

    @override_settings(ADMIN_EMAILS=['boss@example.com'])
    def test_staff_manages_courses_and_student_progress(self):
        student = User.objects.create_user('s@example.com', PW, email_verified=True)
        reg = CourseRegistration.objects.create(user=student, course=self.open)
        login(self.client, 'boss@example.com')
        r = self.client.post('/api/admin/courses/', {'name': 'New', 'description': 'd', 'duration': '2 weeks', 'mode': 'hybrid', 'price': 9000}, format='json')
        self.assertEqual(r.status_code, 201, r.content)
        cid = r.json()['id']
        self.assertEqual(self.client.patch(f'/api/admin/courses/{cid}/', {'status': 'coming_soon', 'is_published': False}, format='json').status_code, 200)
        self.assertEqual(self.client.delete(f'/api/admin/courses/{cid}/').status_code, 204)
        self.assertEqual(self.client.get(f'/api/admin/registrations/?course={self.open.id}').json()['count'], 1)
        ok = self.client.patch(f'/api/admin/registrations/{reg.pk}/', {'progress': 40, 'status': 'active', 'progress_note': 'Week 2 done', 'payment_status': 'paid', 'payment_ref': 'QWE123'}, format='json')
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(self.client.patch(f'/api/admin/registrations/{reg.pk}/', {'progress': 140}, format='json').status_code, 400)
        self.assertEqual(self.client.patch(f'/api/admin/registrations/{reg.pk}/', {'course': self.soon.id}, format='json').status_code, 200)
        reg.refresh_from_db()
        self.assertEqual((reg.progress, reg.status, reg.course_id), (40, 'active', self.open.id))  # course cannot be changed


class ContentTests(APITestCase):
    def test_public_content_defaults_to_empty_and_unknown_page_404s_as_400(self):
        self.assertEqual(self.client.get('/api/content/home/').json(), {})
        self.assertEqual(self.client.get('/api/content/nope/').status_code, 400)

    @override_settings(ADMIN_EMAILS=['boss@example.com'])
    def test_staff_saves_content_and_public_sees_it_without_till_number(self):
        login(self.client, 'boss@example.com')
        self.assertEqual(self.client.put('/api/admin/content/about/', {'hero': {'title': 'Hello'}}, format='json').status_code, 200)
        self.assertEqual(self.client.put('/api/admin/content/academy/', {'till_number': '999', 'intro': 'Hi'}, format='json').status_code, 200)
        self.assertEqual(self.client.put('/api/admin/content/home/', ['not', 'an', 'object'], format='json').status_code, 400)
        self.client.credentials()
        self.assertEqual(self.client.get('/api/content/about/').json(), {'hero': {'title': 'Hello'}})
        self.assertEqual(self.client.get('/api/content/academy/').json(), {'intro': 'Hi'})


class VisitorTests(APITestCase):
    def test_track_creates_then_counts_visits(self):
        vid = str(uuid.uuid4())
        self.client.post('/api/track/', {'vid': vid, 'path': '/'}, format='json')
        self.client.post('/api/track/', {'vid': vid, 'path': '/academy'}, format='json')
        v = Visitor.objects.get()
        self.assertEqual((v.visits, v.last_path), (2, '/academy'))

    def test_track_links_signed_in_user_and_rejects_bad_id(self):
        login(self.client)
        vid = str(uuid.uuid4())
        self.client.post('/api/track/', {'vid': vid, 'path': '/'}, format='json')
        self.assertEqual(Visitor.objects.get().user.email, 'client@example.com')
        self.assertEqual(self.client.post('/api/track/', {'vid': 'junk'}, format='json').status_code, 400)

    @override_settings(ADMIN_EMAILS=['boss@example.com'])
    def test_staff_sees_visitors(self):
        Visitor.objects.create(vid=uuid.uuid4(), last_path='/')
        login(self.client, 'boss@example.com')
        self.assertEqual(self.client.get('/api/admin/visitors/').json()['count'], 1)


class StatusTests(APITestCase):
    def test_health_reports_ok_and_db_connected(self):
        r = self.client.get('/api/health/')
        self.assertEqual(r.status_code, 200)
        self.assertEqual((r.json()['status'], r.json()['database']), ('ok', 'connected'))
        self.assertIn('uptime_seconds', r.json())

    def test_status_page_is_html_and_not_cached(self):
        r = self.client.get('/')
        self.assertEqual(r.status_code, 200)
        self.assertIn(b'Techive API', r.content)
        self.assertEqual(r['Cache-Control'], 'no-store')
~~~~

## Verify
```bash
python manage.py makemigrations --check --dry-run    # must print: No changes detected
python manage.py test                                 # must print: OK (47 tests)
python manage.py runserver
```
In another terminal: `curl http://localhost:8000/api/academy/courses/` must return a JSON list of 6 courses. `curl http://localhost:8000/api/content/home/` must return `{}`.

**New API endpoints** (all under `/api/`): `academy/courses/`, `academy/registrations/` (GET mine / POST register), `academy/info/` (signed-in: till number + payment text), `content/<page>/` (public page text overrides), `track/` (cookie visitors), staff: `admin/courses/`, `admin/registrations/`, `admin/content/<page>/`, `admin/visitors/`, `admin/waitlist/<id>/`.
