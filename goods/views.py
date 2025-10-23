from django.core.paginator import Paginator
from django.shortcuts import get_list_or_404, render

from goods.models import Products

# Create your views here.
def catalog(request, category_slug):
    page = request.GET.get('page',1)
    if category_slug == 'all':
        goods = Products.objects.all()
    else:
        goods = get_list_or_404(Products.objects.filter(category__slug=category_slug))
    
    paginator = Paginator(goods, 3)
    current_page = paginator.page(int(page))
    page_range = [n for n in range(current_page.number-2, current_page.number+3)]
    
    context = {
        'title':'Home - Catalog', 
        'goods': current_page,
        'slug_url': category_slug,
        'page_range' : page_range
    }   
    return render(request, 'goods/catalog.html', context)


def product(request,product_slug):
    product = Products.objects.get(slug=product_slug)
    content = {
        'product':product
    }
    return render(request, 'goods/product.html',content)