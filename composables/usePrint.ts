import type { CheckInResult } from './useCheckIn'
import { calculateAge } from '~/utils/age'

export const usePrint = () => {
  const config = useRuntimeConfig()
  const churchName = config.public.churchName

  const getLogoBase64 = async (): Promise<string> => {
    try {
      const response = await fetch('/Logo_CimaKids.png')
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve('')
        reader.readAsDataURL(blob)
      })
    } catch {
      return ''
    }
  }

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
    .logo { max-height: 12mm; margin-bottom: 2mm; display: block; }
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
    .keep-sticker { font-size: 6pt; text-align: center; color: #555; margin-top: 1mm; font-weight: 600; line-height: 1; }
  `

  const buildChildStickers = (checkIns: CheckInResult[], logo: string) =>
    checkIns.map(checkIn => `
      <div class="sticker child-sticker">
        ${logo ? `<img src="${logo}" class="logo" alt="Logo" />` : ''}
        <div class="sticker-type">NIÑO</div>
        <div class="church-name">${churchName}</div>
        <div class="child-name">${checkIn.child.firstName}</div>
        <div class="family-name">${checkIn.child.lastName}</div>
        <div class="timestamp">${formatDate(checkIn.checkInTime)}</div>
        <div class="timestamp">${formatTime(checkIn.checkInTime)}</div>
        <div class="age-info">${calculateAge(checkIn.child.birthDate)} años</div>
      </div>
    `).join('')

  const buildParentStickers = (checkIns: CheckInResult[], logo: string) =>
    checkIns.map(checkIn => `
      <div class="sticker parent-sticker">
        ${logo ? `<img src="${logo}" class="logo" alt="Logo" />` : ''}
        <div class="sticker-type">PADRE/MADRE - RECOGIDA</div>
        <div class="church-name">${churchName}</div>
        <div class="pickup-label">Para recoger a:</div>
        <div class="pickup-child-name">${checkIn.child.firstName}</div>
        <div class="timestamp">${formatDate(checkIn.checkInTime)}</div>
        <div class="timestamp">${formatTime(checkIn.checkInTime)}</div>
        <div class="keep-sticker">Conserve este sticker</div>
      </div>
    `).join('')

  // Opens a single page with both sticker types and two print buttons inside
  const downloadStickers = async (checkIns: CheckInResult[]) => {
    const logo = await getLogoBase64()

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Etiquetas - ${churchName}</title>
        <style>
          ${stickerCSS}

          /* Screen layout */
          @media screen {
            body { background: #111; padding: 16px; }
            .toolbar {
              display: flex;
              gap: 12px;
              margin-bottom: 20px;
              position: sticky;
              top: 0;
              background: #111;
              padding: 12px 0;
              z-index: 10;
            }
            .btn {
              flex: 1;
              padding: 14px;
              font-size: 15px;
              font-weight: bold;
              border: none;
              border-radius: 10px;
              cursor: pointer;
              color: white;
            }
            .btn-child { background: #3b82f6; }
            .btn-parent { background: #10b981; }
            .sticker { margin: 0 auto 12px; box-shadow: 0 2px 8px rgba(255,255,255,0.1); }
            .section-label {
              color: #aaa;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
              text-align: center;
              margin: 20px 0 8px;
              font-family: Arial, sans-serif;
            }
          }

          /* Print: hide toolbar, show only selected type */
          @media print {
            @page { size: 101.6mm 50.8mm; margin: 0; }
            .toolbar { display: none !important; }
            .section-label { display: none !important; }
            .child-section, .parent-section { display: block; }
          }

          body.print-child .parent-section { display: none !important; }
          body.print-parent .child-section { display: none !important; }
        </style>
        <script>
          function printChild() {
            document.body.className = 'print-child';
            window.print();
          }
          function printParent() {
            document.body.className = 'print-parent';
            window.print();
          }
          window.addEventListener('afterprint', function() {
            document.body.className = '';
          });
        <\/script>
      </head>
      <body>
        <div class="toolbar">
          <button class="btn btn-child" onclick="printChild()">🖨 Imprimir Niño</button>
          <button class="btn btn-parent" onclick="printParent()">🖨 Imprimir Padre</button>
        </div>

        <div class="child-section">
          <div class="section-label">Etiquetas Niño</div>
          ${buildChildStickers(checkIns, logo)}
        </div>

        <div class="parent-section">
          <div class="section-label">Etiquetas Padre/Madre</div>
          ${buildParentStickers(checkIns, logo)}
        </div>
      </body>
      </html>
    `

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 30000)
  }

  // Print both stickers together — used from the Windows tablet
  const printStickers = (checkIns: CheckInResult[]) => {
    const generateStickerGrids = () => checkIns.map(checkIn => `
      <div class="page">
        <div class="sticker child-sticker">
          <img src="/Logo_CimaKids.png" class="logo" alt="Logo" />
          <div class="sticker-type">NIÑO</div>
          <div class="church-name">${churchName}</div>
          <div class="child-name">${checkIn.child.firstName}</div>
          <div class="family-name">${checkIn.child.lastName}</div>
          <div class="timestamp">${formatDate(checkIn.checkInTime)}</div>
          <div class="timestamp">${formatTime(checkIn.checkInTime)}</div>
          <div class="age-info">${calculateAge(checkIn.child.birthDate)} años</div>
        </div>
        <div class="sticker parent-sticker">
          <img src="/Logo_CimaKids.png" class="logo" alt="Logo" />
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
    downloadStickers,
    formatTime,
    formatDate,
  }
}
