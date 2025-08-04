// Minimal Alpine.js replacement for basic functionality
window.Alpine = {
  data: function(callback) {
    return {
      init: callback
    };
  },
  start: function() {
    // Initialize Alpine-like behavior
    document.addEventListener('DOMContentLoaded', function() {
      // Find elements with x-data attributes
      const alpineElements = document.querySelectorAll('[x-data]');
      
      alpineElements.forEach(function(element) {
        const dataAttribute = element.getAttribute('x-data');
        
        // Simple state management
        if (dataAttribute) {
          try {
            const dataFunction = new Function('return ' + dataAttribute)();
            if (typeof dataFunction === 'function') {
              const state = dataFunction();
              element._alpineState = state;
              
              // Handle x-show directives
              const showElements = element.querySelectorAll('[x-show]');
              showElements.forEach(function(showEl) {
                const showExpression = showEl.getAttribute('x-show');
                const shouldShow = new Function('state', 'with(state) { return ' + showExpression + '; }')(state);
                showEl.style.display = shouldShow ? '' : 'none';
              });
            }
          } catch (e) {
            console.warn('Alpine.js replacement: Could not parse x-data:', dataAttribute);
          }
        }
      });
      
      // Handle x-click directives
      document.addEventListener('click', function(event) {
        const clickElement = event.target.closest('[x-click]');
        if (clickElement) {
          const clickExpression = clickElement.getAttribute('x-click');
          const alpineParent = clickElement.closest('[x-data]');
          
          if (alpineParent && alpineParent._alpineState) {
            try {
              new Function('state', 'event', 'with(state) { ' + clickExpression + '; }')(alpineParent._alpineState, event);
            } catch (e) {
              console.warn('Alpine.js replacement: Could not execute x-click:', clickExpression);
            }
          }
        }
      });
    });
  }
};

// Auto-start
Alpine.start();

// Make it available globally
window.Alpine = Alpine;