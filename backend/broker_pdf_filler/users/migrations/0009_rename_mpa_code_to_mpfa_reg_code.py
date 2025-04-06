from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0008_update_broker_company_fields'),
    ]

    operations = [
        migrations.RenameField(
            model_name='brokercompany',
            old_name='mpa_code',
            new_name='mpfa_reg_code',
        ),
    ] 