import { Router } from 'express';
import Note from '../models/Note.js';

const router = Router();

router.get('/', async (req, res) => {
  const notes = await Note.find().sort({ createdAt: -1 }).lean();
  res.json(notes);
});

router.post('/', async (req, res) => {
  const { userId = 'test', title = '', content } = req.body;
  if (!content) return res.status(400).json({ error: 'content is required' });
  const note = await Note.create({ userId, title, content });
  res.status(201).json(note);
});

router.put('/:id', async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

router.delete('/:id', async (req, res) => {
  const del = await Note.findByIdAndDelete(req.params.id);
  if (!del) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
