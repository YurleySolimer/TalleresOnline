$(function() {

    $("#sliderInputGasolina").roundSlider({
        sliderType: "min-range",
        editableTooltip: false,
        radius: 100,
        width: 12,
        value: 50,
        handleSize: 12,
        handleShape: "round",
        circleShape: "half-top",
        mouseScrollAction: "true"
    });

    $(".rs-tooltip-text").replaceWith("<span class='indicador1' style='position: absolute; left: -80px; bottom: -18px; z-index: 40; font-weight: bold;'>E</span><span class='indicador2' style='position: absolute; left: -56px; bottom: 27px; z-index: 40; font-weight: bold;'>1/4</span><span class='indicador3' style=' position: absolute; top: 16px; left: -7px; z-index: 50; font-weight: bold;'>2/4</span><span class='indicador4' style='position: absolute; left: 40px; top: 37px; z-index: 40; font-weight: bold;'>3/4</span><span class='indicador5' style='position: absolute; left: 70px; bottom: -16px; z-index: 40; font-weight: bold;'>F</span><i style='position: absolute;top: 65px;z-index: 20;font-size: 32px;right: 40%;' class='fas fa-gas-pump'></i>");
    $(".rs-end").css("transform","translate(175px, 15px)");
    $(".rs-start").css("transform","translate(-11px, 5px)");
    

    /*-----------------------------------
     * FIXED  MENU - HEADER
     *-----------------------------------*/
    function menuscroll() {
        var $navmenu = $('.nav-menu');
        if ($(window).scrollTop() > 50) {
            $navmenu.addClass('is-scrolling');
        } else {
            $navmenu.removeClass("is-scrolling");
        }
    }
    menuscroll();
    $(window).on('scroll', function() {
        menuscroll();
    });
    /*-----------------------------------
     * NAVBAR CLOSE ON CLICK
     *-----------------------------------*/

    $('.navbar-nav > li:not(.dropdown) > a').on('click', function() {
        $('.navbar-collapse').collapse('hide');
    });
    /* 
     * NAVBAR TOGGLE BG
     *-----------------*/
    var siteNav = $('#navbar');
    siteNav.on('show.bs.collapse', function(e) {
        $(this).parents('.nav-menu').addClass('menu-is-open');
    });
    siteNav.on('hide.bs.collapse', function(e) {
        $(this).parents('.nav-menu').removeClass('menu-is-open');
    });

    /*-----------------------------------
     * ONE PAGE SCROLLING
     *-----------------------------------*/
    // Select all links with hashes
    $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').not('[data-toggle="tab"]').on('click', function(event) {
        // On-page links
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            // Figure out element to scroll to
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            // Does a scroll target exist?
            if (target.length) {
                // Only prevent default if animation is actually gonna happen
                event.preventDefault();
                $('html, body').animate({
                    scrollTop: target.offset().top
                }, 1000, function() {
                    // Callback after animation
                    // Must change focus!
                    var $target = $(target);
                    $target.focus();
                    if ($target.is(":focus")) { // Checking if the target was focused
                        return false;
                    } else {
                        $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                        $target.focus(); // Set focus again
                    }
                });
            }
        }
    });
    /*-----------------------------------
     * OWL CAROUSEL
     *-----------------------------------*/
    var $testimonialsDiv = $('.testimonials');
    if ($testimonialsDiv.length && $.fn.owlCarousel) {
        $testimonialsDiv.owlCarousel({
            items: 1,
            nav: true,
            dots: false,
            navText: ['<span class="ti-arrow-left"></span>', '<span class="ti-arrow-right"></span>']
        });
    }

    var $galleryDiv = $('.img-gallery');
    if ($galleryDiv.length && $.fn.owlCarousel) {
        $galleryDiv.owlCarousel({
            nav: false,
            center: true,
            loop: true,
            autoplay: true,
            dots: true,
            navText: ['<span class="ti-arrow-left"></span>', '<span class="ti-arrow-right"></span>'],
            responsive: {
                0: {
                    items: 1
                },
                768: {
                    items: 3
                }
            }
        });
    }
})

/* Service Worker */

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js', {
        scope: '.'
    })
        .then(function(registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }), (function(err) {
            console.log('ServiceWorker registration failed: ', err);
        });
}

/* End Service Worker */
