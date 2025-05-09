from django.db import models
from datetime import date
from django.urls import reverse
from django.contrib.auth.models import User
import os
import json


class Info(models.Model):
    user = models.OneToOneField(User, on_delete = models.CASCADE)
    avatar = models.ImageField("Аватарка", upload_to = "Avatars/", default='avatars/user-interface 1.png')
    address = models.TextField("Адрес", default="")

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

class ProductType(models.Model):
    typeName = models.CharField("Тип продукта", max_length = 200, unique = True)

    def __str__(self):
        return self.typeName

    class Meta:
        verbose_name = "Тип"
        verbose_name_plural = "Типы"

class Measure(models.Model):
    measureName = models.CharField("Мера")

    def __str__(self):
        return self.measureName

    class Meta:
        verbose_name = "Мера"
        verbose_name_plural = "Меры"


class Product(models.Model):
    name = models.CharField("Название продукта", max_length = 200, unique = True)
    type = models.ForeignKey(ProductType, verbose_name = "Тип", on_delete = models.CASCADE)
    description = models.TextField("Описание")
    photo = models.ImageField("Фото", upload_to = "Products/")
    measure = models.ForeignKey(Measure, verbose_name = "Мера", on_delete = models.CASCADE)
    quantity = models.FloatField("Количество меры в 1 товаре", default = 1.0)
    price = models.PositiveIntegerField("Цена")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("product_detail", kwargs = {"slug": self.url})

    class Meta:
        verbose_name = "Продукт"
        verbose_name_plural = "Продукты"

class Review(models.Model):
    #product = models.ForeignKey(Product, verbose_name = "Продукт", on_delete = models.CASCADE)
    user = models.ForeignKey(User, verbose_name = "Пользователь", on_delete = models.CASCADE)
    commentary = models.TextField("Комментарий")
    rating = models.PositiveSmallIntegerField("Оценка", default = 5)

    def __str__(self):
        return f"отзыв {self.user.username}"
    
    def post(self, user):
        try:
            pass
        except Exception as e:
            return e

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"

class Basket(models.Model):
    user = models.ForeignKey(User, verbose_name = "Пользователь", on_delete = models.CASCADE)
    products = models.JSONField("Список продуктов", default = dict)
    status = models.BooleanField("Актуальность", default = True)
    time = models.DateTimeField("Время покупки", auto_now_add=True, null=True)

    def __str__(self):
        return self.user.username

    def get_absolute_url(self):
        return reverse("basket", kwargs = {"slug": self.url})
    
    @classmethod
    def get_user_basket(cls, user):
        try:
            basket = cls.objects.get(user=user, status=True)
            return json.loads(basket.products)
        except cls.DoesNotExist:
            return {}
    
    class Meta:
        verbose_name = "Корзина"
        verbose_name_plural = "Корзины"