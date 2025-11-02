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



    // Catch the click event on the "remove from cart" button
    $(document).on("click", ".remove-from-cart", function (e) {
        // Prevent its default behavior
        e.preventDefault();

        // Take the element of the cart counter icon and get its value
        var goodsInCartCount = $("#goods-in-cart-count");
        var cartCount = parseInt(goodsInCartCount.text() || 0);

        // Get cart ID from data-cart-id attribute
        var cart_id = $(this).data("cart-id");
        // Take Django controller link from href attribute
        var remove_from_cart = $(this).attr("href");

        // Make POST request via AJAX without reloading the page
        $.ajax({

            type: "POST",
            url: remove_from_cart,
            data: {
                cart_id: cart_id,
                csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
            },
            success: function (data) {
                // Show message
                successMessage.html(data.message);
                successMessage.fadeIn(400);
                // Hide message after 7 seconds
                setTimeout(function () {
                    successMessage.fadeOut(400);
                }, 7000);

                // Decrease the number of products in the cart (visual update)
                cartCount -= data.quantity_deleted;
                goodsInCartCount.text(cartCount);

                // Replace the cart content with the new Django-rendered HTML fragment
                var cartItemsContainer = $("#cart-items-container");
                cartItemsContainer.html(data.cart_items_html);

            },

            error: function (data) {
                console.log("Error removing product from cart");
            },
        });
    });



    // Now for the + and - product quantity buttons 
    // Event handler for decrementing quantity
    $(document).on("click", ".decrement", function () {
        // Get the Django controller link from data-cart-change-url
        var url = $(this).data("cart-change-url");
        // Get the cart ID from data-cart-id
        var cartID = $(this).data("cart-id");
        // Find the nearest input field with the product quantity
        var $input = $(this).closest('.input-group').find('.number');
        // Get the current quantity value
        var currentValue = parseInt($input.val());
        // If quantity is greater than one, then only reduce by 1
        if (currentValue > 1) {
            $input.val(currentValue - 1);
            // Run the function defined below
            // with arguments (cart ID, new quantity, change direction, url)
            updateCart(cartID, currentValue - 1, -1, url);
        }
    });

    // Event handler for incrementing quantity
    $(document).on("click", ".increment", function () {
        // Get the Django controller link from data-cart-change-url
        var url = $(this).data("cart-change-url");
        // Get the cart ID from data-cart-id
        var cartID = $(this).data("cart-id");
        // Find the nearest input field with the product quantity
        var $input = $(this).closest('.input-group').find('.number');
        // Get the current quantity value
        var currentValue = parseInt($input.val());

        $input.val(currentValue + 1);

        // Run the function defined below
        // with arguments (cart ID, new quantity, change direction, url)
        updateCart(cartID, currentValue + 1, 1, url);
    });

    function updateCart(cartID, quantity, change, url) {
        $.ajax({
            type: "POST",
            url: url,
            data: {
                cart_id: cartID,
                quantity: quantity,
                csrfmiddlewaretoken: $("[name=csrfmiddlewaretoken]").val(),
            },

            success: function (data) {
                 // Show message
                successMessage.html(data.message);
                successMessage.fadeIn(400);
                 // Hide message after 7 seconds
                setTimeout(function () {
                    successMessage.fadeOut(400);
                }, 7000);

                // Update the number of products in the cart
                var goodsInCartCount = $("#goods-in-cart-count");
                var cartCount = parseInt(goodsInCartCount.text() || 0);
                cartCount += change;
                goodsInCartCount.text(cartCount);

                // Update the cart content
                var cartItemsContainer = $("#cart-items-container");
                cartItemsContainer.html(data.cart_items_html);

            },
            error: function (data) {
                console.log("Error updating product quantity in cart");
            },
        });
    }



    // Take the Django notification element from markup by ID
    var notification = $('#notification');
    // And hide it after 7 seconds
    if (notification.length > 0) {
        setTimeout(function () {
            notification.alert('close');
        }, 7000);
    }

    // When clicking the cart icon, open the modal window
    $('#modalButton').click(function () {
        $('#exampleModal').appendTo('body');

        $('#exampleModal').modal('show');
    });

    // Event handler for closing the cart modal window
    $('#exampleModal .btn-close').click(function () {
        $('#exampleModal').modal('hide');
    });

    // Event handler for radio button selecting delivery method
    $("input[name='requires_delivery']").change(function () {
        var selectedValue = $(this).val();
        // Hide or show delivery address input field
        if (selectedValue === "1") {
            $("#deliveryAddressField").show();
        } else {
            $("#deliveryAddressField").hide();
        }
    });

});
