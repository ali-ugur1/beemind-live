#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║  BeeMora — Ubuntu Production Deployment Script                    ║
# ║                                                                 ║
# ║  Bu script ilk kurulum veya güncelleme için kullanılır.        ║
# ║  Kullanım:                                                     ║
# ║    chmod +x deploy.sh                                          ║
# ║    ./deploy.sh            (tam kurulum)                        ║
# ║    ./deploy.sh update     (sadece güncelleme)                  ║
# ╚══════════════════════════════════════════════════════════════════╝

set -euo pipefail

# ── Renkli çıktı ─────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ── Değişkenler ──────────────────────────────────────────────────
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="beemora-api"
NODE_VERSION="20"
MODE="${1:-full}"  # "full" veya "update"

echo ""
echo "════════════════════════════════════════════════════"
echo "  BeeMora Deployment Script"
echo "  Mode: $MODE"
echo "  Directory: $APP_DIR"
echo "════════════════════════════════════════════════════"
echo ""

# ══════════════════════════════════════════════════════════════════
#  TAM KURULUM (ilk sefer)
# ══════════════════════════════════════════════════════════════════
if [ "$MODE" = "full" ]; then

  # 1. Sistem güncellemesi
  info "Sistem güncelleniyor..."
  sudo apt update && sudo apt upgrade -y
  ok "Sistem güncellendi"

  # 2. Gerekli paketler
  info "Gerekli paketler kuruluyor..."
  sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx ufw
  ok "Paketler kuruldu"

  # 3. Node.js (NVM ile)
  if ! command -v node &> /dev/null; then
    info "Node.js v${NODE_VERSION} kuruluyor (nvm)..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install $NODE_VERSION
    nvm use $NODE_VERSION
    nvm alias default $NODE_VERSION
    ok "Node.js $(node -v) kuruldu"
  else
    ok "Node.js $(node -v) zaten kurulu"
  fi

  # 4. PM2
  if ! command -v pm2 &> /dev/null; then
    info "PM2 kuruluyor..."
    npm install -g pm2
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 7
    pm2 set pm2-logrotate:compress true
    ok "PM2 kuruldu"
  else
    ok "PM2 zaten kurulu"
  fi

  # 5. Firewall
  info "Firewall yapılandırılıyor..."
  sudo ufw allow ssh
  sudo ufw allow 'Nginx Full'
  sudo ufw --force enable
  ok "Firewall aktif (SSH + Nginx)"

fi

# ══════════════════════════════════════════════════════════════════
#  UYGULAMA KURULUMU / GÜNCELLEMESİ
# ══════════════════════════════════════════════════════════════════

cd "$APP_DIR"

# NVM yükle (update modunda da gerekli olabilir)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 2>/dev/null || true

# 1. .env kontrolü
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    warn ".env dosyası bulunamadı! .env.example'dan kopyalanıyor..."
    cp .env.example .env
    warn "⚠️  .env dosyasını düzenlemeyi unutmayın!"
    warn "    nano .env"
  else
    error ".env ve .env.example dosyaları bulunamadı!"
  fi
fi

# 2. Bağımlılıkları kur
info "NPM bağımlılıkları kuruluyor..."
npm ci --production=false
ok "Bağımlılıklar kuruldu"

# 3. Frontend build
info "Frontend build ediliyor..."
npm run build
ok "Frontend build tamamlandı (dist/)"

# 4. Logs dizini oluştur
mkdir -p logs
mkdir -p data

# 5. PM2 ile başlat/yeniden başlat
info "PM2 ile uygulama başlatılıyor..."
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --env production
  ok "Uygulama yeniden başlatıldı (zero-downtime reload)"
else
  pm2 start ecosystem.config.cjs --env production
  ok "Uygulama ilk kez başlatıldı"
fi

# 6. PM2'yi sistem başlangıcına ekle
pm2 save
info "PM2 startup komutu (gerekiyorsa):"
echo "  sudo env PATH=\$PATH:$(which node) $(which pm2) startup systemd -u $USER --hp $HOME"

# 7. Nginx yapılandırması (ilk kurulumda)
if [ "$MODE" = "full" ]; then
  if [ -f "nginx.conf" ]; then
    info "Nginx yapılandırılıyor..."
    sudo cp nginx.conf /etc/nginx/sites-available/beemora
    sudo ln -sf /etc/nginx/sites-available/beemora /etc/nginx/sites-enabled/beemora
    sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

    if sudo nginx -t 2>/dev/null; then
      sudo systemctl reload nginx
      ok "Nginx yapılandırıldı ve yeniden yüklendi"
    else
      warn "Nginx yapılandırma hatası! Lütfen kontrol edin:"
      warn "  sudo nginx -t"
      warn "  sudo nano /etc/nginx/sites-available/beemora"
    fi

    echo ""
    warn "════════════════════════════════════════════════════"
    warn "  SSL sertifikası için:"
    warn "  sudo certbot --nginx -d yourdomain.com"
    warn "════════════════════════════════════════════════════"
  fi
fi

# 8. Health check
sleep 2
info "Health check yapılıyor..."
HEALTH=$(curl -s http://localhost:3001/api/health 2>/dev/null || echo '{"status":"error"}')
if echo "$HEALTH" | grep -q '"ok"'; then
  ok "API sunucusu çalışıyor!"
else
  warn "API sunucusu henüz hazır değil. Logları kontrol edin:"
  warn "  pm2 logs $APP_NAME"
fi

# ── Özet ─────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════"
echo -e "  ${GREEN}BeeMora Deploy Tamamlandı!${NC}"
echo "════════════════════════════════════════════════════"
echo ""
echo "  Faydalı komutlar:"
echo "    pm2 status              — Uygulama durumu"
echo "    pm2 logs $APP_NAME     — Logları izle"
echo "    pm2 monit               — Canlı monitör"
echo "    pm2 reload ecosystem.config.cjs --env production  — Güncelleme"
echo ""
echo "  Yapılacaklar:"
echo "    1. .env dosyasını düzenleyin (JWT_SECRET, CORS_ORIGINS)"
echo "    2. nginx.conf içinde 'yourdomain.com' kısmını değiştirin"
echo "    3. SSL sertifikası alın: sudo certbot --nginx"
echo ""
