// js/menu-mobile.js
function setupMobileMenu() {
  var btn = document.getElementById('mobile-menu-button');
  var menu = document.getElementById('mobile-menu');
  if(btn && menu) {
    // Remove event listeners antigos para evitar múltiplos binds
    btn.onclick = null;
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      menu.classList.toggle('hidden');
    });
    menu.querySelectorAll('a').forEach(function(link) {
      link.onclick = null;
      link.addEventListener('click', function() {
        menu.classList.add('hidden');
      });
    });
    document.addEventListener('click', function docClick(e) {
      if (!menu.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });
  } else {
    console.error('Menu mobile não encontrado. Button:', btn, 'Menu:', menu);
  }
}
window.setupMobileMenu = setupMobileMenu;
