document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(form.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const errorDiv = document.getElementById('loginError');

        if (data.status === 'error') {
            if (data.errors) {
                let messages = [];
                for (let field in data.errors) {
                    messages.push(`${data.errors[field].join(', ')}`);
                }
                errorDiv.innerText = messages.join('\n');
                errorDiv.style.color = 'red';
            } else if (data.message) {
                errorDiv.innerText = data.message;
                errorDiv.style.color = 'red';
            }
            errorDiv.style.display = 'block';
        } else {
            errorDiv.innerText = data.message;
            errorDiv.style.color = 'green';
            errorDiv.style.display = 'block';
            setTimeout(() => {
                window.location.href = '/home/';
            }, 2000);
        }
    })
    .catch(error => {
        const errorDiv = document.getElementById('loginError');
        errorDiv.innerText = 'Ошибка сети. Попробуйте снова.';
        errorDiv.style.color = 'red';
        errorDiv.style.display = 'block';
        console.error('Ошибка:', error);
    });
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(form.action, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const errorDiv = document.getElementById('registerError');

        if (data.status === 'error') {
            if (data.errors) {
                let messages = [];
                for (let field in data.errors) {
                    messages.push(`${data.errors[field].join(', ')}`);
                }
                errorDiv.innerText = messages.join('\n');
                errorDiv.style.color = 'red';
            } else if (data.message) {
                errorDiv.innerText = data.message;
                errorDiv.style.color = 'red';
            }
            errorDiv.style.display = 'block';
        } else {
            errorDiv.innerText = data.message;
            errorDiv.style.color = 'green';
            errorDiv.style.display = 'block';
            setTimeout(() => {
                window.location.href = '/home/';
            }, 2000);
        }
    })
    .catch(error => {
        const errorDiv = document.getElementById('registerError');
        errorDiv.innerText = 'Ошибка сети. Попробуйте снова.';
        errorDiv.style.color = 'red';
        errorDiv.style.display = 'block';
        console.error('Ошибка:', error);
    });
});

const changePasswordForm = document.getElementById("changePasswordForm");
const changePasswordError = document.getElementById("changePasswordError");

if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById("current_password").value;
        const newPassword = document.getElementById("new_password").value;
        const confirmPassword = document.getElementById("confirm_password").value;

        const formData = new FormData();
        formData.append("current_password", currentPassword);
        formData.append("new_password", newPassword);
        formData.append("confirm_password", confirmPassword);

        changePasswordError.textContent = "";
        changePasswordError.style.display = "none";

        try {
            const response = await fetch(changePasswordForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                changePasswordForm.reset();
                changePasswordError.style.color = 'green';
                changePasswordError.textContent = 'Пароль успешно изменен!';
                changePasswordError.style.display = 'block';
            } else {
                changePasswordError.style.color = 'red';
                changePasswordError.textContent = result.message || 'Произошла ошибка при изменении пароля';
                changePasswordError.style.display = 'block';
            }
        } catch (error) {
            console.error('Ошибка при изменении пароля:', error);
            changePasswordError.style.color = 'red';
            changePasswordError.textContent = 'Произошла ошибка при попытке изменить пароль';
            changePasswordError.style.display = 'block';
        }
    });
}

const changeInfoForm = document.getElementById("changeInfo");
const changeInfoError = document.getElementById("changeInfoError");

if (changeInfoForm) {
    changeInfoForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const firstName = document.getElementById("first_name").value;
        const address = document.getElementById("address").value;

        const formData = new FormData();
        formData.append("first_name", firstName);
        formData.append("address", address);

        changeInfoError.textContent = "";
        changeInfoError.style.display = "none";
        if (address !== " ")
        {
            try {
                const response = await fetch(changeInfoForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                    }
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    changeInfoError.style.color = 'green';
                    changeInfoError.textContent = result.message || 'Данные успешно изменены!';
                    changeInfoError.style.display = 'block';
                } else {
                    changeInfoError.style.color = 'red';
                    changeInfoError.textContent = result.message || 'Произошла ошибка при изменении данных';
                    changeInfoError.style.display = 'block';
                }
            } catch (error) {
                console.error('Ошибка при изменении данных:', error);
                changeInfoError.style.color = 'red';
                changeInfoError.textContent = 'Произошла ошибка при попытке изменить данные';
                changeInfoError.style.display = 'block';
            }
        } else {
            changeInfoError.style.color = 'red';
            changeInfoError.textContent = 'Введите адрес';
            changeInfoError.style.display = 'block';
        }
    });
}

const checkoutButton = document.querySelector('.checkout-button');
const messageDiv = document.getElementById('checkout-message');

function getCartFromLocalStorage() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function showCheckoutMessage(message, isSuccess = false) {
    messageDiv.textContent = message;
    messageDiv.style.color = isSuccess ? 'green' : 'red';
    messageDiv.style.display = 'block';
}

checkoutButton.addEventListener('click', function () {
    const cart = getCartFromLocalStorage();
    if (cart.length === 0) {
        showCheckoutMessage('Корзина пуста');
        return;
    }

    fetch('/home/api/basket/checkout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCSRFToken()
        },
        body: `cart=${encodeURIComponent(JSON.stringify(cart))}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showCheckoutMessage(data.message, true);
            localStorage.removeItem('cart');
            // обновить интерфейс, если нужно
            document.getElementById('cart-items').innerHTML = '';
            document.getElementById('total-items-count').textContent = '0';
            document.getElementById('total-price').textContent = 'Итоговая сумма: 0₽';
        } else {
            showCheckoutMessage(data.message || 'Ошибка при оформлении заказа');
        }
    })
    .catch(error => {
        console.error('Ошибка:', error);
        showCheckoutMessage('Ошибка сети. Попробуйте снова.');
    });
});

function getCSRFToken() {
    const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    return csrfInput ? csrfInput.value : '';
}
