"use strict";
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

const uuid = require("uuid/v4");

const table = process.env.POSTS_TABLE;

// create a post
module.exports.create = (event, context, callback) => {
  const reqBody = JSON.parse(event.body);
  if (
    !reqBody.title ||
    reqBody.title.trim() === "" ||
    !reqBody.author ||
    reqBody.author.trim() === "" ||
    !reqBody.body ||
    reqBody.body.trim() === ""
  ) {
    callback(
      null,
      response(400, { error: "Post must have a title, author and body" })
    );
  }
  const post = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    author: reqBody.author,
    title: reqBody.title,
    body: reqBody.body
  };
  return db
    .put({
      TableName: table,
      Item: post
    })
    .promise()
    .then(() => {
      callback(null, response(201, post));
    })
    .catch(err => response(null, response(err.statusCode, err)));
};

// Delete post by id
module.exports.delete = (event, context, callback) => {
  let id = event.pathParameters.id;
  let query = {
    Key: {
      id: id
    },
    TableName: table
  };
  return db
    .delete(query)
    .promise()
    .then(() => {
      callback(null, response(200, { message: "Post deleted successfully" }));
    })
    .catch(err => callback(null, response(err.statusCode, err)));
};

// get all posts
module.exports.list = (event, context, callback) => {
  return db
    .scan({ TableName: table })
    .promise()
    .then(res => {
      callback(null, res.Items.sort(sortByDate));
    })
    .catch(err => callback(null, response(err.statusCode, err)));
};

// get post by id
module.exports.get = (event, context, callback) => {
  let id = event.pathParameters.id;
  let query = {
    Key: {
      id: id
    },
    TableName: table
  };
  return db
    .get(query)
    .promise()
    .then(res => {
      if (res.Item) {
        callback(null, response(200, res.Item));
      } else {
        callback(null, response(404, { error: "Post not found" }));
      }
    })
    .catch(err => callback(null, response(err.statusCode, err)));
};

// update post by id
module.exports.update = (event, context, callback) => {
  let id = event.pathParameters.id;
  let body = JSON.parse(event.body);
  let paramName = body.paramName;
  let paramValue = body.paramValue;
  let query = {
    Key: {
      id: id
    },
    TableName: table,
    ConditionExpression: "attribute_exists(id)",
    UpdateExpression: "set " + paramName + " = :v",
    ExpressionAttributeValues: {
      ":v": paramValue
    },
    ReturnValue: "ALL_NEW"
  };
  return db
    .update(query)
    .promise()
    .then(res => {
      callback(null, response(200, res));
    })
    .catch(err => callback(null, response(err.statusCode, err)));
};

// Helpers

function sortByDate(a, b) {
  return a.createdAt > b.createdAt ? -1 : 1;
}

function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}
