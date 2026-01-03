import { Component, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { HrService } from '../services/hr.service';

@Component({
  selector: 'app-bank-hours',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex justify-between items-end">
        <div>
           <h2 class="text-2xl font-bold text-slate-800">Banco de Horas</h2>
           <p class="text-sm text-slate-500">Gestão de compensação e controle de passivo trabalhista.</p>
        </div>
        <div class="text-right hidden md:block">
           <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Valor Hora Base</div>
           <div class="font-mono font-medium text-slate-700">{{ hourlyRate() | currency:'BRL' }}</div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1: Saldo Principal -->
        <div class="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-full">
          <div class="relative z-10">
            <div class="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Saldo Atual</div>
            <div class="text-5xl font-bold tracking-tight flex items-baseline gap-2">
              <span class="font-mono">{{ hrService.bankOfHours().balance | number:'1.2-2' }}</span>
              <span class="text-2xl">h</span>
            </div>
            <div class="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/20 text-xs text-blue-100">
               <span>🟢 Crédito a compensar</span>
            </div>
          </div>
          
          <div class="relative z-10 mt-6 pt-4 border-t border-white/10">
            <div class="flex justify-between items-center text-sm">
              <span class="opacity-80">Expira em:</span>
              <span class="font-bold font-mono bg-white/10 px-2 py-1 rounded">{{ hrService.bankOfHours().expiryDate }}</span>
            </div>
          </div>
          
          <!-- Decorator -->
          <div class="absolute -right-6 -top-6 h-40 w-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
        </div>

        <!-- Card 2: Cálculo Financeiro (Passivo) -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
           <div class="mb-4">
             <div class="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
               💰 Passivo Estimado
               <span class="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] border border-amber-200">CLT Art. 59</span>
             </div>
             <div class="text-3xl font-bold text-slate-800 mt-1">
               {{ financialLiability() | currency:'BRL' }}
             </div>
             <p class="text-xs text-slate-400 mt-1">Valor a pagar caso não haja compensação.</p>
           </div>

           <div class="mt-auto bg-slate-50 rounded-lg p-3 text-xs space-y-2 border border-slate-100">
             <div class="flex justify-between">
               <span class="text-slate-500">Base ({{ hrService.bankOfHours().balance }}h × {{ hourlyRate() | currency:'BRL' }})</span>
               <span class="font-mono text-slate-700">{{ (hrService.bankOfHours().balance * hourlyRate()) | currency:'BRL' }}</span>
             </div>
             <div class="flex justify-between">
               <span class="text-slate-500">Adicional Legal (+50%)</span>
               <span class="font-mono text-slate-700">{{ (hrService.bankOfHours().balance * hourlyRate() * 0.5) | currency:'BRL' }}</span>
             </div>
             <div class="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-800">
               <span>Total Bruto</span>
               <span>{{ financialLiability() | currency:'BRL' }}</span>
             </div>
           </div>
        </div>

        <!-- Card 3: Compliance & Prazos -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden">
          <div class="relative z-10">
            <div class="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Prazo Legal</div>
            
            <div class="flex items-center gap-3 mb-4">
               <div class="text-4xl font-bold" [class.text-red-600]="daysToExpiry() < 30" [class.text-slate-800]="daysToExpiry() >= 30">
                 {{ daysToExpiry() }}
               </div>
               <div class="leading-tight text-sm text-slate-500">
                 dias para<br>vencimento
               </div>
            </div>

            <p class="text-sm text-slate-600 mb-4 leading-relaxed">
              O saldo não compensado até o vencimento deverá ser quitado na folha de pagamento seguinte.
            </p>

            <button class="w-full py-2.5 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-lg hover:bg-indigo-100 transition border border-indigo-100 flex items-center justify-center gap-2">
              <span>📅</span> Agendar Folga
            </button>
          </div>
          
          <!-- Progress Bar Background -->
          <div class="absolute bottom-0 left-0 h-1.5 bg-slate-100 w-full">
            <div class="h-full bg-indigo-500 transition-all duration-1000" [style.width.%]="daysPercentage()"></div>
          </div>
        </div>
      </div>

      <!-- Extract Table / Month View -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-slate-700 text-sm">Movimentação do Mês</h3>
          <div class="flex gap-4 text-xs font-medium">
             <div class="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded border border-green-200">
               <span>⬆️ Créditos:</span>
               <span>+{{ hrService.bankOfHours().monthCredits }}h</span>
             </div>
             <div class="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded border border-red-200">
               <span>⬇️ Débitos:</span>
               <span>-{{ hrService.bankOfHours().monthDebits }}h</span>
             </div>
          </div>
        </div>
        
        <div class="p-8 text-center text-slate-400 text-sm flex flex-col items-center">
          <div class="text-4xl mb-2 grayscale opacity-50">📊</div>
          <p>O extrato detalhado de lançamentos diários aparecerá aqui.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class BankOfHoursComponent {
  hrService = inject(HrService);

  // 1. Calculate Hourly Rate (Salary / 220h standard)
  hourlyRate = computed(() => {
    // In a real app, we would get the logged-in user's salary
    // Using the mock employee '1' (Carlos Silva) who has salary 12500
    const employee = this.hrService.employees().find(e => e.id === '1');
    const salary = employee ? employee.salary : 0;
    return salary / 220;
  });

  // 2. Calculate Liability (Balance * Rate * 1.5 for 50% surcharge)
  financialLiability = computed(() => {
    const balance = this.hrService.bankOfHours().balance;
    const rate = this.hourlyRate();
    // CLT Art 59 § 1º: A remuneração da hora extra será, pelo menos, 50% superior à da hora normal.
    return balance * rate * 1.5; 
  });

  // 3. Days to Expiry Calculation
  daysToExpiry = computed(() => {
    const expiryStr = this.hrService.bankOfHours().expiryDate; // "30/11/2024"
    if (!expiryStr) return 0;

    // Parse DD/MM/YYYY manually to ensure cross-browser compatibility
    const parts = expiryStr.split('/');
    if (parts.length !== 3) return 0;
    
    const expiryDate = new Date(+parts[2], +parts[1] - 1, +parts[0]); // Year, Month (0-idx), Day
    const today = new Date();
    
    // Reset hours for accurate day diff
    expiryDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  });

  // Visual Helper for progress bar (Assuming 180 days/6 months is standard cycle)
  daysPercentage = computed(() => {
    const days = this.daysToExpiry();
    const maxDays = 180; // Standard semester agreement
    const percentage = (days / maxDays) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  });
}