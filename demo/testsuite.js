/*
	Require and initialise PhantomCSS module
	Paths are relative to CasperJs directory
*/

var fs = require( 'fs' );
var path = fs.absolute( fs.workingDirectory + '/phantomcss.js' );
var phantomcss = require( path );
require(fs.absolute(fs.workingDirectory + '/libs/jquery'));
var configs = require(fs.absolute(fs.workingDirectory + '/testConfig.json'));

casper.test.begin( 'E6 module', function ( test ) {

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
	});

  var viewportWidth = configs['global']['viewports'][0]['width'];
  var viewportHeight = configs['global']['viewports'][0]['height'];
  /*
   The test scenario
   */
  casper.start( 'http://ci-pdp.sony.co.uk:9000/', function() {
    this.echo('Current location is ' + this.getCurrentUrl(), 'info');
  });

  casper.viewport(viewportWidth, viewportHeight );

  casper.eachThen(configs['tests'], function (response) {

    var testObj = response.data;
    var url = configs['global']['baseUrl'] + testObj['relativeUrl'];
    var waitTime = testObj['waitTime'] || configs['global']['waitTime'];

    casper.echo("Url: " + url);
    casper.echo("waitTime: " + waitTime);
    casper.echo("moduleName: " + testObj['moduleName']);

    casper.thenOpen(url,function(){
      casper.viewport(viewportWidth, casper.getElementsBounds('body')[0]['height']);
      casper.wait(waitTime, function () {
        var documentHeight = casper.getElementsBounds('body')[0]['height'];
        phantomcss.screenshot({
          top: 0,
          left: 0,
          width: viewportWidth,
          height: documentHeight
        }, testObj['moduleName']);
      });
    });
  });

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
