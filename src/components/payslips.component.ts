import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HrService, Payslip } from '../services/hr.service';

@Component({
  selector: 'app-payslips',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Holerites & Documentos</h2>
          <p class="text-slate-500 text-sm">Acesse e assine seus recibos digitalmente (ICP-Brasil/Eletrônico).</p>
        </div>
        <button class="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium text-sm flex items-center gap-2 shadow-sm">
          <span>📅</span> Selecionar Ano
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Competência</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tipo</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Valor Líquido</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            @for (payslip of hrService.payslips(); track payslip.id) {
              <tr class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="font-medium text-slate-900">{{ payslip.competencia }}</div>
                  <div class="text-xs text-slate-400 font-mono">ID: {{ payslip.id }}</div>
                </td>
                <td class="px-6 py-4 text-slate-600 text-sm">Mensal</td>
                <td class="px-6 py-4 font-bold text-slate-900">{{ payslip.netValue | currency:'BRL' }}</td>
                <td class="px-6 py-4">
                  @if (payslip.status === 'ASSINADO') {
                    <div class="flex flex-col">
                      <span class="inline-flex w-fit items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        ✅ Assinado
                      </span>
                      <span class="text-[10px] text-slate-400 mt-1 font-mono">{{ payslip.signedAt | date:'dd/MM HH:mm' }}</span>
                    </div>
                  } @else {
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      ⏳ Pendente
                    </span>
                  }
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    
                    <!-- View Details -->
                    <button (click)="openDetails(payslip)"
                      class="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Visualizar Detalhes">
                      <span class="text-lg">👁️</span>
                    </button>

                    <!-- Download PDF/A -->
                    <button (click)="simulateDownload(payslip)"
                      class="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Baixar PDF/A">
                      <span class="text-lg">📄</span>
                    </button>
                    
                    <!-- Sign Action (Only if pending) -->
                    @if (payslip.status === 'DISPONIVEL') {
                      <div class="w-px h-6 bg-slate-200 mx-1"></div>
                      <button (click)="openDetails(payslip)" 
                        class="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-1 animate-pulse">
                        <span>✍️</span> Assinar
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      
      <div class="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start">
        <div class="text-blue-500 text-xl mt-0.5">🛡️</div>
        <div class="text-sm text-blue-800">
          <p class="font-bold">Validade Jurídica & Integridade</p>
          <p class="mt-1">
            Os documentos disponibilizados estão no formato <strong>PDF/A</strong> (arquivamento de longo prazo). 
            A assinatura eletrônica possui validade jurídica conforme <strong>MP 2.200-2/2001</strong> e Lei 14.063/2020.
            O hash criptográfico garante a imutabilidade do registro original.
          </p>
        </div>
      </div>
    </div>

    <!-- Modal: Detalhes do Holerite -->
    @if (selectedPayslip()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 class="font-bold text-lg text-slate-800">Detalhes do Holerite</h3>
              <p class="text-xs text-slate-500 font-mono">Competência: {{ selectedPayslip()?.competencia }} • ID: {{ selectedPayslip()?.id }}</p>
            </div>
            <button (click)="closeDetails()" class="text-slate-400 hover:text-red-500 text-xl font-bold">✕</button>
          </div>

          <!-- Body: Simulation of Earnings/Deductions -->
          <div class="p-6 overflow-y-auto space-y-6">
            
            <!-- Summary Table -->
            <div class="border border-slate-200 rounded-lg overflow-hidden text-sm">
              <table class="w-full">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="px-4 py-2 text-left font-semibold text-slate-600">Descrição</th>
                    <th class="px-4 py-2 text-right font-semibold text-green-600">Vencimentos</th>
                    <th class="px-4 py-2 text-right font-semibold text-red-600">Descontos</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr>
                    <td class="px-4 py-2 text-slate-700">Salário Base</td>
                    <td class="px-4 py-2 text-right text-slate-700">R$ 10.000,00</td>
                    <td class="px-4 py-2 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-slate-700">Horas Extras 50%</td>
                    <td class="px-4 py-2 text-right text-slate-700">R$ 850,00</td>
                    <td class="px-4 py-2 text-right text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-slate-700">INSS</td>
                    <td class="px-4 py-2 text-right text-slate-400">-</td>
                    <td class="px-4 py-2 text-right text-red-600">R$ 876,95</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-2 text-slate-700">IRRF</td>
                    <td class="px-4 py-2 text-right text-slate-400">-</td>
                    <td class="px-4 py-2 text-right text-red-600">R$ 1.523,05</td>
                  </tr>
                </tbody>
                <tfoot class="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td class="px-4 py-3 text-slate-800">Total Líquido</td>
                    <td colspan="2" class="px-4 py-3 text-right text-lg text-blue-600">
                      {{ selectedPayslip()?.netValue | currency:'BRL' }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- Compliance Footer in Modal -->
            <div class="text-xs text-slate-400 text-center font-mono border-t pt-4 border-slate-100">
               <p>Hash do Documento Original:</p>
               <p class="break-all">{{ selectedPayslip()?.hash }}</p>
            </div>

          </div>

          <!-- Actions -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
             <button (click)="simulateDownload(selectedPayslip()!)" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition text-sm font-medium flex items-center gap-2">
               <span>📥</span> Baixar PDF/A
             </button>

             @if (selectedPayslip()?.status === 'DISPONIVEL') {
               <button (click)="confirmSignature()" 
                 class="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-sm shadow-md flex items-center gap-2">
                 <span>🖊️</span> Assinar Digitalmente (ICP-Brasil)
               </button>
             } @else {
               <div class="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-bold border border-green-200">
                 <span>✅</span> Documento Assinado
               </div>
             }
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class PayslipsComponent {
  hrService = inject(HrService);
  selectedPayslip = signal<Payslip | null>(null);

  openDetails(payslip: Payslip) {
    this.selectedPayslip.set(payslip);
  }

  closeDetails() {
    this.selectedPayslip.set(null);
  }

  simulateDownload(payslip: Payslip) {
    console.log(`Downloading PDF/A for Payslip ${payslip.id}...`);
    // Here we would implement the actual Blob download
    alert(`Iniciando download seguro do Holerite ${payslip.competencia} (Formato PDF/A)...`);
  }

  confirmSignature() {
    const current = this.selectedPayslip();
    if (current) {
      if (confirm('Deseja aplicar sua assinatura digital neste documento? Esta ação é irretratável.')) {
        this.hrService.signPayslip(current.id);
        this.closeDetails();
      }
    }
  }
}
