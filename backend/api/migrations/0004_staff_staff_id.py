# Generated by Django 5.2 on 2025-05-03 07:29

import api.models.staff
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_student_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='staff',
            name='staff_id',
            field=models.UUIDField(default=api.models.staff.generate_uuid, editable=False, unique=True),
        ),
    ]
