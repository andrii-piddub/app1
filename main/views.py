from django.http import HttpResponse
from django.shortcuts import render
from goods.models import Categories
# Create your views here.

def index(request):

    context = {
        'title':'Home - Main ',
        'content':'Furniture shop - Home',
   
    }
    return render(request, 'main/index.html',context)

def about(request):
    context = {
        'title':'Home - About ',
        'content':'About our shop',
        'text_on_page':'Our furniture shop offers high-quality, stylish, and durable pieces designed to bring comfort and elegance to any space. We focus on combining modern design with craftsmanship to help customers create homes they truly love.'
   
    }

    return render(request, 'main/about.html',context)