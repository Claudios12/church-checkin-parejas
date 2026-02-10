# 🏛️ Sistema de Registro de Niños - Cima Iglesia

Sistema de check-in para niños en servicios de la iglesia. Permite registrar la entrada de niños, imprimir etiquetas de seguridad y gestionar familias.

## 📋 Características

- ✅ Registro rápido de niños usando cédula del padre/madre
- 🔍 Búsqueda automática de familias existentes
- 🏷️ Generación de códigos de seguridad únicos
- 🖨️ Impresión de etiquetas (4 por página)
- 📱 Interfaz táctil optimizada para kiosco
- 💾 Base de datos local (SQLite)
- 🌐 Funciona completamente offline

## 🖥️ Requisitos del Sistema

- **Sistema Operativo:** Windows 10/11
- **Node.js:** Versión 18 o superior
- **Bun:** Instalado globalmente
- **Impresora:** Para imprimir las etiquetas
- **Pantalla táctil:** Opcional pero recomendado

## 📦 Instalación

### 1. Instalar Node.js

Si no tienes Node.js instalado:

1. Descarga Node.js desde: https://nodejs.org/
2. Instala la versión LTS (Long Term Support)
3. Verifica la instalación abriendo CMD y ejecutando:
   ```bash
   node --version
   ```

### 2. Instalar Bun

Abre PowerShell como administrador y ejecuta:

```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

Verifica la instalación:
```bash
bun --version
```

### 3. Configurar el Proyecto

1. Copia la carpeta `church-checkin` a la PC de la iglesia
2. Abre CMD o PowerShell en la carpeta del proyecto
3. **IMPORTANTE:** Crea el archivo de configuración:
   ```bash
   copy .env.example .env
   ```
   Este archivo contiene la configuración local (nombre de iglesia, base de datos, etc.)
4. Instala las dependencias:
   ```bash
   bun install
   ```

### 4. Configurar la Base de Datos

Ejecuta las migraciones para crear la base de datos:

```bash
bunx prisma migrate deploy
bunx prisma generate
```

## 🚀 Cómo Ejecutar

### Modo Desarrollo (con auto-recarga)

```bash
bun run dev
```

La aplicación estará disponible en: http://localhost:3000

### Modo Producción (más rápido)

1. Construir el proyecto:
   ```bash
   bun run build
   ```

2. Iniciar el servidor:
   ```bash
   bun run preview
   ```

## 🔧 Configuración

Edita el archivo `.env` para personalizar la aplicación:

```env
# URL de la base de datos (SQLite local)
DATABASE_URL="file:./dev.db"

# Nombre de la iglesia (aparece en el encabezado)
CHURCH_NAME="Cima Iglesia"

# Segundos antes de reiniciar automáticamente
AUTO_RESET_SECONDS=5
```

## 📖 Cómo Usar

### Para Padres/Voluntarios

1. **Ingresar Cédula:** Escribir la cédula del padre/madre (10 dígitos)
2. **Verificar Información:** El sistema buscará automáticamente familias existentes
3. **Seleccionar Niños:** Marcar los niños que asistirán hoy
4. **Agregar Nuevos Niños:** Si es necesario, usar el botón "+ Agregar Otro Niño"
5. **Registrar:** Hacer clic en "Registrar X Niños"
6. **Imprimir Etiquetas:** Imprimir las etiquetas de seguridad

### Información de la Etiqueta

Cada etiqueta contiene:
- Nombre de la iglesia
- Nombre del niño
- Apellidos del niño
- Código de seguridad único (4 dígitos)
- Fecha y hora del registro

## 🖨️ Configuración de Impresión

1. Al hacer clic en "🖨 Imprimir Etiquetas", se abrirá una nueva ventana
2. Se mostrarán 4 etiquetas por página (formato carta)
3. Configuración recomendada:
   - Orientación: Vertical
   - Tamaño: Carta (8.5" x 11")
   - Márgenes: 0.5 pulgadas
4. Después de imprimir, cortar las etiquetas con tijeras

## 💾 Gestión de la Base de Datos

### Ubicación de la Base de Datos

La base de datos SQLite se encuentra en:
```
church-checkin/dev.db
```

### Backup de la Base de Datos

**¡IMPORTANTE!** Haz copias de seguridad regularmente:

1. Copia el archivo `dev.db` a una ubicación segura
2. Recomendación: Hacer backup semanal o después de cada servicio
3. Guardar copias en una USB o en la nube

Comando rápido para backup:
```bash
copy dev.db backup\dev-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%.db
```

### Restaurar desde Backup

Si algo sale mal, simplemente:
1. Detener el servidor (Ctrl+C)
2. Reemplazar `dev.db` con tu archivo de backup
3. Reiniciar el servidor

### Ver los Datos (Prisma Studio)

Para ver y editar datos manualmente:

```bash
bunx prisma studio
```

Se abrirá un navegador en http://localhost:5555 donde puedes ver todas las tablas.

## 🔍 Estructura de la Base de Datos

- **Family:** Representa una familia (identificada por cédula del padre)
- **Parent:** Información del padre/madre
- **Child:** Información de cada niño
- **CheckIn:** Registro de cada entrada con código de seguridad

## 🚨 Solución de Problemas

### El servidor no inicia

```bash
# Limpiar caché y reinstalar
rm -rf node_modules .nuxt
bun install
```

### Error de base de datos

```bash
# Regenerar la base de datos desde cero
rm dev.db
bunx prisma migrate deploy
bunx prisma generate
```

### Las etiquetas no se imprimen

1. Verifica que permites ventanas emergentes en el navegador
2. Asegúrate de tener una impresora conectada
3. Prueba imprimir desde la vista previa primero

### La aplicación va lenta

1. Cierra otros programas en la PC
2. Usa modo producción (`bun run build` + `bun run start`)
3. Reinicia la PC

## 🔒 Seguridad

- La aplicación funciona completamente offline
- Todos los datos se almacenan localmente
- No se envía información a internet
- Recomendado: Usar en red local protegida

## 📱 Modo Kiosco (Recomendado)

Para usar como kiosco dedicado:

### Con Chrome

1. Crear acceso directo con:
   ```
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --app=http://localhost:3000
   ```

### Configurar Inicio Automático

1. Crear archivo `iniciar-checkin.bat`:
   ```batch
   @echo off
   cd /d "C:\ruta\a\church-checkin"
   start /B bun run start
   timeout /t 5
   start chrome --kiosk --app=http://localhost:3000
   ```

2. Colocar en carpeta de inicio de Windows:
   - Presiona Win+R
   - Escribe: `shell:startup`
   - Copia el archivo .bat allí

## 🛠️ Comandos Útiles

```bash
# Desarrollo
bun run dev           # Iniciar en modo desarrollo

# Producción
bun run build         # Construir para producción
bun run start         # Iniciar en producción

# Base de datos
bunx prisma studio    # Ver/editar datos
bunx prisma migrate   # Gestionar migraciones
bunx prisma generate  # Regenerar cliente

# Limpiar
rm -rf .nuxt          # Limpiar caché de Nuxt
rm -rf node_modules   # Limpiar dependencias
```

## 📞 Soporte

Si tienes problemas:

1. Revisa la sección de "Solución de Problemas"
2. Verifica los logs en la consola
3. Reinicia el servidor y la PC
4. Contacta al desarrollador

## 📄 Licencia

Este proyecto fue desarrollado específicamente para Cima Iglesia.

---

**Versión:** 1.0.0
**Última actualización:** Febrero 2026
**Desarrollador:** Claude + Christian Donado
