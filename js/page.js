//Globals Used: $(jQuery), rxjs, d3 
import Guid from './lib/Guid.js';
import skelMenu from './skelutil.skelMenu.js';

const Page = class Page {
  constructor(modData){//expects init'd object from data.js
    this.skelMenu = new skelMenu();
    this.skelMenu.init();
    this.tree = modData;

  }
  

};

export default Page;