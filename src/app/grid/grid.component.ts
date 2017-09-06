import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DebugService } from './../_services/debug.service';
import { Feature } from '../feature';
import { GridSection } from './../_models/grid-section';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {
  public rows: any;
  public columns: any;
  public hideGuide: boolean = false;
  public mouseIsDown: boolean = false;

  constructor(
    private debug: DebugService,
    private sanitizer: DomSanitizer,
    public feature: Feature
  ) { }

  ngOnInit() {
    // subscribe to the buildGrid event
    this.feature.onBuildGrid.subscribe( result => {
      this.debug.log('grid-component', 'building the grid');
      this.updateGrid();
    });

    // subscribe to the applyAll event
    this.feature.onApplyAll.subscribe( result => {
      this.debug.log('grid-component', 'applying all');
      this.updateGrid(true);
    });

    // subscribe to the toggleGrid event
    this.feature.onToggleGuide.subscribe( result => {
      this.debug.log('grid-component', 'toggling grid');
      this.toggleGrid();
    });
  }

  updateGrid(applyAll: boolean = false) {
    this.rows = new Array(Math.ceil(this.feature.length / 12 / 2));
    this.columns = new Array(Math.ceil(this.feature.width / 12 / 2));
    // new design
    if(typeof this.feature.gridData == 'undefined') {
      this.feature.gridData = [];
      this.debug.log('grid-component', 'gridData is undefined');
      for(var r: number = 0; r < this.rows.length; r++) {
        this.feature.gridData[r] = [];
        for(var c: number = 0; c < this.columns.length; c++) {
          this.feature.gridData[r][c] = new GridSection(r, c);
        }
      }
    }else{
      // Loaded design or design with gridData already set.
      for(var r: number = 0; r < this.rows.length; r++) {
        if(typeof this.feature.gridData[r] == 'undefined') {
          // create new row
          this.feature.gridData[r] = [];
        }
        for(var c: number = 0; c < this.columns.length; c++) {
          if(applyAll) {
            // de-select any tools just in case
            this.feature.selectedTool = '';
            this.setFlag(r, c);
            // this.updateTile(r, c);
            this.removeFlag(r, c);
          }else{
            if(typeof this.feature.gridData[r][c] ==  'undefined') {
              // create a new record for the column
              this.debug.log('grid-component', 'the row does not exist. create a new one.');
              this.feature.gridData[r][c] = new GridSection(r, c);
            }else{
              this.feature.gridData[r][c] = new GridSection(
                r,
                c,
                this.feature.gridData[r][c]['backgroundImage'],
                this.feature.gridData[r][c]['rotation'],
                this.feature.gridData[r][c]['material'],
                this.feature.gridData[r][c]['tile'],
              );
            }
          }
        }
      }
    }
  }

  setFlag(row, column) {
    this.debug.log('grid-component', 'setting flag');
    this.mouseIsDown = true;
    this.updateTile(row, column);
  }

  removeFlag(row, column) {
    this.debug.log('grid-component', 'removing flag');
    this.mouseIsDown = false;
  }

  updateTile(row, column) {
    if(this.mouseIsDown){
      this.debug.log('grid-component', 'updating tile: ' + row + ' | ' + column);
      this.debug.log('grid-component', 'tool: ' + this.feature.selectedTool);
      this.debug.log('grid-component', 'tile: ' + this.feature.selectedTile);
      this.debug.log('grid-component', 'material: ' + this.feature.material);

      switch (this.feature.selectedTool) {
        case "rotate":
          let rotation = this.feature.gridData[row][column].rotation;
          rotation = rotation + 90 == 360 ? 0 : rotation + 90;
          this.feature.gridData[row][column].setRotation(rotation);
          break;

        case "remove":
          this.feature.gridData[row][column].setBackgroundImage("");
          break;

        case "light":
          this.feature.gridData[row][column].setBackgroundImage("url(/assets/icons/tools/light.png), url(/assets/images/tiles/00/" + this.feature.material + ".png)");
          break;

        case "vent":
          this.feature.gridData[row][column].setBackgroundImage("url(/assets/icons/tools/vent.png)");
          break;

        case "sprinkler":
          this.feature.gridData[row][column].setBackgroundImage("url(/assets/icons/tools/sprinkler.png), url('/assets/images/tiles/00/" + this.feature.material + ".png')");
          break;

        // when no tool is selected
        default:
          this.debug.log('grid-component', this.feature.getRows());

          if( (this.feature.length % 4 != 0 && ( row == 0 || row == this.feature.getRows() - 1 )) || (this.feature.width % 4 != 0 && ( column == 0 || column == this.feature.getColumns() - 1 )) ) {
            this.feature.gridData[row][column].setBackgroundImage('url(/assets/images/tiles/00/' + this.feature.material + '.png)');
          }else{
            this.feature.gridData[row][column].setBackgroundImage('url(/assets/images/tiles/'+ this.feature.selectedTile + '/'+ this.feature.material + '.png)');
            this.feature.gridData[row][column].setTile(this.feature.selectedTile);
            this.feature.gridData[row][column].setMaterial(this.feature.material);
            this.debug.log('grid-component', this.feature.gridData[row][column]);
          }
          break;
      }
    }
  }

  toggleGrid() {
    this.hideGuide = !this.hideGuide;
  }

  /**
   * Returns the background image style value.
   * Because we send 2 urls for the background images whenever they choose a
   * light or a sprinkler, we need to ignore the style sanitation.
   * @param number row    the row number
   * @param number column the column number
   * @return safe style string for the background image.
   */
  getTileBackgroundImage(row, column) {
    return this.sanitizer.bypassSecurityTrustStyle(this.feature.gridData[row][column].backgroundImage);
  }

  getTileRotation(row, column) {
    return this.feature.gridData[row][column].rotation;
  }

  getGridWidth() {
    return Math.ceil( this.feature.width / 12 / 2 ) * 48;
  }

  getGridHeight() {
    return Math.ceil( this.feature.length / 12 / 2 ) * 48;
  }

  getRoomGuideWidth() {
    return ( this.feature.width / 12 / 2 ) * 48;
  }

  getRoomGuideHeight() {
    return ( this.feature.length / 12 / 2 ) * 48;
  }

  getRoomGuideLeftAdjustment() {
    return ( this.getGridWidth() - this.getRoomGuideWidth() ) / 2;
  }

  getRoomGuideTopAdjustment() {
    return ( this.getGridHeight() - this.getRoomGuideHeight() ) / 2;
  }

}
