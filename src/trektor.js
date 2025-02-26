import trelloCallbacks from "./trello.js";

TrelloPowerUp.initialize({
  "card-buttons": function () {
    return [
      {
        icon: "./tractor-solid.svg",
        text: "Trek now",
        callback: trelloCallbacks.track,
      },
    ];
  },
  "card-badges": function (t) {
    return t
      .get("card", "shared", "tracking")
      .then((tracking) =>
        tracking === undefined
          ? []
          : [{ icon: "./tractor-solid.svg", text: `#${tracking.task}` }],
      );
  },
  "card-detail-badges": function (t) {
    return t.get("card", "shared", "tracking").then((tracking) =>
      tracking === undefined
        ? []
        : [
            {
              title: "Trekking",
              text: `#${tracking.task}`,
              callback: trelloCallbacks.track,
            },
          ],
    );
  },
  "show-settings": function (t) {
    return t.popup({
      title: "Trektor Settings",
      url: "./settings.html",
      height: 200,
    });
  },
});
