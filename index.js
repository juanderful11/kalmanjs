var m = require('mathjs');

/**
 * Kalman Filter constructor
 * The filter is modeled after typical object 2D linear movement
 * @param {float} rate  		-> system sampling rate
 *		  {float} acceleration 	-> system disturbance acceleration
 *		  {float} pnoise		-> process noise
 *		  {float} mnoise 		-> measurement noise	
 */

function KalmanFilter(rate, acceleration, pnoise, mnoise) {
	// state transition matrix
	this.F = m.matrix([1, 0, rate, 0], [0, 1, 0, rate], [0, 0, 1, 0], [0, 0, 0, 1]);
	// input control matrix
	this.G = m.matrix(m.square(rate)/2, 0, 0, 0], [0, m.square(rate)/2, 0, 0], [0, 0, rate, 0], [0, 0, 0, rate]);
	// control vector 
	this.C = m.multiply(m.matrix([1],[1],[1],[1]), acceleration);
	// measurement model
	this.H = m.matrix([1, 0, 1, 0], [0, 1, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0]);
	// process noise
	this.Q = m.multiply(m.multiply(this.g, m.transpose(this.g)), pnoise);
	// measurement noise
	this.R = m.multiply(m.eye(4), mnoise);
	// covariance matrix
	this.P = this.Q;
}


/**
 * Update Kalman Filter coordinates and get filtered response
 * Could work with any dimension if all state matrices are also properly resized
 * @param {Array<float>} coord  	-> input coordinate to be filtered
 * @return {Array<float>}
 */
// Get next filtered position based on coord array [x,y]
// Could work with any dimension if all state matrices are also properly resized 
function KalmanFilter.prototype.update = function(coord) {
	if (!this.X) {
		this.X = coord;
	}
	// check that coord is right dimensions using this.dim
	var M = m.concat(coord, m.subtract(coord, this.X));

	// prediction: X = F * X + G * C  |  P = F * P * G' + Np
	this.X = m.add(m.multiply(this.F, this.X), m.multiply(this.G, this.C));
	this.P = m.add(m.multiply(m.multiply(this.F,this.P), m.transpose(this.F)), this.Q); 

	// kalman multiplier: K = P * H' * (H * P * H' + Nm)^-1
	var K = m.multiply(m.multiply(this.P, m.transpose(this.H)), m.inverse(m.add(m.multiply(m.multiply(this.H, this.P), m.transpose(this.H)), this.R)));
	
	// correction: X = X + K * (M - H * X)  |  P = (I - K * H) * P
	this.X = m.add(this.X, m.multiply(this.K, m.subtract(M, m.multiply(this.H,this.X))));
	this.P = m.multiply(m.subtract(m.eye(m.size(this.F)[0]), m.multiply(this.K, this.H)), this.P);

	return this.X;
}

module.exports = KalmanFilter;
