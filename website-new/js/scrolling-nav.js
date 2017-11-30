//jQuery to collapse the navbar on scroll
// $(window).scroll(function () {
//     if ($(".navbar").offset().top > 50) {
//         $(".navbar-fixed-top").addClass("top-nav-collapse");
//         $(".navbar-fixed-top").css('box-shadow', '0px 0px 10px rgba(0, 0, 0, 0.5)');
//     } else {
//         $(".navbar-fixed-top").removeClass("top-nav-collapse");
//         $(".navbar-fixed-top").css('box-shadow', 'none');
//     }
// });

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });

    // Closes responsive menu when a scroll trigger link is clicked
    $('.page-scroll').click(function () {
        $('.navbar-collapse').collapse('hide');
    });

    $('body').scrollspy({
        target: '#mainNav',
        offset: 54
      });
});
