from django.shortcuts import render, redirect
from .models import Product, Review, Basket, Info
from .forms import CustomUserCreationForm
from django.contrib.auth import logout, get_user_model, update_session_auth_hash, authenticate, login as django_login
from django.middleware.csrf import get_token
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

User = get_user_model()


@login_required
def get_csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})

@login_required
@csrf_exempt
def update_basket(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            cart_data = data.get('cart', {})
            
            basket, created = Basket.objects.get_or_create(
                user=request.user,
                status=True,
                defaults={'products': json.dumps(cart_data)}
            )
            
            if not created:
                basket.products = json.dumps(cart_data)
                basket.save()
            
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error'}, status=405)

@login_required
@csrf_exempt
def get_basket(request):
    if request.method == 'POST':
        try:
            cart_data = Basket.get_user_basket(user=request.user)
            return JsonResponse({'cart' : cart_data})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error'}, status=405)

def register(request):
    if request.method == "POST":
        try:
            form = CustomUserCreationForm(request.POST)
            if form.is_valid():
                user = form.save()
                django_login(request, user)
                get_token(request)
                return JsonResponse({'status': 'success', 'message': 'Успешная регистрация'}, status=200)
            else:
                return JsonResponse({'status': 'error', 'errors': form.errors}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message' : e}, status=400)
    return JsonResponse({'status': 'error'}, status=405)

def login(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        if not username or not password:
            return JsonResponse({'status': 'error', 'message': 'Введите номер телефона и пароль.'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            django_login(request, user)
            get_token(request)
            return JsonResponse({'status': 'success', 'message': 'Успешный вход'}, status=200)
        else:
            return JsonResponse({'status': 'error', 'message': 'Неверный номер телефона или пароль.'}, status=400)
    return JsonResponse({'status': 'error'}, status=405) 

def home(request):
    meats = Product.objects.filter(type__typeName = "Мясо")
    fruits = Product.objects.filter(type__typeName = "Фрукт")
    vegetables = Product.objects.filter(type__typeName = "Овощ")
    milks = Product.objects.filter(type__typeName = "Молочный продукт")
    return render(request, "organicapp/index.html", {"meats": meats, "fruits": fruits,
                  "vegetables": vegetables, "milks": milks})

def logout_request(request):
    logout(request)
    return redirect("home")   
 
def about(request):
    return render(request, "organicapp/about.html")

def basket(request):
    return render(request, "organicapp/cart.html")

def profile(request):
    if request.method == "GET":
        return render(request, "organicapp/profile.html")
    return JsonResponse({'status': 'error'}, status=405)

def reviews(request):
    if request.method == "GET":
        reviews = Review.objects.all()
        return render(request, 'organicapp/reviews.html', {"reviews": reviews})
    return JsonResponse({'status': 'error'}, status=405)

@login_required
@csrf_exempt
def reviewsPost(request):
    if request.method == "POST":
        review = Review()
        review.user = request.user
        review.commentary = request.POST.get("commentary")
        review.rating = request.POST.get("rating")
        review.save()
        return redirect('reviews')
    return JsonResponse({'status': 'error'}, status=405)

@login_required
@csrf_exempt
def changeInfo(request):
    if request.method == "POST":
        try:
            info, created = Info.objects.get_or_create(user=request.user)
            
            info.address = request.POST.get("address")
            info.save()
            
            request.user.first_name = request.POST.get("first_name")
            request.user.save()
            update_session_auth_hash(request, request.user)
            return JsonResponse({'status': 'success', 'message' : 'Данные успешно изменены!'}, status=200)
        except Exception as e:
            return JsonResponse({'status' : 'error', 'message' : str(e)}, status=400)
    else:
        return JsonResponse({'status' : 'error'}, status=405)

@login_required
@csrf_exempt
def checkout(request):
    if request.method == "POST":
        try:
            cart = json.loads(request.POST.get("cart"))
            if len(cart) == 0:
                return JsonResponse({'status': 'error', 'message': 'Корзина пуста.'}, status=400)
            info, created = Info.objects.get_or_create(user=request.user)
            if info.address == "" or (created.address if type(created) != bool else "1") == "":
                return JsonResponse({'status': 'error', 'message': 'У вас не указан адрес. Зайдите в профиль и укажите ваш адрес.'}, status=400)
            basket = Basket.objects.get(user=request.user)
            print(basket)
            basket.delete()
            return JsonResponse({'status': 'success', 'message' : 'Корзина оплачена. Спасибо за заказ!', 'cart' : '{}'}, status=200)
        except Exception as e:
            return JsonResponse({'status' : 'error', 'message' : str(e)}, status=400)
    else:
        return JsonResponse({'status' : 'error'}, status=405)

@login_required
@csrf_exempt
def changePassword(request):
    if request.method == "POST":
        try:
            current_password = request.POST.get("current_password")
            new_password = request.POST.get("new_password")
            confirm_password = request.POST.get("confirm_password")

            if not request.user.check_password(current_password):
                return JsonResponse({'status': 'error', 'message': 'Текущий пароль неверен'}, status=400)

            if new_password != confirm_password:
                return JsonResponse({'status': 'error', 'message': 'Новые пароли не совпадают'}, status=400)

            if len(new_password) < 8:
                return JsonResponse({'status': 'error', 'message': 'Пароль должен содержать не менее 8 символов'}, status=400)

            request.user.set_password(new_password)
            request.user.save()
            update_session_auth_hash(request, request.user)

            return JsonResponse({'status': 'success', 'message' : 'Пароль успешно изменён!'})

        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error'}, status=405)