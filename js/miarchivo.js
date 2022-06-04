const jsonTiendaPath = "./js/tienda.json";

let carritoDeCompras = [];

let articulosJson;
let menuJson;

window.onload = function () {
    //Cuando se cargue la pagina

    getCarritoFromLocalStorage(); //Obtenemos de localstorage el carrito si existiera

    fetch(jsonTiendaPath) //Obtenemos el json con la infomracion de la tienda
        .then((Response) => Response.json())
        .then((data) => {
            menuJson = data["menu"];
            articulosJson = data["articulos"];

            mostrarMenu(menuJson); //mostramos el menu
            actualizarStock(articulosJson); //Como los articulos no los guardamos en el localstorage, cada vez que se inicia la pagina, hay que chequear el stock
            actulizarSearchInput();
            mostrarProductos(articulosJson, true); //muestra los productos en pantalla
        });
};

function agregarClase(className, section) {
    if (!section.classList.contains(className)) {
        section.classList.add(className);
    }
}

function eliminarClase(className, section) {
    if (section.classList.contains(className)) {
        section.classList.remove(className);
    }
}

function actulizarSearchInput() {
    const inputSearch = document.getElementById("nav__search");

    if (localStorage.getItem("wordToSearch")) {
        inputSearch.value = localStorage.getItem("wordToSearch");
    }
    return;
}

function menuOptions(idMenu) {
    if (!idMenu) return;

    setActiveItemMenu(idMenu);

    switch (idMenu) {
        case "option0":
            mostrarTiendaOnline();
            break;
        case "option1":
            mostrarCarrito();
            carrito();
            break;
    }
}

function setActiveItemMenu(idMenu) {
    //agrega la clase active a la opcion del menu que le corresponda

    const menuItems = document.getElementsByClassName("menu-item");

    for (menuItem of menuItems) {
        if (menuItem.classList.contains("active") && menuItem.id !== idMenu) {
            menuItem.classList.remove("active");
        } else if (
            !menuItem.classList.contains("active") &&
            menuItem.id === idMenu
        ) {
            menuItem.classList.add("active");
        }
    }
}

function getCarritoFromLocalStorage() {
    //Obtiene datos del carrito del localstorage
    if (localStorage.getItem("carritoDeCompras")) {
        carritoDeCompras = JSON.parse(localStorage.getItem("carritoDeCompras"));
    }
}

function mostrarProductos(articulos = articulosJson, soloDisponibles = true) {
    let wordToSearch;

    if (localStorage.getItem("wordToSearch")) {
        wordToSearch = localStorage.getItem("wordToSearch");
        articulos = articulos.filter((articulo) =>
            articulo.nombre.toLowerCase().includes(wordToSearch.toLowerCase())
        );
    }

    const mainShop = document.getElementById("main_shop__articles");
    mainShop.innerHTML = "";

    if (wordToSearch) {
        const divWordToSearch = document.createElement("div");
        divWordToSearch.classList.add("word-to-search");

        const spanWordToSearch = document.createElement("div");

        const divBoldWordToSearch = document.createElement("div");
        divBoldWordToSearch.classList.add("word-to-search-bold");
        divBoldWordToSearch.innerHTML = wordToSearch;

        spanWordToSearch.innerHTML =
            'Resultados para "' + divBoldWordToSearch.outerHTML + '"';
        divWordToSearch.appendChild(spanWordToSearch);
        mainShop.appendChild(divWordToSearch);
    }

    const articleContainer = document.createElement("div");
    articleContainer.classList.add("container-articles");

    if (articulos.length > 0) {
        for (const articulo of articulos) {
            //recorre los articulos

            if (!articulo) continue;
            if (!articulo.descripcion) articulo.descripcion = "";

            const articleInCart = document.createElement("div");

            const article = document.createElement("div");
            article.classList.add("article");

            //imagen
            const articleImage = document.createElement("div");
            articleImage.classList.add("article__image");
            const imageArticle = document.createElement("img");
            imageArticle.classList.add("article_image_img");
            imageArticle.src = articulo.img;
            articleImage.appendChild(imageArticle);

            //nombre
            const articleName = document.createElement("div");
            articleName.classList.add("article__name");
            const nameArticle = document.createElement("p");
            nameArticle.innerHTML = articulo.nombre;
            const precioArticle = document.createElement("div");
            precioArticle.innerHTML = `$${articulo.precio}`;
            articleName.appendChild(nameArticle);
            articleName.appendChild(precioArticle);

            //descripcion
            const articleDescription = document.createElement("div");
            articleDescription.classList.add("article__description");
            const descriptionArticle = document.createElement("p");
            descriptionArticle.innerHTML = articulo.descripcion;
            articleDescription.appendChild(descriptionArticle);

            //button
            const articleButton = document.createElement("button");

            if (articulo.stock > 0 && !isArticleInCart(articulo.id)) {
                articleButton.innerHTML =
                    '<i class="fa-solid fa-cart-shopping"></i> AGREGAR AL CARRITO';
            } else if (articulo.stock > 0 && isArticleInCart(articulo.id)) {
                divContainerStock = document.createElement("div");
                divContainerStock.classList.add("div-container");

                botonMenos = document.createElement("div");
                botonMenos.classList.add("menos");
                botonMenos.innerHTML = "-";
                botonMenos.addEventListener("click", () =>
                    eliminarArticuloCarrito(articulo.id, 1)
                );

                divCantidad = document.createElement("div");
                divCantidad.classList.add("cantidadArticulos");
                divCantidad.innerHTML =
                    getCantidadArticulosEnCarrito(articulo.id) ?? 0;

                botonMas = document.createElement("div");
                botonMas.classList.add("mas");
                botonMas.innerHTML = "+";
                botonMas.addEventListener("click", () =>
                    agregarAlCarrito(articulo.id)
                );

                divContainerStock.appendChild(botonMenos);
                divContainerStock.appendChild(divCantidad);
                divContainerStock.appendChild(botonMas);
                articleButton.appendChild(divContainerStock);
            } else if (articulo.stock === 0) {
                articleButton.innerHTML = "SIN STOCK";
            }

            articleButton.classList.add("article__button");
            if (articulo.stock > 0 && !isArticleInCart(articulo.id)) {
                articleButton.classList.add("con-stock");
                articleButton.addEventListener("click", () =>
                    agregarAlCarrito(articulo.id)
                );
            } else if (articulo.stock === 0) {
                articleButton.classList.add("sin-stock");
            }

            //junta los bloques de codigo
            article.appendChild(articleImage);
            article.appendChild(articleName);
            article.appendChild(articleDescription);
            article.appendChild(articleButton);

            if (isArticleInCart(articulo.id)) {
                articleInCart.classList.add("in-cart");
                const divContainerInCart = document.createElement("div");
                divContainerInCart.classList.add("in-cart-div");
                const articleInCartP = document.createElement("p");
                articleInCartP.innerHTML = "IN CART";
                const iconTrash = document.createElement("i");
                iconTrash.classList.add("fa-solid", "fa-trash");
                iconTrash.addEventListener("click", () =>
                    eliminarArticuloCarrito(articulo.id)
                );

                divContainerInCart.appendChild(articleInCartP);
                divContainerInCart.appendChild(iconTrash);

                articleInCart.appendChild(divContainerInCart);
            }

            //arma el bloque de codigo final
            articleInCart.appendChild(article);
            //agrega el articulo a la pantalla
            articleContainer.appendChild(articleInCart);
        }
    } else {
        const spanSinArticulos = document.createElement("span");
        spanSinArticulos.classList.add("sin-articulos");
        spanSinArticulos.innerHTML = "No se encontraron articulos disponibles";
        articleContainer.appendChild(spanSinArticulos);
    }

    mainShop.appendChild(articleContainer);
}

function mostrarMenu(menuItems) {
    //muestra el menu en pantalla

    if (menuItems.length > 0) {
        const menu = document.getElementById("nav");
        const ulMenu = document.createElement("ul");

        for (menuItem of menuItems) {
            //recorre el array de menu
            (function () {
                const liMenu = document.createElement("li");
                liMenu.setAttribute("id", "option" + menuItem.id);
                liMenu.classList.add("menu-item");
                if (menuItem.default) {
                    liMenu.classList.add("active");
                }
                liMenu.innerHTML = menuItem.label;
                liMenu.addEventListener("click", () =>
                    menuOptions(liMenu.getAttribute("id"))
                );
                ulMenu.appendChild(liMenu);
            })();
        }
        menu.appendChild(ulMenu);
    }

    const search = document.getElementById("nav__search");
    search.addEventListener("keyup", (e) => searchArticles(e.target.value));
}

function searchArticles(wordTosearch) {
    if (wordTosearch) localStorage.setItem("wordToSearch", wordTosearch);
    else localStorage.removeItem("wordToSearch");

    mostrarProductos();
}

function actualizarStock(articulos) {
    //busca el articulo y le resta la cantidad comprada

    if (!articulos) return;
    for (articulo of articulos) {
        const articuloCarritoEncontrado = carritoDeCompras.find(
            (articuloCarrito) => articuloCarrito.id === articulo.id
        );
        if (!articuloCarritoEncontrado) continue;
        articulo.stock -= articuloCarritoEncontrado.cantidad;
    }
}

function isArticleInCart(idArticle) {
    //chequea si el articulo ya esta en el carrito
    return carritoDeCompras.some((articulo) => articulo.id === idArticle);
}

function agregarAlCarrito(idArticulo) {
    let articuloElegido = articulosJson.find(
        (articulo) => articulo.id === idArticulo
    ); //chequea que el articulo exista en el inventario

    if (articuloElegido) {
        if (articuloElegido.stock > 0) {
            //comprueba stock disponible

            let articuloEnCarrito = carritoDeCompras.find(
                (articulo) => articulo.id === articuloElegido.id
            ); //busca si el articulo ya fue agregado al carrito
            articuloElegido.stock -= 1; //resta unidad en el articulo del inventario

            if (articuloEnCarrito) {
                //si el articulo ya existia en el carrito, suma el stock y actualiza el subtotal

                articuloEnCarrito.cantidad += 1;
                articuloEnCarrito.subtotal += articuloElegido.precio;
            } else {
                //si no existe el articulo en el carrito, arma un objeto y lo agrega en el array del carrito
                carritoDeCompras.push({
                    id: articuloElegido.id,
                    nombre: articuloElegido.nombre,
                    cantidad: 1,
                    precioPorUnidad: articuloElegido.precio,
                    subtotal: articuloElegido.precio,
                });
            }

            localStorage.setItem(
                "carritoDeCompras",
                JSON.stringify(carritoDeCompras)
            ); //guarda el carrito en el localstorage
            Toastify({
                text: `Se ha agregado ${articuloElegido.nombre} al carrito`,
                duration: 1500,
                destination: "https://github.com/apvarun/toastify-js",
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
                onClick: function () {}, // Callback after click
            }).showToast();

            mostrarProductos(); //actualiza los productos en pantalla
        } else {
            Toastify({
                text: `No hay stock del articulo seleccionado`,
                duration: 1500,
                destination: "https://github.com/apvarun/toastify-js",
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background:
                        "linear-gradient(0deg, rgba(130,130,130,1) 0%, rgba(201,201,201,1) 100%)",
                },
                onClick: function () {}, // Callback after click
            }).showToast();
        }
    } else {
        Toastify({
            text: `Lo sentimos, el articulo seleccionado no se encuentra disponible`,
            duration: 1500,
            destination: "https://github.com/apvarun/toastify-js",
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background:
                    "linear-gradient(0deg, rgba(212,0,0,1) 0%, rgba(252,160,160,1) 100%)",
            },
            onClick: function () {}, // Callback after click
        }).showToast();
    }
}

function mostrarTiendaOnline() {
    //muestra la seccion de tienda online en pantalla

    let articulos = document.getElementById("main_shop__articles");
    if (articulos.classList.contains("hidden")) {
        articulos.classList.remove("hidden");
    }

    let carrito = document.getElementById("carrito");
    if (!carrito.classList.contains("hidden")) {
        carrito.classList.add("hidden");
    }
}

function vaciarConfirmarPago() {
    const inputDatosPago = document.getElementsByClassName("form_pago_input");
    for (input of inputDatosPago) {
        input.value = "";
    }
    const errorDatosForm = document.getElementsByClassName("datos-invalidos");
    agregarClase("hidden", errorDatosForm[0]);
}

function mostrarCarrito() {
    // muestra la seccion de carrito de compras en pantalla
    let carrito = document.getElementById("carrito");
    if (carrito.classList.contains("hidden")) {
        carrito.classList.remove("hidden");
    }

    let carritoSection = document.getElementById("carrito-section");
    if (carritoSection.classList.contains("hidden")) {
        carritoSection.classList.remove("hidden");
    }

    let cargarDatosSection = document.getElementById("cargar-datos-section");
    if (!cargarDatosSection.classList.contains("hidden")) {
        cargarDatosSection.classList.add("hidden");
    }

    let confirmarDatosSection = document.getElementById(
        "confirmar-datos-section"
    );
    if (!confirmarDatosSection.classList.contains("hidden")) {
        confirmarDatosSection.classList.add("hidden");
    }

    let articulos = document.getElementById("main_shop__articles");
    if (!articulos.classList.contains("hidden")) {
        articulos.classList.add("hidden");
    }
}

function getImagenArticulo(idArticulo) {
    //Devuelve la iamgen de un articulo en especifico
    if (!idArticulo) return;
    return articulosJson.find((articulo) => articulo.id === idArticulo).img;
}

function eliminarArticuloCarrito(idArticulo, cantidad = 0) {
    //Elimina un articulo del carrito
    if (!idArticulo) return;

    let articuloCarrito = carritoDeCompras.find(
        (articulo) => articulo.id === idArticulo
    ); //busca articulo en el carrito
    if (!articuloCarrito) return;

    let articulo = articulosJson.find((articulo) => articulo.id === idArticulo);
    if (!articulo) return;

    if (cantidad > 0 && articuloCarrito.cantidad > 1) {
        articuloCarrito.cantidad -= cantidad;
        articulo.stock += cantidad;
    } else {
        articulo.stock += articuloCarrito.cantidad; //busca articulo en inventario y suma stock
        carritoDeCompras.splice(
            carritoDeCompras.findIndex(
                (articulo) => articulo.id === idArticulo
            ),
            1
        ); //elimina la posicion del array
        Toastify({
            text: `Articulo eliminado del carrito`,
            duration: 1500,
            destination: "https://github.com/apvarun/toastify-js",
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background:
                    "linear-gradient(0deg, rgba(212,0,0,1) 0%, rgba(252,160,160,1) 100%)",
            },
            onClick: function () {}, // Callback after click
        }).showToast();
    }
    localStorage.setItem("carritoDeCompras", JSON.stringify(carritoDeCompras)); //actualiza informacion dle carrito en localstorage
    carrito(); //muestra los articulos del carrito en pantalla
    mostrarProductos(); //actualiza los articulos en la seccion de tienda online
}

function carrito() {
    if (localStorage.getItem("carritoDeCompras")) {
        //chequea si existe un array en el localstorage
        carritoDeCompras = JSON.parse(localStorage.getItem("carritoDeCompras"));
    }

    let cargarDatosSection = document.getElementById("cargar-datos-section");
    cargarDatosSection.classList.remove("mostrar-seccion");

    const carritoArticulos = document.getElementById("carrito__articulos");

    if (carritoDeCompras.length > 0) {
        //si existe un elemento en el carrito

        const carritoVacio = document.getElementById(
            "carrito__articulos_vacio"
        );
        if (!carritoVacio.classList.contains("hidden")) {
            carritoVacio.classList.add("hidden");
        }

        carritoArticulos.innerHTML = "";

        for (const articulo of carritoDeCompras) {
            //Recorre el carrito de compras

            const carritoArticulo = document.createElement("div");
            carritoArticulo.classList.add("carrito__articulo", "carrito_flex");

            //imagen
            const carritoArticuloImage = document.createElement("div");
            carritoArticuloImage.classList.add("carrito__articulo_image");
            const carritoArticuloImagen = document.createElement("img");
            carritoArticuloImagen.classList.add("carrito__articulo_imagen");
            carritoArticuloImagen.src = getImagenArticulo(articulo.id);
            carritoArticuloImage.appendChild(carritoArticuloImagen);

            //nombre del articulo
            const carritoArticuloNombre = document.createElement("div");
            carritoArticuloNombre.classList.add("carrito__articulo_articulo");
            carritoArticuloNombre.innerHTML = articulo.nombre;

            //cantidad
            const carritoArticuloCantidad = document.createElement("div");
            carritoArticuloCantidad.classList.add("carrito__articulo_cantidad");
            carritoArticuloCantidad.innerHTML = articulo.cantidad;

            //precio unitario
            const carritoArticuloPrecioUnitario = document.createElement("div");
            carritoArticuloPrecioUnitario.classList.add(
                "carrito__articulo_precio_unitario"
            );
            carritoArticuloPrecioUnitario.innerHTML =
                "$" + articulo.precioPorUnidad;

            //subtotal
            const carritoArticuloSubtotal = document.createElement("div");
            carritoArticuloSubtotal.classList.add("carrito__articulo_subtotal");
            carritoArticuloSubtotal.innerHTML = `$${articulo.subtotal}`;

            //eliminar
            const carritoArticuloEliminar = document.createElement("div");
            carritoArticuloEliminar.classList.add("carrito__articulo_eliminar");
            carritoArticuloEliminar.innerHTML =
                '<i class="fa-solid fa-trash"></i>';
            carritoArticuloEliminar.addEventListener("click", () =>
                eliminarArticuloCarrito(articulo.id)
            );

            carritoArticulo.appendChild(carritoArticuloImage);
            carritoArticulo.appendChild(carritoArticuloNombre);
            carritoArticulo.appendChild(carritoArticuloCantidad);
            carritoArticulo.appendChild(carritoArticuloPrecioUnitario);
            carritoArticulo.appendChild(carritoArticuloSubtotal);
            carritoArticulo.appendChild(carritoArticuloEliminar);

            carritoArticulos.appendChild(carritoArticulo);
        }
    } else if (carritoDeCompras.length === 0) {
        //Si no hay elementos en el carrito, muestra un texto que no hay articulos en el carrito

        carritoArticulos.innerHTML = "";

        const carritoVacio = document.getElementById(
            "carrito__articulos_vacio"
        );
        if (carritoVacio.classList.contains("hidden")) {
            carritoVacio.classList.remove("hidden");
        }
    }

    let cantidadDeArticulos = document.getElementById(
        "carrito__cantidad_articulos_cantidad"
    );
    let cantidadCont = 0;
    cantidadCont = carritoDeCompras.reduce(
        (cantidadCont, articulo) => cantidadCont + articulo.cantidad,
        cantidadCont
    ); //se calcula la cantidad de articulos en el carrito
    cantidadDeArticulos.innerHTML = cantidadCont; //se muestra la cantidad

    let total = document.getElementById("carrito__total_numero");
    let totalAcum = 0;
    totalAcum = carritoDeCompras.reduce(
        (totalAcum, articulo) => totalAcum + articulo.subtotal,
        totalAcum
    ); //Suma de todo el carrito
    total.innerHTML = "$" + totalAcum; //Muestra el total de lo que esta en el carrito

    let pagarButton = document.getElementsByClassName("carrito__pagar");
    if (carritoDeCompras.length > 0) {
        if (pagarButton[0].classList.contains("hidden")) {
            pagarButton[0].classList.remove("hidden");
        }
        pagarButton[0].addEventListener("click", () => pagar());
        if (pagarButton[0].classList.contains("carrito__pagar_disable")) {
            pagarButton[0].classList.remove("carrito__pagar_disable");
        }
    } else {
        if (!pagarButton[0].classList.contains("hidden")) {
            pagarButton[0].classList.add("hidden");
        }
        if (!pagarButton[0].classList.contains("carrito__pagar_disable")) {
            pagarButton[0].classList.add("carrito__pagar_disable");
        }
    }
}

function pagar() {
    vaciarConfirmarPago();

    let pagarButton = document.getElementsByClassName("carrito__pagar");
    pagarButton[0].classList.add("hidden");

    let cargarDatosSection = document.getElementById("cargar-datos-section");

    if (cargarDatosSection.classList.contains("hidden")) {
        cargarDatosSection.classList.remove("hidden");
    }
    if (!cargarDatosSection.classList.contains("mostrar-seccion")) {
        cargarDatosSection.classList.add("mostrar-seccion");
    }

    let sendButton = document.getElementsByClassName("form_send");
    sendButton[0].addEventListener("click", (e) => confirmarPagos(e));

    let cancelarButton = document.getElementsByClassName("form_cancelar");
    cancelarButton[0].addEventListener("click", (e) => cancelarPago(e));
}

function validarDatos(inputs) {
    for (input of inputs) {
        console.log(input);
        console.log(input.validity);
        console.log(input.validity.valid);
        if (!input.validity.valid) {
            return false;
        }
    }
    return true;
}

function confirmarPagos(e) {
    e.preventDefault();

    const datosInvalidosMessage =
        document.getElementsByClassName("datos-invalidos");

    if (validarDatos(document.getElementById("form-pago").elements)) {
        agregarClase("hidden", datosInvalidosMessage[0]);

        const carritoSection = document.getElementById("carrito-section");
        agregarClase("hidden", carritoSection);
        eliminarClase("mostrar-seccion", carritoSection);

        const cargarDatosSection = document.getElementById(
            "cargar-datos-section"
        );
        agregarClase("hidden", cargarDatosSection);
        eliminarClase("mostrar-seccion", cargarDatosSection);

        const confirmarDatosSection = document.getElementById(
            "confirmar-datos-section"
        );
        eliminarClase("hidden", confirmarDatosSection);
        agregarClase("mostrar-seccion", confirmarDatosSection);

        const formPago = document.getElementById("form-pago").elements;
        var dataUsuarioPago = {};
        for (var i = 0; i < formPago.length; i++)
            if (formPago[i].type != "submit")
                dataUsuarioPago[formPago[i].name] = formPago[i].value;

        localStorage.setItem("datos_usuario", dataUsuarioPago);

        const confirmarNombre = document.getElementById("confirmar-nombre");
        confirmarNombre.innerHTML = `${dataUsuarioPago.nombre} ${dataUsuarioPago.apellido}`;
        const confirmarDireccion = document.getElementById(
            "confirmar-direccion"
        );
        confirmarDireccion.innerHTML = `${dataUsuarioPago.direccion} ${dataUsuarioPago.piso} ${dataUsuarioPago.depto}`;
        const confirmarNroTarjeta =
            document.getElementById("confirmar-tarjeta");
        confirmarNroTarjeta.innerHTML = `${dataUsuarioPago.tarjeta_nro}`;
        const confirmarVencimiento = document.getElementById(
            "confirmar-fecha-venc"
        );
        confirmarVencimiento.innerHTML = `${dataUsuarioPago.tarjeta_vencimiento}`;
        const confirmarTotal = document.getElementById("confirmar-total");
        let totalAcum = 0;
        totalAcum = carritoDeCompras.reduce(
            (totalAcum, articulo) => totalAcum + articulo.subtotal,
            totalAcum
        );
        confirmarTotal.innerHTML = "$" + totalAcum;

        const buttomConfirmar =
            document.getElementsByClassName("button_confirmar");
        buttomConfirmar[0].addEventListener("click", () => confirmarCompra());

        const buttomVolver = document.getElementsByClassName("button_volver");
        buttomVolver[0].addEventListener("click", () => volverConfirmacion());
    } else {
        eliminarClase("hidden", datosInvalidosMessage[0]);
    }
}

function volverConfirmacion() {
    const confirmarDatosSection = document.getElementById(
        "confirmar-datos-section"
    );
    agregarClase("hidden", confirmarDatosSection);

    mostrarCarrito();
    const cargarDatosSection = document.getElementById("cargar-datos-section");
    agregarClase("mostrar-seccion", cargarDatosSection);
    eliminarClase("hidden", cargarDatosSection);
}

function confirmarCompra() {
    swal("¡Gracias por tu compra!", "Compra realizada con éxito", "success", {
        button: false,
    }).then((value) => {
        menuOptions("option0");
    });

    vaciarConfirmarPago();
}

function cancelarPago(e) {
    e.preventDefault();
    console.log("cancelar");

    let pagarSection = document.getElementById("pagar-section");

    if (!pagarSection.classList.contains("hidden")) {
        pagarSection.classList.add("hidden");
    }
    if (pagarSection.classList.contains("mostrar-seccion")) {
        pagarSection.classList.remove("mostrar-seccion");
    }
    vaciarConfirmarPago();
    carrito();
}

function getCantidadArticulosEnCarrito(idArticulo) {
    if (!idArticulo) return;
    return carritoDeCompras.find(
        (articuloCarrito) => articuloCarrito.id === idArticulo
    ).cantidad;
}
