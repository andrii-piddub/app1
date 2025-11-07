# tests/test_views_carts.py
import pytest
from django.urls import reverse
from carts.models import Cart

pytestmark = pytest.mark.django_db


def test_cart_add_anonymous_creates_session_and_item(client, product):
    """
    Анонімний користувач додає товар у кошик:
    - створюється запис у Cart, прив’язаний до session_key
    - відповідь має статус 200 і JSON з HTML-фрагментом кошика
    """
    url = reverse("carts:cart_add")
    resp = client.post(url, {"product_id": product.id})
    assert resp.status_code == 200

    # Після POST у клієнта гарантовано є session_key
    session_key = client.session.session_key
    assert session_key  # не None/порожній

    cart_exists = Cart.objects.filter(session_key=session_key, product=product).exists()
    assert cart_exists

    data = resp.json()
    # Не зав’язуємося на конкретний текст повідомлення — лише на наявність ключів
    assert isinstance(data.get("cart_items_html"), str)
    assert "message" in data


def test_cart_add_authenticated_increments_quantity(client_logged, user, product):
    """
    Авторизований користувач додає той самий товар двічі:
    - перший POST створює позицію
    - другий POST інкрементує quantity до 2
    """
    url = reverse("carts:cart_add")
    resp1 = client_logged.post(url, {"product_id": product.id})
    assert resp1.status_code == 200

    resp2 = client_logged.post(url, {"product_id": product.id})
    assert resp2.status_code == 200

    c = Cart.objects.get(user=user, product=product)
    assert c.quantity == 2

    data = resp2.json()
    assert isinstance(data.get("cart_items_html"), str)


def test_cart_change_updates_quantity(client_logged, user, product):
    """
    Зміна кількості існуючої позиції в кошику через carts:cart_change.
    """
    cart = Cart.objects.create(user=user, product=product, quantity=1)

    url = reverse("carts:cart_change")
    resp = client_logged.post(url, {"cart_id": cart.id, "quantity": 3})
    assert resp.status_code == 200

    cart.refresh_from_db()
    assert cart.quantity == 3

    data = resp.json()
    # Багато реалізацій повертають оновлену кількість і HTML-фрагмент
    assert data.get("quantity") == 3
    assert isinstance(data.get("cart_items_html"), str)


def test_cart_remove_deletes_item(client_logged, user, product):
    """
    Видалення позиції з кошика:
    - запис зникає
    - у відповіді присутній HTML-фрагмент та, зазвичай, кількість видаленої позиції
    """
    cart = Cart.objects.create(user=user, product=product, quantity=2)

    url = reverse("carts:cart_remove")
    resp = client_logged.post(url, {"cart_id": cart.id})
    assert resp.status_code == 200

    assert not Cart.objects.filter(id=cart.id).exists()

    data = resp.json()
    # Якщо у твоїй реалізації є ключ 'quantity_deleted' — перевіримо його;
    # якщо ні — тест залишиться стабільним.
    if "quantity_deleted" in data:
        assert data["quantity_deleted"] == 2
    assert isinstance(data.get("cart_items_html"), str)
