from django.urls import path
from .views import home, songs

urlpatterns = [
    path('', home, name='home'),
    path('songs/', songs, name='songs'),
]
