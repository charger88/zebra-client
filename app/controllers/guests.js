define(['helpers', 'controllers/controller'], function (helpers, Controller) {
	return class extends Controller {
		el(){
			return "main";
		}
		template(){
			return "tpl-guests";
		}
		render(context) {
			if (!(window.appConfig && window.appConfig['require-api-key'] && window.appConfig['guest-one-time-key'])) {
        window.location.hash = "#";
        return null;
      }
			if (!sessionStorage.getItem('x-api-key')){
				if (!confirm("System will ask you for API Key to proceed. If you don't have one press \"Cancel\".")){
					window.location.hash = "#";
					return null;
				}
			}
			context.$el.querySelector('#guests-form').addEventListener("submit", (e) => {
				e.preventDefault();
				helpers.ajax("POST", window.apiURL + "/guest-key", null, [{
          "name": "X-Api-Key",
          "value": helpers.getXAPIKey()
        }], (response) => {
          const $dt = document.createElement('dt');
          const $dd = document.createElement('dd');
          $dt.innerHTML = `G_${response.key}`;
          $dd.innerHTML = (new Date(response.expiration * 1000)).toLocaleString();
          document.getElementById('guests-keys-list').appendChild($dt);
          document.getElementById('guests-keys-list').appendChild($dd);
				}, helpers.renderErrorCallbackInMain);
			}, false);
		}
	}
});