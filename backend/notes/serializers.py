from rest_framework import serializers
from .models import Category, Note


class CategorySerializer(serializers.ModelSerializer):
    notes_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'color', 'notes_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_notes_count(self, obj: Category) -> int:
        """Return the number of notes linked to this category."""
        return obj.notes.count()


class NoteSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'category', 'category_name', 'category_color', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class NoteDetailSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'category', 'category_details', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
