import pytest
from django.contrib.auth import get_user_model
from notes.models import Category, Note

User = get_user_model()


@pytest.mark.unit
@pytest.mark.django_db
class TestCategoryModel:
    """Test Category model"""

    def test_create_category(self, user):
        """Test creating a category"""
        category = Category.objects.create(
            name="Test Category",
            color="peach",
            user=user
        )

        assert category.name == "Test Category"
        assert category.color == "peach"
        assert category.user == user

    def test_category_str_representation(self, user):
        """Test category string representation"""
        category = Category.objects.create(
            name="My Category",
            color="yellow",
            user=user
        )

        assert str(category) == "My Category"

    def test_category_color_choices(self, user):
        """Test valid category colors"""
        valid_colors = ['peach', 'yellow', 'mint']

        for color in valid_colors:
            category = Category.objects.create(
                name=f"Category {color}",
                color=color,
                user=user
            )
            assert category.color == color

    def test_category_notes_count(self, user, category):
        """Test notes count via related manager"""
        # Initially no notes
        assert category.notes.count() == 0

        # Create notes
        Note.objects.create(
            title="Note 1",
            content="Content 1",
            category=category,
            user=user
        )
        Note.objects.create(
            title="Note 2",
            content="Content 2",
            category=category,
            user=user
        )

        # Check count
        assert category.notes.count() == 2

    def test_default_categories_created_for_new_user(self, db):
        """Test that default categories are created via signal"""
        user = User.objects.create_user(
            email="newuser@example.com",
            password="pass123"
        )

        categories = Category.objects.filter(user=user)
        assert categories.count() == 3

        category_names = set(categories.values_list('name', flat=True))
        expected_names = {'Random Thoughts', 'School', 'Personal'}
        assert category_names == expected_names


@pytest.mark.unit
@pytest.mark.django_db
class TestNoteModel:
    """Test Note model"""

    def test_create_note(self, user, category):
        """Test creating a note"""
        note = Note.objects.create(
            title="Test Note",
            content="This is a test note",
            category=category,
            user=user
        )

        assert note.title == "Test Note"
        assert note.content == "This is a test note"
        assert note.category == category
        assert note.user == user

    def test_note_str_representation(self, user, category):
        """Test note string representation"""
        note = Note.objects.create(
            title="My Note",
            content="Content",
            category=category,
            user=user
        )

        assert str(note) == "My Note"

    def test_note_timestamps(self, user, category):
        """Test that created_at and updated_at are set"""
        note = Note.objects.create(
            title="Note",
            content="Content",
            category=category,
            user=user
        )

        assert note.created_at is not None
        assert note.updated_at is not None
        assert note.created_at == note.updated_at

    def test_note_updated_at_changes(self, user, category):
        """Test that updated_at changes on save"""
        note = Note.objects.create(
            title="Original Title",
            content="Content",
            category=category,
            user=user
        )

        original_updated_at = note.updated_at

        # Update note
        note.title = "Updated Title"
        note.save()

        assert note.updated_at > original_updated_at

    def test_note_ordering(self, user, category):
        """Test that notes are ordered by updated_at descending"""
        note1 = Note.objects.create(
            title="First",
            content="Content 1",
            category=category,
            user=user
        )
        note2 = Note.objects.create(
            title="Second",
            content="Content 2",
            category=category,
            user=user
        )

        notes = Note.objects.all()
        # Most recent first
        assert notes[0] == note2
        assert notes[1] == note1

    def test_cascade_delete_category(self, user, category):
        """Test that notes are deleted when category is deleted"""
        note = Note.objects.create(
            title="Note",
            content="Content",
            category=category,
            user=user
        )

        category_id = category.id
        category.delete()

        # Note should still exist but category should be deleted
        assert not Category.objects.filter(id=category_id).exists()
        # Note should be deleted due to CASCADE
        assert not Note.objects.filter(id=note.id).exists()

    def test_cascade_delete_user(self, user, category):
        """Test that notes are deleted when user is deleted"""
        note = Note.objects.create(
            title="Note",
            content="Content",
            category=category,
            user=user
        )

        user_id = user.id
        user.delete()

        # User should be deleted
        assert not User.objects.filter(id=user_id).exists()
        # Note should be deleted due to CASCADE
        assert not Note.objects.filter(id=note.id).exists()
        # Category should also be deleted
        assert not Category.objects.filter(id=category.id).exists()

