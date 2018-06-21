import { Component, OnInit, ViewChild } from '@angular/core';
import { CanvasGridsComponent } from './../canvas-grids.component';
import * as pip from 'point-in-polygon';

@Component({
  selector: 'app-swoon-grid',
  templateUrl: './swoon-grid.component.html',
  styleUrls: ['../canvas-grids.component.css', './swoon-grid.component.css']
})
export class SwoonGridComponent extends CanvasGridsComponent implements OnInit {
  rows = 10;
  columns = 15;
  adjustmentX = 53;
  adjustmentY = 46;

  @ViewChild('swoonCanvas') canvas;

  ngOnInit() {
    this.profile.$buildSwoonGrid.subscribe(result => {
      this.debug.log('swoon-grid-component', 'building the swoon grid');
      this.renderSwoonGrid();
    });
  }

  renderSwoonGrid() {
    this.debug.log('swoon-grid-component', 'rendering the swoon grid');
    const canvas = this.canvas.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 1;

    // new design
    if (typeof this.feature.gridData === 'undefined') {
      this.feature.gridData = [];
      this.newDesign = true;
    } else {
      this.newDesign = false;
    }

    for (let r = 0; r < this.rows; ++r) {
      for (let c = 0; c < this.columns; ++c) {
        this.createSwoonSection(ctx, c * this.adjustmentX, r * this.adjustmentY, this.isOdd(r), r, c);
      }
    }
  }

  swoonGridClick(event: any) {
    if (this.feature.quoted) {
      this.alert.error('This design has been quoted.  To make changes you must first save it as a new design.');
      return;
    }
    this.debug.log('swoon-grid-component', event);
    const x = event.offsetX;
    const y = event.offsetY;
    let foundTile = false;
    this.debug.log('swoon-grid', 'you clicked on x: ' + x + ' and y: ' + y);
    for (const el in this.feature.gridData) {
      if (!foundTile && pip([x, y], this.feature.gridData[el].diamond)) {
        // removing a tile
        if (this.feature.selectedTool === 'remove') {
          // reset the texture for the 3D view.
          this.feature.gridData[el].texture = '';
          // reset the tile
          this.feature.gridData[el].tile = '';
          // reset material
          this.feature.gridData[el].material = '';
          // reset materialType
          this.feature.gridData[el].materialType = '';
          // reset hex color value
          this.feature.gridData[el].hex = '';
          // reset the diffusion
          this.feature.gridData[el].diffusion = '';
          this.debug.log('swoon-grid', this.feature.gridData[el]);
          // set the tile found true so we don't "find" another one that's close
          foundTile = true;
        } else {
          // set the texture for the 3D view.
          this.feature.gridData[el].texture = '/assets/images/tiles/00/' + this.feature.material + '.png';
          // set the tile
          this.feature.gridData[el].tile = this.feature.selectedTile.tile;
          // set material
          this.feature.gridData[el].material = this.feature.material;
          // set materialType
          this.feature.gridData[el].materialType = this.feature.materialType;
          // set hex color value
          this.feature.gridData[el].hex = this.feature.materialHex;
          // // set the diffusion if one is selected and material type is varia
          // if (this.feature.materialType === 'varia') {
          //   this.feature.gridData[el].diffusion = this.feature.diffusion;
          // } else {
          //   this.feature.gridData[el].diffusion = '';
          // }
          // set the tile found true so we don't "find" another one that's close
          foundTile = true;
        }
        this.debug.log('swoon-grid', this.feature.gridData[el]);
        // // render the canvas again
        this.renderSwoonGrid();
        // // update the estimated amount
        // this.feature.updateEstimatedAmount();
      }
    }    
  }

  private createSwoonSection(ctx, adjustmentX, adjustmentY, isOdd, row, column) {
    this.debug.log('swoon-section', row);
    this.debug.log('swoon-section', column);
    const index = (row * this.columns + column) * 3; // 3 is the number of diamonds needed to make a section
    this.debug.log('swoon-grid-component', index);
    if (isOdd) {
      this.drawDiamond(ctx, 56 + adjustmentX, 18 + adjustmentY, 0, row, column, index + 1);
      this.drawDiamond(ctx, 70 + adjustmentX, 41 + adjustmentY, -Math.PI / 3, row, column, index + 2);
      this.drawDiamond(ctx, 43 + adjustmentX, 41 + adjustmentY, Math.PI / 3, row, column, index + 3);
    } else {
      this.drawDiamond(ctx, 29 + adjustmentX, 18 + adjustmentY, 0, row, column, index + 1);
      this.drawDiamond(ctx, 43 + adjustmentX, 41 + adjustmentY, -Math.PI / 3, row, column, index + 2);
      this.drawDiamond(ctx, 16 + adjustmentX, 41 + adjustmentY, Math.PI / 3, row, column, index + 3);
    }
  }

  private drawDiamond(ctx, x, y, rotateAngle, row, column, index) {
    // this.debug.log('draw-diamond', x);
    // this.debug.log('draw-diamond', y);
    // this.debug.log('draw-diamond', rotateAngle);
    // this.debug.log('draw-diamond', row);
    // this.debug.log('draw-diamond', column);

    if(index === 450) {
      console.log('index 450');
    }

    // points to create a diamond
    const xcoords = [0, -27, 0, 27];
    const ycoords = [16, 0, -16, 0];

    // create the swoon section
    // add x,y to all the points on the diamond
    const diamond = [];
    for (let i = 0; i < xcoords.length; ++i) {
      diamond[i] = [xcoords[i] + x, ycoords[i] + y];
    }
    // this.debug.log('draw-diamond', diamond);

    if (this.newDesign) {
      this.feature.gridData.push({
        index: index,
        row: row,
        column: column,
        x: x,
        y: y,
        diamond: diamond,
        texture: '',
        rotation: this.toDegrees(rotateAngle),
        material: '',
        tile: '',
        diffusion: ''
      });
    }

    // save current canvas state
    ctx.save();
    // start drawing
    ctx.beginPath();
    // move to the new x,y coordinates (setting a new 0,0 at x,y)
    ctx.translate(x, y);
    // rotate to fit the tesselation
    ctx.rotate(rotateAngle);
    // move to the start of the pentagon and then draw the lines
    ctx.moveTo(xcoords[0], ycoords[0]);
    ctx.lineTo(xcoords[1], ycoords[1]);
    ctx.lineTo(xcoords[2], ycoords[2]);
    ctx.lineTo(xcoords[3], ycoords[3]);
    // close the path
    ctx.closePath();
    // set the strokestyle
    ctx.strokeStyle = this.strokeStyle;

    if (!this.feature.gridData[index - 1]) {
      console.log('found no index:', index - 1);
    }
    if (index === 0) {
      console.log('index is 0');
    }
    // if the design is not new, then we can set the fill style from the gridData
    if (!this.newDesign && !this.feature.gridData[index - 1].texture !== '') {
      // set the fillstyle
      ctx.fillStyle = this.feature.gridData[index - 1].hex;
      // fill the diamond
      ctx.fill();
      if (this.feature.showGuide) {
        // this.labelTiles(ctx, rotateAngle, index);
      }
    } else {
      ctx.fillStyle = this.fillStyle;
      // fill the diamond
      ctx.fill();
    }

    // DEBUGGING
    ctx.rotate(-rotateAngle);
    ctx.fillStyle = '#00E1E1';
    ctx.font = '10px Arial';
    ctx.fillText(index, -5, -5);
    ctx.font = '8px Arial';
    ctx.fillText(x + ', ' + y, -15, 5);

    // stroke all the pentagon lines
    ctx.stroke();
    // restore the context so that we can draw the next diamond
    ctx.restore();
  }
}
