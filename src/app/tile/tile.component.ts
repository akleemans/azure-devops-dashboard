import {Component, Input, OnChanges} from '@angular/core';
import { MatCardModule} from "@angular/material/card";
import {TileConfig} from "../app.component";
import {NgClass, NgIf} from "@angular/common";
import {NgxEchartsDirective, provideEcharts} from "ngx-echarts";
import {EChartsOption} from "echarts";

@Component({
  selector: 'app-tile',

  templateUrl: './tile.component.html',
  styleUrl: './tile.component.scss',
  standalone: true,
  imports: [
    MatCardModule,
    NgIf,
    NgClass,
    NgxEchartsDirective,
  ],
  providers: [
    provideEcharts(),
  ]
})
export class TileComponent implements OnChanges {
  @Input({required: true})
  public tileConfig!: TileConfig;


  public chartOption: EChartsOption = {
    dataset: {
      source: [
        ['score', 'runtime', 'runId'],
        [0, 20, '1'],
        [1, 23, '2'],
        [0, 18, '3'],
        [1, 25, '4'],
        [0, 24, '5'],
      ]
    },
    tooltip: {
      show: false
    },
    xAxis: {
      type: 'category',
      show: false,
      axisPointer: {
        show: false
      }
    },
    yAxis: {
      show: false,
    },
    visualMap: {
      show: false,
      min: 0,
      max: 1,
      dimension: 0,
      inRange: {
        color: ['#65B581', '#FD665F']
      }
    },
    series: [
      {
        type: 'bar',
        encode: {
          x: 'runId',
          y: 'runtime'
        }
      }
    ]
  };

  public ngOnChanges(): void {
    if (this.tileConfig) {
      const bars: any[] = [['score', 'runtime', 'runId']];
      for (const entry of this.tileConfig.history.reverse()) {
        const result = entry.result === 'succeeded' ? 0 : 1;
        bars.push([result, entry.runtimeMin, bars.length])
      }
      while (bars.length < 11) {
        bars.splice(1, 0, [0, 0, bars.length]);
        // bars.unshift();
      }
      console.log('setting', bars, 'for', this.tileConfig.name);
      // @ts-ignore
      this.chartOption.dataset.source = bars;
    }
  }
}
