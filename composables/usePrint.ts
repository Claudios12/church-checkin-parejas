import type { CheckInResult } from './useCheckIn'
import { calculateAge } from '~/utils/age'

export interface CoupleData {
  manName: string
  manLastName: string
  womanName: string
  womanLastName: string
}

export const usePrint = () => {
  // ── Couples sticker ────────────────────────────────────────────────────────

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

  // ── Kids sticker ───────────────────────────────────────────────────────────

  const starsHTML = `
    <img src="/ESTRELLAS_Sticker-03.png" class="s1" alt="" />
    <img src="/ESTRELLAS_Sticker-04.png" class="s2" alt="" />
    <img src="/ESTRELLAS_Sticker-06.png" class="s3" alt="" />
    <img src="/ESTRELLAS_Sticker-05.png" class="s4" alt="" />
    <img src="/ESTRELLAS_Sticker-04.png" class="s5" alt="" />
  `

  const stickerCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: Arial, sans-serif; background: white; }
    .sticker {
      width: 101.6mm; height: 50.8mm; background: white;
      display: flex; flex-direction: row;
      padding: 2mm 2.5mm 1.5mm 3mm;
      overflow: hidden; page-break-after: always; page-break-inside: avoid;
    }
    .sticker:last-child { page-break-after: avoid; }
    .sticker-left {
      flex: 1; display: flex; flex-direction: column;
      justify-content: space-between; min-width: 0; padding-right: 2.5mm;
    }
    .child-name-area { flex: 1; display: flex; align-items: center; }
    .child-name { font-size: 20pt; font-weight: 900; color: #000; line-height: 1.05; word-break: break-word; }
    .parent-label { font-size: 6.5pt; font-weight: bold; color: #000; line-height: 1.1; }
    .parent-value { font-size: 7pt; font-weight: 700; color: #000; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .field-line { border-bottom: 0.5pt solid #000; margin: 0.5mm 0 1mm; }
    .keep-sticker { font-size: 5pt; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #000; }
    .sticker-right { width: 35mm; display: flex; flex-direction: column; padding-left: 1.5mm; }
    .logos-stars { position: relative; height: 16mm; margin-bottom: 1mm; }
    .logos-row { position: absolute; bottom: 0; left: 0; display: flex; align-items: center; gap: 1.5mm; }
    .church-logo { height: 9mm; width: auto; }
    .kids-logo { height: 9mm; width: auto; filter: contrast(999%); }
    .s1 { position: absolute; top: 0; right: 4mm; width: 6mm; height: 6mm; }
    .s2 { position: absolute; top: 3mm; right: 0; width: 2mm; height: 2mm; }
    .s3 { position: absolute; top: 1mm; right: 2mm; width: 1mm; height: 1mm; }
    .s4 { position: absolute; bottom: 0; right: 0; width: 6mm; height: 6mm; }
    .s5 { position: absolute; top: 6mm; left: 2mm; width: 2mm; height: 2mm; }
    .boxes-area { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; }
    .box-group { display: flex; flex-direction: column; }
    .box-label { font-size: 6pt; font-weight: bold; color: #000; margin-bottom: 0.3mm; line-height: 1; }
    .info-box { border: 0.6pt solid #000; border-radius: 3mm; padding: 0.5mm 1mm; font-size: 7pt; font-weight: 600; text-align: center; color: #000; min-height: 5mm; display: flex; align-items: center; justify-content: center; line-height: 1; }
  `

  const printStickers = (checkIns: CheckInResult[], parentName = '') => {
    const stickerHTML = (childName: string, withAge: boolean, age: string, time: string, date: string) => `
      <div class="sticker">
        <div class="sticker-left">
          <div class="child-name-area">
            <div class="child-name">${childName}</div>
          </div>
          <div>
            <div class="parent-label">Nombre padre/madre/responsable:</div>
            <div class="parent-value">${parentName}</div>
            <div class="field-line"></div>
          </div>
          <div class="keep-sticker">FAVOR CONSERVE ESTE STICKER</div>
        </div>
        <div class="sticker-right">
          <div class="logos-stars">
            ${starsHTML}
            <div class="logos-row">
              <img src="/Logo_CimaChurch.png" class="church-logo" alt="Logo" />
              <img src="/Logo_CimaKidsBlack.png" class="kids-logo" alt="Kids" />
            </div>
          </div>
          <div class="boxes-area">
            ${withAge ? `<div class="box-group"><div class="box-label">Edad:</div><div class="info-box">${age} años</div></div>` : ''}
            <div class="box-group"><div class="box-label">Hora:</div><div class="info-box">${time}</div></div>
            <div class="box-group"><div class="box-label">Fecha:</div><div class="info-box">${date}</div></div>
          </div>
        </div>
      </div>
    `

    const generateStickerGrids = () => checkIns.map(checkIn => {
      const age = calculateAge(checkIn.child.birthDate)
      const time = formatTime(checkIn.checkInTime)
      const date = formatDate(checkIn.checkInTime)
      const childFullName = `${checkIn.child.firstName} ${checkIn.child.lastName}`

      return `
        <div class="page">
          ${stickerHTML(childFullName, true, age.toString(), time, date)}
          ${stickerHTML(childFullName, false, '', time, date)}
        </div>
      `
    }).join('')

    const origin = window.location.origin
    const printWindow = window.open('', '_blank', 'width=384,height=576')
    if (!printWindow) return

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=384, initial-scale=1.0" />
  <style>
    @page { size: 101.6mm 152.4mm; margin: 0; }
    html, body { width: 101.6mm; margin: 0; padding: 0; }
    .page { width: 101.6mm; page-break-after: always; page-break-inside: avoid; }
    .page:last-child { page-break-after: avoid; }
    ${stickerCSS.replace(/url\(\//g, `url(${origin}/`)}
  </style>
</head>
<body>
  ${generateStickerGrids().replace(/src="\//g, `src="${origin}/`)}
</body>
</html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
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
    printCoupleStickers,
    printStickers,
    formatTime,
    formatDate,
  }
}
