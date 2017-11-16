'use strict'; //Modo estricto para prevenir errores y malas prácticas

//Boolean que permite saber si existe el método "classList" en el navegador

var classListEnabled = typeof document.createElement('div').classList === 'undefined' ? false : true;

//Se almacena window y document en variables al comienzo para no utilizar memoria después
var $window = $(window),
    $document = $(document);

//Se obtiene la URL de Ripley.com
var url = document.location.href;
url = url.substring(0, url.lastIndexOf('/')) + '/';
url = url.replace('simple', 'home');

var contenedor_principal = '#ripley-mini-site';
var isSubmenuActive = false;

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////// PLUGINS

//Igual la altura de las cajas
$.fn.equalizeHeights = function () {
  var $items = $(this),
      heightArray = [];
  if (!$items.length) {
    return;
  }
  $items.height('auto');
  $items.each(function (index, elem) {
    heightArray.push($(elem).height());
  });
  $items.height(Math.max.apply(Math, heightArray));
  return this;
};

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////// HANDLERS

window.handler = function () {
  var self = this;
};

//Se almacenan las funciones dentro del prototipo del objeto por convención, recomendación y performance por sobre todo
window.handler.prototype = {
  //Funciones que se inicializan en el document.ready
  onReadySetup: function () {
    var self = this; //Se almacena this com oel objeto para no confundir
    self.$body = $('body'); //Se almacena el body en una variable para ahorrar memoria
    self.eventsHandler($('[data-func]')); //Se ejecuta el método que permite la delegación de eventos automática desde el HTML
    self.loadProducts();
    self.slider();

    $('.tabs label[for=tab2-1]').addClass('active');

    $('input[name=tabs-two]').on('click', function (event) {
      var id_tab = $(this).attr('id');
      $('.tabs label').removeClass('active');
      $('.tabs label[for=' + id_tab + ']').addClass('active');
    });
  },
  //Funciones que se inicializan en el window.load
  onLoadSetup: function () {
    var self = this;
  },
  //Funciones que se inicializan en el evento scroll
  onScrollSetup: function () {
    var self = this;
    //Animaciones CSS al mostrar elemento en pantalla
    self.animateOnView($('[data-animate-on-scroll]'));
    //Animaciones CSS con delay
    self.animateOnDelay($('[data-animate-delay]'));
  },
  //Funciones que se inicializan en el evento resize
  onResizeSetup: function () {
    var self = this;
  },
  //Setea delegaciones automáticas a través del HTML
  eventsHandler: function ($elements) {
    if (!$elements.length) {
      return;
    }
    var self = this;
    $.each($elements, function (index, elem) {
      var $item = $(elem),
          func = $item.data('func'),
          events = $item.data('event') ? $item.data('event') : 'click.handler';
      if (func && typeof self[func] === 'function') {
        $item.on(events, $.proxy(self[func], self));
        $item.data('delegated', true);
      }
    });
  },
  numberWithPoints: function (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },
  //Retorna true o false si el elemento está en pantalla
  isScrolledIntoView: function (elem) {
    var $elem = $(elem);
    var $window = $(window);

    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();

    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();
    return elemBottom <= docViewBottom && elemTop >= docViewTop;
  },
  //Pone la clase 'animated' y la de animacion cuando aparezca el elemento en pantalla
  animateElements: function ($elements) {
    var self = this;
    $.each($elements, function (index, element) {
      var $element = $(element);
      var animation = $element.data('animate') ? $element.data('animate') : $element.data('animate-on-scroll');

      $element.addClass('animated ' + animation);
    });
  },
  animateOnView: function ($elements) {
    var self = this;
    $.each($elements, function (index, element) {
      var $element = $(element);
      var animation = $element.data('animate') ? $element.data('animate') : $element.data('animate-on-scroll');

      if (self.isScrolledIntoView($element)) {
        $element.addClass('animated ' + animation);
      }
    });
  },
  animateOnDelay: function ($elements) {
    var self = this;
    $.each($elements, function (index, element) {
      var $element = $(element);
      if (self.isScrolledIntoView($element)) {
        $element.addClass('animated ' + $element.data('animate'));
      }
    });
  },
  getPrice: function (product_sku, fn) {
    var self = this;
    var vreturn = [];

    $.ajax({
      url: 'https://simple.ripley.cl/api/products/' + product_sku,
      dataType: 'JSON'
    }).done(function (data) {

      //Datos minimos que se obtienen
      var precio_normal = self.numberWithPoints(data.prices.listPrice);
      var uniqueID = data.uniqueID;
      var link_producto = data.url;
      var name_producto = data.name;
      var imagen = data.fullImage;
      var thumbnail = data.thumbnailImage;

      //Precio Internet
      if (data.prices.offerPrice) {
        var precio_internet = data.prices.offerPrice;
        var precio_internet = self.numberWithPoints(precio_internet);
      } else {
        var precio_internet = '0';
      }

      //Precio con Tarjeta Ripley
      if (data.prices.cardPrice) {
        var precio_otar = data.prices.cardPrice;
        var precio_otar = self.numberWithPoints(precio_otar);
      } else {
        var precio_otar = '0';
      }

      //Descuento en numeros del SKU
      if (data.prices.discount) {
        var descuento = data.prices.discount;
      } else {
        var descuento = '0';
      }

      //Porcentaje de descuento del SKU
      if (data.prices.discountPercentage) {
        var porcentaje = data.prices.discountPercentage;
      } else {
        var porcentaje = '0';
      }

      //Obtiene las demás imagenes del SKU
      if (data.images != '') {
        var galeria = [];
        $.each(data.images, function (index, val) {
          galeria[index] = val;
        });
      } else {
        var galeria = 'NOK';
      }

      //Obtiene las variaciones del SKU
      if (jQuery.isEmptyObject(data.variations)) {
        var variaciones = 'NOK';
      } else {
        var variaciones = [];
        $.each(data.variations, function (index, val) {
          if (index) {
            var talla = {
              talla: index
            };
            $.extend(true, val, talla);
            variaciones.push(val);
          }
        });
      }

      vreturn.push({
        'uniqueID': uniqueID,
        'normal': precio_normal,
        'internet': precio_internet,
        'otar': precio_otar,
        'link': link_producto,
        'name': name_producto,
        'imagen': imagen,
        'thumbnail': thumbnail,
        'descuento': descuento,
        'porcentaje': porcentaje,
        'galeria': galeria,
        'variaciones': variaciones
      });
      fn(vreturn);
    }).error(function (retorno) {
      fn(retorno.statusText);
    });
  },
  getModal: function (event) {
    event.preventDefault();

    $('body').css('overflow', 'hidden');

    var self = this;
    var $item = $(event.currentTarget);
    var target = $item.data('modal');

    var sku = $item.data('product').toString();

    //SI NO VIENE EL SKU SE CARGA LA MODAL DE 404
    if (!sku) {
      var sku = 'xxxxxxxxxxxxx';
      target = 'modal-404';
    }

    $('.screen').remove();

    if ($item.data('modal-delegated') === true || $item.find('.btn-add').hasClass('no-modal')) {
      return false;
    }
    var $cortina = self.setScreen();

    $cortina.append('<div class="loader-inner ball-beat white-balls"><div></div><div></div><div></div></div>').addClass('loaded');

    $.ajax({
      url: url + 'partials/' + target + '.html?' + Math.random(),
      success: function (result) {
        $('.ball-beat').remove();
        $cortina.append(result);

        $cortina.find('.lightbox').css('top', $document.scrollTop() + 30).addClass('animated fadeIn');

        //VALIDACION BOTONES EN LA MODAL
        $cortina.find('.lightbox a[data-add-to-cart]').on('click', function (event) {
          event.preventDefault();
          if ($(this).attr('data-add-to-cart') == '') {
            self.ventanaError('Debe seleccionar la talla y/o color.', true);
          }
        });

        $cortina.find('.lightbox').on('click', function (event) {
          //event.stopPropagation();
        });

        $cortina.one('click', function (event) {
          //event.stopPropagation();
          //$cortina.removeClass('loaded').remove();
        });

        //MODAL PRODUCTOS
        if (target == 'modal-producto') {
          self.getPrice(sku, function (producto) {

            if (!$.isArray(producto)) {
              //MODAL 404
              target = 'modal-404';
              $.ajax({
                url: url + 'partials/' + target + '.html?' + Math.random(),
                success: function (result) {
                  $cortina.find('#producto').html(result);
                  $cortina.find('.lightbox .product-sku').html('SKU: ' + sku);
                  self.eventsHandler($cortina.find('[data-func]'));
                }
              });
            } else {
              var uniqueID = producto[0]['uniqueID'];
              var imagen = producto[0]['imagen'];
              var name_producto = producto[0]['name'];
              var link_producto = producto[0]['link'];
              var precio_normal = producto[0]['normal'];
              var precio_internet = producto[0]['internet'];
              var precio_otar = producto[0]['otar'];
              var galeria = producto[0]['galeria'];
              var variaciones = producto[0]['variaciones'];
              var puntos = 0;

              //NOMBRE IMAGEN Y SKU
              $('.lightbox .product-name').html(name_producto);
              $('.lightbox .product-image').attr('src', imagen);
              $('.lightbox .product-sku').html('SKU: ' + sku);
              //PRECIO NOMAL
              $('.lightbox .product-normal-price').html('Normal: $' + precio_normal);
              //SI EXISTE EL PRECIO INTERNET
              if (precio_internet) {
                puntos = Math.ceil(parseInt(precio_internet.replace(/\./g, '')) / 100);
                $('.lightbox .product-oferta-price').html('Internet: $' + precio_internet);
                if (precio_normal == precio_internet) {
                  $('.lightbox .product-oferta-price').remove();
                }
              }
              //SI EXISTE EL PRECIO OTAR
              if (precio_otar == '0') {
                $('.lightbox .oferta-tarjeta-price').remove();
              } else {
                puntos = Math.ceil(parseInt(precio_otar.replace(/\./g, '')) / 100);

                var icon_otar = '<svg role="img" title="opex_izq"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#opex_izq"></use></svg>';

                $('.lightbox .oferta-tarjeta-price').html('Tarjeta Ripley: <span class="product-price">$' + precio_otar + '' + icon_otar + '</span>');
              }

              //GALERIA
              if (galeria != 'NOK') {
                var $galeria = $('.lightbox .galeria ul');

                $galeria.append('<li> <a href="#"> <img src="' + imagen + '" alt="Producto" /> </a> </li>');

                $.each(galeria, function (index, element) {
                  $galeria.append('<li> <a href="#"> <img src="' + element + '" alt="Producto" /> </a> </li>');
                });

                $('.lightbox .galeria ul').find('a').on('click', function (event) {
                  event.preventDefault();
                  var miniatura = $(this).find('img').attr('src');
                  $('.product-image').attr('src', miniatura);
                });
              }

              //VARIACIONES
              if (variaciones == 'NOK') {
                //$('.lightbox a[data-add-to-cart]').hide();
                $('.lightbox a[data-add-to-cart]').attr('data-add-to-cart', uniqueID);
                $('.lightbox a[data-add-to-cart]').css({ 'pointer-events': 'auto', 'cursor': 'pointer', 'background-color': '#E9524D' });
                $('.lightbox a[data-add-to-cart]').removeClass('is-disabled');
              } else {
                if (variaciones.length > 0) {
                  $.each(variaciones, function (index, element) {
                    $('.vtalla ul').append('<li data-func="loadVariant" data-sku="' + element.partNumber + '" data-id="' + element.uniqueID + '">' + element.talla + '</li>');
                  });
                  $('.vtalla').show();
                  self.eventsHandler($cortina.find('[data-func]'));
                }
              }

              //PUNTOS RIPLEY
              if (puntos) {
                $('.lightbox .product-points').html(self.numberWithPoints(puntos) + ' Ripley Puntos con tu Tarjeta Ripley');
              }

              //URL FICHA PRODUCTO
              if (link_producto) {
                $('.lightbox .btn-ver-detalle').attr('href', 'https://simple.ripley.cl' + link_producto);
              } else {
                $('.lightbox .btn-ver-detalle').attr('href', 'https://simple.ripley.cl/' + sku);
              }
            }
          });
        } else {
          //MODAL 404
          $cortina.find('.lightbox .product-sku').html('SKU: ' + sku);
        }

        self.eventsHandler($cortina.find('[data-func]'));
      }
    });
  },
  loadProducts: function () {
    var self = this;

    var $contenedor = $(contenedor_principal);
    var $boxs = $contenedor.find('.rpe-product-thumb');

    $.each($boxs, function (index, element) {
      var $box = $(element);
      if ($box.attr('data-product') && $box.data('product') != '') {
        var sku = $box.data('product').toString();

        self.getPrice(sku, function (producto) {
          if (!$.isArray(producto)) {
            $box.find('span').attr('data-modal', 'modal-404');
            return false;
          }

          var imagen = producto[0]['imagen'];
          var name_producto = producto[0]['name'];
          var linkToProduct = producto[0]['link'];
          if (name_producto) {
            $box.find('.rpe-product__name').html(name_producto);
          }
          if (imagen) {
            $box.find('.rpe-product__img').attr({ 'src': imagen, 'alt': name_producto });
          }
          if (linkToProduct) {
            var finalLink = 'https://simple.ripley.cl/' + linkToProduct;
            $box.find('.rpe-product').attr({ 'href': finalLink, 'alt': name_producto });
          }
        });

        self.getPriceEndPoint(sku, function (prices) {
          var normalPrice = prices[0]['formattedListPrice'];
          var internetPrice = prices[0]['formattedOfferPrice'];
          var otarPrice = prices[0]['formattedCardPrice'];
          var discount = prices[0]['discount'];

          if (!discount && normalPrice === internetPrice) {
            $box.find('.rpe-normal').remove();
            $box.find('.rpe-internet').html('Precio Internet: ' + internetPrice);
          } else if (normalPrice) {
            $box.find('.rpe-normal').html('Precio Normal: ' + normalPrice);
          }

          if (normalPrice != internetPrice) {
            $box.find('.rpe-internet').html('Precio Internet: ' + internetPrice);
          }

          if (otarPrice) {
            $box.find('[data-offer-price]').html(otarPrice);
          }
        });
      }
    });
  },
  getPriceEndPoint: function (product_sku, fn) {
    var self = this;
    var vreturn = [];

    $.ajax({
      url: 'https://simple.ripley.cl/api/products/' + product_sku,
      dataType: 'JSON'
    }).done(function (data) {
      var precio_normal = self.numberWithPoints(data.prices.listPrice);
      var precio_internet = self.numberWithPoints(data.prices.offerPrice);
      var link_producto = data.url;
      var name_producto = data.name;
      if (data.prices.cardPrice) {
        var precio_otar = data.prices.cardPrice;
        var precio_otar = self.numberWithPoints(precio_otar);
      } else {
        var precio_otar = '0';
      }
      if (data.prices.formattedListPrice) {
        var formattedListPrice = data.prices.formattedListPrice;
      }
      if (data.prices.formattedOfferPrice) {
        var formattedOfferPrice = data.prices.formattedOfferPrice;
      }
      if (data.prices.formattedCardPrice) {
        var formattedCardPrice = data.prices.formattedCardPrice;
      }
      if (data.prices.discount) {
        var discount = data.prices.discount;
      }
      vreturn.push({
        'normal': precio_normal,
        'internet': precio_internet,
        'otar': precio_otar,
        'link': link_producto,
        'name': name_producto,
        'formattedListPrice': formattedListPrice,
        'formattedOfferPrice': formattedOfferPrice,
        'formattedCardPrice': formattedCardPrice,
        'discount': discount
      });
      fn(vreturn);
    }).error(function (retorno) {
      console.log(retorno.statusText);
    });
  },
  setScreen: function () {
    var self = this;
    var cortina = '<div class="screen"></div>';
    self.$body.find(contenedor_principal).append(cortina);
    var $cortina = $('.screen');
    $cortina.height($document.height());
    $cortina.addClass('on-screen');
    return $cortina;
  },
  closeModal: function (event) {
    event.preventDefault();
    $('body').css('overflow', 'scroll');
    $('.screen').find('.lightbox').removeClass('fadeIn').addClass('fadeOut');
    setTimeout(function () {
      $('.screen').removeClass('on-screen');
    }, 600);
    setTimeout(function () {
      $('.screen').remove();
    }, 900);
  },
  ventanaError: function (mensaje, error) {
    if (mensaje) {
      $('.lightbox .error-variantes').html(mensaje);
    } else {
      $('.lightbox .error-variantes').html('Error de lectura.');
    }

    if (error) {
      $('.lightbox .error-variantes').show();
    } else {
      $('.lightbox .error-variantes').hide();
    }
  },
  loadVariant: function (event) {
    event.preventDefault();
    var self = this;
    self.ventanaError('', false);
    var $item = $(event.currentTarget);
    var sku = $item.attr('data-sku');
    var id_variacion = $item.attr('data-id');

    if ($item.hasClass('active')) {
      return false;
    }
    $item.parent().find('li').removeClass('active');
    $item.addClass('active');

    self.getPrice(sku, function (variacion) {

      //VALIDACION RESPUESTA DE LA VARIACION DEL PRODUCTO
      if (variacion == 'Internal Server Error') {
        self.ventanaError('No existe el color o la talla seleccionada.', true);
        return false;
      } else {

        var imagen = variacion[0]['imagen'];
        var name_variacion = variacion[0]['name'];
        var precio_normal = variacion[0]['normal'];
        var precio_internet = variacion[0]['internet'];
        var precio_otar = variacion[0]['otar'];
        var galeria = variacion[0]['galeria'];

        $('.lightbox .product-name').html(name_variacion);
        $('.lightbox .product-image').attr('src', imagen);
        $('.lightbox .product-sku').html('SKU: ' + sku);

        //PRECIO NOMAL
        $('.lightbox .product-normal-price').html('Normal: $' + precio_normal);

        //SI EXISTE EL PRECIO INTERNET
        if (precio_internet) {
          var puntos = Math.ceil(parseInt(precio_internet.replace(/\./g, '')) / 100);
          $('.lightbox .product-oferta-price').html('Internet: $' + precio_internet);
          if (precio_normal == precio_internet) {
            $('.lightbox .product-oferta-price').remove();
          }
        }
        //SI EXISTE EL PRECIO OTAR
        if (precio_otar == '0') {
          $('.lightbox .oferta-tarjeta-price').remove();
        } else {
          var puntos = Math.ceil(parseInt(precio_otar.replace(/\./g, '')) / 100);

          var icon_otar = '<svg role="img" title="opex_izq"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#opex_izq"></use></svg>';

          $('.lightbox .oferta-tarjeta-price').html('Tarjeta Ripley: <span class="product-price">$' + precio_otar + '' + icon_otar + '</span>');
        }

        //GALERIA
        if (galeria != 'NOK') {
          var $galeria = $('.lightbox .galeria ul').html('');

          $galeria.append('<li> <a href="#"> <img src="' + imagen + '" alt="Producto" /> </a> </li>');

          $.each(galeria, function (index, element) {
            $galeria.append('<li> <a href="#"> <img src="' + element + '" alt="Producto" /> </a> </li>');
          });

          $('.lightbox .galeria ul').find('a').on('click', function (event) {
            event.preventDefault();
            var miniatura = $(this).find('img').attr('src');
            $('.product-image').attr('src', miniatura);
          });
        }

        //BOTONES ADD TO CART Y COMPRAR
        $('.lightbox a[data-add-to-cart]').attr('data-add-to-cart', id_variacion);
        $('.lightbox a[data-add-to-cart]').css({ 'pointer-events': 'auto', 'cursor': 'pointer', 'background-color': '#E9524D' });
        $('.lightbox a[data-add-to-cart]').removeClass('is-disabled');
      }
    });
  },
  shareFacebook: function (event) {
    event.preventDefault();
    var $item = $(event.currentTarget);

    var title = $item.attr('data-title');
    var url_img = $item.attr('data-img');
    //var url_arr = window.location.href.split('/');
    //var url_img = window.location.href.replace(url_arr[url_arr.length - 1], img);
    var description = $item.parent().parent().parent().parent().find('.descripcion-share').html();

    FB.ui({
      method: 'feed',
      name: title,
      link: window.location.href + '?utm_source=Facebook&utm_medium=PaginaCompartida&utm_campaign=Ripley-Botas',
      picture: url_img,
      caption: 'Ripley Estee Lauder',
      description: description
    });
  },
  shareTwitter: function (event) {
    event.preventDefault();
    var $item = $(event.currentTarget);

    var width = 575;
    var height = 400;
    var left = ($(window).width() - width) / 2;
    var top = ($(window).height() - height) / 2;
    var url = $item.attr('href');
    var opts = 'status=1' + ',width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;

    window.open(url, 'twitter', opts);
  },
  sharePinterest: function (event) {
    var pinterest = $('[data-pinterest]');
    var fullUrl = document.location.href;
    fullUrl = fullUrl.replace('simple', 'home');

    var pinterestUrl = 'http://pinterest.com/pin/create/button/?url=' + fullUrl;
    pinterest.attr('href', pinterestUrl);
  },
  deployMainMenu: function (event) {
    event.preventDefault();

    if ($(window).width() <= 768) {
      var transitionEvent = whichAnimationEvent();

      $('[data-navigation]').addClass('rp-navigation_active animated bounceInRight').one(transitionEvent, function (event) {
        $(this).removeClass('animated bounceInRight');
        $('body').css('overflow', 'hidden');
      });
    }
  },
  deployMenuMobile: function (event) {
    var element = $(event.currentTarget);

    element.toggleClass('wl-offcanvas--active');
    $('.rpe-nav').toggleClass('rpe-nav--active');
  },
  deploySubmenuMobile: function (event) {
    event.preventDefault();
    if ($(window).width() < 768) {
      var element = $(event.currentTarget);
      var submenu = element.siblings();

      element.toggleClass('active');
      submenu.toggleClass('active');

      if (submenu.hasClass('active')) {
        submenu.css('display', 'block');
      } else {
        submenu.css('display', 'none');
      }
    }
  },
  slider: function (event) {
    $('.rpe-slick').slick({
      dots: true,
      infinite: true,
      speed: 300,
      slidesToShow: 2,
      slidesToScroll: 1,
      arrows: false,
      responsive: [{
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      }, {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      }, {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }]
    });
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////// COMIENZO

var Main = new window.handler(); //Se genera un nuevo objeto para almacenar las funciones
$document.ready(function () {
  Main.onReadySetup();
}); //Se inicializan las funcionalidades en el document.ready
$window.load(function () {
  Main.onLoadSetup();
}); //Se inicializan las funcionalidades en el window.ready

//Se inicializan las funcionalidades los eventos scroll y resize
$window.on({
  'scroll': function () {
    Main.onScrollSetup();
  },
  'resize': function () {
    Main.onResizeSetup();
  }
});

String.prototype.filename = function (extension) {
  var s = this.replace(/\\/g, '/');
  s = s.substring(s.lastIndexOf('/') + 1);
  return extension ? s.replace(/[?#].+$/, '') : s.split('.')[0];
};

// $(function() {
//   FastClick.attach(document.body);
// });

$.fn.extend({
  animateCss: function (animationName) {
    var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
    this.addClass('animated ' + animationName).one(animationEnd, function () {
      $(this).removeClass('animated ' + animationName);
    });
  }
});

function whichAnimationEvent() {
  var t,
      el = document.createElement('fakeelement');

  var animations = {
    'animation': 'animationend',
    'OAnimation': 'oAnimationEnd',
    'MozAnimation': 'animationend',
    'WebkitAnimation': 'webkitAnimationEnd'
  };

  for (t in animations) {
    if (el.style[t] !== undefined) {
      return animations[t];
    }
  }
}
//# sourceMappingURL=main.js.map
