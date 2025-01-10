import { TogglGateway, TogglService } from "./toggl.js";

const stripStoryPointsAndTaskToken = function (name) {
  return name
    .replace(/^(\s*\(\d+\))?\s*/, "") // story points, e.g. (3)
    .replace(/\s*#\w+\s*$/, ""); // task token, e.g. #orga_5417
};

const track = async function (t) {
  const token = await t.loadSecret("togglToken");
  if (token === null) {
    throw new Error("Toggl API Token not configured");
  }

  const togglGateway = new TogglGateway(token);
  const togglService = new TogglService(togglGateway);

  const card = await t.card("name", "labels", "idShort", "shortLink");

  const projectLabels = card.labels
    .map((label) => label.name.match(/(?<=#)[a-z0-9]+$/)?.[0])
    .filter((prefix) => prefix !== undefined);
  if (projectLabels.length === 0) {
    throw new Error("Card has no valid project labels.");
  }
  if (projectLabels.length > 1) {
    throw new Error("Card has multiple project labels.");
  }

  const tracking = {
    project: projectLabels[0],
    task: `${card.idShort}_${card.shortLink}`,
  };

  await togglService.track(tracking, stripStoryPointsAndTaskToken(card.name));

  t.set("card", "shared", "tracking", tracking);
};

export default {
  track: async function (t) {
    try {
      await track(t);
    } catch (error) {
      t.alert({ message: error.message });
      throw error;
    }
  },
};
