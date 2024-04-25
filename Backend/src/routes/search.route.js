import {Router} from 'express'
import { searchBooksOverInternet } from '../controllers/search.controller.js';

const searchRouter = Router();

searchRouter.route("/searchOnInternet").get(searchBooksOverInternet);

export {searchRouter};