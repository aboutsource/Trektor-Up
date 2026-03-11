export class TogglGateway {
  static ENDPOINT = "https://api.track.toggl.com/api/v9";

  #token;

  constructor(token) {
    this.#token = token;
  }

  getWorkspaces() {
    return this.#request("get", "/workspaces");
  }

  getProjects(workspace) {
    return this.#request("get", `/workspaces/${workspace.id}/projects`, {
      params: { active: true, per_page: 200 },
    });
  }

  getTasks(project) {
    return this.#request(
      "get",
      `/workspaces/${project.workspace_id}/projects/${project.id}/tasks`,
    );
  }

  createTask(project, name) {
    return this.#request(
      "post",
      `/workspaces/${project.workspace_id}/projects/${project.id}/tasks`,
      {
        data: { name },
      },
    );
  }

  startTimeEntry(project, task, description) {
    return this.#request(
      "post",
      `/workspaces/${task.workspace_id}/time_entries`,
      {
        data: {
          description,
          start: new Date().toISOString(),
          duration: -1,
          workspace_id: project.workspace_id,
          project_id: project.id,
          task_id: task.id,
          billable: project.billable,
          created_with: "trektor",
        },
      },
    );
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

  async track(tracking) {
    const workspace = await this.#getWorkspace();
    const project = await this.#getProject(workspace, tracking.project);
    const task = await this.#getOrCreateTask(project, tracking.task);

    await this.#gateway.startTimeEntry(project, task, tracking.description);
  }

  async #getWorkspace() {
    const workspaces = await this.#gateway.getWorkspaces();

    if (workspaces.length === 0) {
      throw new Error("Could not find any toggl workspaces.");
    }
    if (workspaces.length > 1) {
      throw new Error(
        "Found multiple toggl workspaces. Not sure how to deal with that...",
      );
    }

    return workspaces[0];
  }

  async #getProject(workspace, projectName) {
    const allProjects = await this.#gateway.getProjects(workspace);
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

    return projects[0];
  }

  async #getOrCreateTask(project, name) {
    const tasks = await this.#gateway.getTasks(project);
    return (
      tasks.find((t) => t.name == name) ||
      (await this.#gateway.createTask(project, name))
    );
  }
}
