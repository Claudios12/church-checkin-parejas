import type { CheckInResult } from './useCheckIn'

export const usePrint = () => {
  const config = useRuntimeConfig()
  const churchName = config.public.churchName

  const generateStickerGrids = (checkIns: CheckInResult[]): string => {
    const stickersPerPage = 4 // 2x2 grid
    const pages: CheckInResult[][] = []

    // Group stickers into pages of 4
    for (let i = 0; i < checkIns.length; i += stickersPerPage) {
      pages.push(checkIns.slice(i, i + stickersPerPage))
    }

    return pages.map((pageStickers) => `
      <div class="stickers-grid">
        ${pageStickers.map((checkIn) => `
          <div class="sticker">
            <div class="church-name">${churchName}</div>
            <div class="child-name">${checkIn.child.firstName}</div>
            <div class="family-name">${checkIn.child.lastName}</div>
            <div class="security-code">${checkIn.checkInNumber}</div>
            <div class="timestamp">${formatDate(checkIn.checkInTime)}</div>
            <div class="timestamp">${formatTime(checkIn.checkInTime)}</div>
            ${
              checkIn.child.allergies || checkIn.child.specialNeeds
                ? `<div class="special-info">⚠ Ver notas</div>`
                : ''
            }
          </div>
        `).join('')}
      </div>
    `).join('')
  }

  const printStickers = (checkIns: CheckInResult[]) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      alert('Por favor permite ventanas emergentes para imprimir')
      return
    }

    // Generate HTML for stickers - Multiple per page layout
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Imprimir Etiquetas - ${churchName}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @page {
            size: letter;
            margin: 0.5in;
          }

          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
          }

          .stickers-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.25in;
            page-break-after: always;
          }

          .stickers-grid:last-child {
            page-break-after: avoid;
          }

          .sticker {
            width: 100%;
            height: 4in;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 3px solid #000;
            padding: 0.25in;
            background: white;
            position: relative;
            break-inside: avoid;
          }

          .church-name {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 0.15in;
            text-align: center;
            color: #333;
          }

          .child-name {
            font-size: 32pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 0.15in;
            line-height: 1.1;
            color: #000;
          }

          .family-name {
            font-size: 18pt;
            text-align: center;
            margin-bottom: 0.2in;
            color: #555;
          }

          .security-code {
            font-size: 48pt;
            font-weight: bold;
            letter-spacing: 0.15em;
            text-align: center;
            margin: 0.15in 0;
            color: #000;
            background: #ffd700;
            border: 3px solid #ffd700;
            padding: 0.1in 0.2in;
            border-radius: 8px;
          }

          .timestamp {
            font-size: 10pt;
            text-align: center;
            color: #666;
            margin-top: 0.1in;
          }

          .special-info {
            font-size: 9pt;
            text-align: center;
            color: #d00;
            margin-top: 0.1in;
            font-weight: bold;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }

          @media screen {
            body {
              background: #f0f0f0;
              padding: 20px;
            }
            .stickers-grid {
              margin: 20px auto;
              max-width: 8.5in;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              background: white;
              padding: 0.5in;
            }
          }
        </style>
      </head>
      <body>
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
