define(['controllers/controller'], function (Controller) {
    return class extends Controller {
    	el(){
    		return "main";
    	}
    	template(){
    		return "tpl-index";
    	}
	    render(context){
	    	context.$el.querySelector("#index-instance-name").appendChild(document.createTextNode(window.appConfig.name));
	    }
    }
});