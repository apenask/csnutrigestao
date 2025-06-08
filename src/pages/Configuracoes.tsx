import React, { useState } from 'react';
import { Settings, Store, Moon, Sun, Save, Upload } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function Configuracoes() {
  const { state, dispatch } = useStore();
  const [storeName, setStoreName] = useState(state.config.name);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(state.config.logo || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const updates: any = { name: storeName };
    
    if (logoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        dispatch({ 
          type: 'UPDATE_CONFIG', 
          payload: { ...updates, logo: logoData } 
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      };
      reader.readAsDataURL(logoFile);
    } else {
      dispatch({ 
        type: 'UPDATE_CONFIG', 
        payload: updates 
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = state.config.theme === 'light' ? 'dark' : 'light';
    dispatch({ 
      type: 'UPDATE_CONFIG', 
      payload: { theme: newTheme } 
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Configurações
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Configure as preferências do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Store Settings */}
        <div className="card rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Store size={20} className="mr-2" style={{ color: 'var(--accent-red)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Dados da Loja
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Nome da Loja
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Digite o nome da sua loja"
                className="w-full px-4 py-2 rounded-lg input-field"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Este nome aparecerá nos recibos e relatórios
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Logo da Loja
              </label>
              
              {logoPreview && (
                <div className="mb-3">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain rounded-lg card-secondary p-2"
                  />
                </div>
              )}
              
              <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: 'var(--border-primary)' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload size={32} className="mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Clique para fazer upload do logo
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Formatos aceitos: JPG, PNG, GIF
                  </p>
                </label>
              </div>
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-lg font-semibold hover-lift flex items-center justify-center ${
                saved ? 'btn-success' : 'btn-red'
              }`}
            >
              <Save size={20} className="mr-2" />
              {saved ? 'Salvo!' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="card rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Settings size={20} className="mr-2" style={{ color: 'var(--accent-red)' }} />
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Aparência
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>
                Tema do Sistema
              </label>
              
              <div className="flex items-center justify-between p-4 card-secondary rounded-lg">
                <div className="flex items-center">
                  {state.config.theme === 'light' ? (
                    <Sun size={20} className="mr-3 text-yellow-500" />
                  ) : (
                    <Moon size={20} className="mr-3 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      Modo {state.config.theme === 'light' ? 'Claro' : 'Escuro'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {state.config.theme === 'light' 
                        ? 'Interface clara e brilhante' 
                        : 'Interface escura e suave'
                      }
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleThemeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.config.theme === 'dark' ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      state.config.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Preview do Tema
              </label>
              <div className="card-secondary rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-3 gradient-bg-red rounded-full w-20"></div>
                  <div className="h-3 bg-gray-300 rounded-full w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-300 rounded w-full"></div>
                  <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-6 w-16 gradient-bg-red rounded"></div>
                  <div className="h-6 w-16 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Informações do Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-red)' }}>
              {state.products.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Produtos Cadastrados
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-red)' }}>
              {state.sales.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Vendas Realizadas
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-red)' }}>
              {state.cashFlow.length}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Lançamentos no Caixa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}