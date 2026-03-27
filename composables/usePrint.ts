export interface CoupleData {
  manName: string
  manLastName: string
  womanName: string
  womanLastName: string
}

export const usePrint = () => {
  const printCoupleStickers = (couple: CoupleData) => {
    const coupleLine = `${couple.manName.toUpperCase()} ${couple.manLastName.toUpperCase()} Y ${couple.womanName.toUpperCase()} ${couple.womanLastName.toUpperCase()}`

    const stickerHTML = `
      <div class="couple-sticker">
        <img src="/Bg_Sticker_Parejas.jpg" class="couple-sticker-bg" alt="" />
        <div class="couple-name-overlay">
          <span class="couple-names">${coupleLine}</span>
        </div>
      </div>
    `

    const coupleCSS = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; background: white; }
      .couple-sticker {
        position: relative;
        width: 101.6mm;
        height: 50.8mm;
        page-break-after: always;
        page-break-inside: avoid;
        overflow: hidden;
      }
      .couple-sticker:last-child { page-break-after: avoid; }
      .couple-sticker-bg {
        width: 100%;
        height: 100%;
        object-fit: fill;
        display: block;
      }
      .couple-name-overlay {
        position: absolute;
        top: 52%;
        left: 5%;
        width: 90%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        height: 17%;
      }
      .couple-names {
        font-size: 9pt;
        font-weight: bold;
        color: #000;
        text-align: center;
        text-transform: uppercase;
        line-height: 1.2;
      }
    `

    const printContainer = document.createElement('div')
    printContainer.id = 'couple-sticker-print-container'
    printContainer.innerHTML = stickerHTML + stickerHTML

    const printStyle = document.createElement('style')
    printStyle.id = 'couple-sticker-print-styles'
    printStyle.textContent = `
      @page { size: 101.6mm 152.4mm; margin: 0; }
      #couple-sticker-print-container { display: none; }
      @media print {
        body > *:not(#couple-sticker-print-container) { display: none !important; }
        #couple-sticker-print-container { display: block !important; }
        ${coupleCSS}
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
  }
}
