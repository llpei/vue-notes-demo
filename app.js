const Editor = {
  props:['entityObject'],
  data:function(){
    return {'entity':this.entityObject}
  },
  methods:{
    update(){
      this.$emit("save");
    }
  },
  template:`
    <div class="ui form">
      <div class="field">
        <textarea
          row="5"
          placeholder="写点什么..."
          v-model='entity.body'
          v-on:input='update'>
        </textarea>
      </div>
    </div>
  `
}

const Note = {
  props:['entityObject'],
  data:function(){
    return {
      'entity':this.entityObject,
      'open':false
    }
  },
  computed:{
    header(){
      return _.truncate(this.entity.body,{length:30});
    },
    updated(){
      return moment(this.entity.meta.updated).fromNow();
    },
    words(){
      return this.entity.body.trim().length;
    }
  },
  components:{
    'editor':Editor
  },
  methods:{
    save(){
      loadCollection("notes")
        .then(collection => {
          collection.update(this.entity);
          db.saveDatabase();
        })
    },
    destroy(){
      this.$emit("destroy",this.entity.$loki);
    }
  },
  template:`
      <div class="item">
        <div class=meta>
          {{ updated }}
        </div>
        <div class="content">
          <div class="header"
              v-on:click="open=!open"
            >
            {{ header || '新建笔记' }}
          </div>
          <div class="extra">
            <editor
              v-bind:entity-object="entity"
              v-if="open"
              v-on:save="save"
              >
            </editor>
            {{words}}字
            <i class="right floated trash outline icon"
              v-if='open'
              v-on:click='destroy'
              ></i>
          </div>
        </div>
      </div>
    `
}

const Notes = {
  data:function(){
    return {
      entities:[]
    }
  },
  methods:{
    create:function(){
      loadCollection("notes")
        .then(collection => {
          const entity = collection.insert({
              'body':''
            });
          db.saveDatabase();
          this.entities.unshift(entity);
        })
    },
    destroy(id){
      const _entities = this.entities.filter((entity) => {
          return entity.$loki !== id;
      });
      this.entities = _entities;

      loadCollection('notes')
        .then(collection => {
          collection.remove({'$loki':id});
          db.saveDatabase();
        })
    }

  },
  created:function(){
    loadCollection("notes")
      .then(collection => {
        console.log(collection);
        const _entities =  collection.chain()
          .find().simplesort("$loki","isdesc").data();
        this.entities = _entities;
        console.log(this.entities);
      })
  },
  components:{
    "note":Note
  },
  template:`
    <div class='ui container notes'>
      <h4 class='ui horizontal divider header'>
        <i class='paw icon'></i>llpei Notes App _ vue.js
      </h4>
      <a class="ui right floated basic violet button"
        v-on:click='create'
        >添加笔记</a>
      <div class="ui divided items">
        <note
            v-for="entity in entities"
            v-bind:entityObject ="entity"
            v-bind:key="entity.$loki"
            v-on:destroy='destroy'
          ></note>
          <span class="ui samll center disabled header"
              v-if="!this.entities.length"
            >
              还没有笔记，请按下‘添加笔记’按钮
          </span>
      </div>
    </div>
  `
}


const app = new Vue({
  el:'#app',
  components:{
    "notes":Notes
  },
  template: `<notes></notes>`
});
