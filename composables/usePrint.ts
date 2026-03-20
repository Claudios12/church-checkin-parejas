import type { CheckInResult } from './useCheckIn'
import { calculateAge } from '~/utils/age'

export const usePrint = () => {
  const config = useRuntimeConfig()
  const churchName = config.public.churchName

  const stickerCSS = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; }
    .sticker {
      width: 101.6mm;
      height: 50.8mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 6mm 8mm;
      background: white;
      page-break-after: always;
      page-break-inside: avoid;
      box-sizing: border-box;
      overflow: hidden;
    }
    .sticker:last-child { page-break-after: avoid; }
    .child-sticker { border: 4px solid #3b82f6; }
    .parent-sticker { border: 4px solid #10b981; }
    .logo { max-height: 12mm; margin-bottom: 2mm; display: block; filter: contrast(999%); }
    .sticker-type { font-size: 6pt; font-weight: bold; text-align: center; margin-bottom: 1mm; text-transform: uppercase; line-height: 1; }
    .child-sticker .sticker-type { color: #3b82f6; }
    .parent-sticker .sticker-type { color: #10b981; }
    .church-name { font-size: 8pt; font-weight: bold; margin-bottom: 1mm; text-align: center; color: #333; line-height: 1; }
    .child-name { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 1.5mm; line-height: 1; color: #000; }
    .family-name { font-size: 12pt; text-align: center; margin-bottom: 2mm; color: #555; line-height: 1; }
    .timestamp { font-size: 6pt; text-align: center; color: #666; margin-top: 0.5mm; line-height: 1; }
    .age-info { font-size: 6pt; text-align: center; color: #333; margin-top: 1mm; font-weight: 600; line-height: 1; }
    .pickup-label { font-size: 10pt; font-weight: bold; text-align: center; margin-bottom: 1.5mm; color: #333; line-height: 1; }
    .pickup-child-name { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 2mm; color: #000; line-height: 1; }
    .keep-sticker { font-size: 10pt; text-align: center; color: #555; margin-top: 1mm; font-weight: 600; line-height: 1; letter-spacing: 0.15em; word-spacing: 0.35em; }
  `

  // Print both stickers together — used from the Windows tablet
  const printStickers = (checkIns: CheckInResult[]) => {
    const generateStickerGrids = () => checkIns.map(checkIn => `
      <div class="page">
        <div class="sticker child-sticker">
          <img src="/Logo_CimaKidsBlack.png" class="logo" alt="Logo" />
          <div class="sticker-type">NIÑO</div>
          <div class="church-name">${churchName}</div>
          <div class="child-name">${checkIn.child.firstName}</div>
          <div class="family-name">${checkIn.child.lastName}</div>
          <div class="timestamp">${formatDate(checkIn.checkInTime)}</div>
          <div class="timestamp">${formatTime(checkIn.checkInTime)}</div>
          <div class="age-info">${calculateAge(checkIn.child.birthDate)} años</div>
        </div>
        <div class="sticker parent-sticker">
          <img src="/Logo_CimaKidsBlack.png" class="logo" alt="Logo" />
          <div class="sticker-type">PADRE/MADRE - RECOGIDA</div>
          <div class="church-name">${churchName}</div>
          <div class="pickup-label">Para recoger a:</div>
          <div class="pickup-child-name">${checkIn.child.firstName}</div>
          <div class="timestamp">${formatDate(checkIn.checkInTime)}</div>
          <div class="timestamp">${formatTime(checkIn.checkInTime)}</div>
          <div class="keep-sticker">Conserve este sticker</div>
        </div>
      </div>
    `).join('')

    const printContainer = document.createElement('div')
    printContainer.id = 'sticker-print-container'
    printContainer.innerHTML = generateStickerGrids()

    const printStyle = document.createElement('style')
    printStyle.id = 'sticker-print-styles'
    printStyle.textContent = `
      #sticker-print-container { display: none; }
      @media print {
        body > *:not(#sticker-print-container) { display: none !important; }
        #sticker-print-container { display: block !important; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: 101.6mm 152.4mm; margin: 0; }
        .page { width: 101.6mm; page-break-after: always; page-break-inside: avoid; }
        .page:last-child { page-break-after: avoid; }
        ${stickerCSS}
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
