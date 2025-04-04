import { extractTokenName } from "./extract.js";

const t = TrelloPowerUp.iframe();

window.trektorSettings.addEventListener("submit", (event) => {
  event.preventDefault();

  return extractTokenName(t).then((tokenName) => {
    t.storeSecret(tokenName, window.togglToken.value).then(() => {
      t.closePopup();
    });
  });
});

t.render(() => {
  t.sizeTo(document.body).done();
});
