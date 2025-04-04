const stripStoryPointsAndTaskToken = function (name) {
  return name
    .replace(/^(\s*\(\d+\))?\s*/, "") // story points, e.g. (3)
    .replace(/\s*#\w+\s*$/, ""); // task token, e.g. #orga_5417
};

const extractProjectFromLabels = function (labels) {
  const projectLabels = labels
    .map((label) => label.name.match(/(?<=#)[a-z0-9]+$/)?.[0])
    .filter((prefix) => prefix !== undefined);
  if (projectLabels.length === 0) {
    throw new Error("Card has no valid project labels.");
  }
  if (projectLabels.length > 1) {
    throw new Error("Card has multiple project labels.");
  }
  return projectLabels[0];
};

const extractTaskFromLabels = function (labels) {
  const tasks = labels
    .map((label) => label.name.match(/(?<=!)\w+$/)?.[0])
    .filter((prefix) => prefix !== undefined);
  if (tasks.length === 0) {
    return null;
  }
  if (tasks.length > 1) {
    throw new Error("Card has multiple tasks labels.");
  }
  return tasks[0];
};

export const extractTrackingData = async function (t) {
  const card = await t.card("name", "labels", "idShort", "shortLink");
  const project = extractProjectFromLabels(card.labels);

  return {
    project,
    task:
      extractTaskFromLabels(card.labels) ??
      `${project}_${card.idShort}_${card.shortLink}`,
    description: stripStoryPointsAndTaskToken(card.name),
  };
};

export const extractTokenName = async function (t) {
  const board = await t.board("idOrganization");
  return ["togglToken", board.idOrganization].join("_");
};
