const db = new loki("notes",{
  autoload:true,
  autoloadCallback:databaseInitialize,
  autosave:true,
  autosaveInterval:3000
});

function databaseInitialize(){
  const notes = db.getCollection("notes");
  if(notes === null){
    db.addCollection('notes');
  }
}


function loadCollection(collection){
  return new Promise(resolve =>{
    db.loadDatabase({},()=>{
      const _collection  = db.getCollection(collection) || db.addCollection(collection);
      resolve(_collection);
    })
  })
}
