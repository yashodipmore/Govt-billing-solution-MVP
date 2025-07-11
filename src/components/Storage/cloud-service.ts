import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { isPlatform } from '@ionic/react';

export class CloudService {
  
  /**
   * Creates a PDF from HTML content
   * @param htmlContent - The HTML content to convert to PDF
   * @param fileName - The name for the PDF file
   * @param option - PDF generation options (quality, format, etc.)
   * @returns Promise<Blob> - The generated PDF as a blob
   */
  static async createPDF(htmlContent: string, fileName: string = 'document', option: any = {}): Promise<Blob> {
    try {
      // Default options
      const defaultOptions = {
        format: 'A4',
        quality: 0.98,
        scale: 1.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true
      };

      const options = { ...defaultOptions, ...option };

      // Create a temporary div to render the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      // Better styling for the temporary div with centering
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0px';
      tempDiv.style.width = '800px'; // Fixed width for consistency
      tempDiv.style.minHeight = '1123px'; // A4 height in pixels
      tempDiv.style.backgroundColor = options.backgroundColor;
      tempDiv.style.padding = '40px 60px'; // More padding for better layout
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '14px';
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.color = '#000000';
      tempDiv.style.visibility = 'visible';
      tempDiv.style.display = 'block';
      tempDiv.style.overflow = 'visible';
      tempDiv.style.margin = '0 auto';
      
      // Add CSS to ensure tables and content are visible and centered
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        * { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }
        body { 
          font-family: Arial, sans-serif; 
          font-size: 14px; 
          line-height: 1.5; 
          color: #000; 
        }
        table { 
          border-collapse: collapse; 
          width: 100%; 
          font-size: 12px;
          margin: 15px auto;
          page-break-inside: avoid;
        }
        td, th { 
          border: 1px solid #333; 
          padding: 8px 12px; 
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
          max-width: 200px;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
          text-align: center;
        }
        .socialcalc-table {
          border-collapse: collapse;
          font-family: Arial, sans-serif;
          width: 100%;
          margin: 0 auto;
        }
        .socialcalc-cell {
          border: 1px solid #ccc;
          padding: 6px 10px;
          min-width: 60px;
          min-height: 25px;
          text-align: center;
        }
        .content-wrapper {
          max-width: 700px;
          margin: 0 auto;
          padding: 20px 0;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        .header, .title {
          text-align: center;
          margin-bottom: 20px;
        }
        .invoice-details {
          margin: 20px 0;
        }
      `;
      tempDiv.appendChild(styleElement);
      
      // Wrap content in a centered container
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'content-wrapper';
      while (tempDiv.firstChild && tempDiv.firstChild !== styleElement) {
        contentWrapper.appendChild(tempDiv.firstChild);
      }
      tempDiv.appendChild(contentWrapper);
      
      document.body.appendChild(tempDiv);

      // Wait for content to render and fonts to load
      await new Promise(resolve => setTimeout(resolve, 300));

      // Convert HTML to canvas with better options for full content capture
      const canvas = await html2canvas(tempDiv, {
        scale: options.scale,
        useCORS: options.useCORS,
        allowTaint: options.allowTaint,
        backgroundColor: options.backgroundColor,
        logging: options.logging,
        removeContainer: options.removeContainer,
        width: tempDiv.scrollWidth,
        height: tempDiv.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: true,
        imageTimeout: 5000,
        onclone: (clonedDoc) => {
          // Ensure all content is visible in the clone
          const clonedDiv = clonedDoc.querySelector('div');
          if (clonedDiv) {
            clonedDiv.style.position = 'static';
            clonedDiv.style.left = 'auto';
            clonedDiv.style.top = 'auto';
          }
        }
      });

      // Remove the temporary div
      document.body.removeChild(tempDiv);

      // Check if canvas has content
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has no content - HTML might be empty or not rendering properly');
      }

      // Create PDF with better page sizing
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: options.format
      });

      const imgData = canvas.toDataURL('image/png', options.quality);
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth - 20; // Leave 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image horizontally
      const xOffset = (pdfWidth - imgWidth) / 2;
      let yOffset = 10; // Top margin
      
      // If content is taller than one page, handle pagination
      let remainingHeight = imgHeight;
      let currentY = 0;
      
      while (remainingHeight > 0) {
        const pageHeight = pdfHeight - 20; // Leave margins
        const sliceHeight = Math.min(remainingHeight, pageHeight);
        
        // Calculate the slice of the image for this page
        const srcY = currentY;
        const srcHeight = (sliceHeight * canvas.width) / imgWidth;
        
        // Create a canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = srcHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          pageCtx.drawImage(canvas, 0, srcY, canvas.width, srcHeight, 0, 0, canvas.width, srcHeight);
          const pageImgData = pageCanvas.toDataURL('image/png', options.quality);
          
          pdf.addImage(pageImgData, 'PNG', xOffset, yOffset, imgWidth, sliceHeight);
        }
        
        remainingHeight -= sliceHeight;
        currentY += srcHeight;
        
        if (remainingHeight > 0) {
          pdf.addPage();
          yOffset = 10; // Reset top margin for new page
        }
      }

      // Return PDF as blob
      return pdf.output('blob');
    } catch (error) {
      console.error('Error creating PDF:', error);
      throw new Error('Failed to create PDF');
    }
  }

  /**
   * Alternative PDF creation method that captures visible element
   * @param elementId - The ID of the element to capture
   * @param fileName - The name for the PDF file
   * @param option - PDF generation options
   * @returns Promise<Blob> - The generated PDF as a blob
   */
  static async createPDFFromElement(elementId: string, fileName: string = 'document', option: any = {}): Promise<Blob> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Element with ID '${elementId}' not found`);
      }

      // Default options
      const defaultOptions = {
        format: 'A4',
        quality: 0.98,
        scale: 1.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      };

      const options = { ...defaultOptions, ...option };

      // Ensure the element is visible and styled properly for PDF
      const originalStyle = {
        position: element.style.position,
        left: element.style.left,
        top: element.style.top,
        width: element.style.width,
        height: element.style.height,
        overflow: element.style.overflow,
        backgroundColor: element.style.backgroundColor
      };

      // Apply temporary styles for better PDF rendering
      element.style.position = 'relative';
      element.style.left = 'auto';
      element.style.top = 'auto';
      element.style.width = 'auto';
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.backgroundColor = options.backgroundColor;

      // Wait for any layout changes to settle
      await new Promise(resolve => setTimeout(resolve, 200));

      // Convert element directly to canvas with improved options
      const canvas = await html2canvas(element, {
        scale: options.scale,
        useCORS: options.useCORS,
        allowTaint: options.allowTaint,
        backgroundColor: options.backgroundColor,
        logging: options.logging,
        width: element.scrollWidth,
        height: element.scrollHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: true,
        imageTimeout: 5000,
        onclone: (clonedDoc) => {
          // Apply additional styling to the cloned document
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.padding = '20px';
            clonedElement.style.margin = '0 auto';
            clonedElement.style.backgroundColor = options.backgroundColor;
          }
        }
      });

      // Restore original styles
      Object.keys(originalStyle).forEach(key => {
        element.style[key] = originalStyle[key];
      });

      // Check if canvas has content
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has no content - Element might be empty or not visible');
      }

      // Create PDF with proper centering and pagination
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: options.format
      });

      const imgData = canvas.toDataURL('image/png', options.quality);
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth - 20; // Leave 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image horizontally
      const xOffset = (pdfWidth - imgWidth) / 2;
      let yOffset = 10; // Top margin
      
      // If content is taller than one page, handle pagination
      let remainingHeight = imgHeight;
      let currentY = 0;
      
      while (remainingHeight > 0) {
        const pageHeight = pdfHeight - 20; // Leave margins
        const sliceHeight = Math.min(remainingHeight, pageHeight);
        
        // Calculate the slice of the image for this page
        const srcY = currentY;
        const srcHeight = (sliceHeight * canvas.width) / imgWidth;
        
        // Create a canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = srcHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          pageCtx.drawImage(canvas, 0, srcY, canvas.width, srcHeight, 0, 0, canvas.width, srcHeight);
          const pageImgData = pageCanvas.toDataURL('image/png', options.quality);
          
          pdf.addImage(pageImgData, 'PNG', xOffset, yOffset, imgWidth, sliceHeight);
        }
        
        remainingHeight -= sliceHeight;
        currentY += srcHeight;
        
        if (remainingHeight > 0) {
          pdf.addPage();
          yOffset = 10; // Reset top margin for new page
        }
      }

      // Return PDF as blob
      return pdf.output('blob');
    } catch (error) {
      console.error('Error creating PDF from element:', error);
      throw new Error('Failed to create PDF from element');
    }
  }

  /**
   * Downloads a PDF file
   * @param pdfBlob - The PDF blob to download
   * @param fileName - The name for the downloaded file
   */
  static downloadPDF(pdfBlob: Blob, fileName: string = 'document'): void {
    try {
      const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      saveAs(pdfBlob, finalFileName);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF');
    }
  }

  /**
   * Shares a PDF file (mobile platforms)
   * @param pdfBlob - The PDF blob to share
   * @param fileName - The name for the shared file
   * @param title - The share dialog title
   */
  static async sharePDF(pdfBlob: Blob, fileName: string = 'document', title: string = 'Share PDF'): Promise<void> {
    try {
      const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      
      if (isPlatform('hybrid')) {
        // For mobile platforms, we'll use the Web Share API if available
        if (navigator.share && navigator.canShare) {
          const file = new File([pdfBlob], finalFileName, { type: 'application/pdf' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: title,
              text: `Sharing ${finalFileName}`
            });
            return;
          }
        }
        
        // Fallback: Create download link
        this.downloadPDF(pdfBlob, fileName);
        alert('PDF downloaded. You can share it from your device\'s file manager.');
      } else {
        // For web platforms, use download as fallback
        this.downloadPDF(pdfBlob, fileName);
        
        // Try to use Web Share API if available
        if (navigator.share) {
          try {
            const file = new File([pdfBlob], finalFileName, { type: 'application/pdf' });
            await navigator.share({
              files: [file],
              title: title,
              text: `Sharing ${finalFileName}`
            });
          } catch (shareError) {
            console.log('Web Share API not supported or cancelled');
          }
        }
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      throw new Error('Failed to share PDF');
    }
  }

  /**
   * Exports data as CSV and downloads it
   * @param csvContent - The CSV content string
   * @param fileName - The name for the CSV file
   */
  static exportCSV(csvContent: string, fileName: string = 'export'): void {
    try {
      const finalFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, finalFileName);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Failed to export CSV');
    }
  }

  /**
   * Shares CSV content (mobile platforms)
   * @param csvContent - The CSV content string
   * @param fileName - The name for the shared file
   * @param title - The share dialog title
   */
  static async shareCSV(csvContent: string, fileName: string = 'export', title: string = 'Share CSV'): Promise<void> {
    try {
      const finalFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      if (isPlatform('hybrid')) {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], finalFileName, { type: 'text/csv' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: title,
              text: `Sharing ${finalFileName}`
            });
            return;
          }
        }
        
        // Fallback: Create download link
        this.exportCSV(csvContent, fileName);
        alert('CSV downloaded. You can share it from your device\'s file manager.');
      } else {
        // For web platforms, use download as fallback
        this.exportCSV(csvContent, fileName);
        
        if (navigator.share) {
          try {
            const file = new File([blob], finalFileName, { type: 'text/csv' });
            await navigator.share({
              files: [file],
              title: title,
              text: `Sharing ${finalFileName}`
            });
          } catch (shareError) {
            console.log('Web Share API not supported or cancelled');
          }
        }
      }
    } catch (error) {
      console.error('Error sharing CSV:', error);
      throw new Error('Failed to share CSV');
    }
  }

  /**
   * Simple and effective PDF generation method
   * @param htmlContent - The HTML content to convert to PDF
   * @param fileName - The name for the PDF file
   * @param option - PDF generation options
   * @returns Promise<Blob> - The generated PDF as a blob
   */
  static async createSmartPDF(htmlContent: string, fileName: string = 'document', option: any = {}): Promise<Blob> {
    try {
      console.log('Creating PDF using simple method...');
      
      // Create a simple container
      const container = document.createElement('div');
      container.innerHTML = htmlContent;
      
      // Simple styling
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0px';
      container.style.width = '800px';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '20px';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.color = '#000000';
      
      // Add basic table styling - hide empty grid lines
      const style = document.createElement('style');
      style.textContent = `
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 10px 0;
        }
        td, th {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        /* Hide empty cells and grid lines */
        td:empty {
          border: none !important;
          padding: 0 !important;
        }
        /* Hide SocialCalc grid lines */
        .socialcalc-grid {
          display: none !important;
        }
        .socialcalc-cell-grid {
          border: none !important;
        }
        /* Only show cells with actual content */
        td:not(:empty) {
          border: 1px solid #000 !important;
        }
        /* Hide background grid patterns */
        [class*="grid"], [class*="line"] {
          display: none !important;
        }
        /* Clean background */
        * {
          background-image: none !important;
          background-color: transparent !important;
        }
        table {
          background-color: #ffffff !important;
        }
        td, th {
          background-color: #ffffff !important;
        }
      `;
      
      container.appendChild(style);
      document.body.appendChild(container);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple canvas capture
      const canvas = await html2canvas(container, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove container
      document.body.removeChild(container);
      
      // Create simple PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'A4'
      });
      
      const imgData = canvas.toDataURL('image/png', 0.9);
      const imgWidth = 190; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      return pdf.output('blob');
      
    } catch (error) {
      console.error('PDF creation failed:', error);
      throw new Error('Failed to create PDF');
    }
  }
}
