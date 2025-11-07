import pytest
from django.db import connection
from django.urls import reverse

pytestmark = pytest.mark.django_db

def test_catalog_all_smoke(client, product):
    # /catalog/all/
    url = reverse("catalog:index", kwargs={"category_slug": "all"})
    resp = client.get(url)
    assert resp.status_code == 200

def test_catalog_all_filters_and_ordering(client, product):
    # Перевірка, що в’юха коректно приймає query params (on_sale/order_by)
    url = reverse("catalog:index", kwargs={"category_slug": "all"})
    resp = client.get(url + "?on_sale=1&order_by=price")
    assert resp.status_code == 200

def test_product_detail(client, product):
    url = reverse("catalog:product", kwargs={"product_slug": product.slug})
    resp = client.get(url)
    assert resp.status_code == 200
    # (опційно) перевір контекст
    assert "product" in resp.context
    assert resp.context["product"].id == product.id

def test_product_detail_404(client):
    url = reverse("catalog:product", kwargs={"product_slug": "non-existing-slug"})
    resp = client.get(url)
    assert resp.status_code in (404, 302)  # якщо у тебе редірект — залиш 302, якщо ні — 404

def test_search_numeric_id_branch(client, product):
    # Це гілка q_search для коротких числових рядків (<=5 символів)
    url = reverse("catalog:search")
    resp = client.get(url + f"?q={product.id}")
    assert resp.status_code == 200

@pytest.mark.skipif(connection.vendor != "postgresql", reason="Full-text search вимагає Postgres")
def test_search_full_text_postgres(client, product):
    # Цей тест виконується лише на Postgres (фултекстова гілка в goods.utils.q_search)
    url = reverse("catalog:search")
    resp = client.get(url + f"?q={product.name.split()[0]}")
    assert resp.status_code == 200
