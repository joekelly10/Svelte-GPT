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

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("54q1f01ei608tkj");

  return dao.deleteCollection(collection);
})
