const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");

let cart = [];

// Abrir o modal do carrinho
cartBtn.addEventListener("click", function() {
    cartModal.style.display = "flex";
    updateCartModal();
});

// Fechar o modal quando clicar fora
cartModal.addEventListener("click", function(event) {
    if (event.target === cartModal) {
        cartModal.style.display = "none";
    }
});

// Fechar o modal pelo botão fechar
closeModalBtn.addEventListener("click", function() {
    cartModal.style.display = "none";
});

// Adicionar itens ao carrinho
menu.addEventListener("click", function(event) {
    let parentButton = event.target.closest(".add-to-cart-btn");

    if (parentButton) {
        const name = parentButton.getAttribute("data-name");
        const price = parseFloat(parentButton.getAttribute("data-price"));

        addToCart(name, price);
    }
});

// Função para adicionar itens no carrinho
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1; // Aumenta a quantidade se o item já existir
    } else {
        cart.push({
            name,
            price,
            quantity: 1,
        });
    }

    updateCartModal();
}

// Atualiza o modal do carrinho
function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("flex", "justify-between", "mb-4", "flex-col");

        cartItemElement.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <p class="font-medium">${item.name}</p>
                <p>Quantidade: ${item.quantity}</p>
                <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
            </div>
            <button class="remove-from-cart-btn bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600" data-name="${item.name}">Remover</button>
        </div>
        `;

        total += item.price * item.quantity;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = total.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    cartCounter.innerHTML = cart.length;
}

// Remover itens do carrinho
cartItemsContainer.addEventListener("click", function(event) {
    if (event.target.classList.contains("remove-from-cart-btn")) {
        const name = event.target.getAttribute("data-name");
        removeItemCart(name);
    }
});

function removeItemCart(name) {
    const index = cart.findIndex(item => item.name === name);

    if (index !== -1) {
        const item = cart[index];

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.splice(index, 1);
        }

        updateCartModal();
    }
}

// Verificação do endereço de entrega
addressInput.addEventListener("input", function(event) {
    if (event.target.value !== "") {
        addressInput.classList.remove("border-red-500");
        addressWarn.classList.add("hidden");
    }
});

// Finalizar pedido
checkoutBtn.addEventListener("click", function() {
    const isOpen = checkRestaurantOpen();

    if (!isOpen) {
        Toastify({
            text: "Ops! o restaurante está fechado no momento",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "#ef4444",
            },
        }).showToast();
        return;
    }

    if (cart.length === 0) return;

    if (addressInput.value === "") {
        addressWarn.classList.remove("hidden");
        addressInput.classList.add("border-red-500");
        return;
    }

    const customerName = document.getElementById("nome").value;
    if (customerName === "") {
        document.getElementById("name-warn").classList.remove("hidden");
        document.getElementById("nome").classList.add("border-red-500");
        return;
    } else {
        document.getElementById("name-warn").classList.add("hidden");
    }

    const paymentMethod = document.getElementById("payment-method").value;

    // Montando os itens do carrinho para a mensagem
    const cartItems = cart.map((item) => {
        return `${item.name} Quantidade: (${item.quantity}) Preço: R$${item.price.toFixed(2)}`;
    }).join(" | ");

    // Montando a mensagem final
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalMessage = `Total: R$${totalPrice.toFixed(2)}`; // Total calculado
    const message = encodeURIComponent(`Nome: ${customerName} | Endereço: ${addressInput.value} | Método de Pagamento: ${paymentMethod} | ${cartItems} | ${totalMessage}`);
    const phone = "91189632";

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    
    // Limpa o carrinho e atualiza o modal
    cart = [];
    updateCartModal();

    // Limpa os campos do modal
    addressInput.value = "";
    document.getElementById("nome").value = "";
    document.getElementById("payment-method").selectedIndex = 0;
    addressWarn.classList.add("hidden");
    document.getElementById("name-warn").classList.add("hidden");
});

// Verificar se o restaurante está aberto
function checkRestaurantOpen() {
    const data = new Date();
    const diaSemana = data.getDay(); // 0 (domingo) a 6 (sábado)
    const hora = data.getHours();
    const minutos = data.getMinutes();

    if (diaSemana === 0) {
        return hora >= 7 && hora < 12;
    } else if (diaSemana >= 1 && diaSemana <= 6) {
        return (hora === 7 && minutos >= 30) || (hora > 7 && hora < 19);
    } else {
        return false;
    }
}

// Alterar a cor de status de abertura do restaurante
const spanItem = document.getElementById("date-span");
const isOpen = checkRestaurantOpen();

if (isOpen) {
    spanItem.classList.remove("bg-red-500");
    spanItem.classList.add("bg-green-600");
} else {
    spanItem.classList.remove("bg-green-600");
    spanItem.classList.add("bg-red-500");
}
