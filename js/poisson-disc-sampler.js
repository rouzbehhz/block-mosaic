/**
 * Mike Bostock's implementation of Jason Davies' implementation of Bridson’s algorithm
 * Released under the GNU General Public License, version 3.
 * https://bl.ocks.org/mbostock/19168c663618b7f07158
 * https://www.jasondavies.com/poisson-disc/
 */
function poissonDiscSampler(width, height, radius) {
	var k = 10,
			radius2 = radius * radius,
			R = 3 * radius2,
			cellSize = radius * Math.SQRT1_2,
			gridWidth = Math.ceil(width / cellSize),
			gridHeight = Math.ceil(height / cellSize),
			grid = new Array(gridWidth * gridHeight),
			queue = [],
			queueSize = 0,
			sampleSize = 0;
	return function() {
		if (!sampleSize) {
			return sample(width / 2, height /2 );
		}
		while (queueSize) {
			var i = Math.random() * queueSize | 0,
					s = queue[i];
			for (var j = 0; j < k; ++j) {
				var a = 2 * Math.PI * Math.random(),
						r = Math.sqrt(Math.random() * R + radius2),
						x = s[0] + r * Math.cos(a),
						y = s[1] + r * Math.sin(a);
				if (0 <= x && x < width && 0 <= y && y < height && far(x, y) ) {
					return sample(x, y);
				}
			}
			queue[i] = queue[--queueSize];
			queue.length = queueSize;
		}
	};
	function far(x, y) {
		var i = x / cellSize | 0,
				j = y / cellSize | 0,
				i0 = Math.max(i - 2, 0),
				j0 = Math.max(j - 2, 0),
				i1 = Math.min(i + 3, gridWidth),
				j1 = Math.min(j + 3, gridHeight);
		for (j = j0; j < j1; ++j) {
			var o = j * gridWidth;
			for (i = i0; i < i1; ++i) {
				if (s = grid[o + i]) {
					var s,
							dx = s[0] - x,
							dy = s[1] - y;
					if (dx * dx + dy * dy < radius2) return false;
				}
			}
		}
		return true;
	}
	function sample(x, y) {
		var s = [x, y];
		queue.push(s);
		grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = s;
		++sampleSize;
		++queueSize;
		return s;
	}
}