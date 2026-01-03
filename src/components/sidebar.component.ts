import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Hidden on Mobile (md:flex) -->
    <aside class="hidden md:flex w-64 bg-slate-900 text-white flex-col h-full shadow-xl">
      <div class="p-6 border-b border-slate-800">
        <h1 class="text-xl font-bold tracking-tight text-blue-400">Gestão RH Pro</h1>
        <p class="text-xs text-slate-400 mt-1">Conformidade & Pessoas</p>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        @for (item of menuItems; track item.id) {
          <button
            (click)="selectView(item.id)"
            [class.bg-blue-600]="currentView() === item.id"
            [class.text-white]="currentView() === item.id"
            [class.text-slate-400]="currentView() !== item.id"
            [class.hover:bg-slate-800]="currentView() !== item.id"
            [class.hover:text-white]="currentView() !== item.id"
            class="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium">
            <span class="text-lg">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        }
      </nav>

      <div class="p-4 border-t border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">CS</div>
          <div class="overflow-hidden">
            <p class="text-sm font-medium truncate">Carlos Silva</p>
            <p class="text-xs text-slate-500 truncate">Sair do sistema</p>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  currentView = input.required<string>();
  viewChange = output<string>();

  menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: '📊' },
    { id: 'time-clock', label: 'Ponto (REP-P)', icon: '⏰' },
    { id: 'payslips', label: 'Holerites', icon: '📄' },
    { id: 'bank-hours', label: 'Banco de Horas', icon: '⚖️' },
    { id: 'esocial', label: 'eSocial & SST', icon: '🏛️' },
    { id: 'compliance', label: 'Auditoria & LGPD', icon: '🛡️' },
  ];

  selectView(id: string) {
    this.viewChange.emit(id);
  }
}