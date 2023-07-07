migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("doam3tmqvz9x6nl")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "opxmv2mq",
    "name": "messages",
    "type": "json",
    "required": true,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("doam3tmqvz9x6nl")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "opxmv2mq",
    "name": "messages",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
})
