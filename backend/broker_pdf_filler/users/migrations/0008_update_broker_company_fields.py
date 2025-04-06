from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_revert_broker_company_changes'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='brokercompany',
            name='code',
        ),
        migrations.AlterField(
            model_name='brokercompany',
            name='name',
            field=models.CharField(max_length=255, null=True, blank=True, verbose_name='broker name'),
        ),
        migrations.AddField(
            model_name='brokercompany',
            name='ia_reg_code',
            field=models.CharField(max_length=6, null=True, blank=True, verbose_name='broker IA reg code'),
        ),
        migrations.AddField(
            model_name='brokercompany',
            name='mpa_code',
            field=models.CharField(max_length=8, null=True, blank=True, verbose_name='broker MPA code'),
        ),
        migrations.AddField(
            model_name='brokercompany',
            name='phone_number',
            field=models.CharField(max_length=20, null=True, blank=True, verbose_name='broker phone number'),
        ),
        migrations.AddField(
            model_name='brokercompany',
            name='address',
            field=models.TextField(default='Hong Kong', null=True, blank=True, verbose_name='broker address'),
        ),
        migrations.AddField(
            model_name='brokercompany',
            name='responsible_officer_email',
            field=models.EmailField(max_length=254, null=True, blank=True, verbose_name='broker responsible officer email'),
        ),
        migrations.AddField(
            model_name='brokercompany',
            name='contact_email',
            field=models.EmailField(max_length=254, null=True, blank=True, verbose_name='broker contact email'),
        ),
    ] 