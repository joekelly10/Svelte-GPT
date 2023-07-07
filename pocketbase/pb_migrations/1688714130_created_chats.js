migrate((db) => {
  const collection = new Collection({
    "id": "doam3tmqvz9x6nl",
    "created": "2023-07-07 07:15:30.175Z",
    "updated": "2023-07-07 07:15:30.175Z",
    "name": "chats",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "opxmv2mq",
        "name": "messages",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("doam3tmqvz9x6nl");

  return dao.deleteCollection(collection);
})
