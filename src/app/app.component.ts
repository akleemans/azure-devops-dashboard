import {Component} from '@angular/core';
import {ActivatedRoute, RouterOutlet} from '@angular/router';
import {TileComponent} from "./tile/tile.component";
import {HttpClient} from "@angular/common/http";
import {NgForOf, NgIf} from "@angular/common";
import {intervalToDuration, parseJSON, setISODay} from "date-fns";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

export class TileConfig {
  public constructor(
    public name: string,
    public result: RunResult,
    public runtime: string,
    public history: HistoryEntry[]
  ) {
  }
}

export interface HistoryEntry {
  result: RunResult,
  runtime: string,
  runtimeMin: number;
}

export type RunResult = 'succeeded' | 'failed' | 'canceled';
export type RunState = 'completed' | 'inProgress';

export interface BuildDto {
  definition: {
    id: number
    name: string
  },
  status: RunState,
  result: RunResult,
  finishTime: string,
  startTime: string,
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TileComponent, NgIf, NgForOf, MatProgressSpinner],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  public isLoading = true;
  public tileConfigs: TileConfig[] = [];
  public refreshIntervalMs = 5 * 60 * 1000;

  private PAT = '';
  private organization = '';
  private project = '';
  private pipelineIds: number[] = [];
  private branchName = 'refs/heads/main';

  public constructor(
    private readonly httpClient: HttpClient,
    private readonly activatedRoute: ActivatedRoute,
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      if (!params['pat'] || !params['organization'] || !params['project'] || !params['pipelineIds']) {
        this.isLoading = false;
      } else {
        this.PAT = params['pat'];
        this.organization = params['organization'];
        this.project = params['project'];
        this.pipelineIds = params['pipelineIds'].split(',');
        setInterval(() => this.loadData(), this.refreshIntervalMs);
        this.loadData();
      }
    });
  }

  public loadData(): void {
    console.log('Fetching data...');
    this.isLoading = true;
    this.tileConfigs = [];

    const pat = ':' + this.PAT
    const headers = {'Authorization': 'Basic ' + btoa(pat)};
    for (const pipelineId of this.pipelineIds) {
      // Old URL: `https://dev.azure.com/${this.organization}/${this.project}/_apis/pipelines/${pipelineId}/runs?api-version=7.1-preview.1`;
      const url = `https://dev.azure.com/${this.organization}/${this.project}/_apis/build/builds?api-version=7.1-preview.7&definitions=${pipelineId}&branchName=${this.branchName}&statusFilter=completed`;
      this.httpClient.get(url, {headers}).subscribe((response: any) => {
        const tileConfig = this.mapPipelineRuns(response.value as BuildDto[]);
        this.tileConfigs.push(tileConfig);

        if (this.tileConfigs.length === this.pipelineIds.length) {
          this.tileConfigs.sort((a, b) => {
            if (a.result !== b.result) {
              return (a.result ?? '').localeCompare(b.result ?? '');
            }
            return a.name.localeCompare(b.name);
          });
          this.isLoading = false;
        }
      });
    }
  }

  private mapPipelineRuns(runs: BuildDto[]): TileConfig {
    const entries: HistoryEntry[] = [];
    for (const run of runs) {
      if (entries.length >= 10) {
        break
      }
      const start = parseJSON(run.startTime);
      const end = parseJSON(run.finishTime ?? run.startTime);
      const duration = intervalToDuration({start, end})
      let runtime = '';
      for (let part of ['hours', 'minutes', 'seconds']) {
        // @ts-ignore
        const value = duration[part];
        if (value > 0) {
          runtime += ` ${value}${part[0]}`;
        }
      }
      let result = run.result;

      // @ts-ignore
      let runtimeMin: number = duration['minutes'] + Math.random() * 60;
      // @ts-ignore
      if (duration['hours'] > 0) {
        // Simplify to 1 hour max.
        runtimeMin = 60;
      }
      entries.push({result, runtime, runtimeMin})
    }

    return new TileConfig(runs[0].definition.name, entries[0].result, entries[0].runtime, entries);
  }
}
