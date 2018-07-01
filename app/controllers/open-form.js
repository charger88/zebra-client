define(["helpers", "controllers/controller"], function (helpers, Controller) {
	return class extends Controller {
		el(){
			return "main";
		}
		template(){
			return "tpl-open-form";
		}
		render(context){
			context.$el.querySelector("#open-form").addEventListener("submit", (e) => {
				e.preventDefault();
				let key = helpers.deFormatCode(e.target.querySelector('input[name="key"]').value);
				let password = ""
				let passwordInput = e.target.querySelector('input[name="password"]');
				if (passwordInput){
					password = passwordInput.value;
					if (password.length > 0) {
						window.ofsKey = key;
						window.ofsPassword = password;
					}
				}
				let encryptionPasswordInput = e.target.querySelector('input[name="encryption-password"]');
				if (encryptionPasswordInput){
					let encryptionPassword = e.target.querySelector('input[name="encryption-password"]').value;
					if (encryptionPassword.length > 0) {
						window.ofsKey = key;
						window.ofsEncryptionPassword = encryptionPassword;
					}
				}
				window.location.hash = "#open/" + key + (password.length > 0 ? "/p" : "");
			}, false);
			const passwordPolicy = window.appConfig["password-policy"];
			if (passwordPolicy === "disabled"){
				var obj = context.$el.querySelector("#open-form-password-wrapper");
				while (obj.firstChild) {
					obj.removeChild(obj.firstChild);
				}
				obj.remove();
			} else if (passwordPolicy === "required"){
				context.$el.querySelector("#open-form-password").setAttribute("required", "required");
				context.$el.querySelector("#open-form-password-optional").style.display = "none";
			}
			const encryptionPasswordPolicy = window.appConfig["encryption-password-policy"];
			if (encryptionPasswordPolicy === "disabled"){
				var obj = context.$el.querySelector("#open-form-encryption-password-wrapper");
				while (obj.firstChild) {
					obj.removeChild(obj.firstChild);
				}
				obj.remove();
			} else if (encryptionPasswordPolicy === "required"){
				context.$el.querySelector("#open-form-encryption-password").setAttribute("required", "required");
				context.$el.querySelector("#open-form-encryption-password-optional").style.display = "none";
			}
		}
	}
});