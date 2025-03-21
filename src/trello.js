import { TogglGateway, TogglService } from "./toggl.js";

const withErrorMessage = async function(t, fnc) {
  try {
    await fnc(t);
  } catch (error) {
    t.alert({ message: error.message });
    throw error;
  }
}

const stripStoryPointsAndTaskToken = function(name) {
  return name
    .replace(/^(\s*\(\d+\))?\s*/, "") // story points, e.g. (3)
    .replace(/\s*#\w+\s*$/, ""); // task token, e.g. #orga_5417
};

const extractTrackingData = async function(t) {
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
  const project = projectLabels[0];

  return {
    project,
    task: `${project}_${card.idShort}_${card.shortLink}`,
    description: stripStoryPointsAndTaskToken(card.name),
  };
}

const setTrackingData = async function(t, tracking) {
  await t.set("card", "shared", "tracking", tracking);
}

const track = async function(t) {
  const token = await t.loadSecret("togglToken");
  if (token === null) {
    throw new Error("Toggl API Token not configured");
  }
  const togglService = new TogglService(new TogglGateway(token));

  const tracking = await extractTrackingData(t);

  await togglService.track(tracking);
  await setTrackingData(t, tracking);
  t.alert({ message: `Started trekking #${tracking.task}` });
};

const updateTracking = async function(t) {
  const tracking = await extractTrackingData(t);
  await setTrackingData(t, tracking);

  t.alert({ message: `Updated trekking #${tracking.task}` });
}

const deleteTracking = async function(t) {
  t.remove("card", "shared", "tracking")

  t.alert({ message: "Deleted trekking" });
};

export default {
  track: async function(t) {
    await withErrorMessage(t, track);
  },
  updateTracking: async function(t) {
    await withErrorMessage(t, updateTracking);
  },
  deleteTracking: async function(t) {
    await withErrorMessage(t, deleteTracking);
  },
};
