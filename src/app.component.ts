import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar.component';
import { MobileNavComponent } from './components/mobile-nav.component';
import { DashboardComponent } from './components/dashboard.component';
import { TimeClockComponent } from './components/time-clock.component';
import { PayslipsComponent } from './components/payslips.component';
import { BankOfHoursComponent } from './components/bank-of-hours.component';
import { EsocialStatusComponent } from './components/esocial-status.component';
import { AdminPanelComponent } from './components/admin-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    SidebarComponent,
    MobileNavComponent,
    DashboardComponent,
    TimeClockComponent,
    PayslipsComponent,
    BankOfHoursComponent,
    EsocialStatusComponent,
    AdminPanelComponent
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  currentView = signal<string>('dashboard');

  changeView(viewId: string) {
    this.currentView.set(viewId);
  }
}