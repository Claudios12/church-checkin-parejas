export interface CoupleData {
  manName: string
  manLastName: string
  womanName: string
  womanLastName: string
}

export const useCouplePrint = () => {
  const coupleStickersCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; }
    .sticker {
      width: 101.6mm;
      height: 50.8mm;
      display: flex;
      flex-direction: column;
      background: white;
      border: 2px solid #c0392b;
      page-break-after: always;
      page-break-inside: avoid;
      box-sizing: border-box;
      overflow: hidden;
      position: relative;
    }
    .sticker:last-child { page-break-after: avoid; }
    .bg-strip {
      height: 10mm;
      background-color: #1a5276;
      background-image: url('/bg_mountains.png');
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
    }
    .bg-strip-bottom {
      background-position: bottom center;
    }
    .sticker-body {
      flex: 1;
      display: flex;
      flex-direction: row;
      padding: 2mm 4mm;
      align-items: flex-start;
    }
    .sticker-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .event-title {
      font-size: 10pt;
      font-weight: bold;
      color: #c0392b;
      text-transform: uppercase;
      line-height: 1.1;
      margin-bottom: 2mm;
      letter-spacing: 0.03em;
    }
    .info-line {
      font-size: 8pt;
      color: #111;
      line-height: 1.3;
    }
    .info-line.couple-names {
      font-size: 11pt;
      font-weight: bold;
      color: #000;
    }
    .logo-area {
      width: 18mm;
      flex-shrink: 0;
      display: flex;
      align-items: flex-start;
      justify-content: flex-end;
      padding-left: 2mm;
    }
    .logo {
      max-width: 18mm;
      max-height: 14mm;
      display: block;
    }
  `

  const generateStickerHTML = (couple: CoupleData) => {
    const coupleLine = `${couple.manName.toUpperCase()} ${couple.manLastName.toUpperCase()} Y ${couple.womanName.toUpperCase()} ${couple.womanLastName.toUpperCase()}`
    return `
      <div class="sticker">
        <div class="bg-strip"></div>
        <div class="sticker-body">
          <div class="sticker-content">
            <div class="event-title">Un Ascenso con Propósito</div>
            <div class="info-line couple-names">• ${coupleLine}</div>
            <div class="info-line">• Fecha: Marzo 28, 2026</div>
            <div class="info-line">• Tema: Punto de Partida</div>
          </div>
          <div class="logo-area">
            <img
              src="/Logo_LibresParaAmar.png"
              class="logo"
              alt="Libres para Amar"
              onerror="this.style.display='none'"
            />
          </div>
        </div>
        <div class="bg-strip bg-strip-bottom"></div>
      </div>
    `
  }

  const printCoupleStickers = (couple: CoupleData) => {
    const stickerHTML = generateStickerHTML(couple)

    const printContainer = document.createElement('div')
    printContainer.id = 'couple-sticker-print-container'
    // Two identical stickers
    printContainer.innerHTML = stickerHTML + stickerHTML

    const printStyle = document.createElement('style')
    printStyle.id = 'couple-sticker-print-styles'
    printStyle.textContent = `
      #couple-sticker-print-container { display: none; }
      @media print {
        body > *:not(#couple-sticker-print-container) { display: none !important; }
        #couple-sticker-print-container { display: block !important; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: 101.6mm 101.6mm; margin: 0; }
        ${coupleStickersCSS}
      }
    `

    document.head.appendChild(printStyle)
    document.body.appendChild(printContainer)

    const cleanup = () => {
      document.head.removeChild(printStyle)
      document.body.removeChild(printContainer)
    }

    window.addEventListener('afterprint', cleanup, { once: true })
    setTimeout(() => window.print(), 100)
  }

  return {
    printCoupleStickers,
    generateStickerHTML,
  }
}
