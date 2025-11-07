from decimal import Decimal
import re
from django.urls import reverse


def test_products_sell_price_with_discount(product):
    # 100.00 - 10% = 90.00
    assert product.sell_price() == Decimal("90.00")


def test_products_sell_price_zero_discount(product):
    product.discount = Decimal("0.00")
    assert product.sell_price() == Decimal("100.00")


def test_products_sell_price_none_discount(product):
    # якщо у моделі discount може бути None — ціну не знижуємо
    product.discount = None
    assert product.sell_price() == Decimal("100.00")


def test_products_display_id_format(product):
    disp = product.display_id()
    # 5 цифр, з нулями попереду
    assert isinstance(disp, str)
    assert bool(re.fullmatch(r"\d{5}", disp))


def test_products_get_absolute_url(product):
    assert product.get_absolute_url() == reverse(
        "catalog:product", kwargs={"product_slug": product.slug}
    )


def test_products_str(product, category):
    # Зазвичай __str__ повертає назву; підкоригуй, якщо в тебе інакше
    assert str(product) == "Office Chair"
