from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name = "home"),
    path('about/', views.about, name = "about"),
    path('basket/', views.basket, name = "basket"),
    path('reviews/', views.reviews, name = "reviews"),
    path('profile/', views.profile, name = "profile"),
    path('register/', views.register, name = "register"),
    path('login/', views.login, name = "login"),
    path('logout/', views.logout_request, name = "logout"),
    path('api/basket/update/', views.update_basket, name='update_basket'),
    path('api/basket/get/', views.get_basket, name='get_basket'),
    path('api/basket/checkout/', views.checkout, name="checkout"),
    path('api/review/post/', views.reviewsPost, name = "reviewsPost"),
    path('api/profile/changePassword', views.changePassword, name = "changePassword"),
    path('api/profile/changeInfo', views.changeInfo, name="changeInfo"),
]