import SkelUtil from './js/skelutil.js';

//Initiate on page load
const skelInit = rxjs.fromEvent(window, 'load');
const skelInstance = skelInit.subscribe(function (event){

  let thisSkel = new SkelUtil(); console.log(thisSkel);

  let asapScheduler = rxjs.operators.observeOn(rxjs.asapScheduler);//async

  thisSkel.data.newMap().pipe(asapScheduler).subscribe(function (thisMap){ console.log(thisMap);
    thisSkel.data.rootNode(thisMap, 'RootNodeTitle', {node: "root"}).pipe(asapScheduler).subscribe(function (thisItem){
      thisSkel.data.leafNode(thisMap, thisItem.item.NODE_ID, {node: 'leaf1'}).pipe(asapScheduler).subscribe(function (thisBranch){
        thisSkel.data.leafNode(thisMap, thisBranch.NODE_ID, {node: 'leaf2'}).pipe(asapScheduler).subscribe();
        thisSkel.data.leafNode(thisMap, thisItem.item.NODE_ID, {node: 'leaf1'}).pipe(asapScheduler).subscribe();
        //console.log(thisItem); console.log(thisBranch);
        thisSkel.data.traverse(thisMap, thisItem.item.NODE_ID).pipe(asapScheduler).subscribe(function (who_dis){
          console.log(who_dis);
        });
      });
    });
  });


});