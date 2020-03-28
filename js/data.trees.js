//Globals Used: rxjs
import Guid from './lib/Guid.js';

class Trees {
  constructor(){
    this.encrypt = new Hashes.SHA1; //.hex(string)
    this.template = {
      NODE_ID: '',
      NODE_PARENT: null,
      NODE_CHILDREN: []
    }
  }

  //create new root node
  seed(treeName, nodeData){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insNodeData = (nodeData && typeof nodeData === 'object' ? nodeData : {});
        let insTreeName = (treeName && typeof treeName === 'string' ? treeName : '');
        let template = Object.assign({}, that.template); let newSeed = Object.assign(template, insNodeData);
        that.randomHash(insTreeName).subscribe(hash =>{
          newSeed.NODE_ID = hash;
          subscriber.next(newSeed); subscriber.complete();
        });
      }
      catch(e){ subscriber.error(e); }
    });
  }

  //append a new node to an existing one
  branch(parentNodeId, nodeData){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insNodeData = (nodeData && typeof nodeData === 'object' ? nodeData : {});
        let insParentNodeId = (parentNodeId && typeof parentNodeId === 'string' ? parentNodeId : '');
        let template = Object.assign({}, that.template);
        let newBranch = Object.assign(template, insNodeData);
        newBranch.NODE_PARENT = insParentNodeId;
        that.randomHash(insParentNodeId).subscribe(hash =>{
          newBranch.NODE_ID = hash;
          subscriber.next(newBranch); subscriber.complete();
        });
      }
      catch(e){ subscriber.error(e); }
    });
  }

  //Generate some kinda random hash values
  randomHash(value){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let GUID = Guid.create().value;
        let insValue = ((value && typeof value === 'string') ? value : '');
        let hashValue = that.encrypt.hex(GUID+insValue);
        subscriber.next(hashValue); subscriber.complete();
      } 
      catch(e){ subscriber.error(e); }
    });
  }

  //generate a hash specifically from a given seed
  seedHash(seed){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insSeed = ((seed && typeof seed === 'string') ? seed : '');
        subscriber.next(that.encrypt.hex(insSeed));
        subscriber.complete();
      } 
      catch(e){ subscriber.error(e); }
    });
  }

};//end class

export default Trees;