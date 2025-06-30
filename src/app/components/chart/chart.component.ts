import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; 
import Chart from 'chart.js/auto'; 
interface QuarterHourEntry {
  timestampStart: string;
  timestampEnd: string;
  value: number;
}

interface RawJsonData {
  [hourlyTimestamp: string]: QuarterHourEntry[];
}

interface HourlyData {
  time: string;
  averageValue: number;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, DecimalPipe], 
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css'
})
export class ChartComponent implements OnInit, AfterViewInit {
  @ViewChild('myChart') myChart!: ElementRef<HTMLCanvasElement>;
  chart: any; 
  
  hourlyData: HourlyData[] = []; 
  

  constructor() { }

  ngOnInit(): void {
    
    this.loadDataAndProcess();
  }

  ngAfterViewInit(): void {
    
  }


  private async loadDataAndProcess(): Promise<void> {
    try {
      const response = await fetch('/assets/podaci.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawJsonData: RawJsonData = await response.json();
      this.hourlyData = this.processDataToHourlyAverage(rawJsonData);
      this.createChart(); 
    } catch (error) {
      console.error('Error loading or processing data:', error);
      this.hourlyData = []; 
    }
  }

  
  private processDataToHourlyAverage(rawData: RawJsonData): HourlyData[] {
    const hourlyProcessedDataMap = new Map<string, { sum: number, count: number }>();

    for (const hourlyTimestampKey in rawData) {
      if (Object.prototype.hasOwnProperty.call(rawData, hourlyTimestampKey)) {
        const quarterHourEntries = rawData[hourlyTimestampKey];

        quarterHourEntries.forEach(entry => {
          const date = new Date(hourlyTimestampKey);
          const formattedHourKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:00`;

          if (!hourlyProcessedDataMap.has(formattedHourKey)) {
            hourlyProcessedDataMap.set(formattedHourKey, { sum: 0, count: 0 });
          }
          const current = hourlyProcessedDataMap.get(formattedHourKey)!;
          current.sum += entry.value;
          current.count++;
        });
      }
    }

    const processedData: HourlyData[] = [];
    hourlyProcessedDataMap.forEach((data, key) => {
      processedData.push({
        time: key,
        averageValue: data.sum / data.count 
      });
    });

    processedData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return processedData;
  }

 
  private createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    
    if (!this.myChart || !this.hourlyData || this.hourlyData.length === 0) {
      console.warn('Cannot create chart: No data or canvas element not ready.');
      return;
    }

    const labels = this.hourlyData.map(data => data.time);
    const values = this.hourlyData.map(data => data.averageValue);

    const ctx = this.myChart.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'bar', 
        data: {
          labels: labels,
          datasets: [{
            label: 'Hourly Average Value',
            data: values,
            backgroundColor: 'rgba(75, 192, 192, 0.6)', 
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1 
          }]
        },
        options: {
          responsive: true, 
          maintainAspectRatio: false, 
          scales: {
            x: {
              title: {
                display: true,
                text: 'Time (Hourly)'
              }
            },
            y: {
              beginAtZero: true, 
              title: {
                display: true,
                text: 'Average Value'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Hourly Average Data Overview' // Chart title
            },
            tooltip: {
              callbacks: {
                title: function(context) {
                  return `Time: ${context[0].label}`;
                },
                label: function(context) {
                  return `Average Value: ${context.parsed.y.toFixed(2)}`; 
                }
              }
            }
          }
        }
      });
    }
  }
}