import type { CheckInResult } from './useCheckIn'
import { calculateAge } from '~/utils/age'

export const usePrint = () => {
  const config = useRuntimeConfig()
  const churchName = config.public.churchName

  const generateStickerGrids = (checkIns: CheckInResult[]): string => {
    // Create array with both child and parent stickers
    const allStickers: { checkIn: CheckInResult; type: 'child' | 'parent' }[] = []
    checkIns.forEach(checkIn => {
      allStickers.push({ checkIn, type: 'child' })
      allStickers.push({ checkIn, type: 'parent' })
    })

    // Each sticker gets its own page (100mm x 50mm)
    return allStickers.map(({ checkIn, type }) => {
      if (type === 'child') {
        return `
          <div class="sticker child-sticker">
            <div class="sticker-type">NIÑO</div>
            <div class="church-name">${churchName}</div>
            <div class="child-name">${checkIn.child.firstName}</div>
            <div class="family-name">${checkIn.child.lastName}</div>
            <div class="timestamp">${formatDate(checkIn.checkInTime)}</div>
            <div class="timestamp">${formatTime(checkIn.checkInTime)}</div>
            <div class="age-info">${calculateAge(checkIn.child.birthDate)} años</div>
          </div>
        `
      } else {
        return `
          <div class="sticker parent-sticker">
            <div class="sticker-type">PADRE/MADRE - RECOGIDA</div>
            <div class="church-name">${churchName}</div>
            <div class="pickup-label">Para recoger a:</div>
            <div class="pickup-child-name">${checkIn.child.firstName}</div>
            <div class="timestamp">${formatDate(checkIn.checkInTime)}</div>
            <div class="timestamp">${formatTime(checkIn.checkInTime)}</div>
            <div class="keep-sticker">Conserve este sticker</div>
          </div>
        `
      }
    }).join('')
  }

  const printStickers = (checkIns: CheckInResult[]) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para imprimir')
      return
    }

    // Generate HTML for stickers
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Etiquetas - ${churchName}</title>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            size: 100mm 63mm;
            margin: 0;
          }

          html, body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100mm;
            height: 63mm;
          }

          .sticker {
            width: 100mm;
            height: 63mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2mm 3mm;
            background: white;
            position: relative;
            page-break-after: always;
            box-sizing: border-box;
            overflow: hidden;
          }

          .sticker:last-child {
            page-break-after: avoid;
          }

          .child-sticker {
            border: 4px solid #3b82f6;
          }

          .parent-sticker {
            border: 4px solid #10b981;
          }

          .sticker-type {
            font-size: 6pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 1mm;
            text-transform: uppercase;
            line-height: 1;
          }

          .child-sticker .sticker-type {
            color: #3b82f6;
          }

          .parent-sticker .sticker-type {
            color: #10b981;
          }

          .church-name {
            font-size: 8pt;
            font-weight: bold;
            margin-bottom: 1mm;
            text-align: center;
            color: #333;
            line-height: 1;
          }

          .child-name {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 1.5mm;
            line-height: 1;
            color: #000;
          }

          .family-name {
            font-size: 12pt;
            text-align: center;
            margin-bottom: 2mm;
            color: #555;
            line-height: 1;
          }

          .security-code {
            font-size: 22pt;
            font-weight: bold;
            letter-spacing: 0.1em;
            text-align: center;
            margin: 1.5mm 0;
            color: #000;
            background: #ffd700;
            border: 2px solid #ffd700;
            padding: 1mm 2mm;
            border-radius: 3px;
            line-height: 1;
          }

          .timestamp {
            font-size: 6pt;
            text-align: center;
            color: #666;
            margin-top: 0.5mm;
            line-height: 1;
          }

          .age-info {
            font-size: 6pt;
            text-align: center;
            color: #333;
            margin-top: 1mm;
            font-weight: 600;
            line-height: 1;
          }

          .pickup-label {
            font-size: 10pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 1.5mm;
            color: #333;
            line-height: 1;
          }

          .pickup-child-name {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 2mm;
            color: #000;
            line-height: 1;
          }

          .keep-sticker {
            font-size: 6pt;
            text-align: center;
            color: #555;
            margin-top: 1mm;
            font-weight: 600;
            line-height: 1;
          }

          .print-instructions {
            display: none;
          }

          @media print {
            html, body {
              margin: 0;
              padding: 0;
              width: 100mm;
              height: 63mm;
            }
            .print-instructions {
              display: none !important;
            }
          }

          @media screen {
            html, body {
              width: auto;
              height: auto;
              background: #f0f0f0;
              padding: 0;
            }
            .print-instructions {
              display: block;
              background: #1e40af;
              color: white;
              padding: 20px;
              margin: 0;
              text-align: center;
              font-size: 14px;
              line-height: 1.6;
            }
            .print-instructions strong {
              display: block;
              font-size: 18px;
              margin-bottom: 10px;
              color: #fbbf24;
            }
            .print-instructions ol {
              text-align: left;
              display: inline-block;
              margin: 10px auto;
            }
            .print-instructions li {
              margin: 5px 0;
            }
            .sticker {
              margin: 20px auto;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
          }
        </style>
      </head>
      <body>
        <div class="print-instructions">
          <strong>🖨️ INSTRUCCIONES PARA IMPRESORA ZEBRA GK420t</strong>
          <p>Para imprimir correctamente en tu impresora de etiquetas:</p>
          <ol>
            <li>En el diálogo de impresión, selecciona tu <strong>Zebra GK420t</strong></li>
            <li>Verifica que el <strong>"Tamaño del papel"</strong> muestre <strong>100mm × 63mm</strong> (o 4" × 2.5")</li>
            <li>Si no aparece automáticamente, ve a <strong>"Más configuración"</strong> o <strong>"Propiedades de impresora"</strong></li>
            <li>Configura los <strong>márgenes a 0</strong> (None/Sin márgenes)</li>
            <li>Asegúrate que <strong>"Escala"</strong> esté en <strong>100%</strong></li>
            <li>NO selecciones "Ajustar a página" o "Fit to page"</li>
          </ol>
          <p style="margin-top: 15px; font-size: 12px; color: #fbbf24;">✓ Este mensaje no se imprimirá - solo aparece en la vista previa</p>
        </div>
        ${generateStickerGrids(checkIns)}
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Don't auto-close so user can print again if needed
        // printWindow.close()
      }, 250)
    }
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return {
    printStickers,
    formatTime,
    formatDate,
  }
}
