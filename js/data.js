//Globals Used: Hashes, rxjs, Dexie
import Trees from './data.trees.js';

let asapScheduler = rxjs.operators.observeOn(rxjs.asapScheduler);//async

class Data {
  constructor(localStorageId){
    this.plant = new Trees();
    //this.Dex = new Dexie('SkelData');
  }

  /*
  **
  ***node-tree heirarchies (expects a Map Object)
  ** NOTE:needs a culling method for null child references
  */

  //retrieve nodes relative to given nodeId
  traverse(mapObj, nodeId, direction){
    let that = this;
    return new rxjs.Observable(function (subscriber){
      try{
        let insMapObj = (mapObj && mapObj.__proto__.constructor.name === "Map" ? mapObj : false);
        let insNodeId = (nodeId && typeof nodeId === 'string' ? nodeId : '');
        let insDirection = (direction && typeof direction === 'string' && direction === 'up' ? direction : 'down');
        let maxIterations = 1000;//hard limit
        let nodeIds = [insNodeId];//running list of items to retrieve (w/ initial ID)
        let cursorID;//next ID to retrieve (initially empty) 
        //iterate over tree
        for(let i=0; i<maxIterations; i++){
          if(nodeIds.length > 0){
            cursorID = nodeIds.shift();//shift an id from list into cursor
            that.getMapItem(insMapObj, cursorID).subscribe(function (item){
              if(item){//if item exists
                subscriber.next(item);//next out object
                if(item.NODE_CHILDREN.length > 0){//if children exist
                  nodeIds = nodeIds.concat(item.NODE_CHILDREN);//append any children
                }
              }
              else {//
                subscriber.next(cursorID);//next out string
                console.warn(`${cursorID} is deleted or invalid.`);
              }
            });
          }
          else {//if nodeIds array runs out of items before max iterations
            console.log(`loop ended in ${i} iterations`);
            subscriber.complete();
            break;
          }
        }//end loop
      }
      catch(e){ subscriber.error(e); }
    });
  }
  
  //import existing tree into map
  growTree(){

  }

  //cut specified amounts of nodes below (or above) a given node
  cutTree(){

  }

  //Create new root node (i.e. plant a tree?)
  rootNode(mapObj, treeName, nodeData){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insMapObj = (mapObj && mapObj.__proto__.constructor.name === "Map" ? mapObj : false);
        let insTreeName = (treeName && typeof treeName === 'string' ? treeName : '');
        let insNodeData = (nodeData && typeof nodeData === 'object' ? nodeData : {});
        that.plant.seed(insTreeName, insNodeData).subscribe(seed => {
          that.addMapItem(insMapObj, seed.NODE_ID, seed).subscribe(item =>{
            if(item){
              let nameOrPlaceHolder = (insTreeName === '' ? item.NODE_ID : insTreeName);
              subscriber.next({name: nameOrPlaceHolder, item: item }); subscriber.complete();
            }
            else { subscriber.next(false); subscriber.complete(); }
          });
        });
      }
      catch(e){ subscriber.error(e); }
    });
  }

  //create a child node of the given parentNodeId
  leafNode(mapObj, parentNodeId, nodeData){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insMapObj = (mapObj && mapObj.__proto__.constructor.name === "Map" ? mapObj : false);
        let insParentNodeId = (parentNodeId && typeof parentNodeId === 'string' ? parentNodeId : '');
        let insNodeData = (nodeData && typeof nodeData === 'object' ? nodeData : {});
        that.getMapItem(insMapObj, insParentNodeId).subscribe(parentNode =>{
          if(parentNode){//if item exists, create leaf node
            that.plant.branch(insParentNodeId, insNodeData).subscribe(branch =>{
              that.addMapItem(insMapObj, branch.NODE_ID, branch).subscribe(item =>{
                if(item){//if leaf node was created
                  let updatedChildren = parentNode['NODE_CHILDREN'].slice();//copy old child arry
                  updatedChildren.push(item['NODE_ID']);//update parent node's child array
                  that.editMapItem(insMapObj, insParentNodeId, {'NODE_CHILDREN': updatedChildren}).subscribe();
                  subscriber.next(item);//return newly created leaf node
                  subscriber.complete();
                }
                else { subscriber.next(false); subscriber.complete(); }
              });
            });
          }
          else{ subscriber.next(false); subscriber.complete(); }
        });
      }
      catch(e){ subscriber.error(); }
    });
  }


  /*
  **
  ***Standard Map Manipulation
  **
  */

  //create an ES6 Map()
  newMap(initialData){
    //let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let newMap = (initialData && typeof initialData === 'object' ? new Map(initialData) : new Map());
        subscriber.next(newMap); subscriber.complete();  
      }
      catch(e){ subscriber.next(false); subscriber.error(e); }
    });
  }

  //retrieve item from Map
  getMapItem(mapObj, itemId){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insMapObj = (mapObj && mapObj.__proto__.constructor.name === "Map" ? mapObj : false);
        let insItemId = (itemId && typeof itemId === 'string' ? itemId : '');
        if(insMapObj){//if Object is a Map
          let mapItem = insMapObj.has(insItemId);
          if(mapItem !== false){//if map item exists
            subscriber.next(insMapObj.get(insItemId));
            subscriber.complete();
          }//if map item doesnt exist
          else { subscriber.next(null); subscriber.complete(); }
        }//if object isnt a map
        else { subscriber.next(false); subscriber.complete(); }
      }
      catch(e){ subscriber.error(e); }
    });
  }

  //add item to a Map()
  addMapItem(mapObj, itemId, data){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insMapObj = (mapObj && mapObj.__proto__.constructor.name === "Map" ? mapObj : false);
        let insItemId = (itemId && typeof itemId === 'string' ? itemId : '');
        let insData = (data ? data : {});
        that.getMapItem(insMapObj, insItemId).subscribe(item =>{
          if(item === null){//if key is unused
            insMapObj.set(insItemId, insData);
            subscriber.next(insData);
            subscriber.complete();
          }
          else{//if key exist
            console.warn(`attempted data insert of Inspected Item Identifer ${insItemId} failed: was this a GUID hash collision?`);
            subscriber.next(false);
            subscriber.complete();
          }
        });
      }
      catch(e){ subscriber.error(e); }
    });
  }

  //delete map item
  delMapItem(mapObj, itemId){//BUG: non-matches return undefined, tafuq?
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insMapObj = (mapObj && mapObj.__proto__.constructor.name === "Map" ? mapObj : false);
        let insItemId = (itemId && typeof itemId === 'string' ? itemId : '');
        that.getMapItem(insMapObj, insItemId).subscribe(item =>{
          if(item !== false){//key found
            insMapObj.delete(insItemId);
            subscriber.next(true); subscriber.complete();
          }
          else{//key not found
            subscriber.next(false); subscriber.complete();
          }
        });
      }
      catch(e){ subscriber.error(e); }
    });
  }

  //edit map
  editMapItem(mapObj, itemId, newData){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insMapObj = (mapObj && mapObj.__proto__.constructor.name === "Map" ? mapObj : false);
        let insItemId = (itemId && typeof itemId === 'string' ? itemId : '');
        let insNewData = (newData && typeof newData === 'object' ? newData : {});
        that.getMapItem(insMapObj, insItemId).subscribe(item =>{
          if(item){//item found
            let thisItem = insMapObj.get(insItemId);//copy original item
            for(let items in thisItem){//iterate through original data for updates
              if(thisItem.hasOwnProperty(items) && insNewData[items] != undefined && thisItem[items] !== insNewData[items])
                { thisItem[items] = insNewData[items]; }
            }
            for(let items in insNewData){//iterate through insNewData
              if(!thisItem.hasOwnProperty(items))
                { thisItem[items] = insNewData[items]; }//append any new properties
              if(thisItem.hasOwnProperty(items) && insNewData.hasOwnProperty(items) && insNewData[items] === null)
                { delete thisItem[items]; }//delete any null values
            }
            insMapObj.set(insItemId, thisItem);//SET
            subscriber.next(thisItem); subscriber.complete();
          }
          else{
            subscriber.next(false); subscriber.complete();
          }
        });
      }
      catch(e){ subscriber.error(e); }
    });
  }

  /*
  **
  ***Basic Object Manipulation
  **
  */

  //list data objects
  lsObjs(obj, name){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insObj = (obj && typeof obj === 'object' ? obj : {});
        let list = { total: 0, names: [] };
        for(let items in insObj){//populate list
          ++list.total;
          list.names.push(items);
        }
        if(name && typeof name === 'string'){//dupe check
          for(let i=0; i<list.total; i++){
            if(name.match(list.names[i])){
              subscriber.next(false);
              subscriber.complete();
            }
          }
        }
        subscriber.next(list);
        subscriber.complete();
      } 
      catch(e){ subscriber.error(e); }
    });
  }

  //check for a data object
  chkObj(obj, name){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insObj = (obj && typeof obj === 'object' ? obj : {});
        let lookup = (name && typeof name === 'string' ? name : '');
        for(let items in insObj){
          if(items === lookup) {
            subscriber.next(true);
            subscriber.complete();
            break;
          }
        }
        subscriber.next(false);
        subscriber.complete();
      }
      catch(e){ subscriber.error(e); }
    });
  }

  //make object member
  mkObjMem(obj, name, data){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insObj = (obj && typeof obj === 'object' ? obj : {});
        that.lsObjs(insObj, name).subscribe(list => {
          if(list !== false){//success
            insObj[name] = data;
            subscriber.next({"name":name,"data":data});
            subscriber.complete();
          }
          else{//failed
            subscriber.next(false);
            subscriber.complete();
          }
        });
      }
      catch(e){ subscriber.error(e); }
    });
  }

  //remove object member
  rmObjMem(obj, name){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insObj = (obj && typeof obj === 'object' ? obj : {});
        let lookup = (name && typeof name === 'string' ? name : '');
        that.chkObj(insObj, lookup).subscribe(list =>{
          if(list === true){//success
            delete insObj[name];
            subscriber.next(true); subscriber.complete();
          }
          else{//failed
            subscriber.next(false); subscriber.complete();
          }
        });
      }
      catch(e){ subscriber.error(e); }
    });
  }

  //retrieve object member
  getObjMem(obj, name){
    let that = this;
    return new rxjs.Observable(function subscribe(subscriber){
      try{
        let insObj = (obj && typeof obj === 'object' ? obj : {});
        let lookup = (name && typeof name === 'string' ? name : '');
        that.chkObj(insObj, lookup).subscribe(list =>{
          if(list === true){
            subscriber.next(insObj[name]);
            subscriber.complete();
          }
          else{
            subscriber.next(false);
            subscriber.complete();
          }
        });
      }
      catch(e){ subscriber.error(e); }
    });
  }

};//end class

export default Data;