from django.http import HttpResponse
from django.shortcuts import render
from goods.models import Categories
import random
from goods.models import Products
# Create your views here.

def index(request):

    products = list(Products.objects.all())
    random_products = random.sample(products, min(len(products),3))

    context = {
        'title':'Home - Main ',
        'content':'furniture shop - shopNest',
        'random_products':random_products,

    }
    return render(request, 'main/index.html',context)

def about(request):
    context = {
        'title':'Home - About ',
        'content':'About our shop',
        'text_on_page':'Our furniture shop offers high-quality, stylish, and durable pieces designed to bring comfort and elegance to any space. We focus on combining modern design with craftsmanship to help customers create homes they truly love.'

    }

    return render(request, 'main/about.html',context)