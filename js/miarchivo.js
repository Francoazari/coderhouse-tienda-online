const jsonTiendaPath = "./js/tienda.json";

let carritoDeCompras = [];

let articulosJson;
let menuJson;

window.onload = function() { //Cuando se cargue la pagina

    getCarritoFromLocalStorage(); //Obtenemos de localstorage el carrito si existiera
    
    fetch(jsonTiendaPath) //Obtenemos el json con la infomracion de la tienda
        .then(Response => Response.json())
        .then(data => {

            menuJson = data["menu"];
            articulosJson = data["articulos"];

            mostrarMenu(menuJson); //mostramos el menu
            actualizarStock(articulosJson); //Como los articulos no los guardamos en el localstorage, cada vez que se inicia la pagina, hay que chequear el stock
            mostrarProductos(articulosJson, true) //muestra los productos en pantalla
        })
};

function menuOptions(idMenu) {
    if(!idMenu) return;

    setActiveItemMenu(idMenu);

    switch(idMenu) {
        case "option0":
            mostrarTiendaOnline();
            break;
        case "option1":
            mostrarCarrito();
            carrito();
            break;
    }
}

function setActiveItemMenu(idMenu){ //agrega la clase active a la opcion del menu que le corresponda

    const menuItems = document.getElementsByClassName("menu-item");

    for(menuItem of menuItems){
        console.log();
        if(menuItem.classList.contains("active") && menuItem.id !== idMenu){
            menuItem.classList.remove("active");
        }else if(!menuItem.classList.contains("active") && menuItem.id === idMenu){
            menuItem.classList.add("active");        
        }
    }
}

function getCarritoFromLocalStorage(){ //Obtiene datos del carrito del localstorage
    if(localStorage.getItem("carritoDeCompras")){
        carritoDeCompras = JSON.parse(localStorage.getItem("carritoDeCompras"));
    }
}

function mostrarProductos(articulos = articulosJson, soloDisponibles = true){

    const mainShop = document.getElementById('main_shop__articles');
    mainShop.innerHTML = '';

    for (const articulo of articulos) { //recorre los articulos

        if(!articulo) continue;
        if(!articulo.descripcion) articulo.descripcion = "";

        const articleInCart = document.createElement('div');

        const article = document.createElement('div');
        article.classList.add('article');

        //imagen
        const articleImage = document.createElement('div');
        articleImage.classList.add('article__image');
        const imageArticle = document.createElement('img');
        imageArticle.classList.add('article_image_img');
        imageArticle.src = articulo.img;
        articleImage.appendChild(imageArticle);

        //nombre
        const articleName = document.createElement('div');
        articleName.classList.add('article__name');
        const nameArticle = document.createElement('p');
        nameArticle.innerHTML = articulo.nombre;
        const precioArticle = document.createElement('div');
        precioArticle.innerHTML = `$${articulo.precio}`;
        articleName.appendChild(nameArticle);
        articleName.appendChild(precioArticle);

        //descripcion
        const articleDescription = document.createElement('div'); 
        articleDescription.classList.add('article__description');
        const descriptionArticle = document.createElement('p');
        descriptionArticle.innerHTML = articulo.descripcion;
        articleDescription.appendChild(descriptionArticle);

        //button
        const articleButton = document.createElement('button');
        articleButton.innerHTML = (articulo.stock > 0) ? "<i class=\"fa-solid fa-cart-shopping\"></i> AGREGAR AL CARRITO": "SIN STOCK";
        articleButton.classList.add('article__button');
        if(articulo.stock > 0){
            articleButton.classList.add('con-stock');
            articleButton.addEventListener("click", () => agregarAlCarrito(articulo.id));
        }else{
            articleButton.classList.add('sin-stock');
        }

        //junta los bloques de codigo
        article.appendChild(articleImage);
        article.appendChild(articleName);
        article.appendChild(articleDescription);
        article.appendChild(articleButton);

        if(isArticleInCart(articulo.id)){
            
            articleInCart.classList.add('in-cart');
            const divContainerInCart = document.createElement('div');
            divContainerInCart.classList.add('in-cart-div');
            const articleInCartP = document.createElement('p');
            articleInCartP.innerHTML = "IN CART";
            const iconTrash = document.createElement('i');
            iconTrash.classList.add('fa-solid', 'fa-trash');
            iconTrash.addEventListener('click', () => eliminarArticuloCarrito(articulo.id));
            
            divContainerInCart.appendChild(articleInCartP);
            divContainerInCart.appendChild(iconTrash);

            articleInCart.appendChild(divContainerInCart);
            
        }
        
        //arma el bloque de codigo final
        articleInCart.appendChild(article);
        //agrega el articulo a la pantalla
        mainShop.appendChild(articleInCart);
    }
}

function mostrarMenu(menuItems){ //muestra el menu en pantalla

    if(menuItems.length > 0){
        const menu = document.getElementById('nav');
        const ulMenu = document.createElement('ul');

        for (menuItem of menuItems) { //recorre el array de menu
            (function () {
                const liMenu = document.createElement('li');
                liMenu.setAttribute("id","option" + menuItem.id);
                liMenu.classList.add("menu-item");
                if (menuItem.default) {
                    liMenu.classList.add("active");
                } 
                liMenu.innerHTML = menuItem.label;
                liMenu.addEventListener("click", () => menuOptions(liMenu.getAttribute("id")));
                ulMenu.appendChild(liMenu);
            }())
            
        }
        menu.appendChild(ulMenu);
    }
}

function actualizarStock(articulos) { //busca el articulo y le resta la cantidad comprada
    
    if(!articulos) return;
    for(articulo of articulos){
        const articuloCarritoEncontrado = carritoDeCompras.find(articuloCarrito => articuloCarrito.id === articulo.id);
        if(!articuloCarritoEncontrado) continue;
        articulo.stock -= articuloCarritoEncontrado.cantidad;
    }
}

function isArticleInCart(idArticle) { //chequea si el articulo ya esta en el carrito
    return carritoDeCompras.some(articulo => articulo.id === idArticle);
}

function agregarAlCarrito(idArticulo){ 

    let articuloElegido = articulosJson.find(articulo => articulo.id === idArticulo); //chequea que el articulo exista en el inventario

    if(articuloElegido){
        if(articuloElegido.stock > 0){ //comprueba stock disponible

            let articuloEnCarrito = carritoDeCompras.find((articulo) => articulo.id === articuloElegido.id);//busca si el articulo ya fue agregado al carrito
            articuloElegido.stock -= 1; //resta unidad en el articulo del inventario

            if(articuloEnCarrito){ //si el articulo ya existia en el carrito, suma el stock y actualiza el subtotal

                articuloEnCarrito.cantidad += 1;
                articuloEnCarrito.subtotal += articuloElegido.precio;

            }else{ //si no existe el articulo en el carrito, arma un objeto y lo agrega en el array del carrito
                carritoDeCompras.push({
                    "id": articuloElegido.id,
                    "nombre": articuloElegido.nombre,
                    "cantidad": 1,
                    "precioPorUnidad": articuloElegido.precio, 
                    "subtotal": articuloElegido.precio 
                });
            }

            localStorage.setItem("carritoDeCompras", JSON.stringify(carritoDeCompras)); //guarda el carrito en el localstorage
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
                onClick: function(){} // Callback after click
              }).showToast();

            mostrarProductos(); //actualiza los productos en pantalla

        }else{
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
                    background: "linear-gradient(0deg, rgba(130,130,130,1) 0%, rgba(201,201,201,1) 100%)",
                },
                onClick: function(){} // Callback after click
              }).showToast();
        }
    }else{
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
                background: "linear-gradient(0deg, rgba(212,0,0,1) 0%, rgba(252,160,160,1) 100%)",
            },
            onClick: function(){} // Callback after click
          }).showToast();
    }
    
}


function mostrarTiendaOnline(){ //muestra la seccion de tienda online en pantalla

    let articulos = document.getElementById("main_shop__articles");
    if(articulos.classList.contains('hidden')){
        articulos.classList.remove('hidden');
    }

    let carrito = document.getElementById("carrito");
    if(!carrito.classList.contains('hidden')){
        carrito.classList.add('hidden');
    }

}

function mostrarCarrito(){ // muestra la seccion de carrito de compras en pantalla
    let carrito = document.getElementById("carrito");
    if(carrito.classList.contains('hidden')){
        carrito.classList.remove('hidden');
    }
    
    let articulos = document.getElementById("main_shop__articles");
    if(!articulos.classList.contains('hidden')){
        articulos.classList.add('hidden');
    }
}

function getImagenArticulo(idArticulo){ //Devuelve la iamgen de un articulo en especifico
    if(!idArticulo) return;
    return articulosJson.find(articulo => articulo.id === idArticulo).img;
}

function eliminarArticuloCarrito(idArticulo) { //Elimina un articulo del carrito
    if(!idArticulo) return;

    let articuloCarrito = carritoDeCompras.find(articulo => articulo.id === idArticulo); //busca articulo en el carrito
    if(!articuloCarrito) return;

    articulosJson.find(articulo => articulo.id === idArticulo).stock += articuloCarrito.cantidad; //busca articulo en inventario y suma stock

    carritoDeCompras.splice(carritoDeCompras.findIndex(articulo => articulo.id === idArticulo), 1); //elimina la posicion del array
    localStorage.setItem("carritoDeCompras", JSON.stringify(carritoDeCompras)); //actualiza informacion dle carrito en localstorage
    carrito(); //muestra los articulos del carrito en pantalla
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
            background: "linear-gradient(0deg, rgba(212,0,0,1) 0%, rgba(252,160,160,1) 100%)",
        },
        onClick: function(){} // Callback after click
      }).showToast();
    mostrarProductos(); //actualiza los articulos en la seccion de tienda online
}



function carrito(){

    if(localStorage.getItem("carritoDeCompras")) { //chequea si existe un array en el localstorage
        carritoDeCompras = JSON.parse(localStorage.getItem("carritoDeCompras")); 
    }
    
    const carritoArticulos = document.getElementById('carrito__articulos');
    
    if(carritoDeCompras.length > 0){ //si existe un elemento en el carrito

        const carritoVacio = document.getElementById('carrito__articulos_vacio');
        if(!carritoVacio.classList.contains('hidden')){
            carritoVacio.classList.add('hidden');
        }
        
        carritoArticulos.innerHTML = "";

        for (const articulo of carritoDeCompras) { //Recorre el carrito de compras

            const carritoArticulo = document.createElement('div');
            carritoArticulo.classList.add('carrito__articulo', 'carrito_flex');

            //imagen
            const carritoArticuloImage = document.createElement('div');
            carritoArticuloImage.classList.add('carrito__articulo_image');
            const carritoArticuloImagen = document.createElement('img');
            carritoArticuloImagen.classList.add('carrito__articulo_imagen');
            carritoArticuloImagen.src = getImagenArticulo(articulo.id);
            carritoArticuloImage.appendChild(carritoArticuloImagen);

            //nombre del articulo
            const carritoArticuloNombre = document.createElement('div');
            carritoArticuloNombre.classList.add('carrito__articulo_articulo');
            carritoArticuloNombre.innerHTML = articulo.nombre;

            //cantidad
            const carritoArticuloCantidad = document.createElement('div');
            carritoArticuloCantidad.classList.add('carrito__articulo_cantidad');
            carritoArticuloCantidad.innerHTML = articulo.cantidad;

            //precio unitario
            const carritoArticuloPrecioUnitario = document.createElement('div');
            carritoArticuloPrecioUnitario.classList.add('carrito__articulo_precio_unitario');
            carritoArticuloPrecioUnitario.innerHTML = articulo.precioPorUnidad;

            //subtotal
            const carritoArticuloSubtotal = document.createElement('div');
            carritoArticuloSubtotal.classList.add('carrito__articulo_subtotal');
            carritoArticuloSubtotal.innerHTML = `$${articulo.subtotal}`;

            //eliminar
            const carritoArticuloEliminar = document.createElement('div');
            carritoArticuloEliminar.classList.add('carrito__articulo_eliminar');
            carritoArticuloEliminar.innerHTML = '<i class="fa-solid fa-trash"></i>';
            carritoArticuloEliminar.addEventListener("click", () => eliminarArticuloCarrito(articulo.id));

            carritoArticulo.appendChild(carritoArticuloImage);
            carritoArticulo.appendChild(carritoArticuloNombre);
            carritoArticulo.appendChild(carritoArticuloCantidad);
            carritoArticulo.appendChild(carritoArticuloPrecioUnitario);
            carritoArticulo.appendChild(carritoArticuloSubtotal);
            carritoArticulo.appendChild(carritoArticuloEliminar);

            carritoArticulos.appendChild(carritoArticulo);
        }

    }else if(carritoDeCompras.length === 0){ //Si no hay elementos en el carrito, muestra un texto que no hay articulos en el carrito

        carritoArticulos.innerHTML = "";
        
        const carritoVacio = document.getElementById('carrito__articulos_vacio');
        if(carritoVacio.classList.contains('hidden')){
            carritoVacio.classList.remove('hidden');
        }
    }

    
    let cantidadDeArticulos = document.getElementById('carrito__cantidad_articulos_cantidad');
    let cantidadCont = 0;
    cantidadCont = carritoDeCompras.reduce((cantidadCont, articulo) => cantidadCont + articulo.cantidad, cantidadCont); //se calcula la cantidad de articulos en el carrito
    cantidadDeArticulos.innerHTML = cantidadCont; //se muestra la cantidad

    let total = document.getElementById('carrito__total_numero');
    let totalAcum = 0;
    totalAcum = carritoDeCompras.reduce((totalAcum, articulo) => totalAcum + articulo.subtotal, totalAcum); //Suma de todo el carrito
    total.innerHTML = "$" + totalAcum; //Muestra el total de lo que esta en el carrito
}