import pytest
from django.urls import reverse
from rest_framework import status
from notes.models import Category, Note


@pytest.mark.api
@pytest.mark.django_db
class TestCategoryAPI:
    """Test Category API endpoints"""

    def test_list_categories_authenticated(self, authenticated_client, user):
        """Test listing categories when authenticated"""
        # Create categories
        Category.objects.create(name="Work", color="peach", user=user)
        Category.objects.create(name="Personal", color="yellow", user=user)

        url = reverse('category-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2

    def test_list_categories_unauthenticated(self, api_client):
        """Test listing categories without authentication"""
        url = reverse('category-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_categories_include_notes_count(self, authenticated_client, user, category):
        """Test that category response includes notes_count"""
        # Create notes
        Note.objects.create(title="Note 1", content="Content", category=category, user=user)
        Note.objects.create(title="Note 2", content="Content", category=category, user=user)

        url = reverse('category-list')
        response = authenticated_client.get(url)

        # Find our category in response
        our_category = next((c for c in response.data if c['id'] == category.id), None)
        assert our_category is not None
        assert our_category['notes_count'] == 2

    def test_user_only_sees_own_categories(self, authenticated_client, user, create_user):
        """Test that users only see their own categories"""
        # Create category for authenticated user
        Category.objects.create(name="My Category", color="peach", user=user)

        # Create another user and their category
        other_user = create_user(email="other@example.com")
        Category.objects.create(name="Other Category", color="yellow", user=other_user)

        url = reverse('category-list')
        response = authenticated_client.get(url)

        # Should only see own categories
        category_names = [c['name'] for c in response.data]
        assert "My Category" in category_names or "Random Thoughts" in category_names  # Default categories
        assert "Other Category" not in category_names

    def test_create_update_delete_category(self, authenticated_client):
        """Create, update, and delete a category via API."""
        url = reverse('category-list')
        create_resp = authenticated_client.post(url, {"name": "Work", "color": "peach"}, format='json')
        assert create_resp.status_code == status.HTTP_201_CREATED
        cat_id = create_resp.data['id']

        detail = reverse('category-detail', kwargs={'pk': cat_id})
        patch_resp = authenticated_client.patch(detail, {"name": "Work Updated"}, format='json')
        assert patch_resp.status_code == status.HTTP_200_OK
        assert patch_resp.data['name'] == 'Work Updated'

        del_resp = authenticated_client.delete(detail)
        assert del_resp.status_code == status.HTTP_204_NO_CONTENT

    def test_cannot_modify_others_category(self, authenticated_client, create_user):
        """User cannot update/delete another user's category."""
        other = create_user(email="o2@example.com")
        other_cat = Category.objects.create(name="Other", color="peach", user=other)
        detail = reverse('category-detail', kwargs={'pk': other_cat.id})
        resp = authenticated_client.patch(detail, {"name": "X"}, format='json')
        assert resp.status_code == status.HTTP_404_NOT_FOUND
        resp2 = authenticated_client.delete(detail)
        assert resp2.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.api
@pytest.mark.django_db
class TestNoteAPI:
    """Test Note API endpoints"""

    def test_list_notes_authenticated(self, authenticated_client, user, category):
        """Test listing notes when authenticated"""
        Note.objects.create(title="Note 1", content="Content 1", category=category, user=user)
        Note.objects.create(title="Note 2", content="Content 2", category=category, user=user)

        url = reverse('note-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) >= 2

    def test_list_notes_filter_by_category(self, authenticated_client, user, create_category):
        """List notes filtered by category id query param."""
        cat1 = create_category(name="Cat A")
        cat2 = create_category(name="Cat B")
        Note.objects.create(title="A1", content="c", category=cat1, user=user)
        Note.objects.create(title="A2", content="c", category=cat1, user=user)
        Note.objects.create(title="B1", content="c", category=cat2, user=user)

        url = reverse('note-list') + f"?category={cat2.id}"
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['title'] == 'B1'

    def test_list_notes_unauthenticated(self, api_client):
        """Test listing notes without authentication"""
        url = reverse('note-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_note_success(self, authenticated_client, category):
        """Test creating a note"""
        url = reverse('note-list')
        data = {
            'title': 'New Note',
            'content': 'Note content',
            'category': category.id
        }

        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'New Note'
        assert response.data['content'] == 'Note content'
        assert response.data['category'] == category.id

        # Verify in database
        note = Note.objects.get(id=response.data['id'])
        assert note.title == 'New Note'

    def test_create_note_invalid_category(self, authenticated_client, create_user):
        """Test creating note with category from another user"""
        other_user = create_user(email="other@example.com")
        other_category = Category.objects.create(name="Other", color="peach", user=other_user)

        url = reverse('note-list')
        data = {
            'title': 'Note',
            'content': 'Content',
            'category': other_category.id
        }

        response = authenticated_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_update_note_invalid_category(self, authenticated_client, create_user, category, user):
        """Updating a note with another user's category should fail."""
        other_user = create_user(email="o@example.com")
        other_cat = Category.objects.create(name="Other", color="peach", user=other_user)
        note = Note.objects.create(title="T", content="C", category=category, user=user)

        url = reverse('note-detail', kwargs={'pk': note.id})
        data = {'category': other_cat.id}
        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_retrieve_note(self, authenticated_client, note):
        """Test retrieving a specific note"""
        url = reverse('note-detail', kwargs={'pk': note.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == note.id
        assert response.data['title'] == note.title

    def test_update_note(self, authenticated_client, note):
        """Test updating a note"""
        url = reverse('note-detail', kwargs={'pk': note.id})
        data = {
            'title': 'Updated Title',
            'content': 'Updated content',
            'category': note.category.id
        }

        response = authenticated_client.put(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Title'

        # Verify in database
        note.refresh_from_db()
        assert note.title == 'Updated Title'

    def test_partial_update_note(self, authenticated_client, note):
        """Test partially updating a note"""
        url = reverse('note-detail', kwargs={'pk': note.id})
        data = {'title': 'Partially Updated'}

        response = authenticated_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Partially Updated'
        assert response.data['content'] == note.content  # Unchanged

    def test_delete_note(self, authenticated_client, note):
        """Test deleting a note"""
        note_id = note.id
        url = reverse('note-detail', kwargs={'pk': note_id})

        response = authenticated_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Note.objects.filter(id=note_id).exists()

    def test_user_cannot_access_other_users_notes(self, authenticated_client, create_user, create_category):
        """Test that users cannot access notes from other users"""
        # Create another user and their note
        other_user = create_user(email="other@example.com")
        other_category = Category.objects.create(name="Other", color="peach", user=other_user)
        other_note = Note.objects.create(
            title="Other Note",
            content="Content",
            category=other_category,
            user=other_user
        )

        # Try to access other user's note
        url = reverse('note-detail', kwargs={'pk': other_note.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_note_response_includes_category_info(self, authenticated_client, note):
        """Test that note response includes category name and color"""
        url = reverse('note-detail', kwargs={'pk': note.id})
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'category_name' in response.data
        assert 'category_color' in response.data
        assert response.data['category_name'] == note.category.name
        assert response.data['category_color'] == note.category.color

    def test_by_category_endpoint(self, authenticated_client, user, create_category):
        """Grouped notes by category endpoint returns categories with notes."""
        c1 = create_category(name="Group1")
        c2 = create_category(name="Group2")
        n1 = Note.objects.create(title="N1", content="x", category=c1, user=user)
        n2 = Note.objects.create(title="N2", content="y", category=c2, user=user)

        url = reverse('note-by-category')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        categories = [item['category']['name'] for item in response.data]
        assert set(categories) >= {"Group1", "Group2"}
        all_note_ids = {n['id'] for item in response.data for n in item['notes']}
        assert {n1.id, n2.id}.issubset(all_note_ids)

    def test_notes_ordered_by_updated_at(self, authenticated_client, user, category):
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

        url = reverse('note-list')
        response = authenticated_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        # Most recent should be first
        assert response.data[0]['id'] == note2.id
