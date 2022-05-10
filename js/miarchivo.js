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


window.onload = function() { // también puede usar window.addEventListener('load', (event) => {
    

    

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

                mainShop.innerHTML += `<div class="article">
                                            <div class="article__image">
                                                <img src="${articulo.img}" class="article_image_img" />
                                            </div>
                                            <div class="article__name">
                                                <p>${articulo.nombre}</p>
                                                <div>$${articulo.precio}</div>
                                            </div>
                                            <div class="article__description">
                                                <p>${articulo.descripcion}</p>
                                            </div>
                                            <button class="article__button" onclick="agregarAlCarrito(${articulo.id})">Agregar al carrito</button>
                                        </div>`;
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

    carritoDeCompras.splice(carritoDeCompras.findIndex(articulo => articulo.id === idArticulo), 1)
    //carritoDeCompras.remove(articulo => articulo.id === idArticulo);
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
            carritoArticulos.innerHTML += `<div class="carrito__articulo carrito_flex">                                                
                                                <div class="carrito__articulo_image">
                                                    <img src="` + getImagenArticulo(articulo.id) + `" class="carrito__articulo_imagen">
                                                </div>
                                                <div class="carrito__articulo_articulo">${articulo.nombre}</div>
                                                <div class="carrito__articulo_cantidad">${articulo.cantidad}</div>
                                                <div class="carrito__articulo_precio_unitario">$${articulo.precioPorUnidad}</div>
                                                <div class="carrito__articulo_subtotal">$${articulo.subtotal}</div>
                                                <div class="carrito__articulo_eliminar" onclick="eliminarArticuloCarrito(${articulo.id})">X</div>
                                            </div>`;
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