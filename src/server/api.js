/* eslint-disable no-console */

import express from 'express';
import { searchEntries } from '../lib/search';
import { list as listEntries } from '../lib/data/entries';
import { list as listMotifs } from '../lib/data/motifs';
import { list as listSources } from '../lib/data/sources';
import { list as listAuthors } from '../lib/data/authors';
import { get as getPage } from '../lib/data/pages';
import { get as getMenu } from '../lib/data/menus';
import { motifDictFromList } from '../lib/indexers';

const router = express.Router();

router.get('/search', async (req, res) => {
  const { query, groupBy, withMeta, id, author } = req.query;
  const results = await searchEntries({
    query,
    groupBy,
    withMeta,
    author
  });
  res.status(200).json({
    id,
    results
  });
});

router.get('/motifs/:mid', async (req, res) => {
  const motifDict = motifDictFromList(await listMotifs());
  const motif = motifDict[req.params.mid];
  if (!motif) {
    return res.status(404).end();
  }
  const { sources, entryCount } = await listEntries({
    motifId: req.params.mid,
    author: req.query.author,
    groupBy: 'source',
  });
  return res.status(200).json({
    ...motif,
    entryCount,
    sources,
  });
});

router.get('/sources/:sid', async (req, res) => {
  const entries = await listEntries({
    sourceId: req.params.sid
  });
  if (!entries.length) {
    return res.status(404).end();
  }
  return res.status(200).json(entries);
});

router.get('/pages/:path', async (req, res) => {
  try {
    const content = await getPage(req.params.path);
    return res.status(200).json(content);
  } catch (err) {
    console.error(err);
    return res.status(404).end();
  }
});

router.get('/menus/:path', async (req, res) => {
  try {
    const menu = await getMenu(req.params.path);
    return res.status(200).json(menu);
  } catch (err) {
    console.error(err);
    return res.status(404).end();
  }
});

router.get('/sources', async (req, res) => {
  const sources = await listSources();
  return res.status(200).json(sources);
});

router.get('/authors', async (req, res) => {
  const authors = await listAuthors();
  return res.status(200).json(authors);
});

router.get('/motifs', async (req, res) => {
  const motifs = await listMotifs();
  return res.status(200).json(motifs);
});

router.post('/admin/dumptobeta', (req, res) => {
  const { API_ADMIN_TOKEN } = process.env;
  if (req.get('Authorization') !== API_ADMIN_TOKEN) {
    req.status(403).end();
    return;
  }
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Disposition': 'attachment; filename="stream.txt"'
  });
  const dump = new DumpDbToBeta();
  dump.on('end', () => {
    console.log('END');
    res.end();
  });
  dump.on('stdout', (msg) => {
    console.log(msg);
    res.write(msg);
  });
  dump.on('stderr', (msg) => {
    console.error(msg);
    res.write(msg);
  });
  dump.run();
});

export default router;
