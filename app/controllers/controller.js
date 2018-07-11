define([], function () {
    return class {
		constructor(request) {
			request = request || {};
            let context = {};
			context.request = request || {};
			context.$el = document.getElementById(this.el());
			context.$el.classList.add("loading");
		    this.init(context, (context) => {
                let selected = document.querySelector("nav a.selected");
				if (selected !== null){
					selected.classList.remove('selected');
				}
				while (context.$el.firstChild) {
				    context.$el.removeChild(context.$el.firstChild);
				}
				if (this.template()){
					context.$el.innerHTML = document.getElementById(this.template()).innerHTML;
				}
		    	this.render(context);
		    	context.$el.classList.remove("loading");
		    	context.$el.classList.remove("error");
		    	selected = document.querySelector(`nav a[href="${window.location.hash}"]`);
				if (selected !== null){
					selected.classList.add('selected');
				}
		    });
		}
    	el(){
    		return null;
    	}
    	template(){
    		return null;
    	}
		init(context, renderCallback) {
			renderCallback(context);
		}
		render(context) {
			console.log('Default render callback was invoked', context.data);
		}
	}
});