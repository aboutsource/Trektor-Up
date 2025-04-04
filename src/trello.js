import { TogglGateway, TogglService } from "./toggl.js";
import { extractTokenName, extractTrackingData } from "./extract.js";

const withErrorMessage = async function (t, fnc) {
  try {
    await fnc(t);
  } catch (error) {
    t.alert({ message: error.message });
    throw error;
  }
};

const setTrackingData = async function (t, tracking) {
  await t.set("card", "shared", "tracking", tracking);
};

const track = async function (t) {
  const token = await t.loadSecret(await extractTokenName(t));
  if (token === null) {
    throw new Error("Toggl API Token not configured");
  }
  const togglService = new TogglService(new TogglGateway(token));

  const tracking = await extractTrackingData(t);

  await togglService.track(tracking);
  await setTrackingData(t, tracking);
  t.alert({ message: `Started trekking #${tracking.task}` });
};

const updateTracking = async function (t) {
  const tracking = await extractTrackingData(t);
  await setTrackingData(t, tracking);

  t.alert({ message: `Updated trekking #${tracking.task}` });
};

const deleteTracking = async function (t) {
  t.remove("card", "shared", "tracking");

  t.alert({ message: "Deleted trekking" });
};

export default {
  track: async function (t) {
    await withErrorMessage(t, track);
  },
  updateTracking: async function (t) {
    await withErrorMessage(t, updateTracking);
  },
  deleteTracking: async function (t) {
    await withErrorMessage(t, deleteTracking);
  },
};
