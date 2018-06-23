define(['helpers', 'controllers/controller', 'crypto/sha256'], function (helpers, Controller) {
	return class extends Controller {
		el(){
			return "main";
		}
		template(){
			return "tpl-shared-text";
		}
		init(context, renderCallback){
			if (window.lastSharedStripe && window.lastSharedStripe.key === context.request.key){
				context.data = window.lastSharedStripe;
				renderCallback(context);
			} else {
				var data = [];
				var p;
				data.push("key=" + encodeURIComponent(context.request.key));
				if (context.request.password){
					p = prompt("Password required");
					data.push("password=" + encodeURIComponent(CryptoJS.SHA256("ZEBRA-CLIENT:" + p).toString()));
				}
				var headers = [];
				if (window.appConfig && window.appConfig['require-api-key'] && !window.appConfig['require-api-key-for-post-only']){
					headers.push({
						"name": "X-Api-Key",
						"value": helpers.getXAPIKey()
					});
				}
				helpers.ajax("GET", window.apiURL + "/stripe?" + data.join('&'), {}, headers, (response) => {
					context.data = response;
					if (p){
						var bytes = CryptoJS.AES.decrypt(context.data.data, p);
						context.data.data = bytes.toString(CryptoJS.enc.Utf8)
					}
					renderCallback(context);
				}, helpers.renderErrorCallbackInMain);
			}
		}
		render(context){
			const copyValue = (e) => {
				var elem = document.getElementById(e.target.getAttribute("for"));
				elem.classList.add("copying");
				var newElement = false;
				var input;
				if (elem.tagName.toUpperCase() == 'INPUT'){
					input = elem;
				} else {
					input = document.createElement('textarea');
					input.value = elem.innerHTML;
					input.style.margin = "-10000px 0 0 0";
					elem.appendChild(input);
					newElement = true;
				}
				input.select();
				document.execCommand("copy");
				input.setSelectionRange(0, 0);
				!newElement || elem.removeChild(input);
				setTimeout(function(){
					elem.classList.remove("copying");
				}, 500);
			};
			var ownerKey = localStorage.getItem("OWNER:" + context.data.key);
  			context.$el.querySelector("#shared-text-data").appendChild(document.createTextNode(context.data.data));
  			context.$el.querySelector('label[for="shared-text-data"]').addEventListener("click", copyValue, false);
			context.$el.querySelector("#shared-text-key").value = helpers.formatCode(context.data.key);
  			context.$el.querySelector('label[for="shared-text-key"]').addEventListener("click", copyValue, false);
  			context.$el.querySelector("#shared-text-url").value = window.appConfig.url + "#open/" + context.data.key + (context.data.password ? "/p" : "");
			context.$el.querySelector('label[for="shared-text-url"]').addEventListener("click", copyValue, false);
  			context.$el.querySelector("#shared-text-countdown").setAttribute("data-countdown", context.data.expiration);
			if (ownerKey){
				var $st = context.$el.querySelector('#shared-text-delete');
				$st.querySelector('a').addEventListener("click", (e) => {
					e.preventDefault();
					var countdown = context.$el.querySelector("#shared-text-countdown");
					var data = [];
					data.push("key=" + encodeURIComponent(context.request.key));
					data.push("owner-key=" + encodeURIComponent(ownerKey));
					var headers = [];
					if (window.appConfig && window.appConfig['require-api-key']){
						headers.push({
							"name": "X-Api-Key",
							"value": helpers.getXAPIKey()
						});
					}
					helpers.ajax("DELETE", window.apiURL + "/stripe?" + data.join('&'), {}, headers, (response) => {
						countdown.setAttribute("data-countdown", 0);
						while ($st.firstChild) {
							$st.removeChild($st.firstChild);
						}
						$st.remove();
					});
				}, false);
				$st.style.display = "block";
			}
  			var countdownObj = context.$el.querySelector("#shared-text-countdown");
  			var countdown = helpers.countdownString(context.data.expiration);
			countdownObj.querySelector('span').innerHTML = countdown.clock;
			if (countdown.status == 'warning' && !countdownObj.classList.contains("warning")){
				countdownObj.classList.add("warning");
			} else if (countdown.status == 'gone' && !countdownObj.classList.contains("gone")){
				countdownObj.classList.remove("warning");
				countdownObj.classList.add("gone");
			}
		}
	}
});