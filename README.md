kalmanjs
===========
kalman.js is a simple Kalman Filter library that allows you to apply the popular filter on any set of data.

### Usage
To use the Kalman Filter, you simply create a new object:

  	var filter = new KalmanFilter(0.02,3,10);
And then you can proceed to input measurements to get the filtered result:
	
  	var filteredX = filter.update(x);

### Download
To download using npm simply use the command:

  	npm install kalmanjs
  	

### Example
We have added an example that uses google maps and angular to simulate using a kalman filter on gps signals