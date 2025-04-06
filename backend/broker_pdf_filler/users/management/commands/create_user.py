from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from broker_pdf_filler.users.models import BrokerCompany
import uuid

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a new user with specified role (admin or standard)'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='User email')
        parser.add_argument('password', type=str, help='User password')
        parser.add_argument('first_name', type=str, help='User first name')
        parser.add_argument('last_name', type=str, help='User last name')
        parser.add_argument('role', type=str, choices=['admin', 'standard'], help='User role')
        parser.add_argument('--company', type=str, help='Broker company name (optional)')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        role = options['role']
        company_name = options.get('company')

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f'User with email {email} already exists'))
            return

        # Get or create broker company if provided
        broker_company = None
        if company_name:
            broker_company, created = BrokerCompany.objects.get_or_create(
                name=company_name,
                defaults={'code': company_name[:3].upper()}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created broker company: {company_name}'))

        # Create user
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
            broker_company=broker_company
        )

        # Set staff and superuser flags for admin users
        if role == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.save()

        self.stdout.write(self.style.SUCCESS(f'Successfully created {role} user: {email}')) 