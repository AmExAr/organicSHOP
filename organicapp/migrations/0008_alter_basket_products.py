# Generated by Django 5.2 on 2025-05-08 23:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organicapp', '0007_remove_review_product'),
    ]

    operations = [
        migrations.AlterField(
            model_name='basket',
            name='products',
            field=models.JSONField(default=dict, verbose_name='Список продуктов'),
        ),
    ]
