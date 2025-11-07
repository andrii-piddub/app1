import pytest
from django.urls import reverse

pytestmark = pytest.mark.django_db

def test_main_index(client):
    url = reverse("main:index")
    resp = client.get(url)
    assert resp.status_code == 200
    # якщо у в’юхі додається контекст з випадковими товарами
    assert "random_products" in resp.context
    assert len(resp.context["random_products"]) <= 3

def test_main_about(client):
    url = reverse("main:about")
    resp = client.get(url)
    assert resp.status_code == 200
