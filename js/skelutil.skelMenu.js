//Globals Used: $(jQuery), rxjs, d3 

const skelMenu = class skelMenu {
  constructor(){
    let that = this;
    //right-click triggers menu interface
    let rightClick = rxjs.fromEvent(document, 'contextmenu');
    let skelMenu = rightClick.subscribe(function(event){
      event.preventDefault();
      if(!that.isMenuOn()) $('#skelMenuVeil').addClass('hide');
      else $('#skelMenuVeil').removeClass('hide');
    });
  }

  init(){
    $(document.body).append('<div id="skelMenuVeil" class="hide"></div>');
  }

  isMenuOn(){
    if(!$('#skelMenuVeil').hasClass('hide')) return false;
    else return true;
  }
};

export default skelMenu;