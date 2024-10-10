migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("54q1f01ei608tkj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ig9qj4wh",
    "name": "active",
    "type": "bool",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("54q1f01ei608tkj")

  // remove
  collection.schema.removeField("ig9qj4wh")

  return dao.saveCollection(collection)
})
