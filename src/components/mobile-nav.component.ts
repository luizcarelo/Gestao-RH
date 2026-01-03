import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 pb-safe z-50 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div class="grid grid-cols-5 h-16">
        <button (click)="selectView('dashboard')" 
          class="flex flex-col items-center justify-center gap-1 active:bg-slate-50 transition"
          [class.text-blue-600]="currentView() === 'dashboard'"
          [class.text-slate-400]="currentView() !== 'dashboard'">
          <span class="text-xl">📊</span>
          <span class="text-[10px] font-medium">Início</span>
        </button>

        <button (click)="selectView('time-clock')"
          class="flex flex-col items-center justify-center gap-1 active:bg-slate-50 transition"
          [class.text-blue-600]="currentView() === 'time-clock'"
          [class.text-slate-400]="currentView() !== 'time-clock'">
          <span class="text-xl">⏰</span>
          <span class="text-[10px] font-medium">Ponto</span>
        </button>

        <!-- Main Action Button (Floating Look) -->
        <div class="relative -top-5 flex justify-center">
          <button (click)="selectView('time-clock')" 
            class="w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center text-2xl text-white border-4 border-slate-50 active:scale-95 transition">
            📍
          </button>
        </div>

        <button (click)="selectView('payslips')"
          class="flex flex-col items-center justify-center gap-1 active:bg-slate-50 transition"
          [class.text-blue-600]="currentView() === 'payslips'"
          [class.text-slate-400]="currentView() !== 'payslips'">
          <span class="text-xl">📄</span>
          <span class="text-[10px] font-medium">Holerite</span>
        </button>

        <button (click)="selectView('bank-hours')"
          class="flex flex-col items-center justify-center gap-1 active:bg-slate-50 transition"
          [class.text-blue-600]="currentView() === 'bank-hours'"
          [class.text-slate-400]="currentView() !== 'bank-hours'">
          <span class="text-xl">⚖️</span>
          <span class="text-[10px] font-medium">Banco</span>
        </button>
      </div>
    </nav>
  `
})
export class MobileNavComponent {
  currentView = input.required<string>();
  viewChange = output<string>();

  selectView(id: string) {
    this.viewChange.emit(id);
  }
}