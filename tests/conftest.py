# tests/conftest.py
import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model

@pytest.fixture
def user(db):
    User = get_user_model()
    return User.objects.create_user(
        username="u1", email="u1@example.com", password="pass12345"
    )

@pytest.fixture
def admin_user(db):
    User = get_user_model()
    return User.objects.create_superuser(
        username="admin", email="admin@example.com", password="adminpass123"
    )

@pytest.fixture
def client_logged(client, user):
    client.login(username="u1", password="pass12345")
    return client

# ---- goods ----
@pytest.fixture
def category(db):
    from goods.models import Categories
    return Categories.objects.create(name="Chairs", slug="chairs")

@pytest.fixture
def product(db, category):
    from goods.models import Products
    return Products.objects.create(
        name="Office Chair",
        slug="office-chair",
        description="Test chair",
        price=Decimal("100.00"),
        discount=Decimal("10.00"),  # 10%
        quantity=5,
        category=category,
    )

# ---- carts ----
@pytest.fixture
def cart_item(db, user, product):
    from carts.models import Cart
    return Cart.objects.create(user=user, product=product, quantity=1)

# ---- загальні утиліти ----
@pytest.fixture
def rf():
    from django.test import RequestFactory
    return RequestFactory()

# Тимчасові директорії для медіа/статик, щоб не смітити локальні файли під час тестів
