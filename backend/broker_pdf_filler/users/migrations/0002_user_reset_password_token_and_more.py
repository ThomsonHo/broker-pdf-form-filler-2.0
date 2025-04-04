# Generated by Django 5.2 on 2025-04-04 06:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='reset_password_token',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='reset_password_token_expiry',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
