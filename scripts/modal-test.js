// Simple test modal
console.log('TEST: Modal script executing...');

window.Modal = {
  init: function(flowers) {
    console.log('TEST: Modal.init called with', flowers ? flowers.length : 0, 'flowers');
  },
  open: function(flower) {
    console.log('TEST: Modal.open called with flower:', flower.text);
    alert('Modal would open for: ' + flower.text);
  },
  close: function() {
    console.log('TEST: Modal.close called');
  }
};

console.log('TEST: Modal object created and assigned to window.Modal');