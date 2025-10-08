<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Dota 2 Teammate Finder</h3>
        <p>Найдите идеальных тиммейтов для игры в Dota 2</p>
      </div>
      <div class="footer-section">
        <h4>Быстрые ссылки</h4>
        <router-link to="/players">Поиск игроков</router-link>
        <router-link to="/teams">Поиск команд</router-link>
        <router-link to="/chat">Сообщения</router-link>
      </div>
      <div class="footer-section">
        <h4>Помощь</h4>
        <a href="#">FAQ</a>
        <a href="#">Поддержка</a>
        <a href="#">Правила</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 Dota 2 Teammate Finder. Все права защищены.</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background-color: #2c3e50;
  color: white;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 15px;
}

.footer-section a {
  display: block;
  color: #bdc3c7;
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #3498db;
}

.footer-bottom {
  border-top: 1px solid #34495e;
  text-align: center;
  padding: 20px;
  color: #bdc3c7;
}
</style>