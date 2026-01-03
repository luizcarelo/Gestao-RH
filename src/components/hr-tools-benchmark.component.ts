import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService, AiBenchmarkResult } from '../services/hr.service';

@Component({
  selector: 'app-hr-tools-benchmark',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span class="text-3xl">🤖</span> Inteligência de Mercado
          </h2>
          <p class="text-slate-500 text-sm">Use a IA do Google para comparar ferramentas globais e adaptá-las à legislação brasileira.</p>
        </div>
        
        <button (click)="fetchBenchmarks()" 
          [disabled]="isLoading()"
          class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:from-indigo-700 hover:to-violet-700 transition flex items-center gap-2 disabled:opacity-70">
          @if (isLoading()) {
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Analisando Mercado...
          } @else {
            <span>🔍</span> Buscar Benchmarks
          }
        </button>
      </div>

      <!-- Content Area -->
      @if (benchmarks().length > 0) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          @for (item of benchmarks(); track item.toolName) {
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
              <div class="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 class="font-bold text-indigo-900">{{ item.toolName }}</h3>
                <span class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Global Leader</span>
              </div>
              
              <div class="p-5 space-y-4">
                <div>
                  <div class="text-xs font-bold text-slate-400 uppercase mb-1">Funcionalidade Global</div>
                  <p class="text-slate-700 text-sm">{{ item.globalFeature }}</p>
                </div>
                
                <div class="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">🇧🇷</span>
                    <div class="text-xs font-bold text-amber-800 uppercase">Adaptação Brasil</div>
                  </div>
                  <p class="text-sm text-amber-900">{{ item.brazilAdaptation }}</p>
                </div>

                <div class="flex items-start gap-2 pt-2 border-t border-slate-100">
                  <span class="text-green-600 text-sm">🛡️</span>
                  <div>
                     <span class="text-xs font-bold text-slate-500">Nota de Compliance</span>
                     <p class="text-xs text-slate-600 italic">{{ item.complianceNote }}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        @if (sources().length > 0) {
          <div class="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-500">
            <h4 class="font-bold mb-2">Fontes Consultadas (Google Search Grounding):</h4>
            <ul class="space-y-1 list-disc pl-4">
              @for (source of sources(); track $index) {
                @if (source.web?.uri) {
                  <li>
                    <a [href]="source.web.uri" target="_blank" class="text-blue-600 hover:underline">
                      {{ source.web.title || source.web.uri }}
                    </a>
                  </li>
                }
              }
            </ul>
          </div>
        }
      } @else if (!isLoading() && !hasSearched()) {
        <div class="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <div class="text-6xl mb-4 opacity-20">🌍</div>
          <h3 class="text-lg font-bold text-slate-700">Explore o que há de melhor no mundo</h3>
          <p class="text-slate-500 max-w-md mx-auto mt-2 text-sm">
            Nossa IA analisa ferramentas como Rippling e BambooHR e explica exatamente como implementar suas inovações respeitando a CLT e o eSocial.
          </p>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class HrToolsBenchmarkComponent {
  hrService = inject(HrService);
  
  benchmarks = signal<AiBenchmarkResult[]>([]);
  sources = signal<any[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);

  async fetchBenchmarks() {
    this.isLoading.set(true);
    this.hasSearched.set(true);
    
    // Simulate delay if key is missing/invalid to show UI state, then try call
    const result = await this.hrService.getMarketBenchmarks();
    
    if (result.items.length > 0) {
      this.benchmarks.set(result.items);
      this.sources.set(result.sources);
    } else {
      // Fallback data for demo if API key is not present or call fails
      this.benchmarks.set([
        {
          toolName: "Rippling (EUA)",
          globalFeature: "Unified Workforce Platform: Permite gerenciar dispositivos (IT) e folha de pagamento em um único fluxo automatizado.",
          brazilAdaptation: "Integração Inventário x Admissão: Ao entregar o notebook, o sistema deve gerar automaticamente o Termo de Responsabilidade e atualizar o registro de EPIs/Ativos, vinculando ao evento S-2200 (Admissão) ou anotação interna.",
          complianceNote: "Requer assinatura digital no termo de entrega (Art. 462 CLT para descontos em caso de dano)."
        },
        {
          toolName: "Deel (Global)",
          globalFeature: "Global Payroll & EOR: Contratação de pessoas em qualquer país com conformidade local automatizada.",
          brazilAdaptation: "Gestão de Terceiros e PJ: Diferenciação estrita entre CLT e Prestador de Serviço para evitar vínculo empregatício (Pejotização). Validação de CNAE e Notas Fiscais.",
          complianceNote: "Monitoramento de riscos trabalhistas e 'Subordinação Jurídica' na plataforma."
        }
      ]);
    }
    
    this.isLoading.set(false);
  }
}