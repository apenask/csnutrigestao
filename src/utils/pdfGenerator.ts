import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Sale } from '../types';
import { formatDateTime, formatCurrency } from './dateUtils';

export async function generateSaleReceipt(sale: Sale, storeName: string = 'CS Nutri', storeLogo?: string): Promise<void> {
  try {
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    // Estilos Otimizados para compactação
    tempContainer.style.width = '300px'; // Largura reduzida, similar a um recibo
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '20px'; // Padding reduzido
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    tempContainer.style.color = '#000';
    tempContainer.style.lineHeight = '1.3'; // Linha um pouco mais justa

    const paymentMethodLabels = {
      cash: 'Dinheiro',
      card: 'Cartão',
      pix: 'PIX'
    };

    // HTML do Recibo com estilos inline ajustados
    tempContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 16px;">
        ${storeLogo ? `
          <div style="margin-bottom: 12px;">
            <img src="${storeLogo}" alt="Logo" style="max-width: 60px; max-height: 60px; object-fit: contain; margin: 0 auto; display: block;" />
          </div>
        ` : ''}
        <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 4px; color: #D92D20; margin: 0;">
          ${storeName}
        </h1>
        <p style="font-size: 12px; color: #666; margin: 4px 0;">Comprovante de Venda</p>
        <div style="border-bottom: 1px solid #eee; margin-top: 12px;"></div>
      </div>

      <div style="margin-bottom: 16px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Venda ID:</span>
          <span style="font-family: monospace;">#${sale.id}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Data/Hora:</span>
          <span>${formatDateTime(sale.date)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Pagamento:</span>
          <span>${paymentMethodLabels[sale.paymentMethod]}</span>
        </div>
      </div>

      <div style="border-bottom: 1px dashed #ccc; margin-top: 12px; margin-bottom: 12px;"></div>

      <div style="margin-bottom: 16px;">
        <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 8px; margin-top: 0;">ITENS</h3>
        <div>
          ${sale.items.map(item => `
            <div style="font-size: 12px; margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; font-weight: 500;">
                <span>${item.quantity}x ${item.product.name}</span>
                <span>${formatCurrency(item.product.price * item.quantity)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #666; font-size: 11px;">
                <span>(${formatCurrency(item.product.price)} cada)</span>
                <span>${item.product.category}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div style="border-bottom: 1px dashed #ccc; margin-top: 12px; margin-bottom: 12px;"></div>

      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: bold;">
          <span>TOTAL:</span>
          <span style="color: #D92D20;">${formatCurrency(sale.total)}</span>
        </div>
      </div>

      <div style="text-align: center; font-size: 11px; color: #666; border-top: 1px solid #eee; padding-top: 12px;">
        <p style="margin-bottom: 4px;">Obrigado pela preferência!</p>
        <p style="font-weight: 500;">${storeName}</p>
        <div style="font-size: 10px; margin-top: 12px;">
          <p>Este documento não possui valor fiscal</p>
        </div>
      </div>
    `;

    document.body.appendChild(tempContainer);

    const images = tempContainer.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => new Promise(resolve => {
      if (img.complete) return resolve(true);
      img.onload = img.onerror = () => resolve(true);
    })));

    const canvas = await html2canvas(tempContainer, { scale: 3, useCORS: true });
    document.body.removeChild(tempContainer);

    const imgData = canvas.toDataURL('image/png');
    // A4 page is 210mm wide. Let's make the receipt 80mm wide (common for thermal printers).
    const pdfWidth = 80;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfWidth, pdfHeight] });
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`recibo-venda-${sale.id}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    alert('Ocorreu um erro ao gerar o PDF. Tente novamente.');
  }
}