# TrektorUp

A Trello Power-Up to integrate Trello cards into Toggl time tracking.

## Usage

### Configure Toggl API key

To make use of TrektorUp, you first have to configure your personal Toggl API
key. To do so, click on Trello Board Menu (Three dots in the upper right
corner) -> Power-Ups -> Enabled -> Settings (Trektor) -> Edit Power-Up
settings.

### Create tracking task and start tracking

Open a card. The card must have exactly one label starting with `#`, containing
the corresponding Toggl project. The Toggl project have to exist. Look for the
Power-Ups button section on the right side of the card. Click on "Trek now".
Shortly after clicking, there will be a new card label named "Trekking", that
shows the current tracking task. The Toggl task will be created if it does not
exist.

### Re-start existing tracking task

you can also click on the Trekking label within the top section of the Trello
card to start tracking. If there is no Trekking label, you first have to create
the tracking task as shown bevore.

## Hacking

TrektorUp uses Vite/Rollup for development.

    git clone git@github.com:aboutsource/Trektor-Up.git
    cd Trektor-Up
    npm install

### Build the Power-Ip

    npm run build

If build successfully, there is a dist folder containing the Power-Up

### Release a new version

* Update version string in `package.json`
* Push to github
* Tag the repo with new version
* Push tag
* Github-Actions should run the Deploy job

### Hosting and Deployment

TrektorUp is hosted at https://trello.aboutsource.net right now. The deployment
process is managed by Github-Actions. See also
https://developer.atlassian.com/cloud/trello/guides/power-ups/building-a-power-up-part-one/#getting-started
for hosting requirements.

WARNING: The hosting domain has to be manually whitelisted by the Toggl support
team. Otherwise, there are no corresponding CORS headers when accessing the
Toggl API. See also
https://github.com/toggl/toggl_api_docs/blob/master/chapters/cors.md
