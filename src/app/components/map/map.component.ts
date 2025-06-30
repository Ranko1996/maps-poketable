import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import Style from 'ol/style/Style';
import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { defaults as defaultControls } from 'ol/control';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  map!: Map;
  private vectorLayer!: VectorLayer<VectorSource>;

  @Input() centerCoordinates: { E: number; N: number } | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initMap();
    if (this.centerCoordinates) {
      this.centerMapOnCoordinates(this.centerCoordinates.E, this.centerCoordinates.N);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['centerCoordinates'] && changes['centerCoordinates'].currentValue) {
      const coords = changes['centerCoordinates'].currentValue;
      if (this.map) {
        this.centerMapOnCoordinates(coords.E, coords.N);
      }
    }
  }

  private initMap(): void {
    this.map = new Map({
      target: this.mapContainer.nativeElement,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([16.0076573, 45.8044250]),
        zoom: 12
      }),
      controls: defaultControls({
        zoom: false,
        rotate: false,
        attribution: false
      }).extend([])
    });

    this.vectorLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.6)'
          }),
          stroke: new Stroke({
            color: 'red',
            width: 2
          })
        })
      })
    });

    this.map.addLayer(this.vectorLayer);
  }

  private centerMapOnCoordinates(E: number, N: number): void {
    const coords = fromLonLat([E, N]);
    this.map.getView().animate({
      center: coords,
      duration: 1000,
      zoom: 16
    });

    this.vectorLayer.getSource()?.clear();
    this.addMarker(E, N);
  }

  private addMarker(E: number, N: number): void {
    const coords = fromLonLat([E, N]);
    const marker = new Feature({
      geometry: new Point(coords)
    });
    this.vectorLayer.getSource()?.addFeature(marker);
  }
}