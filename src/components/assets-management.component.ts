import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HrService, Asset } from '../services/hr.service';

@Component({
  selector: 'app-assets-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Gestão de Ativos & IT</h2>
          <p class="text-slate-500 text-sm">Controle de Inventário, EPIs e Equipamentos (Rippling Style)</p>
        </div>
        <button (click)="openModal()" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition flex items-center gap-2 shadow-sm">
          <span>📦</span> Novo Ativo / Atribuição
        </button>
      </div>

      <!-- Stats / Inventory Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">💻</div>
           <div>
             <div class="text-2xl font-bold text-slate-800">{{ totalAssets() }}</div>
             <div class="text-xs text-slate-500 uppercase font-bold">Total Itens</div>
           </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold">✅</div>
           <div>
             <div class="text-2xl font-bold text-slate-800">{{ inUseAssets() }}</div>
             <div class="text-xs text-slate-500 uppercase font-bold">Em Uso</div>
           </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div class="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold">👷</div>
           <div>
             <div class="text-2xl font-bold text-slate-800">{{ ppeCount() }}</div>
             <div class="text-xs text-slate-500 uppercase font-bold">EPIs (NR-6)</div>
           </div>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
           <div class="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">📅</div>
           <div>
             <div class="text-2xl font-bold text-slate-800">0</div>
             <div class="text-xs text-slate-500 uppercase font-bold">Devoluções Pend.</div>
           </div>
        </div>
      </div>

      <!-- Asset List (Flattened) -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500">
              <tr>
                <th class="px-6 py-4 font-semibold">Item / Serial</th>
                <th class="px-6 py-4 font-semibold">Tipo</th>
                <th class="px-6 py-4 font-semibold">Colaborador (Responsável)</th>
                <th class="px-6 py-4 font-semibold">Data Entrega</th>
                <th class="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (item of flattenedAssets(); track item.id) {
                <tr class="hover:bg-slate-50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-lg">
                        @switch (item.type) {
                           @case ('NOTEBOOK') { 💻 }
                           @case ('CELULAR') { 📱 }
                           @case ('EPI_CALCADO') { 👢 }
                           @case ('EPI_CAPACETE') { ⛑️ }
                           @case ('TOKEN') { 🔑 }
                           @default { 📦 }
                        }
                      </div>
                      <div>
                        <div class="font-medium text-slate-900">{{ item.name }}</div>
                        <div class="text-xs text-slate-500 font-mono">SN: {{ item.serialNumber }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600 border border-slate-200">
                      {{ formatType(item.type) }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                       <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                         {{ item.ownerName.charAt(0) }}
                       </div>
                       <span class="text-slate-700">{{ item.ownerName }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-600">
                    {{ item.deliveryDate | date:'dd/MM/yyyy' }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    @switch (item.status) {
                      @case ('EM_USO') { <span class="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">Em Uso</span> }
                      @case ('DEVOLVIDO') { <span class="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">Devolvido</span> }
                      @case ('DANIFICADO') { <span class="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-200">Danificado</span> }
                    }
                  </td>
                </tr>
              }
              
              @if (flattenedAssets().length === 0) {
                 <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                      Nenhum ativo registrado no sistema.
                    </td>
                 </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Assignment -->
    @if (isModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 class="font-bold text-lg text-slate-800">Atribuir Novo Ativo</h3>
              <p class="text-xs text-slate-500">Registre e vincule um equipamento a um colaborador</p>
            </div>
            <button (click)="closeModal()" class="text-slate-400 hover:text-red-500 text-xl font-bold">✕</button>
          </div>

          <div class="p-6 overflow-y-auto">
            <form [formGroup]="assetForm" (ngSubmit)="submitAsset()" class="space-y-4">
              
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-700">Colaborador (Responsável)</label>
                <select formControlName="employeeId" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="" disabled>Selecione...</option>
                  @for (emp of hrService.employees(); track emp.id) {
                    <option [value]="emp.id">{{ emp.name }} - {{ emp.role }}</option>
                  }
                </select>
              </div>

              <div class="space-y-1">
                 <label class="text-sm font-medium text-slate-700">Tipo de Ativo</label>
                 <select formControlName="type" class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                   <option value="NOTEBOOK">Notebook / Laptop</option>
                   <option value="CELULAR">Celular Corporativo</option>
                   <option value="TOKEN">Token / Chave de Segurança</option>
                   <option value="EPI_CALCADO">EPI - Calçado (Botina)</option>
                   <option value="EPI_CAPACETE">EPI - Capacete</option>
                 </select>
              </div>

              <div class="space-y-1">
                 <label class="text-sm font-medium text-slate-700">Modelo / Nome</label>
                 <input formControlName="name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: MacBook Pro M3, Capacete 3M...">
              </div>

              <div class="space-y-1">
                 <label class="text-sm font-medium text-slate-700">Número de Série / CA (EPI)</label>
                 <input formControlName="serialNumber" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="XYZ-12345">
              </div>

              <div class="space-y-1">
                 <label class="text-sm font-medium text-slate-700">Data de Entrega</label>
                 <input formControlName="deliveryDate" type="date" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              </div>

              <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 items-start mt-2">
                 <span class="text-blue-500 text-lg">ℹ️</span>
                 <p class="text-xs text-blue-800 leading-tight">
                   Ao salvar, um <strong>Termo de Responsabilidade</strong> será gerado automaticamente e enviado para assinatura do colaborador no portal.
                 </p>
              </div>

            </form>
          </div>

          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
             <button (click)="closeModal()" class="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition">Cancelar</button>
             <button (click)="submitAsset()" 
                     [disabled]="assetForm.invalid"
                     class="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition disabled:opacity-50 shadow-md">
               Confirmar Atribuição
             </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AssetsManagementComponent {
  hrService = inject(HrService);
  fb = inject(FormBuilder);
  
  isModalOpen = signal(false);

  // Form
  assetForm: FormGroup = this.fb.group({
    employeeId: ['', Validators.required],
    type: ['NOTEBOOK', Validators.required],
    name: ['', Validators.required],
    serialNumber: ['', Validators.required],
    deliveryDate: [new Date().toISOString().split('T')[0], Validators.required],
    status: ['EM_USO']
  });

  // Flatten assets from all employees to create a global inventory view
  flattenedAssets = computed(() => {
    return this.hrService.employees().flatMap(emp => 
      emp.assets.map(asset => ({
        ...asset,
        ownerName: emp.name,
        ownerId: emp.id
      }))
    );
  });

  // Stats
  totalAssets = computed(() => this.flattenedAssets().length);
  inUseAssets = computed(() => this.flattenedAssets().filter(a => a.status === 'EM_USO').length);
  ppeCount = computed(() => this.flattenedAssets().filter(a => a.type.startsWith('EPI')).length);

  formatType(type: string) {
    return type.replace('EPI_', 'EPI: ').replace('_', ' ');
  }

  openModal() {
    this.assetForm.reset({
      employeeId: '',
      type: 'NOTEBOOK',
      name: '',
      serialNumber: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      status: 'EM_USO'
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  submitAsset() {
    if (this.assetForm.valid) {
      const formVal = this.assetForm.value;
      const newAsset: Asset = {
        id: crypto.randomUUID(),
        type: formVal.type,
        name: formVal.name,
        serialNumber: formVal.serialNumber,
        deliveryDate: formVal.deliveryDate,
        status: formVal.status
      };

      this.hrService.assignAsset(formVal.employeeId, newAsset);
      this.closeModal();
    }
  }
}
