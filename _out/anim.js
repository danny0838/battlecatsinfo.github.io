if (window.OffscreenCanvas == undefined || window.OffscreenCanvas.prototype.convertToBlob == undefined) {
	window.OffscreenCanvas = class OffscreenCanvas {
		constructor(width, height) {
			this.canvas = document.createElement('canvas');
			this.canvas.width = width;
			this.canvas.height = height;
			this.width = width;
			this.height = height;
		}
		getContext(c) {
			return this.canvas.getContext(c);
		}
		convertToBlob(type, Q) {
			const self = this;
			return new Promise(resolve => {
				self.canvas.toBlob(resolve, type, Q);
			});
		}
	}
}
const eggs={"656":[0,1],"658":[0,2],"659":[0,7],"663":[0,4],"664":[0,3],"665":[0,9],"669":[0,9],"670":[0,2],"675":[0,7],"676":[0,6],"685":[0,1],"691":[0,10],"697":[0,8],"700":[0,1],"706":[0,7],"707":[0,9],"713":[0,8],"716":[0,1],"717":[0,6],"720":[0,9],"724":[0,1],"730":[0,2],"757":[0,8],"765":[0,2]};
