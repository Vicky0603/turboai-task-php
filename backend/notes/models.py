from django.db import models
from django.conf import settings


class Category(models.Model):
    """Model for note categories"""
    CATEGORY_COLORS = [
        ('peach', 'Peach'),
        ('yellow', 'Yellow'),
        ('mint', 'Mint'),
    ]
    
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=20, choices=CATEGORY_COLORS, default='peach')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
        unique_together = ['name', 'user']

    def __str__(self):
        return self.name


class Note(models.Model):
    """Model for notes"""
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='notes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title
