import { Component, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HrService } from '../services/hr.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div class="space-y-8 animate-fade-in">
      <!-- Welcome Section -->
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Olá, {{ hrService.user().name.split(' ')[0] }}! 👋</h1>
          <p class="text-slate-500 mt-1">Visão geral: Compliance, Analytics e Operação.</p>
        </div>
        <div class="hidden md:block text-right text-sm text-slate-400">
          <p>{{ hrService.user().company }}</p>
          <p class="font-mono">Matrícula: {{ hrService.user().registration }}</p>
        </div>
      </div>

      <!-- Quick Stats (Personal) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="text-slate-500 text-sm font-medium mb-2">Status da Jornada</div>
          @if (hrService.isShiftActive()) {
            <div class="text-green-600 font-bold text-xl flex items-center gap-2">
              <span class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              Em Trabalho
            </div>
            <p class="text-xs text-slate-400 mt-1">Desde as {{ hrService.lastPunch()?.timestamp | date:'HH:mm' }}</p>
          } @else {
            <div class="text-slate-600 font-bold text-xl flex items-center gap-2">
              <span class="w-3 h-3 bg-slate-300 rounded-full"></span>
              Ausente / Folga
            </div>
            <p class="text-xs text-slate-400 mt-1">Último reg: {{ hrService.lastPunch()?.timestamp | date:'HH:mm' }}</p>
          }
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="text-slate-500 text-sm font-medium mb-2">Próximo Holerite</div>
          <div class="text-blue-600 font-bold text-xl">05/Junho</div>
          <p class="text-xs text-slate-400 mt-1">Competência 05/2024 em processamento</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div class="text-slate-500 text-sm font-medium mb-2">Banco de Horas</div>
          <div class="text-slate-800 font-bold text-xl">+ {{ hrService.bankOfHours().balance }}h</div>
          <p class="text-xs text-slate-400 mt-1">Saldo positivo</p>
        </div>
      </div>

      <!-- People Analytics (Workday/Oracle Style) -->
      <div class="space-y-4">
        <h3 class="font-bold text-slate-800 flex items-center gap-2 text-lg">
          <span>📈</span> People Analytics & Insights
          <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">Gerencial</span>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
           <!-- Turnover Risk (Predictive) -->
           <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
             <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <span class="text-6xl">📉</span>
             </div>
             <div class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Risco de Turnover (IA)</div>
             <div class="text-3xl font-bold text-slate-800">{{ hrService.turnoverRisk() }}</div>
             <div class="text-xs mt-2 font-medium" 
                [class.text-red-500]="hrService.turnoverRisk() > 0"
                [class.text-green-500]="hrService.turnoverRisk() === 0">
                {{ hrService.turnoverRisk() > 0 ? 'Colaboradores em Risco' : 'Baixo Risco' }}
             </div>
             <div class="w-full bg-slate-100 h-1 mt-4 rounded-full overflow-hidden">
               <div class="bg-indigo-500 h-full" [style.width.%]="(hrService.turnoverRisk() / hrService.headcount()) * 100"></div>
             </div>
           </div>

           <!-- Headcount & Cost -->
           <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Custo Folha Mensal</div>
             <div class="text-2xl font-bold text-slate-800">{{ hrService.monthlyPayrollCost() | currency:'BRL' }}</div>
             <div class="text-xs text-slate-400 mt-1">{{ hrService.headcount() }} Colaboradores ativos</div>
           </div>

           <!-- Overtime Liability (Passivo) -->
           <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Passivo Banco de Horas</div>
             <div class="text-2xl font-bold text-amber-600">{{ estimatedLiability() | currency:'BRL' }}</div>
             <div class="text-xs text-amber-700 mt-1 bg-amber-50 inline-block px-1 rounded">
               Estimado (50% add)
             </div>
           </div>

           <!-- eSocial Compliance -->
           <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Conformidade eSocial</div>
             <div class="text-2xl font-bold text-green-600">98%</div>
             <div class="text-xs text-slate-400 mt-1">S-1200/S-1210 em dia</div>
           </div>
        </div>
      </div>

      <!-- Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4">Acesso Rápido</h3>
          <div class="grid grid-cols-2 gap-3">
             <button class="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition text-left flex items-center gap-2">
               <span>✈️</span> Solicitar Férias
             </button>
             <button class="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition text-left flex items-center gap-2">
               <span>🏥</span> Enviar Atestado
             </button>
             <button class="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition text-left flex items-center gap-2">
               <span>📄</span> Informe Rendimentos
             </button>
             <button class="p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 font-medium transition text-left flex items-center gap-2">
               <span>🎯</span> Meu PDI (Performance)
             </button>
          </div>
        </div>

        <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="font-bold text-lg mb-2">Canal de Ética & Privacidade</h3>
            <p class="text-slate-300 text-sm">Sua privacidade é prioridade. Consulte nossa política de proteção de dados ou fale com o DPO.</p>
          </div>
          <button class="relative z-10 mt-4 w-fit px-4 py-2 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-sm transition">
            Acessar Portal do Titular
          </button>
          <!-- Decorator -->
          <div class="absolute -right-10 -bottom-10 text-9xl opacity-5 rotate-12">⚖️</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class DashboardComponent {
  hrService = inject(HrService);

  // Mock calculation for financial liability of overtime hours (CLT + 50%)
  estimatedLiability = computed(() => {
    // Average Hourly Rate approx = Total Payroll / Headcount / 220h
    const headcount = this.hrService.headcount();
    const payroll = this.hrService.monthlyPayrollCost();
    if (headcount === 0) return 0;
    
    const avgHourlyRate = (payroll / headcount) / 220;
    const hours = this.hrService.bankOfHours().balance;
    
    // Liability = Hours * Rate * 1.5 (50% extra)
    return hours * avgHourlyRate * 1.5;
  });
}