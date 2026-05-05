import express from 'express';
import { getEntries, handleEntryAction } from '../controllers/entryController.js';

const router = express.Router();

router.route('/')
  .get(getEntries)
  .post(handleEntryAction);

export default router;
