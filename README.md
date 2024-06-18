# azure-devops-dashboard

A simple Azure DevOps dashboard to show a collection of pipeline status & history using [Apache ECharts](https://echarts.apache.org/en/index.html).

TODO Screenshot

## Usage

The dashboard works by opening the App via GitHub.io link (`https://akleemans.github.io/azure-devops-dashboard/`) with configuration parameters.

You will need to pass the following parameters:

* `PAT`: A Personal Access Token (see below)
* `organization`: Your DevOps organization (found in URL)
* `project`: Your DevOps project (found in URL)
* `pipelineIds`: A list of pipeline Ids (visible as `definitionId` in URL)

So a complete URL would look like this:

    http://akleemans.github.io/azure-devops-dashboard/?pat=3dsfhjkh&organization=myorg&project=myproject&pipelineIds=16,25,35

### Generating a Personal Access Token

For the dashboard to work, you will need a [Personal Access Tokens](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate).

You can learn how to create one [here](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows#create-a-pat).

You will need to generate one with "Read" permissions on "Build":

TODO Screenshot

### How it works

With the configuration provided, the App will iterate over the provided `pipelineIds` and call the Azure DevOps API with the PAT provided.

You can learn about the Azure DevOps API here: https://learn.microsoft.com/en-us/rest/api/azure/devops/pipelines/runs?view=azure-devops-rest-7.1.

TODO or: https://learn.microsoft.com/en-us/rest/api/azure/devops/build/builds/list?view=azure-devops-rest-7.1

### But isn't sending a PAT via URL parameter insecure?!?

Well... it depends. It has the [same exposure risk as the rest of the HTTP request (like headers or request body)](https://stackoverflow.com/a/66548278) when it is sent unencrypted.
However, it should be secured [in transit when using SSL](https://security.stackexchange.com/a/12533).

That being said, there will be more traces (compared to i.e. POST request), for example [in Browser history or logs on a webserver](https://security.stackexchange.com/a/29605).

So while it generally may not be best practice, it should be okay for certain use cases like here.
If your pipeline runs are super sensitive to you please don't use this project.
