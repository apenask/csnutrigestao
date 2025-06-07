import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Sale } from '../types';
import { formatDateTime, formatCurrency } from './dateUtils';

export async function generateSaleReceipt(sale: Sale, storeName: string = 'CS Nutri', storeLogo?: string): Promise<void> {
  try {
    // Create a temporary container for the receipt
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '400px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '32px';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    tempContainer.style.color = '#000';
    tempContainer.style.lineHeight = '1.4';

    const paymentMethodLabels = {
      cash: 'Dinheiro',
      card: 'Cartão',
      pix: 'PIX'
    };

    // Build the receipt HTML
    tempContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        ${storeLogo ? `
          <div style="margin-bottom: 16px;">
            <img src="${storeLogo}" alt="Logo" style="max-width: 80px; max-height: 80px; object-fit: contain; margin: 0 auto; display: block;" />
          </div>
        ` : ''}
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; color: #E53E3E; margin: 0;">
          ${storeName}
        </h1>
        <p style="font-size: 14px; color: #666; margin: 8px 0;">Sistema de Gestão</p>
        <div style="border-bottom: 2px solid #ccc; margin-top: 16px;"></div>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; margin-top: 0;">COMPROVANTE DE VENDA</h2>
        <div style="font-size: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Venda:</span>
            <span style="font-family: monospace;">#${sale.id}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Data/Hora:</span>
            <span>${formatDateTime(sale.date)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Pagamento:</span>
            <span>${paymentMethodLabels[sale.paymentMethod]}</span>
          </div>
        </div>
        <div style="border-bottom: 1px solid #ccc; margin-top: 12px;"></div>
      </div>

      <div style="margin-bottom: 24px;">
        <h3 style="font-weight: 600; margin-bottom: 12px; margin-top: 0;">ITENS</h3>
        <div>
          ${sale.items.map(item => `
            <div style="font-size: 14px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-weight: 500;">
                <span>${item.product.name}</span>
                <span>${formatCurrency(item.product.price * item.quantity)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; color: #666; font-size: 12px;">
                <span>${formatCurrency(item.product.price)} x ${item.quantity}</span>
                <span>${item.product.category}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="border-bottom: 1px solid #ccc; margin-top: 12px;"></div>
      </div>

      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold;">
          <span>TOTAL:</span>
          <span style="color: #E53E3E;">${formatCurrency(sale.total)}</span>
        </div>
      </div>

      <div style="text-align: center; font-size: 14px; color: #666; border-top: 1px solid #ccc; padding-top: 16px;">
        <p style="margin-bottom: 8px;">Obrigado pela preferência!</p>
        <p style="font-weight: 500; margin-bottom: 4px;">${storeName}</p>
        <p style="margin-bottom: 16px;">Sua loja de suplementos</p>
        <div style="font-size: 12px;">
          <p style="margin-bottom: 4px;">Este documento não possui valor fiscal</p>
          <p>Gerado em ${formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>
    `;

    document.body.appendChild(tempContainer);

    // Wait for images to load
    const images = tempContainer.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(true);
        } else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        }
      });
    }));

    // Generate canvas from HTML
    const canvas = await html2canvas(tempContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save PDF
    pdf.save(`recibo-venda-${sale.id}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    
    // Fallback to simple jsPDF generation
    const doc = new jsPDF();
    let yPosition = 20;
    
    // Header
    doc.setFontSize(20);
    doc.text(storeName, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text('Comprovante de Venda', 20, yPosition);
    yPosition += 10;
    doc.text(`Venda #${sale.id}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Data: ${formatDateTime(sale.date)}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Pagamento: ${sale.paymentMethod.toUpperCase()}`, 20, yPosition);
    yPosition += 10;
    
    // Line separator
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    // Items header
    doc.setFontSize(10);
    doc.text('Item', 20, yPosition);
    doc.text('Qtd', 120, yPosition);
    doc.text('Valor Unit.', 140, yPosition);
    doc.text('Total', 170, yPosition);
    yPosition += 5;
    
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 7;
    
    // Items
    sale.items.forEach((item) => {
      doc.text(item.product.name, 20, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(formatCurrency(item.product.price), 140, yPosition);
      doc.text(formatCurrency(item.product.price * item.quantity), 170, yPosition);
      yPosition += 7;
    });
    
    // Total line
    yPosition += 5;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(sale.total)}`, 20, yPosition);
    yPosition += 15;
    
    // Footer
    doc.setFontSize(8);
    doc.text('Obrigado pela preferência!', 20, yPosition);
    doc.text(`${storeName} - Sua loja de suplementos`, 20, yPosition + 10);
    
    // Save PDF
    doc.save(`recibo-venda-${sale.id}.pdf`);
  }
}