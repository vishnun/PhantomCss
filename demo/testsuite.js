/*
	Require and initialise PhantomCSS module
	Paths are relative to CasperJs directory
*/

var fs = require( 'fs' );
var path = fs.absolute( fs.workingDirectory + '/phantomcss.js' );
var phantomcss = require( path );
require(fs.absolute(fs.workingDirectory + '/libs/jquery'));

//var casper = require('casper').create({
//  clientScripts:  [
//    'includes/jquery.js',      // These two scripts will be injected in remote
//    'includes/underscore.js'   // DOM on every request
//  ],
//  pageSettings: {
//    loadImages:  true,        // The WebPage instance used by Casper will
//    loadPlugins: true         // use these settings
//  },
//  logLevel: "info",              // Only "info" level messages will be logged
//  verbose: true                  // log messages will be printed out to the console
//});

casper.test.begin( 'Coffee machine visual tests', function ( test ) {

	phantomcss.init( {
		rebase: casper.cli.get( "rebase" ),
		// SlimerJS needs explicit knowledge of this Casper, and lots of absolute paths
		casper: casper,
		libraryRoot: fs.absolute( fs.workingDirectory + '' ),
		screenshotRoot: fs.absolute( fs.workingDirectory + '/screenshots' ),
		failedComparisonsRoot: fs.absolute( fs.workingDirectory + '/demo/failures' ),
		addLabelToFailedImage: false,
		/*
		screenshotRoot: '/screenshots',
		failedComparisonsRoot: '/failures'
		casper: specific_instance_of_casper,
		libraryRoot: '/phantomcss',
		fileNameGetter: function overide_file_naming(){},
		onPass: function passCallback(){},
		onFail: function failCallback(){},
		onTimeout: function timeoutCallback(){},
		onComplete: function completeCallback(){},
		hideElements: '#thing.selector',
		addLabelToFailedImage: true,
		outputSettings: {
			errorColor: {
				red: 255,
				green: 255,
				blue: 0
			},
			errorType: 'movement',
			transparency: 0.3
		}*/
	} );

	casper.on( 'remote.message', function ( msg ) {
		this.echo( msg );
	} );

	casper.on( 'error', function ( err ) {
		this.die( "PhantomJS has errored: " + err );
	} );

	casper.on( 'resource.error', function ( err ) {
		casper.log( 'Resource load error: ' + err, 'warning' );
	} );
	/*
		The test scenario
	*/
	casper.start( 'http://ci-pdp.sony.co.uk:9000/captions_demo_page', function() {
    this.echo('Current location is ' + this.getCurrentUrl(), 'info');
  });

  //casper.start( 'http://ci-pdp.sony.co.uk:9000/electronics/module-demos/module_demo_e1', function() {
  //  this.echo('Current location is ' + this.getCurrentUrl(), 'info');
  //});

  var viewportWidth = 1200;
  var viewportHeight = 1024;
  casper.viewport(viewportWidth, viewportHeight );
  //
  var documentHeight;
  //
  //var scrollPage = function () {
  //  this.wait(2000, function() {
  //    this.echo("I've waited for 2 seconds.");
  //
  //    var currentScrollY = window.scrollY + window.innerHeight;
  //
  //    (currentScrollY >= document.documentElement.scrollHeight);
  //
  //
  //  });
  //};

	casper.then( function () {

    this.echo("Scroll started");


    documentHeight = casper.getElementsBounds('body')[0]['height'];
    var scrollY = viewportHeight;
    while(scrollY < documentHeight){
      casper.wait(1000, function(){
        casper.scrollTo(0, scrollY);
      });
      scrollY = scrollY + 300;
      documentHeight = casper.getElementsBounds('html')[0]['height'];
    }

    this.echo("Scroll finished");


    //casper.evaluate(function() {
    //  $.each($('.iq-img'), function( index, imgEl ) {
    //    var src = $(imgEl).data('src-desktop');
    //    $(imgEl).css('background-image', "url(" + src + ")");
    //  });
    //
    //  $.each($('.image-module'), function( index, imgEl ) {
    //    var src = $(imgEl).data('src-desktop');
    //    $(imgEl).css('background-image', "url(" + src + ")");
    //  });
    //
    //});

    casper.waitFor(function() {
      return this.evaluate(function() {
        $.each($('.iq-img'), function( index, imgEl ) {
          var src = $(imgEl).data('src-desktop');
          $(imgEl).css('background-image', "url(" + src + ")");
        });
        //
        //$.each($('.image-module'), function( index, imgEl ) {
        //  var src = $(imgEl).data('src-desktop');
        //  $(imgEl).css('background-image', "url(" + src + ")");
        //});
        return true;
      });
    }, function(){
      casper.wait(20000, function() {
        documentHeight = casper.getElementsBounds('body')[0]['height'];
        phantomcss.screenshot({
          top: 0,
          left: 0,
          width: viewportWidth,
          height: documentHeight
        }, 'module');
      });
    });

    //casper.wait(5000, function(){
      //casper.capture('screenshots/' + 'body' + '/' + 'viewport.name' + '-' + 'viewport.viewport.width' + 'x' + 'viewport.viewport.height' + '.png', {
      //  top: 0,
      //  left: 0,
      //  width: viewportWidth,
      //  height: documentHeight
      //});
    //});
	} );

	// casper.then( function () {
	// 	casper.click( '#coffee-machine-button' );

	// 	// wait for modal to fade-in 
	// 	casper.waitForSelector( '#myModal:not([style*="display: none"])',
	// 		function success() {
	// 			phantomcss.screenshot( '#myModal', 'coffee machine dialog' );
	// 		},
	// 		function timeout() {
	// 			casper.test.fail( 'Should see coffee machine' );
	// 		}
	// 	);
	// } );

	// casper.then( function () {
	// 	casper.click( '#cappuccino-button' );
	// 	phantomcss.screenshot( '#myModal', 'cappuccino success' );
	// } );

	// casper.then( function () {
	// 	casper.click( '#close' );

	// 	// wait for modal to fade-out
	// 	casper.waitForSelector( '#myModal[style*="display: none"]',
	// 		function success() {
	// 			phantomcss.screenshot( {
	// 				'Coffee machine close success': {
	// 					selector: '#coffee-machine-wrapper',
	// 					ignore: '.selector'
	// 				},
	// 				'Coffee machine button success': '#coffee-machine-button'
	// 			} );
	// 		},
	// 		function timeout() {
	// 			casper.test.fail( 'Should be able to walk away from the coffee machine' );
	// 		}
	// 	);
	// } );

	casper.then( function now_check_the_screenshots() {
		// compare screenshots
		phantomcss.compareAll();
	} );

	/*
	Casper runs tests
	*/
	casper.run( function () {
		console.log( '\nTHE END.' );
		// phantomcss.getExitStatus() // pass or fail?
		casper.test.done();
	} );
} );
