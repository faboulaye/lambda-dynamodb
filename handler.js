"use strict";
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient();

const uuid = require("uuid/v4");

const table = process.env.POSTS_TABLE;

module.exports.create = (event, context, callback) => {
  const reqBody = JSON.parse(event.body);
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

function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}
