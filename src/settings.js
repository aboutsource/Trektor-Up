const t = TrelloPowerUp.iframe();

window.trektorSettings.addEventListener("submit", function (event) {
  event.preventDefault();
  return t.storeSecret("togglToken", window.togglToken.value).then(() => {
    t.closePopup();
  });
});

t.render(function () {
  t.sizeTo(document.body).done();
});
