<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Основные секции -->
      <div class="footer-main">
        <!-- Лого и описание -->
        <div class="footer-brand">
          <div class="brand-logo">
            <el-icon class="logo-icon"><Star /></el-icon>
            <span class="logo-text">Dota2Finder</span>
          </div>
          <p class="brand-description">
            Находите идеальных тиммейтов и создавайте непобедимые команды для игры в Dota 2
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Discord">
              <el-icon><ChatDotRound /></el-icon>
            </a>
            <a href="#" class="social-link" aria-label="Telegram">
              <el-icon><Promotion /></el-icon>
            </a>
            <a href="#" class="social-link" aria-label="VK">
              <el-icon><Comment /></el-icon>
            </a>
            <a href="#" class="social-link" aria-label="YouTube">
              <el-icon><VideoPlay /></el-icon>
            </a>
          </div>
        </div>
        <!-- Помощь -->
        <div class="footer-section">
          <h4 class="section-title">Помощь</h4>
          <div class="footer-links">
            <a href="#" class="footer-link">
              <el-icon><QuestionFilled /></el-icon>
              FAQ
            </a>
            <a href="#" class="footer-link">
              <el-icon><Headset /></el-icon>
              Поддержка
            </a>
            <a href="#" class="footer-link">
              <el-icon><Document /></el-icon>
              Правила
            </a>
            <a href="#" class="footer-link">
              <el-icon><InfoFilled /></el-icon>
              О проекте
            </a>
          </div>
        </div>

        <!-- Контакты -->
        <div class="footer-section">
          <h4 class="section-title">Контакты</h4>
          <div class="contact-info">
            <div class="contact-item">
              <el-icon class="contact-icon"><Message /></el-icon>
              <span>support@dota2finder.com</span>
            </div>
            <div class="contact-item">
              <el-icon class="contact-icon"><Promotion /></el-icon>
              <span>@dota2finder</span>
            </div>
            <div class="contact-item">
              <el-icon class="contact-icon"><ChatDotRound /></el-icon>
              <span>Discord сообщество</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Нижняя часть -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <div class="copyright">
          <p>&copy; 2025 Dota 2 Teammate Finder. Все права защищены.</p>
        </div>
        <div class="footer-meta">
          <a href="#" class="meta-link">Политика конфиденциальности</a>
          <a href="#" class="meta-link">Условия использования</a>
          <a href="#" class="meta-link">Cookie</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Star,
  User,
  UserFilled,
  ChatDotRound,
  Avatar,
  QuestionFilled,
  Headset,
  Document,
  InfoFilled,
  Message,
  Promotion,
  Comment,
  VideoPlay,
  ArrowUp
} from '@element-plus/icons-vue'

export default {
  name: 'Footer',
  setup() {
    const showScrollTop = ref(false)

    const formatNumber = (num) => {
      return new Intl.NumberFormat('ru-RU').format(num)
    }

    const checkScroll = () => {
      showScrollTop.value = window.scrollY > 500
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

    onMounted(() => {
      window.addEventListener('scroll', checkScroll)
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', checkScroll)
    })

    return {
      showScrollTop,
      formatNumber,
      scrollToTop,
      Star,
      User,
      UserFilled,
      ChatDotRound,
      Avatar,
      QuestionFilled,
      Headset,
      Document,
      InfoFilled,
      Message,
      Promotion,
      Comment,
      VideoPlay,
      ArrowUp
    }
  }
}
</script>

<style scoped>
.footer {
  position: relative;
  background: #1a1f2e;
  color: var(--text-primary);
  margin-top: auto;
  overflow: hidden;
}

.footer-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  opacity: 0.1;
  pointer-events: none;
}

.footer-waves {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23667eea'%3E%3C/path%3E%3C/svg%3E");
  background-size: 50% 100px;
  opacity: 0.4;
}

.wave-1 {
  animation: wave 25s linear infinite;
  opacity: 0.3;
}

.wave-2 {
  animation: wave 20s linear infinite reverse;
  opacity: 0.2;
}

.wave-3 {
  animation: wave 15s linear infinite;
  opacity: 0.1;
}

@keyframes wave {
  0% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(-50%); }
}

.footer-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 20px 40px;
}

.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 40px;
  margin-bottom: 40px;
}

/* Бренд */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.logo-icon {
  color: var(--primary-color);
  font-size: 2rem;
}

.brand-description {
  color: var(--text-muted);
  line-height: 1.6;
  font-size: 0.95rem;
  max-width: 300px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.social-link:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

/* Секции */
.footer-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30px;
  height: 2px;
  background: var(--primary-gradient);
  border-radius: 2px;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  padding: 6px 0;
}

.footer-link:hover {
  color: var(--primary-color);
  transform: translateX(5px);
}

.footer-link .el-icon {
  font-size: 1rem;
  opacity: 0.7;
}

/* Контакты */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.contact-icon {
  color: var(--primary-color);
  font-size: 1rem;
}

/* Дополнительная информация */
.footer-extra {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 600px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: lowercase;
}

/* Нижняя часть */
.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer-meta {
  display: flex;
  gap: 20px;
}

.meta-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.meta-link:hover {
  color: var(--primary-color);
}

/* Кнопка "Наверх" */
.scroll-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: var(--primary-gradient);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  z-index: 1000;
}

.scroll-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.scroll-to-top:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* ===== АДАПТИВНОСТЬ ===== */

/* Большие планшеты и маленькие десктопы */
@media (max-width: 1024px) {
  .footer-main {
    grid-template-columns: 1.5fr 1fr 1fr;
    gap: 30px;
  }
  
  .footer-brand {
    grid-column: 1 / -1;
    text-align: center;
    align-items: center;
  }
  
  .brand-description {
    max-width: 500px;
  }
}

/* Планшеты */
@media (max-width: 768px) {
  .footer-content {
    padding: 40px 20px 30px;
  }
  
  .footer-main {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  
  .footer-section:last-child {
    grid-column: 1 / -1;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 400px;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .scroll-to-top {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
  }
}

/* Мобильные устройства */
@media (max-width: 600px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 30px;
    text-align: center;
  }
  
  .section-title::after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .footer-links {
    align-items: center;
  }
  
  .footer-link {
    justify-content: center;
  }
  
  .contact-info {
    align-items: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-meta {
    flex-direction: column;
    gap: 10px;
  }
  
  .footer-content {
    padding: 30px 15px 20px;
  }
  
  .footer-extra {
    padding-top: 30px;
  }
}

/* Маленькие мобильные */
@media (max-width: 480px) {
  .footer-content {
    padding: 25px 12px 15px;
  }
  
  .brand-logo {
    font-size: 1.3rem;
  }
  
  .logo-icon {
    font-size: 1.7rem;
  }
  
  .stat-value {
    font-size: 1.7rem;
  }
  
  .scroll-to-top {
    bottom: 15px;
    right: 15px;
    width: 40px;
    height: 40px;
  }
  
  .social-link {
    width: 36px;
    height: 36px;
  }
  
  .footer-main {
    gap: 25px;
  }
}

/* Очень маленькие мобильные */
@media (max-width: 360px) {
  .footer-content {
    padding: 20px 10px 15px;
  }
  
  .brand-logo {
    flex-direction: column;
    gap: 8px;
  }
  
  .footer-section {
    gap: 15px;
  }
  
  .footer-links {
    gap: 10px;
  }
  
  .footer-link {
    font-size: 0.85rem;
  }
  
  .stat-item {
    padding: 15px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}

/* Ландшафтная ориентация */
@media (max-height: 500px) and (max-width: 900px) {
  .footer-content {
    padding: 30px 20px;
  }
  
  .footer-main {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  
  .footer-brand {
    grid-column: span 1;
    text-align: left;
    align-items: flex-start;
  }
}

/* Темная тема улучшения */
@media (prefers-color-scheme: dark) {
  .footer {
    background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%);
  }
  
  .social-link {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .stat-item {
    background: rgba(255, 255, 255, 0.03);
  }
}

/* Улучшение доступности */
@media (prefers-reduced-motion: reduce) {
  .wave {
    animation: none;
  }
  
  .social-link,
  .footer-link,
  .stat-item,
  .scroll-to-top,
  .meta-link {
    transition: none;
  }
  
  .social-link:hover,
  .footer-link:hover,
  .stat-item:hover,
  .scroll-to-top:hover {
    transform: none;
  }
}

/* Высокие экраны */
@media (min-height: 800px) {
  .footer-content {
    padding: 80px 20px 50px;
  }
  
  .footer-main {
    margin-bottom: 60px;
  }
}

/* Печать */
@media print {
  .footer-background,
  .scroll-to-top,
  .social-links,
  .footer-extra {
    display: none;
  }
  
  .footer {
    background: white !important;
    color: black !important;
  }
  
  .footer-link,
  .meta-link {
    color: #666 !important;
  }
}
</style>