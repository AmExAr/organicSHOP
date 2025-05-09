from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.core.exceptions import ValidationError

class CustomUserCreationForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=True, label="Ваше имя")

    class Meta:
        model = User
        fields = ("username", "first_name", "password1", "password2")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = "Номер телефона"

    def clean_password1(self):
        password = self.cleaned_data.get("password1")
        if len(password) < 8:
            raise ValidationError("Пароль должен содержать минимум 8 символов.")
        return password

    def clean_username(self):
        phone = self.cleaned_data.get("username")
        if User.objects.filter(username=phone).exists():
            raise ValidationError("Этот номер телефона уже зарегистрирован.")
        return phone

    def save(self, commit=True):
        user = super().save(commit=False)
        user.first_name = self.cleaned_data["first_name"]
        if commit:
            user.save()
        return user

