export class TogglGateway {
  static ENDPOINT = "https://api.track.toggl.com/api/v9";

  #token;

  constructor(token) {
    this.#token = token;
  }

  getWorkspaces() {
    return this.#request("get", "/workspaces");
  }

  getProjects(workspaceId) {
    return this.#request("get", `/workspaces/${workspaceId}/projects`, {
      params: { active: true, per_page: 200 },
    });
  }

  getTasks(workspaceId, projectId) {
    return this.#request(
      "get",
      `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
    );
  }

  createTask(workspaceId, projectId, name) {
    return this.#request(
      "post",
      `/workspaces/${workspaceId}/projects/${projectId}/tasks`,
      {
        data: { name },
      },
    );
  }

  startTimeEntry(workspaceId, projectId, taskId, description) {
    return this.#request("post", `/workspaces/${workspaceId}/time_entries`, {
      data: {
        description,
        start: new Date().toISOString(),
        duration: -1,
        workspace_id: workspaceId,
        project_id: projectId,
        task_id: taskId,
        created_with: "trektor",
      },
    });
  }

  async #request(method, path, conf = {}) {
    let url = this.constructor.ENDPOINT + path;

    if (conf.params) {
      url += `?${new URLSearchParams(conf.params).toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Basic ${btoa(`${this.#token}:api_token`)}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: conf.data ? JSON.stringify(conf.data) : null,
    });

    if (response.status === 403) {
      throw new Error("Invalid Toggl API Token.");
    } else {
      return response.json();
    }
  }
}

export class TogglService {
  #gateway;

  constructor(gateway) {
    this.#gateway = gateway;
  }

  async addTask(tracking) {
    const workspaceId = await this.#getWorkspaceId();
    const projectId = await this.#getProjectId(workspaceId, tracking.project);

    const togglTasks = await this.#gateway.getTasks(workspaceId, projectId);
    const togglTask =
      togglTasks.find((t) => t.name === tracking.task) ||
      (await this.#gateway.createTask(workspaceId, projectId, tracking.task));

    return togglTask;
  }

  async track(tracking, description) {
    const togglTask = await this.addTask(tracking);

    await this.#gateway.startTimeEntry(
      togglTask.workspace_id,
      togglTask.project_id,
      togglTask.id,
      description,
    );
  }

  async #getWorkspaceId() {
    const workspaces = await this.#gateway.getWorkspaces();

    if (workspaces.length === 0) {
      throw new Error("Could not find any toggl workspaces.");
    }
    if (workspaces.length > 1) {
      throw new Error(
        "Found multiple toggl workspaces. Not sure how to deal with that...",
      );
    }

    return workspaces[0].id;
  }

  async #getProjectId(workspaceId, projectName) {
    const allProjects = await this.#gateway.getProjects(workspaceId);
    const projects = allProjects.filter((project) =>
      project.name.endsWith(`(${projectName})`),
    );

    if (projects.length === 0) {
      throw new Error("Could not find any matching toggl project.");
    }
    if (projects.length > 1) {
      throw new Error(
        "Found multiple matching toggl projects. Not sure how to deal with that...",
      );
    }

    return projects[0].id;
  }
}
