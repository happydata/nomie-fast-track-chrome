module.exports = function() {
	var pub = {};

	pub.listen = function() {
		var inputs = document.querySelectorAll('input[data-save]');
		inputs.forEach((item)=>{
			let key = 'storage.'+item.getAttribute('data-save');
			let value = localStorage.getItem(key);
			if(value) {
				item.value = value;
			}
			item.addEventListener('keyup', (event,change)=>{
				console.log('CHANGE INPUT', event.target.value, event.target.getAttribute('data-save'));
				localStorage.setItem(key, event.target.value);
			})
		});
	}
	return pub;
}();
