from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Category


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_categories(sender, instance, created, **kwargs):
    """Create default categories when a new user is created"""
    if created:
        default_categories = [
            {'name': 'Random Thoughts', 'color': 'peach'},
            {'name': 'School', 'color': 'yellow'},
            {'name': 'Personal', 'color': 'mint'},
        ]
        
        for category_data in default_categories:
            Category.objects.create(
                user=instance,
                name=category_data['name'],
                color=category_data['color']
            )

