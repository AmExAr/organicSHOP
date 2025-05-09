from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import Info, Basket, Product, Review, ProductType, Measure

class InfoInline(admin.StackedInline):
    model = Info
    can_delete = False
    verbose_name_plural = 'Info'

class UserAdmin(BaseUserAdmin):
    inlines = (InfoInline,)

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

admin.site.register(Basket)
admin.site.register(Product)
admin.site.register(Review)
admin.site.register(ProductType)
admin.site.register(Measure)
#admin.site.register(Info)