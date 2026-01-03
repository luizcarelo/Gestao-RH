import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService } from '../services/hr.service';

@Component({
  selector: 'app-bank-hours',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800">Banco de Horas</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Main Balance Card -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <div class="relative z-10">
            <div class="text-blue-100 text-sm font-medium mb-1">Saldo Atual</div>
            <div class="text-4xl font-bold tracking-tight flex items-baseline gap-2">
              +{{ hrService.bankOfHours().balance }}h
              <span class="text-base font-normal text-blue-200">crédito</span>
            </div>
            <div class="mt-4 pt-4 border-t border-blue-500/50 flex justify-between text-sm text-blue-100">
              <span>Validade: {{ hrService.bankOfHours().expiryDate }}</span>
              <span class="bg-blue-500/30 px-2 py-0.5 rounded text-xs border border-blue-400/30">CLT Art. 59</span>
            </div>
          </div>
          <!-- Decorator -->
          <div class="absolute right-0 top-0 h-32 w-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
        </div>

        <!-- Details -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
           <div class="flex justify-between items-center mb-4">
             <span class="text-slate-500 text-sm">Créditos no Mês</span>
             <span class="text-green-600 font-bold">+{{ hrService.bankOfHours().monthCredits }}h</span>
           </div>
           <div class="flex justify-between items-center">
             <span class="text-slate-500 text-sm">Débitos no Mês</span>
             <span class="text-red-600 font-bold">-{{ hrService.bankOfHours().monthDebits }}h</span>
           </div>
           
           <div class="mt-6">
             <div class="text-xs text-slate-400 mb-1">Limite Diário (10h Max)</div>
             <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
               <div class="bg-slate-400 h-full w-[80%]"></div>
             </div>
             <div class="flex justify-between text-xs mt-1 text-slate-400">
               <span>Hoje: 8h trabalhadas</span>
               <span>Max: 10h</span>
             </div>
           </div>
        </div>

        <!-- Compliance Warning -->
        <div class="bg-amber-50 p-6 rounded-xl border border-amber-200 flex flex-col gap-3">
          <div class="text-amber-600 font-bold text-lg flex items-center gap-2">
            <span>⚠️</span> Regras de Compensação
          </div>
          <p class="text-sm text-amber-800 leading-relaxed">
            Seu acordo é <strong>Semestral</strong>. As horas não compensadas até <strong>{{ hrService.bankOfHours().expiryDate }}</strong> serão pagas com adicional de 50%.
          </p>
          <button class="mt-auto w-full py-2 bg-white border border-amber-300 text-amber-700 font-medium rounded hover:bg-amber-100 transition">
            Solicitar Compensação
          </button>
        </div>
      </div>

      <!-- Extract Table -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200">
        <div class="p-4 border-b border-slate-200 font-bold text-slate-700">Extrato Recente</div>
        <div class="p-8 text-center text-slate-500 text-sm italic">
          Gráfico de evolução e tabela detalhada estariam aqui.
        </div>
      </div>
    </div>
  `
})
export class BankOfHoursComponent {
  hrService = inject(HrService);
}