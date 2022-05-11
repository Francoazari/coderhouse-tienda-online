let jsonTienda = {};
const jsonTiendaPath = "./js/tienda.json";

let carritoDeCompras = [];

function menuOptions(idMenu) {
    if(!idMenu) return;

    setActiveItemMenu(idMenu);

    switch(idMenu) {
        case "option0":
            tiendaOnline();
            break;
        case "option1":
            carrito();
            break;
    }
}

function setActiveItemMenu(idMenu){

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

window.onload = function() {
    
    fetch(jsonTiendaPath)
        .then(Response => Response.json())
        .then(data => {

            jsonTienda = data;

            if(jsonTienda["menu"].length > 0){
                
                const menu = document.getElementById('nav');
                const ulMenu = document.createElement('ul');

                for (itemMenu of jsonTienda["menu"]) {
                    (function () {
                        const liMenu = document.createElement('li');
                        liMenu.setAttribute("id","option" + itemMenu.id);
                        liMenu.classList.add("menu-item");
                        liMenu.innerHTML = itemMenu.label;
                        liMenu.addEventListener("click", () => menuOptions(liMenu.getAttribute("id")));
                        ulMenu.appendChild(liMenu);
                    }())
                    
                }
                menu.appendChild(ulMenu);
            }
            
            const mainShop = document.getElementById('main_shop__articles');
            mainShop.innerHTML = '';

            for (const articulo of jsonTienda["articulos"]) {

                if(!articulo) continue;
                if(articulo.stock <= 0) continue;
                if(!articulo.descripcion) articulo.descripcion = "";

                const article = document.createElement('div');
                article.classList.add('article');

                const articleImage = document.createElement('div');
                articleImage.classList.add('article__image');
                const imageArticle = document.createElement('img');
                imageArticle.classList.add('article_image_img');
                imageArticle.src = articulo.img;
                articleImage.appendChild(imageArticle);

                const articleName = document.createElement('div');
                articleName.classList.add('article__name');
                const nameArticle = document.createElement('p');
                nameArticle.innerHTML = articulo.nombre;
                const precioArticle = document.createElement('div');
                precioArticle.innerHTML = `$${articulo.precio}`;
                articleName.appendChild(nameArticle);
                articleName.appendChild(precioArticle);

                const articleDescription = document.createElement('div');
                articleDescription.classList.add('article__description');
                const descriptionArticle = document.createElement('p');
                descriptionArticle.innerHTML = articulo.descripcion;
                articleDescription.appendChild(descriptionArticle);

                const articleButton = document.createElement('button');
                articleButton.classList.add('article__button');
                articleButton.innerHTML = "Agregar al carrito";
                articleButton.addEventListener("click", () => agregarAlCarrito(articulo.id));

                article.appendChild(articleImage);
                article.appendChild(articleName);
                article.appendChild(articleDescription);
                article.appendChild(articleButton);

                mainShop.appendChild(article);
            }
        })
};

function agregarAlCarrito(idArticulo){

    if(localStorage.getItem("carritoDeCompras")) {
        carritoDeCompras = JSON.parse(localStorage.getItem("carritoDeCompras"));
    }

    let articuloElegido = jsonTienda["articulos"].find(articulo => articulo.id === idArticulo);

    if(articuloElegido){
        if(articuloElegido.stock > 0){

            let articuloEnCarrito = carritoDeCompras.find((articulo) => articulo.id === articuloElegido.id);            
            articuloElegido.stock -= 1;

            if(articuloEnCarrito){

                articuloEnCarrito.cantidad += 1;
                articuloEnCarrito.subtotal += articuloElegido.precio;

            }else{

                carritoDeCompras.push({
                    "id": articuloElegido.id,
                    "nombre": articuloElegido.nombre,
                    "cantidad": 1,
                    "precioPorUnidad": articuloElegido.precio, 
                    "subtotal": articuloElegido.precio 
                });

            }

            localStorage.setItem("carritoDeCompras", JSON.stringify(carritoDeCompras));

            console.clear();
            console.table(carritoDeCompras);

        }else{
            console.log("¡Lo sentimos! No hay stock disponible.");    
        }
    }else{
        console.error("El ID del articulo no existe. Intente nuevamente.");
    }
    
}


function tiendaOnline(){

    let articulos = document.getElementById("main_shop__articles");
    if(articulos.classList.contains('hidden')){
        articulos.classList.remove('hidden');
    }

    let carrito = document.getElementById("carrito");
    if(!carrito.classList.contains('hidden')){
        carrito.classList.add('hidden');
    }

}

function getImagenArticulo(idArticulo){
    if(!idArticulo) return;
    return jsonTienda.articulos.find(articulo => articulo.id === idArticulo).img;
}

function eliminarArticuloCarrito(idArticulo) {
    if(!idArticulo) return;

    let articuloCarrito = carritoDeCompras.find(articulo => articulo.id === idArticulo);
    if(!articuloCarrito) return;

    jsonTienda.articulos.find(articulo => articulo.id === idArticulo).stock += articuloCarrito.cantidad;

    carritoDeCompras.splice(carritoDeCompras.findIndex(articulo => articulo.id === idArticulo), 1);
    localStorage.setItem("carritoDeCompras", JSON.stringify(carritoDeCompras));
    carrito();
}



function carrito(){

    if(localStorage.getItem("carritoDeCompras")) {
        carritoDeCompras = JSON.parse(localStorage.getItem("carritoDeCompras"));
    }
    
    let carrito = document.getElementById("carrito");
    if(carrito.classList.contains('hidden')){
        carrito.classList.remove('hidden');
    }
    
    let articulos = document.getElementById("main_shop__articles");
    if(!articulos.classList.contains('hidden')){
        articulos.classList.add('hidden');
    }

    const carritoArticulos = document.getElementById('carrito__articulos');
    
    if(carritoDeCompras.length > 0){

        const carritoVacio = document.getElementById('carrito__articulos_vacio');
        if(!carritoVacio.classList.contains('hidden')){
            carritoVacio.classList.add('hidden');
        }
        carritoArticulos.innerHTML = "";
        for (const articulo of carritoDeCompras) {

            const carritoArticulo = document.createElement('div');
            carritoArticulo.classList.add('carrito__articulo', 'carrito_flex');

            const carritoArticuloImage = document.createElement('div');
            carritoArticuloImage.classList.add('carrito__articulo_image');
            const carritoArticuloImagen = document.createElement('img');
            carritoArticuloImagen.classList.add('carrito__articulo_imagen');
            carritoArticuloImagen.src = getImagenArticulo(articulo.id);
            carritoArticuloImage.appendChild(carritoArticuloImagen);

            const carritoArticuloNombre = document.createElement('div');
            carritoArticuloNombre.classList.add('carrito__articulo_articulo');
            carritoArticuloNombre.innerHTML = articulo.nombre;

            const carritoArticuloCantidad = document.createElement('div');
            carritoArticuloCantidad.classList.add('carrito__articulo_cantidad');
            carritoArticuloCantidad.innerHTML = articulo.cantidad;

            const carritoArticuloPrecioUnitario = document.createElement('div');
            carritoArticuloPrecioUnitario.classList.add('carrito__articulo_precio_unitario');
            carritoArticuloPrecioUnitario.innerHTML = articulo.precioPorUnidad;

            const carritoArticuloSubtotal = document.createElement('div');
            carritoArticuloSubtotal.classList.add('carrito__articulo_subtotal');
            carritoArticuloSubtotal.innerHTML = `$${articulo.subtotal}`;

            const carritoArticuloEliminar = document.createElement('div');
            carritoArticuloEliminar.classList.add('carrito__articulo_eliminar');
            carritoArticuloEliminar.innerHTML = `X`;
            carritoArticuloEliminar.addEventListener("click", () => eliminarArticuloCarrito(articulo.id));

            carritoArticulo.appendChild(carritoArticuloImage);
            carritoArticulo.appendChild(carritoArticuloNombre);
            carritoArticulo.appendChild(carritoArticuloCantidad);
            carritoArticulo.appendChild(carritoArticuloPrecioUnitario);
            carritoArticulo.appendChild(carritoArticuloSubtotal);
            carritoArticulo.appendChild(carritoArticuloEliminar);

            carritoArticulos.appendChild(carritoArticulo);
        }

    }else if(carritoDeCompras.length === 0){

        carritoArticulos.innerHTML = "";
        
        const carritoVacio = document.getElementById('carrito__articulos_vacio');
        if(carritoVacio.classList.contains('hidden')){
            carritoVacio.classList.remove('hidden');
        }
    }

    let cantidadDeArticulos = document.getElementById('carrito__cantidad_articulos_cantidad');
    let cantidadCont = 0;
    cantidadCont = carritoDeCompras.reduce((cantidadCont, articulo) => cantidadCont + articulo.cantidad, cantidadCont);
    cantidadDeArticulos.innerHTML = cantidadCont;

    let total = document.getElementById('carrito__total_numero');
    let totalAcum = 0;
    totalAcum = carritoDeCompras.reduce((totalAcum, articulo) => totalAcum + articulo.subtotal, totalAcum);
    total.innerHTML = "$" + totalAcum;
}