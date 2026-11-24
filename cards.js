/* Native links keep working without JavaScript. Touch adds a preview tap. */
(function(root){
  'use strict';
  function init(document){
    const cards = [...document.querySelectorAll('[data-flip-card]')];
    const closeOthers = keep => cards.forEach(card=>{
      if(card !== keep)card.classList.remove('is-revealed');
    });
    cards.forEach(card=>{
      let pointerType = '';
      card.addEventListener('pointerdown',event=>{pointerType=event.pointerType;});
      card.addEventListener('click',event=>{
        if(event.detail === 0 || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)return;
        if(pointerType !== 'touch' && pointerType !== 'pen')return;
        if(!card.classList.contains('is-revealed')){
          event.preventDefault();
          closeOthers(card);
          card.classList.add('is-revealed');
        }
      });
    });
    if(cards.length)document.addEventListener('pointerdown',event=>{
      if(!event.target.closest('[data-flip-card]'))closeOthers(null);
    });
  }
  root.PortfolioCards = {init};
})(typeof window !== 'undefined' ? window : globalThis);
