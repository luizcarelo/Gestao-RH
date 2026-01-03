import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService } from '../services/hr.service';

@Component({
  selector: 'app-esocial-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-slate-800">Monitor eSocial S-1.2</h2>
            <p class="text-slate-500 text-sm">Status de transmissão de eventos periódicos e não periódicos.</p>
          </div>
          <div class="flex gap-2">
             <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Ambiente: Produção</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div class="text-slate-500 text-xs font-medium uppercase">Eventos na Fila</div>
            <div class="text-2xl font-bold text-slate-800 mt-1">12</div>
          </div>
          <div class="p-4 bg-green-50 rounded-lg border border-green-100">
            <div class="text-green-600 text-xs font-medium uppercase">Aceitos (Mês)</div>
            <div class="text-2xl font-bold text-green-700 mt-1">1,240</div>
          </div>
          <div class="p-4 bg-red-50 rounded-lg border border-red-100">
            <div class="text-red-600 text-xs font-medium uppercase">Erros Retornados</div>
            <div class="text-2xl font-bold text-red-700 mt-1">3</div>
          </div>
           <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div class="text-blue-600 text-xs font-medium uppercase">Próximo Fechamento</div>
            <div class="text-2xl font-bold text-blue-700 mt-1">Dia 15</div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th class="py-3 px-4">Evento</th>
                <th class="py-3 px-4">Descrição</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Recibo</th>
                <th class="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (event of hrService.esocialQueue(); track event.code) {
                <tr class="group hover:bg-slate-50">
                  <td class="py-3 px-4 font-mono font-medium text-slate-700">{{ event.code }}</td>
                  <td class="py-3 px-4 text-slate-600">{{ event.description }}</td>
                  <td class="py-3 px-4">
                    @switch (event.status) {
                      @case ('ENVIADO') { <span class="text-green-600 font-medium text-xs bg-green-100 px-2 py-1 rounded">Aceito</span> }
                      @case ('PENDENTE') { <span class="text-slate-600 font-medium text-xs bg-slate-100 px-2 py-1 rounded">Fila</span> }
                      @case ('ERRO') { <span class="text-red-600 font-medium text-xs bg-red-100 px-2 py-1 rounded">Erro</span> }
                      @case ('PROCESSANDO') { <span class="text-blue-600 font-medium text-xs bg-blue-100 px-2 py-1 rounded animate-pulse">Enviando...</span> }
                    }
                  </td>
                  <td class="py-3 px-4 font-mono text-xs text-slate-400">
                    {{ event.receipt || '---' }}
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button class="text-slate-400 hover:text-blue-600">Ver XML</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl border border-slate-200">
          <h3 class="font-bold text-slate-800 mb-4">SST - Saúde e Segurança</h3>
          <div class="space-y-3">
             <div class="flex justify-between items-center text-sm p-3 bg-slate-50 rounded">
               <span>S-2210 (CAT)</span>
               <span class="text-slate-500">Nenhuma ocorrência</span>
             </div>
             <div class="flex justify-between items-center text-sm p-3 bg-slate-50 rounded">
               <span>S-2220 (Monitoramento)</span>
               <span class="text-orange-500 font-medium">2 Exames vencendo</span>
             </div>
             <div class="flex justify-between items-center text-sm p-3 bg-slate-50 rounded">
               <span>S-2240 (Agentes Nocivos)</span>
               <span class="text-green-600">Atualizado</span>
             </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-xl border border-slate-200">
           <h3 class="font-bold text-slate-800 mb-4">Auditoria Interna</h3>
           <div class="text-sm text-slate-600 space-y-2">
             <p>• Última reconciliação: <span class="font-mono">Ontem 23:00</span></p>
             <p>• Logs de acesso: <span class="text-green-600">Normais</span></p>
             <button class="text-blue-600 font-medium hover:underline mt-2">Gerar Relatório de Discrepâncias</button>
           </div>
        </div>
      </div>
    </div>
  `
})
export class EsocialStatusComponent {
  hrService = inject(HrService);
}