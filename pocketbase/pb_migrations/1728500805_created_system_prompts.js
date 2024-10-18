migrate((db) => {
  const collection = new Collection({
    "id": "54q1f01ei608tkj",
    "created": "2024-10-09 19:06:45.302Z",
    "updated": "2024-10-09 19:06:45.302Z",
    "name": "system_prompts",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "n4oex9vl",
        "name": "message",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "ig9qj4wh",
        "name": "active",
        "type": "bool",
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": "",
    "viewRule": "",
    "createRule": "",
    "updateRule": "",
    "deleteRule": "",
    "options": {}
  });

  const dao = new Dao(db)
  dao.saveCollection(collection);

  const record = new Record(collection)
  record.set("message", "You are a helpful assistant.")
  record.set("active", true)

  return dao.saveRecord(record)
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("54q1f01ei608tkj");

  return dao.deleteCollection(collection);
})
