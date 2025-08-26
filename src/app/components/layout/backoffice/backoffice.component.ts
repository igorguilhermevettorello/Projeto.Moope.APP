import { Component } from '@angular/core';
import { TopBarComponent } from '../top-bar/top-bar.component';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-backoffice-layout',
  standalone: true,
  imports: [TopBarComponent, SideMenuComponent, RouterModule],
  templateUrl: './backoffice.component.html',
  styleUrls: ['./backoffice.component.css']
})

export class BackofficeLayoutComponent {} 