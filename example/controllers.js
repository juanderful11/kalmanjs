var app = angular.module('KalmanApp', ['uiGmapgoogle-maps']);
var rate = 0.02;
var pnoise = 10;
var mnoise = 3;

var gpsrate = 0.1;
var gpsnoise = 0.00005;
var cent = {latitude:40.35, longitude: -74.66}

var maprate = 0.1;
var coordScale = 111300;
var points = 1000;

app.controller('KalmanCtrl', function ($scope, KalmanFilter) {
	$scope.map = {
	  zoom:19,
	  center: {latitude:40.35, longitude: -74.66},
	  options: {
	    zoomControlOptions: {
	      style:google.maps.ZoomControlStyle.SMALL,
	      position:google.maps.ControlPosition.RIGHT_BOTTOM
	    },
	    draggable: false,
	    scrollwheel: false,
	    streetViewControl: false,
	    mapTypeControl: false,
	    panControl: false,
	    disableDoubleClickZoom: true,
	    styles: [{featureType: "poi", stylers: [{visibility: "off"}] }]
	  }
	};

	$scope.angle = 0;
	$scope.speed = 0;
  	$scope.kalman = {latitude:40.35, longitude: -74.66};
	$scope.gps = {latitude:40.35, longitude: -74.66};
	$scope.kalmanError = [];
	$scope.gpsError = [];
	$scope.kalmanAvg = 0;
	$scope.gpsAvg = 0;
	$scope.Math = window.Math;

  	$scope.modelGPS = function() {
    	$scope.gps.latitude = $scope.map.center.latitude + (Math.random()-.5)*gpsnoise;
	    $scope.gps.longitude = $scope.map.center.longitude + (Math.random()-.5)*gpsnoise;
  	}

  	$scope.setLocation = function() {

	    if ($scope.gps.latitude != 0 || $scope.gps.longitude != 0) {
	      	var gPoint = $scope.convertCoordsToMeters($scope.gps);
	      	var kPoint = {x: $scope.kalmanX.update(gPoint.x), y: $scope.kalmanY.update(gPoint.y)}
	      	$scope.kalman = $scope.convertMetersToCoords(kPoint);
	      	var mPoint = $scope.convertCoordsToMeters($scope.map.center);

	      	$scope.kalmanError.push(Math.sqrt(Math.pow(kPoint.x-mPoint.x, 2) + Math.pow(kPoint.y-mPoint.y, 2)));
	      	$scope.gpsError.push(Math.sqrt(Math.pow(gPoint.x-mPoint.x, 2) + Math.pow(gPoint.y-mPoint.y, 2)));
	      	if ($scope.kalmanError.length > points || $scope.gpsError.length > points) {
	      		$scope.kalmanError.splice(0,1);
	      		$scope.gpsError.splice(0,1);
	      	}

		    var canvas = document.querySelector('.error');
		    var canvasCtx = canvas.getContext("2d");
	    	var w = canvas.width;
		    var h = canvas.height;
	   	    canvasCtx.clearRect(0, 0, w, h);
	    	canvasCtx.fillStyle = '#ffffff';
	    	canvasCtx.strokeStyle = '#ff0000';
	    	canvasCtx.lineWidth = 2;
	    	canvasCtx.fillRect(0, 0, w, h);
	      	canvasCtx.beginPath();
	      	$scope.gpsAvg = 0;
	    	for(var i = 0; i < $scope.kalmanError.length; i++) {
	      		canvasCtx.lineTo(i*w/points, h-$scope.gpsError[i]*20);
	      		$scope.gpsAvg += $scope.gpsError[i];
		    }
		    $scope.gpsAvg = Math.round($scope.gpsAvg*100/$scope.gpsError.length)/100;
		    canvasCtx.stroke();
		    canvasCtx.moveTo(0,0);
		    canvasCtx.beginPath();
		    canvasCtx.strokeStyle = '#0000ff';
		    $scope.kalmanAvg = 0;
	    	for(var i = 0; i < $scope.kalmanError.length; i++) {
	      		canvasCtx.lineTo(i*w/points, h-$scope.kalmanError[i]*20);
	      		$scope.kalmanAvg += $scope.kalmanError[i];
		    }
		    $scope.kalmanAvg = Math.round($scope.kalmanAvg*100/$scope.kalmanError.length)/100;
		    canvasCtx.stroke();
		    $scope.$apply();
		}
  	}

  	$scope.convertMetersToCoords = function(point){
	  	var lat = point.x/coordScale + cent.latitude;
	  	var lon = point.y/coordScale/Math.cos(lat-cent.latitude) + cent.longitude;
	  	return {latitude: lat, longitude: lon};
	}

	$scope.convertCoordsToMeters = function(center) {
		var x = (center.latitude - cent.latitude) * coordScale;
	  	var y = (center.longitude - cent.longitude) * coordScale * Math.cos(center.latitude - cent.latitude);
	  	return {x: x, y:y};
	}

	$scope.move = function() {
	    $scope.map.center.latitude += $scope.speed*Math.cos($scope.angle);
	    $scope.map.center.longitude += $scope.speed*Math.sin($scope.angle);
    	$scope.$apply();	
	}

	$scope.kalmanX = new KalmanFilter(rate,pnoise,mnoise);
  	$scope.kalmanY = new KalmanFilter(rate,pnoise,mnoise);
  	window.setInterval($scope.modelGPS, gpsrate*1000);
  	window.setInterval($scope.setLocation, rate*1000);
  	window.setInterval($scope.move, maprate*1000);

	$scope.userCircle = {
	    path: google.maps.SymbolPath.CIRCLE,
	    fillOpacity: 1.0,
	    strokeWeight: 0,
	    fillColor:'#0000FF',
	    scale: 7
	};
	$scope.gpsCircle = {
	    path: google.maps.SymbolPath.CIRCLE,
	    fillOpacity: 1.0,
	    strokeWeight: 0,
	    fillColor:'#FF0000',
	    scale: 5
	};
	$scope.kalmanCircle = {
	    path: google.maps.SymbolPath.CIRCLE,
	    fillOpacity: 1.0,
	    strokeWeight: 0,
	    fillColor:'#000000',
	    scale: 5
	};


  	$scope.keyPressed = function(keyEvent) {
      if (keyEvent.which==87) {
        $scope.speed = 0.0000007/maprate;
      } else if (keyEvent.which==83) {
       	$scope.speed = 0;
      } else if (keyEvent.which==65) {
        $scope.angle -= Math.PI/12;
      } else if (keyEvent.which==68) {
        $scope.angle += Math.PI/12;
      }
  	}
});


app.factory('KalmanFilter', function() {
  var KalmanFilter = function (rate, pnoise, mnoise) {
    // state transition matrix
    this.F = math.matrix([[1, rate], [0,1]]);
    // input control matrix
    this.G = math.matrix([[math.square(rate)/2],[rate]]);
    // measurement model
    this.H = math.matrix([1, 0]);
    // process noise
    this.Q = math.multiply(math.multiply(this.G, math.transpose(this.G)), pnoise);
    // measurement noise
    this.R = mnoise;
    // covariance matrix
    this.P = this.Q;

    this.update = function(m) {
      if (!this.X) {
        this.X =  math.matrix([[m],[0]]);
      }
      // prediction: X = F * X  |  P = F * P * F' + Q
      this.X = math.multiply(this.F, this.X);
      this.P = math.add(math.multiply(math.multiply(this.F,this.P), math.transpose(this.F)), this.Q); 
      // kalman multiplier: K = P * H' * (H * P * H' + R)^-1
      var K = math.multiply(math.multiply(this.P, math.transpose(this.H)), math.inv(math.add(math.multiply(math.multiply(this.H, this.P), math.transpose(this.H)), this.R)));
      // correction: X = X + K * (m - H * X)  |  P = (I - K * H) * P
      this.X = math.add(this.X, math.multiply(K, math.subtract(m, math.multiply(this.H,this.X))));
      this.P = math.multiply(math.subtract(math.eye(2), math.multiply(K, this.H)), this.P);
    
      return this.X._data[0];
    }
  }

  return KalmanFilter;
});