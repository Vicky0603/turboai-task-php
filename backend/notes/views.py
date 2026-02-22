from typing import Any

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Category, Note
from .serializers import CategorySerializer, NoteSerializer, NoteDetailSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category CRUD operations"""
    serializer_class = CategorySerializer

    def get_queryset(self):
        """Return categories owned by the current user."""
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Attach request.user to created Category instance."""
        serializer.save(user=self.request.user)


class NoteViewSet(viewsets.ModelViewSet):
    """ViewSet for Note CRUD operations"""
    
    def get_serializer_class(self):
        """Use a detailed serializer for retrieve, otherwise a lighter one."""
        if self.action == 'retrieve':
            return NoteDetailSerializer
        return NoteSerializer

    def get_queryset(self):
        """Return notes owned by the current user, optionally filtered by category id.

        Query params:
            category: int — if provided, filter notes by this category id.
        """
        queryset = Note.objects.filter(user=self.request.user)
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def perform_create(self, serializer):
        """Attach request.user to created Note instance."""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Return notes grouped by category for the current user."""
        categories = Category.objects.filter(user=request.user).prefetch_related('notes')
        result = []
        
        for category in categories:
            notes = self.get_serializer(category.notes.all(), many=True)
            result.append({
                'category': CategorySerializer(category).data,
                'notes': notes.data
            })
        
        return Response(result)
