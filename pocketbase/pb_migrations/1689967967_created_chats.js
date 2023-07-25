migrate((db) => {
  const collection = new Collection({
    "id": "aukmp3s38t9s9ez",
    "created": "2023-07-21 19:32:47.474Z",
    "updated": "2023-07-21 19:32:47.474Z",
    "name": "chats",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "soncrepi",
        "name": "messages",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "fadimwzs",
        "name": "forks",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "kmujmv7b",
        "name": "active_fork",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
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
  const collection = dao.findCollectionByNameOrId("aukmp3s38t9s9ez");

  return dao.deleteCollection(collection);
})
