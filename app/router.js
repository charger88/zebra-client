define([
  "controllers/index",
  "controllers/open-form",
  "controllers/share-form",
  "controllers/guests",
  "controllers/shared-text"
], function (
  Index,
  OpenForm,
  ShareForm,
  Guests,
  SharedText
) {
  return () => {
    const route = window.location.hash.split('/');
    if (route[0] === "#share") {
      return new ShareForm();
    } else if (route[0] === "#guests") {
      return new Guests();
    } else if (route[0] === "#open") {
      if (route[1]) {
        return new SharedText({
          "key": route[1],
          "password": route[2] === "p"
        });
      } else {
        return new OpenForm();
      }
    } else {
      return new Index();
    }
  };
});