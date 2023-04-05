const express = require('express');
const { generate } = require('./utils.js');

// import express from 'express';
// import { generate } from './utils.js';

const app = express();

const default_opts = {
  title: "Hyprland Cheatsheet",
  blocks: [
    {
      title: "general",
      binds: [
        {
          description: "enter command mode",
          key: ";"
        },
        {
          description: "move window",
          key: "ctrl+arrow"
        },
        {
          description: "enter command mode",
          key: ";"
        },
      ]
    },
    {
      title: "wow",
      binds: [
        {
          description: "enter command mode",
          key: ";"
        },
      ]
    },
    {
      title: "general",
      binds: [
        {
          description: "enter command mode",
          key: ";"
        },
      ]
    },
  ]
};

app.get('/', async (req, res) => {
  res.send(await generate(default_opts));
});

app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});
