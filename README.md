kalmanjs
===========
kalman.js is a simple Kalman Filter library that allows you to apply the popular filter on any set of data.

### Usage
To use the Kalman Filter, you simply create a new object:

  	var filter = new KalmanFilter(0.2,0.8,0.1,0.1);
And then you can proceed to input measurements to get the filtered result:
	
  	var coords = filter.update([latitude, longitude]);

### Download
To download using npm simply use the command:

  	npm install kalmanjs
  	