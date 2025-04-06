from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import User, UserActivity, UserQuotaUsage, BrokerCompany, InsuranceCompanyAccount


class InsuranceCompanyAccountInline(admin.TabularInline):
    """Inline admin for InsuranceCompanyAccount model."""
    model = InsuranceCompanyAccount
    extra = 1


@admin.register(BrokerCompany)
class BrokerCompanyAdmin(admin.ModelAdmin):
    """Admin interface for BrokerCompany model."""
    
    list_display = ('name', 'ia_reg_code', 'mpfa_reg_code', 'user_count', 'created_at')
    search_fields = ('name', 'ia_reg_code', 'mpfa_reg_code')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [InsuranceCompanyAccountInline]
    
    def user_count(self, obj):
        """Display the number of users associated with the broker company."""
        return obj.users.count()
    user_count.short_description = _('Number of Users')


@admin.register(InsuranceCompanyAccount)
class InsuranceCompanyAccountAdmin(admin.ModelAdmin):
    """Admin interface for InsuranceCompanyAccount model."""
    
    list_display = ('broker_company', 'insurance_company', 'account_code')
    list_filter = ('broker_company', 'insurance_company')
    search_fields = ('broker_company__name', 'insurance_company', 'account_code')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom admin interface for User model."""
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Role & Permissions'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Broker Information'), {
            'fields': ('broker_company', 'tr_name', 'tr_license_number', 'tr_phone_number'),
        }),
        (_('Quotas'), {'fields': ('daily_form_quota', 'monthly_form_quota')}),
        (_('Important dates'), {'fields': ('last_login', 'last_login_ip', 'date_joined', 'created_at', 'updated_at')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name', 'role', 'broker_company'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
    list_display = ('email', 'first_name', 'last_name', 'role', 'broker_company', 'is_tr', 'is_active', 'is_staff')
    list_filter = ('role', 'is_active', 'is_staff', 'is_superuser', 'broker_company', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'tr_name', 'tr_license_number')
    ordering = ('email',)
    
    def is_tr(self, obj):
        """Display whether the user has TR information."""
        return obj.is_tr
    is_tr.boolean = True
    is_tr.short_description = _('Is TR')


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    """Admin interface for UserActivity model."""
    
    list_display = ('user', 'action', 'ip_address', 'timestamp')
    list_filter = ('action', 'timestamp')
    search_fields = ('user__email', 'ip_address')
    readonly_fields = ('id', 'user', 'action', 'ip_address', 'timestamp', 'details')
    date_hierarchy = 'timestamp'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(UserQuotaUsage)
class UserQuotaUsageAdmin(admin.ModelAdmin):
    """Admin interface for UserQuotaUsage model."""
    
    list_display = ('user', 'date', 'daily_usage', 'monthly_usage', 'quota_status')
    list_filter = ('date', 'user')
    search_fields = ('user__email',)
    date_hierarchy = 'date'
    
    def quota_status(self, obj):
        """Display quota status with color coding."""
        daily_percent = (obj.daily_usage / obj.user.daily_form_quota) * 100 if obj.user.daily_form_quota > 0 else 0
        monthly_percent = (obj.monthly_usage / obj.user.monthly_form_quota) * 100 if obj.user.monthly_form_quota > 0 else 0
        
        if daily_percent >= 90 or monthly_percent >= 90:
            color = 'red'
        elif daily_percent >= 70 or monthly_percent >= 70:
            color = 'orange'
        else:
            color = 'green'
            
        return format_html(
            '<span style="color: {};">Daily: {}/{}% - Monthly: {}/{}%</span>',
            color,
            obj.daily_usage, obj.user.daily_form_quota,
            obj.monthly_usage, obj.user.monthly_form_quota
        )
    
    quota_status.short_description = _('Quota Status')
