from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_update_broker_company_model'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='brokercompany',
            options={'ordering': ['name'], 'verbose_name': 'broker company', 'verbose_name_plural': 'broker companies'},
        ),
        migrations.RemoveField(
            model_name='brokercompany',
            name='address',
        ),
        migrations.RemoveField(
            model_name='brokercompany',
            name='contact_email',
        ),
        migrations.RemoveField(
            model_name='brokercompany',
            name='ia_reg_code',
        ),
        migrations.RemoveField(
            model_name='brokercompany',
            name='mpfa_reg_code',
        ),
        migrations.RemoveField(
            model_name='brokercompany',
            name='phone_number',
        ),
        migrations.RemoveField(
            model_name='brokercompany',
            name='responsible_person_email',
        ),
        migrations.AddField(
            model_name='brokercompany',
            name='code',
            field=models.CharField(default='', max_length=50, unique=True, verbose_name='company code'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='brokercompany',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='brokercompany',
            name='name',
            field=models.CharField(max_length=255, unique=True, verbose_name='company name'),
        ),
    ] 