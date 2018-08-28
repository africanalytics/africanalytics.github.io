(function($){
	
	// =============================================
	// Collapse Grid
	// =============================================
	
	window.closeCollapseGrid = function() {
		$('#collapse-grid .group.active .panel').removeAttr('style'); 
		$('#collapse-grid .group.active').removeAttr('style'); 
		$('#collapse-grid .group.active').removeClass('active'); 
	}

	window.initCollapseGrid = function() {
		var currentGroup,
			group,
			hInner,
			hPanel,
			HGROUP,
			openDelay = 50,
			img;
		

		// Load the first image to define height of items
		img = new Image();
		img.src = $('#collapse-grid .group img').eq(0).attr('src');
		img.onload = function() {
			HGROUP = $('#collapse-grid .group').eq(0).outerHeight() + 20;

		};
		
		var managePanel = function managePanel(object){
			object.target.children('.panel').height(object.hPanel);
			object.target.height( object.hPanel + object.hGroup );
		};

		$('#collapse-grid').off('click');
		$('#collapse-grid').on('click', '.group', function(event){
			if (event.target.tagName.toLowerCase() == "a") return;
			event.preventDefault();


			if(!HGROUP){
				return false;
			}
			group 	= $(this);
			hPanel	= group.children('.panel').height();
			hInner 	= group.children('.panel').children('.inner').outerHeight();

			//Close old Panel
			if( currentGroup ){
				managePanel({target:currentGroup, hPanel:0, hGroup:(HGROUP-20)});
				currentGroup.removeClass('active');
				openDelay = 600;
			}

			//Open new Panel
			if(  hPanel === 0 ){
				setTimeout(function(){
					group.addClass('active');
					managePanel({ target:group, hPanel:hInner, hGroup:HGROUP});
				},	openDelay);
			}

			currentGroup = group;
		});
		//closing some remaining opened grid
		window.closeCollapseGrid();
		$('#collapse-grid .close').off('click');
		//setting listener on close button
		$('#collapse-grid .close').on('click', '.group', function(){
			managePanel({target:currentGroup, hPanel:0, hGroup:(HGROUP-20)});
			currentGroup.removeClass('active');

		});
	}

	if(document.getElementById("collapse-grid")){
		window.initCollapseGrid();
	}

	// =============================================
	// Accordions 
	// =============================================

	if(document.getElementById("accordions")){

		//var currentPanel;

		$('#accordions').on('click', '.trigger', function(event){

			event.preventDefault();

			var panel = $( $(this).attr('href') );

			// Toggle
			if (panel.parent('.accordion-panel').hasClass('active')){
				panel.height(0);
				panel.parent('.accordion-panel').removeClass('active');
			}
			else {
				panel.height( panel.find('.accordion-content').outerHeight() );
				panel.parent('.accordion-panel').addClass('active');

			}


			// Open/Close Panels
			// ----------------------
				// Current
				// if( currentPanel ){
				// 	currentPanel.height(0);
				// 	currentPanel.parent('.accordion-panel').removeClass('active');
				// }


				// // New
				// if( panel.height() === 0 ){
				// 	panel.height( panel.find('.accordion-content').outerHeight() );
				// 	panel.parent('.accordion-panel').addClass('active');
				// }
			// Scroll to Current Panel
			// ----------------------
				/*$('html, body').animate({
					scrollTop: (panel.offset().top)
				},400);*/


			// Define new Current Panel
			// ----------------------
				//currentPanel = panel;
		});
		
	}


	// =============================================
	// MAIN NAV (DESKTOP)
	// =============================================

		// Get Scroll Position
		// -------------------------------
		function getScrollXY() {
			var scrOfX = 0, scrOfY = 0;
			if( typeof( window.pageYOffset ) === 'number' ) {
				//Netscape compliant
				scrOfY = window.pageYOffset;
				scrOfX = window.pageXOffset;
			} else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
				//DOM compliant
				scrOfY = document.body.scrollTop;
				scrOfX = document.body.scrollLeft;
			} else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
				//IE6 standards compliant mode
				scrOfY = document.documentElement.scrollTop;
				scrOfX = document.documentElement.scrollLeft;
			}
			return [ scrOfX, scrOfY ];
		}
		
		// 
		// -------------------------------
		if( document.getElementById('hero') ){
			
			var mainNav = $('#headnav'),
				maxPos 	= $('#hero').outerHeight();
			$(window).scroll(function() {
				var offs = getScrollXY();
				var posY = offs[1];
				if( posY >= maxPos ){
					mainNav.removeClass('transparent');
				}else{
					mainNav.addClass('transparent');
				}
			});

		}else{
			// $('#template').css({'padding-top':'120px'});
		}

	// =============================================
	//  MAIN NAV (MOBILE)
	// =============================================
		
		var body 		= $('body'),
			subnavs 	= $('#mainnav .subnav'),
			mobileBtn 	= $('#mobile-panel-trigger'),
			navOverlay 	= $('#nav-overlay'),
			windowWidth = $( window ).outerWidth();

			$( window ).resize(function() {
				windowWidth = $(this).outerWidth();
			});
		// Accordion
		// -------------------------------
			$('#mainnav .subnav-trigger').click(function(event){
				if( windowWidth <= 991 ){
					event.preventDefault();
					var selector = "*";
					if ($(this).data("subnav-level")) {
						selector = "[data-subnav-level='" + $(this).data("subnav-level") + "']";
					} 
					var target = $(this).siblings(selector);
					if( target.hasClass('is-open') ){
						target.removeClass('is-open');
					}else{
						subnavs.filter(selector).removeClass('is-open');
						target.addClass('is-open');	
					}
				}
			});
		// Open/Close Panel
		// -------------------------------
			mobileBtn.on('click',function(){
				panelManagement();				
			});
			navOverlay.on('click',function(){
				panelManagement();				
			});

			function panelManagement (){			
				body.toggleClass('mobilenav-is-open');
				if( ! body.hasClass('is-open') ){
					mobileBtn.blur();
					setTimeout(function(){
						subnavs.removeClass('mobilenav-is-open');
					},800);
				}
			}

	// =============================================
	//  Popin
	// =============================================
		if( document.getElementById('popin') ){
			$('#trigger-popin').on('click',function(){
				body.addClass('popin-is-open');
				$('#popin').addClass('active');
			});
			$('#close-popin').on('click',function(){
				body.removeClass('popin-is-open');
				$('.popin').removeClass('active');
			});
		}

	// =============================================
	//  Form
	// =============================================

	if ($('form input[required]').length > 0) {
		var onErrorFieldFocus = function(el) {
			$(el.currentTarget).removeClass('has-error');
			$(el.currentTarget).unbind('focus');
		}

		$('form button[type=submit]').click(function(e) {
			$('form input[required]').each(function(index, el) {
				if ($(el).val().length<=0) {
					$(el).addClass('has-error');
					$(el).focus(onErrorFieldFocus);
					e.preventDefault();
				}
				return true;
			})
		});
	}

	// =============================================
	// Sticky menu
	// =============================================

	var deviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
	var deviceHeight = (window.innerHeight > 0) ? window.innerHeight : $(window).height();
	if ($('.sticky-content:visible').length > 0  && deviceWidth >= 768) { 
		var stickyContentTop = $('.sticky-content').offset().top;
		var stickyContentWidth = $('.sticky-content').innerWidth();
 		var maxVerticalScroll;

		var makeItSticky = function(){
			if ($('.sticky-content:visible').length > 0) {
				var scrollTop = $(window).scrollTop();
				//if maxVerticalScroll was set (ie: we are at the bottom of the page) and scrollTop did not get higher thant it, do nothing
				if (maxVerticalScroll && scrollTop > maxVerticalScroll) {
					handleTooLow(maxVerticalScroll);
				}			
				//if sticky content is about to disapear while scrolling
				if (scrollTop > stickyContentTop - $('#headnav').height()) { 
					//regular sticky case : sticky content is not overlaping on footer
					if ($('.sticky-content').offset().top + $('.sticky-content').innerHeight() < $('footer').offset().top) {
						handleTooHigh(maxVerticalScroll);
					}
					//specific case to prevent sticky content from overlaping on footer
					if ($('.sticky-content').offset().top + $('.sticky-content').innerHeight() >= $('footer').offset().top) {
						handleTooLow(maxVerticalScroll);
					} 
					$('.sticky-content').innerWidth(stickyContentWidth);
				} else {
					unmakeSticky();
				}
			} 
		};

 		var handleTooHigh = function(maxVerticalScroll) {
			maxVerticalScroll = undefined;
			var leftOffset = $('.sticky-content:visible').offset().left;
			var topOffset = $('#headnav').height();
		    $('.sticky-content:visible').addClass('sticky');
		    $('.sticky-content:visible').css('left', leftOffset + 'px');
		    $('.sticky-content:visible').css('top', topOffset + 'px');
		    $('.sticky-content:visible').css('bottom', 'initial');
 		}

 		var handleTooLow = function(maxVerticalScroll) {
			maxVerticalScroll = maxVerticalScroll ? maxVerticalScroll : $(window).scrollTop();
			var leftOffset = $('.sticky-content:visible').offset().left;
			// Computing visible part of the footer:
			// hint: hiddenHeightAtTheBottomOfPage = $('#frame-content').innerHeight() - $(window).scrollTop() - $('body').innerHeight()
			var bottomOffset = $('footer').innerHeight() - ($('#frame-content').innerHeight() - $(window).scrollTop() - $('body').innerHeight()); 
		    if (bottomOffset < 0) {
				bottomOffset = 0;
		    }
		    $('.sticky-content:visible').addClass('sticky');
		    $('.sticky-content:visible').css('left', leftOffset + 'px');
		    $('.sticky-content:visible').css('top', 'initial');
		    $('.sticky-content:visible').css('bottom', bottomOffset + 'px');
 		}

		var unmakeSticky = function() {
			if ($('.sticky-content:visible').length > 0) {
				maxVerticalScroll = undefined;
			    $('.sticky-content:visible').removeClass('sticky'); 
			    $('.sticky-content:visible').css('left', 'initial');
			    $('.sticky-content:visible').css('top', 'initial');
			    $('.sticky-content:visible').css('bottom', 'initial');
			    $('.sticky-content').innerWidth('initial');
			}
		}
		 
		//initialization
		makeItSticky();
		 
		//on scroll 
		$(window).scroll(function() {
		    makeItSticky();
		});

		//adapting to new window size
		$( window ).resize(function() {
			stickyContentWidth = $('.sticky-content').innerWidth();
			unmakeSticky();
			makeItSticky();
		});
	}

	// LEARN PORTAL SPECIFIC
	if ($('.portal-right-menu').length && deviceWidth >= 768) {
		var isMenuTallerThanBrowser = $('.portal-right-menu').height() > deviceHeight - $('#headnav').height();
		var isMenuTallerThanArticle = $('.portal-right-menu').height() > $('.article-column').height();
		if (!isMenuTallerThanBrowser && !isMenuTallerThanArticle) {
			$(window).scroll(function() {
				if ($('.portal-right-menu').offset().top + $('.portal-right-menu').innerHeight() >= $('footer').offset().top) {
					var bottomOffset = $('footer').innerHeight() - ($('#frame-content').innerHeight() - $(window).scrollTop() - $('body').innerHeight()); 
				    if (bottomOffset < 0) {
						bottomOffset = 0;
				    }
				    $('.portal-right-menu').css('bottom', bottomOffset + 'px');
				} else {
					$('.portal-right-menu').css('bottom', 'initial');
				}
			});
		} else {
			$('.portal-right-menu').css("position", "static");
		}
	}

	// HOME SPECIFIC
	if ($('.home').length) {
		$(window).scroll(function() {
            var scrollTop = $(window).scrollTop();
            if (scrollTop > 200) {
                $('#headnav').removeClass('transparent');
            } else {
                $('#headnav').addClass('transparent');
            }
        });
	} 

	if (innerWidth > 991) {
		$(window).scroll(function() {
	        var scrollTop = $(window).scrollTop();
	        if (scrollTop > 300) {
	            $('#headnav').css('border-bottom', '1px #2bb2ad solid');
	        } else {
	            $('#headnav').css('border-bottom', '0px #2bb2ad solid');
	        }
	    });
	} 

	// =============================================
	// Downloads
	// =============================================

	if ($('.gallery-article').length) {

		var openPopin = function(popinId) {
			//disabling scroll yet keeping vertical position
			var verticalBodyPosition = $('body').scrollTop();
			$('#frame-content').css('top', '-'+verticalBodyPosition+'px');

			$('#' + popinId).addClass('active');
			body.addClass('popin-is-open');
			$('.close-btn').off('click');
			$('.close-btn').on('click',function(){
				var verticalBodyPosition = $('#frame-content').offset().top;
				body.removeClass('popin-is-open');
				$('.popin').removeClass('active');
				$('#frame-content').removeAttr('style');
				window.scrollTo(0, -verticalBodyPosition);
			});
		};

		$(".play-in-dss-btn").on("click", function(e) {
			var popinId = $(e.currentTarget).data('popin');
			openPopin(popinId);
		});

		$(".view-in-action-btn").on("click", function(e) {
			var isIE = /(MSIE|Trident\/|Edge\/)/i.test(navigator.userAgent);
			var isMobileDevice = $(window).width() < 992;
			if (isMobileDevice) {
				e.preventDefault();
				openPopin("mobile-popin");
			} else if (isIE) {
				e.preventDefault();
				openPopin("unsupported-browser-popin");
			} else {
 				if (Cookies.get('wasAdvicedToCheckDSSConcepts')) {
					return true;
				} else {
					e.preventDefault();
					var popinId = $(e.currentTarget).data('popin');
					openPopin(popinId);
					Cookies.set('wasAdvicedToCheckDSSConcepts', true);
				}
			}
		});
	}

	// -------------------------------------------
	// Zoomable images
	// -------------------------------------------
 
	$('.zoomable').click(function(e){
		var zoomable = $(this);
		var thumb_src = zoomable.find('img').attr('src');
		
		if(! zoomable.is('.active')){
			zoomable.addClass('active');
			if(zoomable.find('img').attr('data-original')){
				zoomable.find('img').attr('src', zoomable.find('img').attr('data-original'));
			}
			$(window).one('click', function(){
				zoomable.removeClass('active');
				zoomable.find('img').attr('src', thumb_src);
			});
			e.stopPropagation();
		}
	});

})(jQuery);

/*============================================================================
  Social Icon Buttons
==============================================================================*/


$(function() {
  // Share popups
  $('.social-sharing').find('a').on('click', function(e) {
	e.preventDefault();
	var el = $(this),
		popup = el.attr('class').replace('-','_'),
		link = el.attr('href'),
		w = 700,
		h = 400;

	// Set popup sizes
	switch (popup) {
	  case 'share-twitter':
		h = 300;
		break;
	  case 'share-linkedin':
		w = 800;
		h = 600;
		break;
	  case 'share-google':
		w = 500;
		break;
	}

	window.open(link, popup, 'width=' + w + ', height=' + h);
  });
});

