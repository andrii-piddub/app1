from django.db import models

from goods.models import Products
from users.models import User

# Create your models here.


class CartQuerySet(models.QuerySet):
    
    def total_price(self):
        return sum(cart.products_price() for cart in self )
    def total_quantity(self):
        if self:
            return sum(cart.quantity for cart in self)
        return 0


class Cart(models.Model):
    user = models.ForeignKey ( to=User, blank=True, null=True, on_delete=models.CASCADE )
    product = models.ForeignKey(to=Products, on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField(default=0)
    session_key = models.CharField(max_length=32, blank=True, null=True)
    created_timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'cart'
        verbose_name='Cart'
        verbose_name_plural = 'Carts'

    objects = CartQuerySet().as_manager()

    def products_price(self):
        return round(self.product.sell_price()*self.quantity,2)

    def __str__(self):
        if self.user:
            return f'Cart {self.user.username} | Product {self.product.name} | Quantity {self.quantity}'
        return f'Anonymous Cart| Product {self.product.name} | Quantity {self.quantity}'