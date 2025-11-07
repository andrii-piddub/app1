from decimal import Decimal
from carts.models import Cart


def test_cart_item_products_price(user, product, db):
    # quantity=2, sell_price=90.00 => 180.00
    c = Cart.objects.create(user=user, product=product, quantity=2)
    assert c.products_price() == Decimal("180.00")


def test_cart_queryset_totals(user, product, db):
    # 2 * 90 = 180 та 1 * 90 = 90
    Cart.objects.create(user=user, product=product, quantity=2)
    Cart.objects.create(user=user, product=product, quantity=1)

    qs = Cart.objects.filter(user=user)

    # Якщо у тебе є кастомні менеджер/QuerySet з методами:
    assert qs.total_quantity() == 3
    assert qs.total_price() == Decimal("270.00")
