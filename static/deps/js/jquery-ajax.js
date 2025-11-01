$(document).ready(function () {

    // cache selectors (will be present on page)
    var successMessage = $("#jq-notification");
    var goodsInCartCount = $("#goods-in-cart-count");
    var cartItemsContainer = $("#cart-items-container");

    // delegated click handler
    $(document).on("click", ".add-to-cart", function (e) {
        e.preventDefault();

        // get product id and url from clicked element
        var $btn = $(this);
        var product_id = $btn.data("product-id");      // MUST be data-product-id="..."
        var add_to_cart_url = $btn.attr("href");       // MUST be the add-to-cart endpoint

        // debug logs (remove in production)
        console.log("add-to-cart clicked. product_id:", product_id, "url:", add_to_cart_url);

        // basic validation
        if (!product_id) {
            console.error("Missing product_id on .add-to-cart element. Check data-product-id attribute.");
            return;
        }
        if (!add_to_cart_url || add_to_cart_url === "#") {
            console.error("Invalid add_to_cart_url:", add_to_cart_url);
            return;
        }

        // get csrf token (from input or meta)
        var csrfToken = $("[name=csrfmiddlewaretoken]").val() || $("meta[name='csrf-token']").attr("content");
        if (!csrfToken) {
            console.error("CSRF token not found on the page.");
            return;
        }

        $.ajax({
            type: "POST",
            url: add_to_cart_url,
            data: {
                product_id: product_id,
                csrfmiddlewaretoken: csrfToken,
            },
            dataType: "json",
            success: function (data) {
                // show message (if element exists)
                if (successMessage.length) {
                    successMessage.html(data.message || "Added to cart");
                    successMessage.fadeIn(400);
                    setTimeout(function () { successMessage.fadeOut(400); }, 4000);
                }

                // update cart count using server value if provided
                if (data.cart_count !== undefined && goodsInCartCount.length) {
                    goodsInCartCount.text(data.cart_count);
                } else if (goodsInCartCount.length) {
                    // fallback: increment locally (best effort)
                    var cartCount = parseInt(goodsInCartCount.text() || 0) + 1;
                    goodsInCartCount.text(cartCount);
                }

                // replace cart HTML fragment if provided
                if (data.cart_items_html && cartItemsContainer.length) {
                    cartItemsContainer.html(data.cart_items_html);
                }
            },
            error: function (xhr) {
                // inspect server response
                console.error("Error adding to cart:", xhr.status, xhr.responseText);

                if (xhr.status === 401 || xhr.status === 403) {
                    // not authenticated or CSRF blocked — redirect to login or show message
                    window.location.href = "/accounts/login/?next=" + encodeURIComponent(window.location.pathname);
                    return;
                }

                if (successMessage.length) {
                    successMessage.html("Error adding product to cart.");
                    successMessage.fadeIn(400);
                    setTimeout(function () { successMessage.fadeOut(400); }, 4000);
                }
            }
        });
    });



    // Ловим собыитие клика по кнопке удалить товар из корзины
    $(document).on("click", ".remove-from-cart", function (e) {
        // Блокируем его базовое действие
        e.preventDefault();

        // Берем элемент счетчика в значке корзины и берем оттуда значение
        var goodsInCartCount = $("#goods-in-cart-count");
        var cartCount = parseInt(goodsInCartCount.text() || 0);

        // Получаем id корзины из атрибута data-cart-id
        var cart_id = $(this).data("cart-id");
        // Из атрибута href берем ссылку на контроллер django
        var remove_from_cart = $(this).attr("href");

        // делаем post запрос через ajax не перезагружая страницу
        $.ajax({

            type: "POST",
            url: remove_from_cart,
            data: {
                cart_id: cart_id,
                csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
            },
            success: function (data) {
                // Сообщение
                successMessage.html(data.message);
                successMessage.fadeIn(400);
                // Через 7сек убираем сообщение
                setTimeout(function () {
                    successMessage.fadeOut(400);
                }, 7000);

                // Уменьшаем количество товаров в корзине (отрисовка)
                cartCount -= data.quantity_deleted;
                goodsInCartCount.text(cartCount);

                // Меняем содержимое корзины на ответ от django (новый отрисованный фрагмент разметки корзины)
                var cartItemsContainer = $("#cart-items-container");
                cartItemsContainer.html(data.cart_items_html);

            },

            error: function (data) {
                console.log("Ошибка при добавлении товара в корзину");
            },
        });
    });



    // // Теперь + - количества товара 
    // // Обработчик события для уменьшения значения
    // $(document).on("click", ".decrement", function () {
    //     // Берем ссылку на контроллер django из атрибута data-cart-change-url
    //     var url = $(this).data("cart-change-url");
    //     // Берем id корзины из атрибута data-cart-id
    //     var cartID = $(this).data("cart-id");
    //     // Ищем ближайшеий input с количеством 
    //     var $input = $(this).closest('.input-group').find('.number');
    //     // Берем значение количества товара
    //     var currentValue = parseInt($input.val());
    //     // Если количества больше одного, то только тогда делаем -1
    //     if (currentValue > 1) {
    //         $input.val(currentValue - 1);
    //         // Запускаем функцию определенную ниже
    //         // с аргументами (id карты, новое количество, количество уменьшилось или прибавилось, url)
    //         updateCart(cartID, currentValue - 1, -1, url);
    //     }
    // });

    // // Обработчик события для увеличения значения
    // $(document).on("click", ".increment", function () {
    //     // Берем ссылку на контроллер django из атрибута data-cart-change-url
    //     var url = $(this).data("cart-change-url");
    //     // Берем id корзины из атрибута data-cart-id
    //     var cartID = $(this).data("cart-id");
    //     // Ищем ближайшеий input с количеством 
    //     var $input = $(this).closest('.input-group').find('.number');
    //     // Берем значение количества товара
    //     var currentValue = parseInt($input.val());

    //     $input.val(currentValue + 1);

    //     // Запускаем функцию определенную ниже
    //     // с аргументами (id карты, новое количество, количество уменьшилось или прибавилось, url)
    //     updateCart(cartID, currentValue + 1, 1, url);
    // });

    // function updateCart(cartID, quantity, change, url) {
    //     $.ajax({
    //         type: "POST",
    //         url: url,
    //         data: {
    //             cart_id: cartID,
    //             quantity: quantity,
    //             csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
    //         },

    //         success: function (data) {
    //              // Сообщение
    //             successMessage.html(data.message);
    //             successMessage.fadeIn(400);
    //              // Через 7сек убираем сообщение
    //             setTimeout(function () {
    //                  successMessage.fadeOut(400);
    //             }, 7000);

    //             // Изменяем количество товаров в корзине
    //             var goodsInCartCount = $("#goods-in-cart-count");
    //             var cartCount = parseInt(goodsInCartCount.text() || 0);
    //             cartCount += change;
    //             goodsInCartCount.text(cartCount);

    //             // Меняем содержимое корзины
    //             var cartItemsContainer = $("#cart-items-container");
    //             cartItemsContainer.html(data.cart_items_html);

    //         },
    //         error: function (data) {
    //             console.log("Ошибка при добавлении товара в корзину");
    //         },
    //     });
    // }



    // Берем из разметки элемент по id - оповещения от django
    var notification = $('#notification');
    // И через 7 сек. убираем
    if (notification.length > 0) {
        setTimeout(function () {
            notification.alert('close');
        }, 7000);
    }

    // При клике по значку корзины открываем всплывающее(модальное) окно
    $('#modalButton').click(function () {
        $('#exampleModal').appendTo('body');

        $('#exampleModal').modal('show');
    });

    // Собыите клик по кнопке закрыть окна корзины
    $('#exampleModal .btn-close').click(function () {
        $('#exampleModal').modal('hide');
    });

    // Обработчик события радиокнопки выбора способа доставки
    $("input[name='requires_delivery']").change(function () {
        var selectedValue = $(this).val();
        // Скрываем или отображаем input ввода адреса доставки
        if (selectedValue === "1") {
            $("#deliveryAddressField").show();
        } else {
            $("#deliveryAddressField").hide();
        }
    });

});